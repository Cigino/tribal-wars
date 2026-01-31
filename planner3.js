(function () {
  'use strict';

  if (document.getElementById('twPlanner3')) return;

  if (typeof $ === 'undefined') {
    alert('Chýba jQuery – spusti script cez $.getScript()');
    return;
  }

  if (!window.game_data || !game_data.village) {
    alert('Script funguje iba v hre Tribal Wars');
    return;
  }

  /* ===================== CONFIG ===================== */

  const STORAGE_KEY = 'tw_planner3_data';

  const DEFAULT = {
    delayMin: 200,
    delayMax: 400,
    perVillage: 10,
    perCoord: 1,
    avoidNight: true,
    units: {
      spyMin: 1,
      ramMin: 5,
      catMin: 10,
      spearMaxPop: 30
    },
    sections: {
      fake: ''
    }
  };

  const NIGHT_START = 0;
  const NIGHT_END = 480;

  const POP = {
    spear: 1,
    sword: 1,
    axe: 1,
    spy: 2,
    ram: 5,
    catapult: 8
  };

  /* ===================== STORAGE ===================== */

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT;
    } catch {
      return DEFAULT;
    }
  }

  function saveData(d) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  }

  let DATA = loadData();

  /* ===================== UI ===================== */

  const panel = document.createElement('div');
  panel.id = 'twPlanner3';
  panel.style = `
    position:fixed;
    top:70px;
    right:40px;
    width:420px;
    background:#1b2b1b;
    color:#eee;
    padding:12px;
    z-index:99999;
    border:2px solid #3f6b3f;
    font-family:Arial;
    box-shadow:0 0 15px #000;
  `;

  panel.innerHTML = `
    <h3 style="margin-top:0">⚔️ Planner 3.0 – FAKE</h3>

    <b>FAKE coordy</b>
    <textarea id="p3_fake" rows="4" style="width:100%;"></textarea>

    <hr>

    <label>Delay tabov (ms)</label>
    <input id="p3_delay" style="width:100%;" value="200-400">

    <label>Útokov na 1 coord</label>
    <input id="p3_per_coord" type="number" min="1" style="width:100%;">

    <label>Útokov z 1 dediny</label>
    <input id="p3_per_village" type="number" min="1" style="width:100%;">

    <label>
      <input type="checkbox" id="p3_night"> Neútočiť 00:00–08:00
    </label>

    <hr>
    <b>FAKE jednotky</b>

    <label>Min. špehov</label>
    <input id="u_spy" type="number" min="0" style="width:100%;">

    <label>Min. baranidiel</label>
    <input id="u_ram" type="number" min="0" style="width:100%;">

    <label>Min. katapultov</label>
    <input id="u_cat" type="number" min="0" style="width:100%;">

    <label>Max. pechota (POP)</label>
    <input id="u_spear_pop" type="number" min="0" style="width:100%;">

    <button id="p3_run" style="margin-top:10px;width:100%;">
      VYPOČÍTAŤ FAKE ÚTOKY
    </button>

    <div id="p3_ranges" style="margin-top:10px;"></div>
  `;

  document.body.appendChild(panel);

  /* ===================== INIT ===================== */

  $('#p3_fake').val(DATA.sections.fake);
  $('#p3_delay').val(`${DATA.delayMin}-${DATA.delayMax}`);
  $('#p3_per_coord').val(DATA.perCoord);
  $('#p3_per_village').val(DATA.perVillage);
  $('#p3_night').prop('checked', DATA.avoidNight);

  $('#u_spy').val(DATA.units.spyMin);
  $('#u_ram').val(DATA.units.ramMin);
  $('#u_cat').val(DATA.units.catMin);
  $('#u_spear_pop').val(DATA.units.spearMaxPop);

  function persist() {
    DATA.sections.fake = $('#p3_fake').val();

    const [a, b] = $('#p3_delay').val().split('-').map(Number);
    DATA.delayMin = a;
    DATA.delayMax = b;

    DATA.perCoord = parseInt($('#p3_per_coord').val());
    DATA.perVillage = parseInt($('#p3_per_village').val());
    DATA.avoidNight = $('#p3_night').is(':checked');

    DATA.units.spyMin = parseInt($('#u_spy').val());
    DATA.units.ramMin = parseInt($('#u_ram').val());
    DATA.units.catMin = parseInt($('#u_cat').val());
    DATA.units.spearMaxPop = parseInt($('#u_spear_pop').val());

    saveData(DATA);
  }

  $('#twPlanner3 input, #twPlanner3 textarea').on('input change', persist);

  /* ===================== HELPERS ===================== */

  function parseCoords(txt) {
    return (txt.match(/\d+\|\d+/g) || []);
  }

  function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  function isNight(min) {
    return min >= NIGHT_START && min < NIGHT_END;
  }

  /* ===================== FAKE UNIT CALC ===================== */

  function calculateFakeUnits(cfg, fakeLimit = 100) {
    let popLeft = fakeLimit;
    const units = {};

    units.spy = cfg.spyMin;
    popLeft -= cfg.spyMin * POP.spy;

    units.ram = cfg.ramMin;
    popLeft -= cfg.ramMin * POP.ram;

    units.catapult = cfg.catMin;
    popLeft -= cfg.catMin * POP.catapult;

    const spearPop = Math.min(cfg.spearMaxPop, popLeft);
    units.spear = spearPop;
    popLeft -= spearPop;

    return units;
  }

  /* ===================== RUN ===================== */

  $('#p3_run').click(() => {
    persist();

    const coords = parseCoords(DATA.sections.fake);
    if (!coords.length) return alert('Žiadne FAKE coordy');

    const villages = $('.overview_table tbody tr')
      .map(function () {
        const m = $(this).find('.quickedit-label').text().match(/\d+\|\d+/);
        return m ? m[0].split('|').map(Number) : null;
      }).get();

    let planned = [];

    villages.forEach(v => {
      let sent = 0;
      coords.forEach(c => {
        for (let i = 0; i < DATA.perCoord; i++) {
          if (sent >= DATA.perVillage) return;

          const t = c.split('|').map(Number);
          const travel = distance(v, t) * 30 / game_data.speed / game_data.unit_speed;

          const now = new Date();
          const arr = (now.getHours() * 60 + now.getMinutes() + travel) % 1440;
          if (DATA.avoidNight && isNight(arr)) continue;

          planned.push({
            source: v.join('|'),
            target: c,
            type: 'fake',
            units: calculateFakeUnits(DATA.units)
          });

          sent++;
        }
      });
    });

    localStorage.setItem('tw_planner3_plan', JSON.stringify(planned));

    alert(`Pripravených ${planned.length} FAKE útokov.\nPlán uložený.`);
  });

})();
