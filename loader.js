// ===============================
// Tribal Wars – Loader
// Author: Cigino
// Repo: https://github.com/Cigino/tribal-wars
// ===============================

(function () {

    if (window.firebase && firebase.apps && firebase.apps.length) {
        console.warn("[TW] Firebase already loaded");
        loadMain();
        return;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function initFirebase() {
        // 🔥 STABILNÁ VERZIA
        await loadScript("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
        await loadScript("https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js");
    }

    function loadMain() {
        const script = document.createElement("script");
        script.src = "https://raw.githubusercontent.com/Cigino/tribal-wars/main/fakeScriptMain.js";
        script.type = "text/javascript";
        document.body.appendChild(script);
    }

    async function start() {
        console.log("[TW] Loader starting…");
        await initFirebase();
        loadMain();
    }

    start();
})();

    function loadMain() {
        const script = document.createElement("script");
        script.src = "https://raw.githubusercontent.com/Cigino/tribal-wars/main/fakeScriptMain.js";
        script.type = "text/javascript";
        document.body.appendChild(script);
    }

    async function start() {
        console.log("[TW] Loader starting…");
        await initFirebase();
        loadMain();
    }

    start();
})();
