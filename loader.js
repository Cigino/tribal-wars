// ===============================
// Tribal Wars – Loader
// Author: Cigino
// Repo: https://github.com/Cigino/tribal-wars
// ===============================

(function () {
    if (typeof firebase !== "undefined") {
        console.warn("Firebase already loaded");
        loadMain();
        return;
    }

    const FIREBASE_VERSION = "9.23.0";

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
        await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
        await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`);
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
