(function () {
  'use strict';

  if (document.getElementById('twPlanner3')) return;

  if (typeof $ === 'undefined') {
    alert('Chýba jQuery – otvor script cez $.getScript()');
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
    sections: {
      fake: '',
      real: '',
      test: ''
    }
  };

  const NIGHT_START = 0;
  const NIGHT_END = 480;

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
  panel.id = 'twPlanner3';
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
    <h3 style="margin-top:0">⚔️ Planner 3.0</h3>

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

  /* ===================== INIT ===================== */

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

  // ===== AUTO UNIT FILLER + FAKE LIMIT DETEKCIA =====
  function injectUnitFiller(win) {
    if (!win) return;

    const tryInject = () => {
      try {
        if (!win.document || !win.document.body) {
          return setTimeout(tryInject, 300);
        }

        win.eval(`
          (function(){
            function waitForPlace(){
              if(!document.querySelector('#units_entry_all')){
                return setTimeout(waitForPlace, 200);
              }

              // 🔍 fake limit z textu stránky
              let fakeLimit = 1;
              const txt = document.body.innerText;
              const m = txt.match(/fake[^0-9]*(\\d+)/i);
              if (m) fakeLimit = parseInt(m[1]);

              const getAvail = (u) => {
                const el = document.querySelector('#unit_input_' + u);
                return el ? parseInt(el.dataset.all || 0) : 0;
              };

              const units = {};

              if (getAvail('spy') > 0) units.spy = 1;

              if (getAvail('ram') > 0) {
                units.ram = 1;
              } else if (getAvail('catapult') > 0) {
                units.catapult = 1;
              }

              if (fakeLimit > 1 && getAvail('spear') > 0) {
                units.spear = Math.min(fakeLimit, getAvail('spear'));
              }

              Object.entries(units).forEach(([u,v]) => {
                const i = document.querySelector('#unit_input_' + u);
                if(i){
                  i.value = v;
                  i.dispatchEvent(new Event('input', {bubbles:true}));
                }
              });

              console.log('Planner3 AUTO OK | fakeLimit:', fakeLimit, units);
            }

            waitForPlace();
          })();
        `);
      } catch {
        setTimeout(tryInject, 300);
      }
    };

    tryInject();
  }

  /* ===================== RUN ===================== */

  $('#p2_run').click(() => {
    persist();

    const coords = [
      ...parseCoords(DATA.sections.fake),
      ...parseCoords(DATA.sections.real),
      ...parseCoords(DATA.sections.test)
    ];

    if (!coords.length) return alert('Žiadne coordy');

    const villages = $('.overview_table tbody tr')
      .map(function () {
        const m = $(this).find('.quickedit-label').text().match(/\d+\|\d+/);
        return m ? m[0].split('|').map(Number) : null;
      }).get();

    let openings = [];

    villages.forEach(v => {
      let sent = 0;
      coords.forEach(c => {
        for (let i = 0; i < DATA.perCoord; i++) {
          if (sent >= DATA.perVillage) return;

          const t = c.split('|').map(Number);
          const speed = Math.max(...Object.values(unitSpeed));
          const travel = distance(v, t) * speed / game_data.speed / game_data.unit_speed;

          const now = new Date();
          const arr = (now.getHours() * 60 + now.getMinutes() + travel) % 1440;
          if (DATA.avoidNight && isNight(arr)) continue;

          openings.push({ x: t[0], y: t[1] });
          sent++;
        }
      });
    });

    let html = '<b>Otvoriť:</b><br>';
    for (let i = 0; i < openings.length; i += 10) {
      html += `<button class="p2_range" data-f="${i}" data-t="${i + 10}">
        ${i + 1}–${Math.min(i + 10, openings.length)}
      </button>`;
    }

    $('#p2_ranges').html(html);

    $('.p2_range').click(function () {
      const from = +$(this).data('f');
      const to = Math.min(+$(this).data('t'), openings.length);

      let delay = 0;
      for (let i = from; i < to; i++) {
        delay += rand(DATA.delayMin, DATA.delayMax);
        const t = openings[i];

        setTimeout(() => {
          const w = window.open(
            game_data.link_base_pure + 'place&x=' + t.x + '&y=' + t.y,
            '_blank'
          );
          setTimeout(() => injectUnitFiller(w), 500);
        }, delay);
      }
    });

    alert(`Pripravených ${openings.length} útokov.`);
  });

})();
