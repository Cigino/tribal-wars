(function () {
  'use strict';

  if (document.getElementById('twPlanner2')) return;

  if (typeof $ === 'undefined') {
    alert('Chýba jQuery – otvor prosím script cez $.getScript()');
    return;
  }

  if (!window.game_data || !game_data.village) {
    alert('Script funguje iba v hre Tribal Wars');
    return;
  }

  /* ===================== CONFIG ===================== */

  const STORAGE_KEY = 'tw_planner2_data';

  const DEFAULT = {
    delayMin: 200,
    delayMax: 400,
    perVillage: 10,
    perCoord: 1,
    avoidNight: true,
    sections: {
      fake: '',
      real: '',
      test: ''
    }
  };

  const NIGHT_START = 0;      // 00:00
  const NIGHT_END = 480;      // 08:00

  const unitSpeed = {
    spear: 18, sword: 22, axe: 18, archer: 18,
    spy: 9, light: 10, marcher: 10, heavy: 11,
    ram: 30, catapult: 30, knight: 10, snob: 35
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
  panel.id = 'twPlanner2';
  panel.style = `
    position:fixed;
    top:70px;
    right:40px;
    width:460px;
    background:#1b2b1b;
    color:#eee;
    padding:12px;
    z-index:99999;
    border:2px solid #3f6b3f;
    font-family:Arial;
    box-shadow:0 0 15px #000;
  `;

  panel.innerHTML = `
    <h3 style="margin-top:0">⚔️ Planner 2.0 (Advanced)</h3>

    <b>FAKE coordy</b>
    <textarea id="p2_fake" rows="3" style="width:100%;"></textarea>

    <b>REAL coordy</b>
    <textarea id="p2_real" rows="3" style="width:100%;"></textarea>

    <b>TEST coordy</b>
    <textarea id="p2_test" rows="2" style="width:100%;"></textarea>

    <hr>

    <label>Delay tabov (ms):</label>
    <input id="p2_delay" style="width:100%;" value="200-400">

    <label>Útokov na 1 coord:</label>
    <input id="p2_per_coord" type="number" min="1" style="width:100%;">

    <label>Útokov z 1 dediny:</label>
    <input id="p2_per_village" type="number" min="1" style="width:100%;">

    <label>
      <input type="checkbox" id="p2_night"> Neútočiť 00:00–08:00
    </label>

    <button id="p2_run" style="margin-top:10px;width:100%;">VYPOČÍTAŤ ÚTOKY</button>

    <div id="p2_ranges" style="margin-top:10px;"></div>
  `;

  document.body.appendChild(panel);

  /* ===================== INIT VALUES ===================== */

  $('#p2_fake').val(DATA.sections.fake);
  $('#p2_real').val(DATA.sections.real);
  $('#p2_test').val(DATA.sections.test);
  $('#p2_delay').val(`${DATA.delayMin}-${DATA.delayMax}`);
  $('#p2_per_coord').val(DATA.perCoord);
  $('#p2_per_village').val(DATA.perVillage);
  $('#p2_night').prop('checked', DATA.avoidNight);

  function persist() {
    DATA.sections.fake = $('#p2_fake').val();
    DATA.sections.real = $('#p2_real').val();
    DATA.sections.test = $('#p2_test').val();

    const [a, b] = $('#p2_delay').val().split('-').map(Number);
    DATA.delayMin = a;
    DATA.delayMax = b;
    DATA.perCoord = parseInt($('#p2_per_coord').val());
    DATA.perVillage = parseInt($('#p2_per_village').val());
    DATA.avoidNight = $('#p2_night').is(':checked');

    saveData(DATA);
  }

  $('#p2_fake, #p2_real, #p2_test, #p2_delay, #p2_per_coord, #p2_per_village')
    .on('input', persist);
  $('#p2_night').on('change', persist);

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

  // ===== FAKE LOGIKA (MINIMÁLNE JEDNOTKY + VŽDY ŠPEH + RAM/CATA) =====
  function buildFakeUnits() {
    const units = {};

    const available = {
      ram: parseInt($('#unit_input_ram')[0]?.dataset.all || 0),
      catapult: parseInt($('#unit_input_catapult')[0]?.dataset.all || 0),
      spear: parseInt($('#unit_input_spear')[0]?.dataset.all || 0),
      spy: parseInt($('#unit_input_spy')[0]?.dataset.all || 0)
    };

    // VŽDY aspoň 1 špeh
    if (available.spy > 0) units.spy = 1;

    // VŽDY ram alebo catapult
    if (available.ram > 0) {
      units.ram = 1;
    } else if (available.catapult > 0) {
      units.catapult = 1;
    }

    // ak je fake limit > 1, pridáme kopijníkov
    const fakeLimit = parseInt(game_data.fake_limit || 1);
    if (fakeLimit > 1 && available.spear > 0) {
      units.spear = Math.min(fakeLimit, available.spear);
    }

    return units;
  }

  function getFakeSpeed() {
    const order = ['ram', 'catapult', 'spear', 'spy'];
    for (const u of order) {
      const i = document.querySelector('#unit_input_' + u);
      if (i && parseInt(i.dataset.all) > 0) return unitSpeed[u];
    }
    return null;
  }

  /* ===================== RUN ===================== */

  $('#p2_run').click(() => {
    persist();

    const fakeCoords = parseCoords(DATA.sections.fake);
    const realCoords = parseCoords(DATA.sections.real);
    const testCoords = parseCoords(DATA.sections.test);

    const allCoords = [...fakeCoords, ...realCoords, ...testCoords];
    if (!allCoords.length) return alert('Žiadne coordy');

    const villages = $('.overview_table tbody tr')
      .map(function () {
        const c = $(this).find('.quickedit-label').text().match(/\d+\|\d+/);
        return c ? c[0].split('|').map(Number) : null;
      }).get();

    let openings = [];
    let counter = 0;

    villages.forEach(v => {
      let sentFromVillage = 0;

      allCoords.forEach(c => {
        for (let i = 0; i < DATA.perCoord; i++) {
          if (sentFromVillage >= DATA.perVillage) return;

          const target = c.split('|').map(Number);
          const speed = getFakeSpeed() || Math.max(...Object.values(unitSpeed));

          const travel = distance(v, target) * speed / game_data.speed / game_data.unit_speed;
          const now = new Date();
          const arr = (now.getHours() * 60 + now.getMinutes() + travel) % 1440;

          if (DATA.avoidNight && isNight(arr)) continue;

          openings.push({
            x: target[0],
            y: target[1]
          });

          sentFromVillage++;
          counter++;
        }
      });
    });

    // ===== ZOBRAZIŤ ROZSAHY 1–10, 11–20, ... =====
    let html = '<b>Otvoriť:</b><br>';
    for (let i = 0; i < openings.length; i += 10) {
      const from = i + 1;
      const to = Math.min(i + 10, openings.length);

      html += `<button class="p2_range" data-from="${from}" data-to="${to}" style="margin:2px;">
        ${from}–${to}
      </button>`;
    }

    $('#p2_ranges').html(html);

    $('.p2_range').click(function () {
      const from = parseInt($(this).data('from')) - 1;
      const to = parseInt($(this).data('to'));

      let delay = 0;

      for (let i = from; i < to; i++) {
        delay += rand(DATA.delayMin, DATA.delayMax);
        const t = openings[i];

        setTimeout(() => {
          window.open(
            game_data.link_base_pure + 'place&x=' + t.x + '&y=' + t.y,
            '_blank'
          );
        }, delay);
      }
    });

    alert(`Pripravených ${openings.length} útokov.`);
  });

})();
