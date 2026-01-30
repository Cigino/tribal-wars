(function () {
  if (document.getElementById('twAttackPlanner')) return;

  if (typeof $ === 'undefined') {
    alert('jQuery nie je dostupné');
    return;
  }

  if (!game_data || !game_data.village) {
    alert('Script funguje iba v hre Tribal Wars');
    return;
  }

  /* ===================== CONFIG ===================== */

  const unitSpeed = {
    spear: 18, sword: 22, axe: 18, archer: 18,
    spy: 9, light: 10, marcher: 10, heavy: 11,
    ram: 30, catapult: 30, knight: 10, snob: 35
  };

  const NIGHT_START = 0;   // 00:00
  const NIGHT_END = 480;  // 08:00

  /* ===================== UI ===================== */

  const panel = document.createElement('div');
  panel.id = 'twAttackPlanner';
  panel.style = `
    position:fixed;
    top:80px;
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
    <h3 style="margin-top:0">⚔️ Attack Planner PRO</h3>

    <label>Target coordy:</label>
    <textarea id="ap_coords" rows="4" style="width:100%;"></textarea>

    <label><input type="checkbox" id="ap_arrival_on"> Dopad medzi:</label>
    <input id="ap_arrival" style="width:100%;" value="08:00-23:59">

    <label><input type="checkbox" id="ap_night_on" checked> Vyhnúť sa nočáku (00:00–08:00)</label>

    <label>Typ útokov:</label>
    <select id="ap_type" style="width:100%;">
      <option value="real">REAL</option>
      <option value="fake">FAKE</option>
    </select>

    <label>Útokov na 1 coord:</label>
    <input id="ap_per_coord" type="number" value="1" min="1" style="width:100%;">

    <label>Útokov z 1 dediny:</label>
    <input id="ap_per_village" type="number" value="10" min="1" style="width:100%;">

    <label>Delay tabov (ms):</label>
    <input id="ap_delay" value="200-400" style="width:100%;">

    <button id="ap_run" style="margin-top:10px;width:100%;">Otvoriť útoky</button>
    <button id="ap_close" style="margin-top:5px;width:100%;">Zavrieť</button>
  `;

  document.body.appendChild(panel);

  /* ===================== HELPERS ===================== */

  const save = () => {
    localStorage.setItem('ap_coords', $('#ap_coords').val());
  };

  $('#ap_coords').val(localStorage.getItem('ap_coords') || '');

  $('#ap_coords').on('input', save);

  function parseTime(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function isNight(min) {
    return min >= NIGHT_START && min < NIGHT_END;
  }

  function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  function getFakeSpeed() {
    const order = ['ram', 'catapult', 'spear', 'sword', 'spy'];
    for (const u of order) {
      const i = document.querySelector('#unit_input_' + u);
      if (i && parseInt(i.dataset.all) > 0) return unitSpeed[u];
    }
    return null;
  }

  /* ===================== RUN ===================== */

  $('#ap_close').click(() => panel.remove());

  $('#ap_run').click(() => {
    const coords = ($('#ap_coords').val().match(/\d+\|\d+/g) || []);
    if (!coords.length) return alert('Žiadne coordy');

    const perCoord = parseInt($('#ap_per_coord').val());
    const perVillage = parseInt($('#ap_per_village').val());

    const [d1, d2] = $('#ap_delay').val().split('-').map(Number);

    const arrivalOn = $('#ap_arrival_on').is(':checked');
    let a = 0, b = 1440;
    if (arrivalOn) {
      [a, b] = $('#ap_arrival').val().split('-').map(parseTime);
    }

    const avoidNight = $('#ap_night_on').is(':checked');
    const type = $('#ap_type').val();

    const villages = $('.overview_table tbody tr')
      .map(function () {
        const c = $(this).find('.quickedit-label').text().match(/\d+\|\d+/);
        return c ? c[0].split('|').map(Number) : null;
      }).get();

    let opened = 0;
    let delay = 0;

    villages.forEach(v => {
      let sent = 0;
      coords.forEach(c => {
        for (let i = 0; i < perCoord; i++) {
          if (sent >= perVillage) return;

          const target = c.split('|').map(Number);
          const speed = type === 'fake'
            ? getFakeSpeed()
            : Math.max(...Object.values(unitSpeed));

          if (!speed) continue;

          const travel = distance(v, target) * speed / game_data.speed / game_data.unit_speed;
          const now = new Date();
          const arr = (now.getHours() * 60 + now.getMinutes() + travel) % 1440;

          if (arrivalOn && (arr < a || arr > b)) continue;
          if (avoidNight && isNight(arr)) continue;

          delay += rand(d1, d2);
          setTimeout(() => {
            window.open(
              game_data.link_base_pure + 'place&x=' + target[0] + '&y=' + target[1],
              '_blank'
            );
          }, delay);

          opened++;
          sent++;
        }
      });
    });

    alert(`Otvorených ${opened} útokov.\nOdoslanie je manuálne.`);
  });

})();
