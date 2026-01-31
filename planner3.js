(function () {
  'use strict';
  if (document.getElementById('twPlanner3')) return;

  /* ================== GUARDS ================== */

  if (!window.game_data || !game_data.server_time) {
    alert('Script musí bežať v hre Tribal Wars');
    return;
  }

  /* ================== CONST ================== */

  const STORAGE_KEY = 'tw_planner3_data';
  const NIGHT_START = 0;
  const NIGHT_END = 480;

  const POP = { spy: 2, ram: 5, catapult: 8, spear: 1 };

  /* ================== DEFAULT ================== */

  const DEFAULT = {
    perVillage: 10,
    perCoord: 1,
    avoidNight: true,
    arrivalFrom: '',
    arrivalTo: '',
    units: { spyMin: 1, ramMin: 5, catMin: 10, spearMaxPop: 30 },
    fakeCoords: ''
  };

  /* ================== STORAGE ================== */

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT; }
    catch { return DEFAULT; }
  }

  function save(d) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  }

  let DATA = load();

  /* ================== UI ================== */

  const box = document.createElement('div');
  box.id = 'twPlanner3';
  box.style = `
    position:fixed; top:70px; right:40px; width:430px;
    background:#1b2b1b; color:#eee; padding:12px;
    z-index:99999; border:2px solid #3f6b3f;
    font-family:Arial; box-shadow:0 0 15px #000;
  `;

  box.innerHTML = `
    <h3>⚔️ Planner 3.0 – FAKE</h3>

    <b>FAKE coordy</b>
    <textarea id="p_fake" rows="3" style="width:100%"></textarea>

    <b>Arrival od (YYYY-MM-DD HH:MM)</b>
    <input id="p_from" style="width:100%">

    <b>Arrival do (YYYY-MM-DD HH:MM)</b>
    <input id="p_to" style="width:100%">

    <hr>

    <label>Útokov z dediny</label>
    <input id="p_pv" type="number" min="1" style="width:100%">

    <label>Útokov na coord</label>
    <input id="p_pc" type="number" min="1" style="width:100%">

    <label><input type="checkbox" id="p_night"> Mimo nočák (00–08)</label>

    <hr>
    <b>FAKE jednotky</b>
    <input id="u_spy" type="number" placeholder="Min. spy" style="width:100%">
    <input id="u_ram" type="number" placeholder="Min. ram" style="width:100%">
    <input id="u_cat" type="number" placeholder="Min. cat" style="width:100%">
    <input id="u_pop" type="number" placeholder="Max POP spear" style="width:100%">

    <button id="p_run" style="width:100%;margin-top:8px">
      VYPOČÍTAŤ FAKE
    </button>
  `;

  document.body.appendChild(box);

  /* ================== INIT ================== */

  p_fake.value = DATA.fakeCoords;
  p_from.value = DATA.arrivalFrom;
  p_to.value = DATA.arrivalTo;
  p_pv.value = DATA.perVillage;
  p_pc.value = DATA.perCoord;
  p_night.checked = DATA.avoidNight;
  u_spy.value = DATA.units.spyMin;
  u_ram.value = DATA.units.ramMin;
  u_cat.value = DATA.units.catMin;
  u_pop.value = DATA.units.spearMaxPop;

  /* ================== HELPERS ================== */

  function parseCoords(t) {
    return (t.match(/\d+\|\d+/g) || []);
  }

  function serverNow() {
    return new Date(game_data.server_time * 1000);
  }

  function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function isNight(date) {
    const m = date.getHours() * 60 + date.getMinutes();
    return m >= NIGHT_START && m < NIGHT_END;
  }

  function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  function fakeUnits() {
    let pop = 100;
    const u = {};
    u.spy = DATA.units.spyMin; pop -= u.spy * POP.spy;
    u.ram = DATA.units.ramMin; pop -= u.ram * POP.ram;
    u.catapult = DATA.units.catMin; pop -= u.catapult * POP.catapult;
    u.spear = Math.max(0, Math.min(DATA.units.spearMaxPop, pop));
    return u;
  }

  /* ================== RUN ================== */

  p_run.onclick = () => {
    DATA = {
      fakeCoords: p_fake.value,
      arrivalFrom: p_from.value,
      arrivalTo: p_to.value,
      perVillage: +p_pv.value,
      perCoord: +p_pc.value,
      avoidNight: p_night.checked,
      units: {
        spyMin: +u_spy.value,
        ramMin: +u_ram.value,
        catMin: +u_cat.value,
        spearMaxPop: +u_pop.value
      }
    };
    save(DATA);

    const coords = parseCoords(DATA.fakeCoords);
    if (!coords.length) return alert('Žiadne coordy');

    const from = new Date(DATA.arrivalFrom.replace(' ', 'T'));
    const to = new Date(DATA.arrivalTo.replace(' ', 'T'));
    if (isNaN(from) || isNaN(to) || from >= to)
      return alert('Zlé arrival okno');

    const villages = Object.values(game_data.villages)
      .map(v => v.coord.split('|').map(Number));

    let plan = [];

    villages.forEach(v => {
      let sent = 0;
      coords.forEach(c => {
        for (let i = 0; i < DATA.perCoord; i++) {
          if (sent >= DATA.perVillage) return;

          let arrival;
          let attempts = 0;

          do {
            arrival = new Date(rand(from.getTime(), to.getTime()));
            attempts++;
          } while (
            DATA.avoidNight && isNight(arrival) && attempts < 50
          );

          if (DATA.avoidNight && isNight(arrival)) return;

          const t = c.split('|').map(Number);
          const travelMin = distance(v, t) * 30 / game_data.speed / game_data.unit_speed;
          const send = new Date(arrival.getTime() - travelMin * 60000);

          if (send < serverNow()) return;

          plan.push({
            source: v.join('|'),
            target: c,
            send,
            arrival,
            units: fakeUnits()
          });

          sent++;
        }
      });
    });

    if (!plan.length) return alert('Nevznikol žiadny útok');

    localStorage.setItem('tw_planner3_plan', JSON.stringify(plan));
    alert(`✅ Naplánovaných ${plan.length} FAKE útokov`);
  };

})();
