(function () {

  if (document.getElementById('planner2')) return;

  if (typeof $ === 'undefined') {
    alert('jQuery nie je dostupné');
    return;
  }

  if (!window.game_data || !game_data.village) {
    alert('Script funguje iba v hre Tribal Wars');
    return;
  }

  /* ================= CONFIG ================= */

  const STORAGE = 'planner2_storage';

  const FAKE_LIMITS = {
    1: { spear: 1, spy: 1, ram: 1 },
    2: { spear: 2, spy: 1, ram: 1 },
    5: { spear: 5, spy: 1, ram: 1 }
  };

  const NIGHT_START = 0;
  const NIGHT_END = 480;

  /* ================= STORAGE ================= */

  const DATA = JSON.parse(localStorage.getItem(STORAGE)) || {
    coords: [],
    fakeLimit: 1,
    unitMode: 'ram',
    delay: '200-400',
    nightBlock: true,
    split: 10
  };

  const save = () => localStorage.setItem(STORAGE, JSON.stringify(DATA));

  /* ================= UI ================= */

  const panel = document.createElement('div');
  panel.id = 'planner2';
  panel.style = `
    position:fixed;
    top:80px;
    right:40px;
    width:430px;
    background:#1b2b1b;
    color:#eee;
    padding:12px;
    z-index:99999;
    border:2px solid #3f6b3f;
    font-family:Arial;
    box-shadow:0 0 15px #000;
  `;

  panel.innerHTML = `
    <h3>⚔️ Planner2 – Fakes</h3>

    Fake limit:
    <select id="p2_limit">
      <option value="1">1%</option>
      <option value="2">2%</option>
      <option value="5">5%</option>
    </select>

    Unit mode:
    <select id="p2_unit">
      <option value="ram">Ram</option>
      <option value="catapult">Catapult</option>
      <option value="rotate">Rotate</option>
    </select>

    <label>
      <input type="checkbox" id="p2_night"> Vyhnúť sa nočáku (00–08)
    </label>

    Delay (ms):
    <input id="p2_delay" style="width:100%;">

    Coords:
    <textarea id="p2_coords" rows="5" style="width:100%;"></textarea>

    <button id="p2_save" style="width:100%;margin-top:5px;">Uložiť</button>

    <hr>
    <div id="p2_pages"></div>

    <button id="p2_close" style="width:100%;margin-top:5px;">Zavrieť</button>
  `;

  document.body.appendChild(panel);

  /* ================= LOAD UI ================= */

  $('#p2_coords').val(DATA.coords.join('\n'));
  $('#p2_limit').val(DATA.fakeLimit);
  $('#p2_unit').val(DATA.unitMode);
  $('#p2_delay').val(DATA.delay);
  $('#p2_night').prop('checked', DATA.nightBlock);

  /* ================= HELPERS ================= */

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const isNight = m => m >= NIGHT_START && m < NIGHT_END;

  const getUnits = () => {
    let u = { ...FAKE_LIMITS[DATA.fakeLimit], spy: 1 };
    if (DATA.unitMode === 'catapult') {
      u.catapult = 1; u.ram = 0;
    } else if (DATA.unitMode === 'rotate') {
      u.ram = Math.random() > 0.5 ? 1 : 0;
      u.catapult = u.ram ? 0 : 1;
    } else {
      u.ram = 1; u.catapult = 0;
    }
    return u;
  };

  /* ================= SAVE ================= */

  $('#p2_save').click(() => {
    DATA.coords = ($('#p2_coords').val().match(/\d+\|\d+/g) || []);
    DATA.fakeLimit = +$('#p2_limit').val();
    DATA.unitMode = $('#p2_unit').val();
    DATA.delay = $('#p2_delay').val();
    DATA.nightBlock = $('#p2_night').is(':checked');
    save();
    renderPages();
  });

  $('#p2_close').click(() => panel.remove());

  /* ================= PAGINATION ================= */

  function renderPages() {
    const wrap = $('#p2_pages').empty();
    const pages = Math.ceil(DATA.coords.length / DATA.split);

    for (let i = 0; i < pages; i++) {
      $('<button>')
        .text(`${i * 10 + 1}-${Math.min((i + 1) * 10, DATA.coords.length)}`)
        .css('margin', '3px')
        .click(() => openPage(i))
        .appendTo(wrap);
    }
  }

  function openPage(p) {
    const [d1, d2] = DATA.delay.split('-').map(Number);
    let delay = 0;

    DATA.coords
      .slice(p * DATA.split, p * DATA.split + DATA.split)
      .forEach(c => {
        delay += rand(d1, d2);
        setTimeout(() => {
          window.open(
            game_data.link_base_pure + 'place&target=' + c,
            '_blank'
          );
        }, delay);
      });
  }

  renderPages();
  console.log('planner2.js loaded OK');

})();
