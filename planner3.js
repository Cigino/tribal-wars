// ==UserScript==
// @name        TW Planner + Costache Bookmarklet Generator
// @namespace   tribalwars
// @match       https://*.tribalwars.net/*
// @version     1.1
// ==/UserScript==

(async function () {

    // 1) Načítame CryptoJS (POTREBNÉ pre Costache)
    const cryptoScript = document.createElement("script");
    cryptoScript.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js";
    document.head.appendChild(cryptoScript);
    await new Promise(res => cryptoScript.onload = res);

    // 2) Vytvoríme UI okno
    const container = document.createElement("div");
    container.style = `
        position:fixed;
        bottom:10px;
        right:10px;
        width:360px;
        z-index:999999;
        background:#fff;
        border:2px solid #000;
        padding:10px;
        font-size:12px;
    `;

    container.innerHTML = `
        <h3>Costache Bookmarklet Generator</h3>

        <label>Fake koordináty (x|y):</label><br>
        <input id="inp_fake" style="width:100%"><br><br>

        <label>Číslo sveta (napr. 35):</label><br>
        <input id="inp_world" style="width:100%"><br><br>

        <label>Dropbox TOKEN (POVINNÉ!):</label><br>
        <input id="inp_token" style="width:100%"><br><br>

        <label>Názov databázy (DB name):</label><br>
        <input id="inp_db" style="width:100%"><br><br>

        <label>Tvoje admin ID:</label><br>
        <input id="inp_admin" style="width:100%"><br><br>

        <button id="btn_generate">GENERUJ BOOKMARKLET</button><br><br>

        <textarea id="out_bookmark" rows="4" style="width:100%"></textarea>
        <p style="font-size:10px;color:gray;">
        Skopíruj text vyššie a ulož ako záložku v prehliadači.
        </p>
    `;

    document.body.appendChild(container);

    // 3) Funkcia na generovanie Costache bookmarkletu
    function generateCostacheBookmarklet(config) {

        // TOTO MUSÍ byť rovnaké ako u Costache launcheru:
        const plainText =
            `dropboxToken="${config.dropboxToken}";` +
            `databaseName="${config.databaseName}";` +
            `runWorld=${config.worldNumber};` +
            `adminBoss="${config.adminId}";` +
            `fakeCoords="${config.fakeCoords}";`;

        const encryptionKey = "automateThisAnnoyingPart";

        const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey).toString();

        const bookmarklet =
            "javascript:var encryptedData='" + encrypted +
            "';$.getScript('https://dl.dropboxusercontent.com/s/2q29vaqbibe6tph/fakeScriptMain.js?dl=0');void(0);";

        return bookmarklet;
    }

    // 4) Keď klikneš na tlačidlo
    document.getElementById("btn_generate").onclick = () => {

        const token = document.getElementById("inp_token").value.trim();

        if (!token) {
            alert("MUSÍŠ zadať Dropbox TOKEN, inak to NEBUDE fungovať!");
            return;
        }

        const cfg = {
            fakeCoords: document.getElementById("inp_fake").value.trim(),
            worldNumber: parseInt(document.getElementById("inp_world").value.trim()) || 0,
            dropboxToken: token,
            databaseName: document.getElementById("inp_db").value.trim(),
            adminId: document.getElementById("inp_admin").value.trim()
        };

        const bm = generateCostacheBookmarklet(cfg);
        document.getElementById("out_bookmark").value = bm;
    };

})();
