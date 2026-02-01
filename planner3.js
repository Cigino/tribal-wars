// ==UserScript==
// @name        TW Planner (GitHub edition for Costache)
// @namespace   tribalwars
// @match       https://*.tribalwars.net/*
// @version     2.0
// ==/UserScript==

(async function () {

    /* ================================
       1) NAČÍTAME CryptoJS (pre kompatibilitu)
    ================================ */
    const cryptoScript = document.createElement("script");
    cryptoScript.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js";
    document.head.appendChild(cryptoScript);
    await new Promise(res => cryptoScript.onload = res);

    /* ================================
       2) UI OKNO V HRE
    ================================ */
    const container = document.createElement("div");
    container.style = `
        position:fixed;
        bottom:10px;
        right:10px;
        width:380px;
        z-index:999999;
        background:#fff;
        border:2px solid #000;
        padding:10px;
        font-size:12px;
    `;

    container.innerHTML = `
        <h3>Costache (GitHub) Bookmarklet</h3>

        <label>Fake koordináty (x|y):</label><br>
        <input id="inp_fake" style="width:100%"><br><br>

        <label>Číslo sveta (napr. 35):</label><br>
        <input id="inp_world" style="width:100%"><br><br>

        <label>GitHub RAW URL databázy:</label><br>
        <input id="inp_github" style="width:100%" 
        placeholder="https://raw.githubusercontent.com/USER/REPO/main/db.json"><br><br>

        <label>Názov databázy (ľubovoľné meno):</label><br>
        <input id="inp_db" style="width:100%"><br><br>

        <label>Tvoje admin ID:</label><br>
        <input id="inp_admin" style="width:100%"><br><br>

        <button id="btn_generate">GENERUJ GITHUB BOOKMARKLET</button><br><br>

        <textarea id="out_bookmark" rows="5" style="width:100%"></textarea>

        <p style="font-size:10px;color:gray;">
        Skopíruj text vyššie a ulož ako záložku v prehliadači.
        </p>
    `;

    document.body.appendChild(container);

    /* ================================
       3) FUNKCIA NA GENEROVANIE BOOKMARKLETU
    ================================ */
    function generateGithubBookmarklet(config) {

        // pripravíme "fake" encryptedData len kvôli kompatibilite
        const plainText =
            `dropboxToken="GITHUB_MODE";` +
            `databaseName="${config.databaseName}";` +
            `runWorld=${config.worldNumber};` +
            `adminBoss="${config.adminId}";` +
            `fakeCoords="${config.fakeCoords}";` +
            `githubRaw="${config.githubUrl}";`;

        const encryptionKey = "automateThisAnnoyingPart";
        const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey).toString();

        // TOTO JE KĽÚČOVÁ ČASŤ — GitHub loader
        const loader = `
        (function(){
            // PREPÍŠEME Dropbox volania na GitHub
            window.__GITHUB_RAW_DB = "${config.githubUrl}";

            // Zachytíme pokusy o načítanie Dropbox súborov
            window.fetchDropboxFile = async function(path){
                console.log("Redirecting Dropbox request to GitHub:", path);
                const res = await fetch(window.__GITHUB_RAW_DB);
                return await res.text();
            };

            // PREPÍŠEME AJAX volania Costache skriptu
            const _origAjax = window.jQuery.ajax;
            window.jQuery.ajax = function(opts){
                if(opts.url && opts.url.includes("dropboxusercontent.com")){
                    console.log("Intercepted Dropbox call -> GitHub");
                    opts.url = window.__GITHUB_RAW_DB;
                }
                return _origAjax(opts);
            };
        })();
        `;

        // finálny bookmarklet
        const bookmarklet =
            "javascript:var encryptedData='" + encrypted + "';" +
            encodeURIComponent(loader) + ";" +
            "$.getScript('https://dl.dropboxusercontent.com/s/2q29vaqbibe6tph/fakeScriptMain.js?dl=0');void(0);";

        return bookmarklet;
    }

    /* ================================
       4) TLAČIDLO
    ================================ */
    document.getElementById("btn_generate").onclick = () => {

        const githubUrl = document.getElementById("inp_github").value.trim();

        if (!githubUrl.startsWith("https://raw.githubusercontent.com")) {
            alert("MUSÍŠ zadať RAW GitHub URL (raw.githubusercontent.com)!");
            return;
        }

        const cfg = {
            fakeCoords: document.getElementById("inp_fake").value.trim(),
            worldNumber: parseInt(document.getElementById("inp_world").value.trim()) || 0,
            githubUrl: githubUrl,
            databaseName: document.getElementById("inp_db").value.trim(),
            adminId: document.getElementById("inp_admin").value.trim()
        };

        const bm = generateGithubBookmarklet(cfg);
        document.getElementById("out_bookmark").value = bm;
    };

})();
