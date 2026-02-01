(function () {
  'use strict';

  if (document.getElementById('twPlanner3')) return;

  /* ================== GUARD ================== */

  if (!window.game_data || !game_data.village) {
    alert('Script musí bežať v hre Tribal Wars');
    return;
  }

  /* ================== KONŠTANTY ================== */

  const STORAGE_KEY = 'tw_planner3_data';
  const NIGHT_START = 0;
  const NIGHT_END = 480;

  const SOFT_BONUS = 2;
  const SOFT_DIST = 25;

  const POP = { spy: 2, ram: 5, catapult: 8, spear: 1 };

  /* ================== DEFAULT ================== */

  const DEFAULT = {
    fakeCoords: '',
    arrivalFrom: '',
    arrivalTo: '',
    perVillage: 10,
    perCoord: 1,
    avoidNight: true,
    units: {
      spyMin: 1,
      ramMin: 5,
      catMin: 10,
      spearMaxPop: 30
    }
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
    position:fixed;
    top:70px;
    right:40px;
    width:440px;
    background:#1b2b1b;
    color:#eee;
    padding:12px;
    z-index:99999;
    border:2px solid #3f6b3f;
    font-family:Arial;
    box-shadow:0 0 15px #000;
  `;

  box.innerHTML = `
    <h3 style="margin-top:0">⚔️ Planner 3.0 – FAKE</h3>

    <b>FAKE coordy</b>
    <textarea id="p_fake" rows="3" style="width:100%"></textarea>

    <b>Arrival OD (YYYY-MM-DD HH:MM)</b>
    <input id="p_from" style="width:100%">

    <b>Arrival DO (YYYY-MM-DD HH:MM)</b>
    <input id="p_to" style="width:100%">

    <hr>

    <label>Útokov z 1 dediny</label>
    <input id="p_pv" type="number" min="1" style="width:100%">

    <label>Útokov na 1 coord</label>
    <input id="p_pc" type="number" min="1" style="width:100%">

    <label>
      <input type="checkbox" id="p_night"> Mimo nočák (00:00–08:00)
    </label>

    <hr>

    <b>FAKE jednotky</b>
    <input id="u_spy" type="number" placeholder="Min. spy" style="width:100%">
    <input id="u_ram" type="number" placeholder="Min. ram" style="width:100%">
    <input id="u_cat" type="number" placeholder="Min. cat" style="width:100%">
    <input id="u_pop" type="number" placeholder="Max POP spear" style="width:100%">

    <button id="p_run" style="margin-top:10px;width:100%">
      VYPOČÍTAŤ FAKE ÚTOKY
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

  function parseCoords(txt) {
    return (txt.match(/\d+\|\d+/g) || []);
  }

  function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  function isNight(date) {
    const m = date.getHours() * 60 + date.getMinutes();
    return m >= NIGHT_START && m < NIGHT_END;
  }

  function serverNow() {
    if (game_data.server_time) {
      return new Date(game_data.server_time * 1000);
    }
    return new Date();
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

    const stats = {
      night: 0,
      window: 0,
      past: 0,
      perVillage: 0,
      accepted: 0
    };

    const coords = parseCoords(DATA.fakeCoords);
    if (!coords.length) return alert('❌ Žiadne FAKE coordy');

    const from = new Date(DATA.arrivalFrom.replace(' ', 'T'));
    const to = new Date(DATA.arrivalTo.replace(' ', 'T'));
    if (isNaN(from) || isNaN(to) || from >= to) {
      return alert('❌ Zlé arrival okno');
    }

    const villages = Object.values(game_data.villages)
      .map(v => v.coord.split('|').map(Number));

    const coordCount = {};
    const heat = {};
    let plan = [];

    villages.forEach(v => {
      let sent = 0;

      coords.forEach(c => {
        coordCount[c] = coordCount[c] || 0;
        if (coordCount[c] >= DATA.perCoord) return;

        const t = c.split('|').map(Number);
        const dist = distance(v, t);

        const max = DATA.perVillage +
          (dist <= SOFT_DIST ? SOFT_BONUS : 0);

        if (sent >= max) {
          stats.perVillage++;
          return;
        }

        let arrival, tries = 0;
        do {
          arrival = new Date(rand(from.getTime(), to.getTime()));
          tries++;
        } while (DATA.avoidNight && isNight(arrival) && tries < 50);

        if (DATA.avoidNight && isNight(arrival)) {
          stats.night++;
          return;
        }

        const travelMin =
          dist * 30 / game_data.speed / game_data.unit_speed;

        const send = new Date(arrival.getTime() - travelMin * 60000);
        if (send < serverNow()) {
          stats.past++;
          return;
        }

        plan.push({
          source: v.join('|'),
          target: c,
          send,
          arrival,
          units: fakeUnits()
        });

        coordCount[c]++;
        sent++;
        stats.accepted++;

        const bucket = Math.floor(dist / 10) * 10;
        heat[bucket] = (heat[bucket] || 0) + 1;
      });
    });

    if (!plan.length) {
      alert('⚠️ Nevznikol žiadny útok');
      return;
    }

    console.table(heat);
    console.table(stats);

    localStorage.setItem('tw_planner3_plan', JSON.stringify(plan));

    alert(
      `✅ FAKE: ${plan.length}\n` +
      `🌙 Nočák: ${stats.night}\n` +
      `⏱️ Minulosť: ${stats.past}\n` +
      `🚫 Limit dediny: ${stats.perVillage}`
    );
  };

})();
