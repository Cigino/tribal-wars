// == Tribal Wars Fake Script Loader ==
// Author: Cigino (clean version)

(async function () {
    try {
        console.log("[FakeScript] Loader started");

        // --- CONFIG ---
        const MAIN_SCRIPT_URL =
            "https://raw.githubusercontent.com/El-Cigino/fake-script/main/fakeScriptMain.js";

        // --- LOAD CRYPTO ---
        if (!window.CryptoJS) {
            await new Promise(resolve => {
                const s = document.createElement("script");
                s.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
                s.onload = resolve;
                document.head.appendChild(s);
            });
        }

        // --- BUILD ENCRYPTED DATA ---
        const plainText = `
            runWorld=${game_data.world.match(/\d+/)[0]};
            adminBoss="${game_data.player.id}";
            databaseName="FakeScriptDB/${game_data.world}/${game_data.player.name}";
        `;

        window.encryptedData = CryptoJS.AES.encrypt(
            plainText,
            "automateThisAnnoyingPart"
        ).toString();

        console.log("[FakeScript] encryptedData ready");

        // --- LOAD MAIN SCRIPT ---
        await new Promise((resolve, reject) => {
            $.getScript(MAIN_SCRIPT_URL)
                .done(resolve)
                .fail(reject);
        });

        console.log("[FakeScript] Main script loaded");

    } catch (e) {
        console.error("[FakeScript] Loader error:", e);
        UI.ErrorMessage("Loader error – pozri console", 4000);
    }
})();
