// ==UserScript==
// @name        Tribal Wars Planner + Costache bookmarklet support
// @namespace   tribalwars
// @match       https://*.tribalwars.net/*
// @version     1.0
// ==/UserScript==

(async function () {
    /* --- IMPORT CryptoJS AES pre šifrovanie Costache bookmarkletu --- */
    const cryptoScript = document.createElement("script");
    cryptoScript.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js";
    document.head.appendChild(cryptoScript);
    await new Promise(res => cryptoScript.onload = res);

    /* --- UI HLAVNEJ FUNKCIE pre plánovač a bookmarklet --- */
    const container = document.createElement("div");
    container.style = "position:fixed;bottom:10px;right:10px;width:350px;z-index:9999;background:#fff;border:2px solid #000;padding:10px;";

    container.innerHTML = `
        <h3>TW Planner + Costache fake</h3>
        <label>Fake coordy (x|y):</label><br><input id="inp_fake" style="width:100%"><br>
        <label>World number:</label><br><input id="inp_world" style="width:100%"><br>
        <label>Dropbox token:</label><br><input id="inp_token" style="width:100%"><br>
        <label>DB Name:</label><br><input id="inp_db" style="width:100%"><br>
        <label>Tvoj admin ID:</label><br><input id="inp_admin" style="width:100%"><br><br>

        <button id="btn_generate">Generuj Costache bookmarklet</button><br><br>

        <textarea id="out_bookmark" rows="4" style="width:100%"></textarea>
    `;
    document.body.appendChild(container);

    /* --- FUNKCIA na generovanie bookmarkletu --- */
    function generateCostacheBookmarklet(config) {
        // pripravi text s potrebnymi hodnotami
        const plainText =
            `dropboxToken="${config.dropboxToken}";` +
            `databaseName="${config.databaseName}";` +
            `runWorld=${config.worldNumber};` +
            `adminBoss="${config.adminId}";` +
            `fakeCoords="${config.fakeCoords}";`;

        const encryptionKey = "automateThisAnnoyingPart";
        const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey).toString();

        // bookmarklet v spravnom formate pre Costache main skript
        const bookmarklet =
            "javascript:var encryptedData='" + encrypted +
            "';$.getScript('https://dl.dropboxusercontent.com/s/2q29vaqbibe6tph/fakeScriptMain.js?dl=0');void(0);";

        return bookmarklet;
    }

    /* --- STLAČENIE TLACIDLA --- */
    document.getElementById("btn_generate").onclick = () => {
        const cfg = {
            fakeCoords: document.getElementById("inp_fake").value.trim(),
            worldNumber: parseInt(document.getElementById("inp_world").value.trim()) || 0,
            dropboxToken: document.getElementById("inp_token").value.trim(),
            databaseName: document.getElementById("inp_db").value.trim(),
            adminId: document.getElementById("inp_admin").value.trim()
        };
        const bm = generateCostacheBookmarklet(cfg);
        document.getElementById("out_bookmark").value = bm;
    };
})();
