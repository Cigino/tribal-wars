// ==UserScript==
// @name         FarmSmart (DK)
// @version      0.1
// @description  Inteligentné farmenie s A/B/C logikou a cooldownom
// @match        https://*.divokekmeny.sk/*
// @match        https://*.tribalwars.net/*
// @match        https://*.tribalwars.com/*
// ==/UserScript==

javascript:(function(){
'use strict';

try {
console.log('[FarmSmart] START');

/************************************************************
 * 1) ZÁKLADNÁ KONTROLA PROSTREDIA
 ************************************************************/
if (typeof window.game_data === 'undefined') {
    alert('Spusť skript priamo v hre Divoké kmene.');
    return;
}

/************************************************************
 * 2) IDENTITA – KĽÚČ PRE ODDDELENÚ DB PODĽA SVETA
 ************************************************************/
const DK = {
    server: location.hostname,
    world: game_data.world,
    village: game_data.village.coord,
    now: () => Date.now()
};

const DB_KEY = `FARMSMART_${DK.server}_${DK.world}`;

/************************************************************
 * 3) DATABÁZA (LOCALSTORAGE)
 ************************************************************/
const DB = {
    data: null,

    load() {
        const raw = localStorage.getItem(DB_KEY);
        this.data = raw ? JSON.parse(raw) : {};

        if (!this.data.villages) this.data.villages = {};

        if (!this.data.settings) {
            this.data.settings = {
                cooldownMin: 1,     // globálny cooldown (minúty)
                maxDistance: 15,    // (zatiaľ len pre budúce rozšírenie)

                // Jednotky (bude editovateľné v ďalšej verzii)
                unitsA: { light: 2 },
                unitsB: { light: 3 },
                unitsC: { light: 6, ram: 2 }
            };
        }
        this.save();
    },

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    },

    getVillage(coord) {
        if (!this.data.villages[coord]) {
            this.data.villages[coord] = {
                state: "ACTIVE",   // ACTIVE | NEED_C | BLOCKED
                lastAttack: 0,
                nextPattern: "A"   // A | B | C
            };
            this.save();
        }
        return this.data.villages[coord];
    },

    countVillages() {
        return Object.keys(this.data.villages).length;
    }
};

DB.load();

/************************************************************
 * 4) GLOBÁLNY COOLDAWN
 ************************************************************/
function inCooldown(v) {
    const ms = DB.data.settings.cooldownMin * 60 * 1000;
    return (DK.now() - v.lastAttack) < ms;
}

/************************************************************
 * 5) PANEL S NASTAVENIAMI (VŽDY SA VYTVORÍ)
 ************************************************************/
const old = document.getElementById('farmsmart_panel');
if (old) old.remove();

const panel = document.createElement('div');
panel.id = 'farmsmart_panel';
panel.style.cssText = `
    position:fixed;
    top:110px;
    right:10px;
    background:#222;
    color:#fff;
    padding:10px;
    z-index:999999;
    font-size:12px;
    border-radius:6px;
    box-shadow:0 0 6px #000;
    font-family: Arial, sans-serif;
`;

panel.innerHTML = `
<b>FarmSmart</b><br><br>

Max. vzdialenosť:<br>
<input id="fs_maxdist" type="number"
 value="${DB.data.settings.maxDistance}" style="width:60px"><br><br>

Cooldown (min):<br>
<input id="fs_cd" type="number"
 value="${DB.data.settings.cooldownMin}" style="width:60px"><br><br>

<button id="fs_save">Uložiť</button>
<button id="fs_test">Test DB</button>
`;

document.body.appendChild(panel);

/************************************************************
 * 6) TLAČIDLÁ V PANELI
 ************************************************************/
document.getElementById('fs_save').addEventListener('click', function(){
    const maxD = parseInt(document.getElementById('fs_maxdist').value, 10);
    const cd = parseInt(document.getElementById('fs_cd').value, 10);

    if (!isNaN(maxD)) DB.data.settings.maxDistance = maxD;
    if (!isNaN(cd)) DB.data.settings.cooldownMin = cd;

    DB.save();
    alert('Uložené!');
});

document.getElementById('fs_test').addEventListener('click', function(){
    alert(
        'Tvoja dedina: ' + DK.village + '\n' +
        'Dedín v DB: ' + DB.countVillages()
    );
});

/************************************************************
 * 7) ENTER = A/B/C LOGIKA (FARM ASSISTANT)
 ************************************************************/
if (location.href.includes('screen=am_farm')) {

    function getCoordFromRow(row) {
        const cell = row.querySelector('.village_coord');
        if (!cell) return null;
        return cell.innerText.trim();
    }

    function highlightRow(row, pattern) {
        row.style.transition = 'background 0.2s';

        if (pattern === 'A') {
            row.style.background = '#1b5e20'; // zelená
            row.style.color = '#fff';
        }
        else if (pattern === 'B') {
            row.style.background = '#f57f17'; // žltá
            row.style.color = '#000';
        }
        else if (pattern === 'C') {
            row.style.background = '#b71c1c'; // červená
            row.style.color = '#fff';
        }
    }

    document.addEventListener('keydown', function(e){
        if (e.key !== 'Enter') return;

        const rows = Array.from(document.querySelectorAll('tr.farmRow'));
        const row = rows.find(r => r.offsetParent !== null);

        if (!row) {
            console.log('[FarmSmart] Žiadny riadok na spracovanie.');
            return;
        }

        const coord = getCoordFromRow(row);
        if (!coord) {
            console.log('[FarmSmart] Nenašli sa súradnice.');
            return;
        }

        const v = DB.getVillage(coord);

        if (inCooldown(v)) {
            row.style.background = '#555';
            row.style.color = '#ccc';
            row.title = 'COOLDOWN';
            console.log(`[FarmSmart] ${coord} je v cooldowne.`);
            return;
        }

        highlightRow(row, v.nextPattern);
        console.log(`[FarmSmart] ${coord} → poslať ${v.nextPattern}`);
    });

}

/************************************************************
 * HOTOVO
 ************************************************************/
console.log('[FarmSmart] LOADED');

} catch (e) {
    console.error('[FarmSmart ERROR]', e);
    alert('Chyba (pozri F12): ' + e.message);
}

})();
