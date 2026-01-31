(function () {
  'use strict';

  if (document.getElementById('twPlanner4')) return;

  if (typeof $ === 'undefined') {
    alert('Chýba jQuery – spusti script cez $.getScript()');
    return;
  }

  if (!window.game_data || !game_data.village) {
    alert('Script funguje iba v hre Tribal Wars');
    return;
  }

  /* ===================== CONFIG ===================== */

  const STORAGE_KEY = 'tw_planner4_data';

  const DEFAULT = {
    delayMin: 200,
    delayMax: 400,
    perVillage: 10,
    perCoord: 1,
    avoidNight: true,
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
  panel.id = 'twPlanner4';
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
    <h3 style="margin-top:0">⚔️ Planner 4.0 – FAKE</h3>

    <b>FAKE coordy</b>
    <textarea id="p3_fake" rows="4" style="width:100%;"></textarea>

    <hr>

    <label>Delay tabov (ms):</label>
    <input id="p3_delay" style="width:100%;" value="200-400">

    <label>Útokov na 1 coord:</label>
    <input id="p3_per_coord" type="number" min="1" style="width:100%;">

    <label>Útokov z 1 dediny:</label>
    <input id="p3_per_village" type="number" min="1" style="width:100%;">

    <label>
      <input type="checkbox" id="p3_night"> Neútočiť 00:00–08:00
    </label>

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

  function persist() {
    DATA.sections.fake = $('#p3_fake').val();

    const [a, b] = $('#p3_delay').val().split('-').map(Number);
    DATA.delayMin = a;
    DATA.delayMax = b;
    DATA.perCoord = parseInt($('#p3_per_coord').val());
    DATA.perVillage = parseInt($('#p3_per_village').val());
    DATA.avoidNight = $('#p3_night').is(':checked');

    saveData(DATA);
  }

  $('#p3_fake, #p3_delay, #p3_per_coord, #p3_per_village')
    .on('input', persist);
  $('#p3_night').on('change', persist);

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

  /* ===================== FAKE LOGIKA ===================== */

  function injectUnitFiller(win) {
    if (!win) return;

    const tryInject = () => {
      try {
        if (!win.document || !win.document.body) {
          return setTimeout(tryInject, 300);
        }

        win.eval(`(${function () {

          const POP = { spear:1, sword:1, axe:1, spy:2, ram:5, catapult:8 };

          function buildFakeUnits(fakeLimit, available) {
            let popLeft = fakeLimit;
            const units = {};

            if (available.spy > 0 && popLeft >= POP.spy) {
              units.spy = 1;
              popLeft -= POP.spy;
            }

            let infantryPop = Math.min(30, popLeft);
            if (available.spear > 0 && infantryPop > 0) {
              const c = Math.min(available.spear, infantryPop);
              units.spear = c;
              popLeft -= c;
            }

            if (available.catapult > 0 && popLeft >= POP.catapult) {
              const c = Math.min(
                available.catapult,
                Math.floor(popLeft / POP.catapult)
              );
              if (c > 0) {
                units.catapult = c;
                popLeft -= c * POP.catapult;
              }
            }

            if (available.ram > 0 && popLeft >= POP.ram) {
              const c = Math.min(
                available.ram,
                Math.floor(popLeft / POP.ram)
              );
              if (c > 0) {
                units.ram = c;
                popLeft -= c * POP.ram;
              }
            }

            return units;
          }

          function waitForPlace() {
            if (!document.querySelector('#units_entry_all')) {
              return setTimeout(waitForPlace, 200);
            }

            const fakeLimit = parseInt(game_data.fake_limit || 1);
            const available = {};

            ['spy','spear','ram','catapult'].forEach(u => {
              const el = document.querySelector('#unit_input_' + u);
              available[u] = el ? parseInt(el.dataset.all || 0) : 0;
            });

            const units = buildFakeUnits(fakeLimit, available);

            Object.entries(units).forEach(([u,v]) => {
              const i = document.querySelector('#unit_input_' + u);
              if (i) {
                i.value = v;
                i.dispatchEvent(new Event('input', { bubbles:true }));
              }
            });

            console.log('Planner4 FAKE OK', units, 'fakeLimit=', fakeLimit);
          }

          waitForPlace();

        }.toString()})()`);
      } catch {
        setTimeout(tryInject, 300);
      }
    };

    tryInject();
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

    let openings = [];

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

          openings.push({ x: t[0], y: t[1] });
          sent++;
        }
      });
    });

    let html = '<b>Otvoriť:</b><br>';
    for (let i = 0; i < openings.length; i += 10) {
      html += `<button class="p3_range" data-f="${i}" data-t="${i+10}">
        ${i+1}–${Math.min(i+10, openings.length)}
      </button>`;
    }

    $('#p3_ranges').html(html);

    $('.p3_range').click(function () {
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

    alert(`Pripravených ${openings.length} FAKE útokov.`);
  });

})();
