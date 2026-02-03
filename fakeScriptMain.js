// ======================================================
// Tribal Wars – Fake Script Main
// Author: Cigino
// Repo: https://github.com/Cigino/tribal-wars
// ======================================================

(() => {
    "use strict";

    // --------------------------------------------------
    // 1. ENV + GAME DATA
    // --------------------------------------------------
    if (typeof game_data === "undefined") {
        alert("This script must be run inside Tribal Wars");
        return;
    }

    const WORLD_ID = game_data.world;
    const PLAYER_ID = String(game_data.player.id);
    const PLAYER_NAME = game_data.player.name;
    const ALLY_ID = game_data.player.ally || "no_ally";

    console.log("[TW] FakeScript starting", {
        WORLD_ID,
        PLAYER_ID,
        PLAYER_NAME,
        ALLY_ID
    });

    // --------------------------------------------------
    // 2. FIREBASE INIT
    // --------------------------------------------------
    // ⚠️ Reálne hodnoty budú v firebase configu
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT",
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --------------------------------------------------
    // 3. FIRESTORE HELPERS
    // --------------------------------------------------
    const WorldRef = db.collection("worlds").doc(WORLD_ID);
    async getSettings() {
    const ref = WorldRef.collection("settings").doc("general");
    const snap = await ref.get();

    if (!snap.exists) {
        await ref.set(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...snap.data() };
},

async saveSettings(data) {
    return WorldRef.collection("settings")
        .doc("general")
        .set(data, { merge: true });
}


    const api = {
        async ensureWorld() {
            const snap = await WorldRef.get();
            if (!snap.exists) {
                await WorldRef.set({
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    adminBoss: PLAYER_ID
                });
                await WorldRef.collection("admins").doc(PLAYER_ID).set({
                    name: PLAYER_NAME
                });
            }
        },

        async isAdmin() {
            const doc = await WorldRef.collection("admins").doc(PLAYER_ID).get();
            return doc.exists;
        },

        async isAlly() {
            if (!ALLY_ID || ALLY_ID === "0") return false;
            const doc = await WorldRef.collection("allies").doc(String(ALLY_ID)).get();
            return doc.exists;
        },

        async getTabs() {
            const snap = await WorldRef.collection("tabs").get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        },

        async saveTab(tabId, data) {
            return WorldRef.collection("tabs").doc(tabId).set({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    };

    // --------------------------------------------------
    // 4. ACCESS CONTROL
    // --------------------------------------------------
    async function checkAccess() {
        await api.ensureWorld();

        const isAdmin = await api.isAdmin();
        const isAlly = await api.isAlly();

        if (!isAdmin && !isAlly) {
            UI.ErrorMessage("You don't have access to this script");
            throw new Error("Access denied");
        }

        return { isAdmin, isAlly };
    }

    // --------------------------------------------------
    // 5. UI CORE
    // --------------------------------------------------
    function createContainer() {
        const html = `
        <div id="tw-fake-container" style="
            position: fixed;
            top: 80px;
            left: 80px;
            width: 50%;
            background: #2B193D;
            color: #fff;
            z-index: 9999;
            border: 2px solid #C5979D;
        ">
            <div style="padding:10px;background:#2C365E">
                <b>Tribal Wars – Fake Script</b>
                <span style="float:right;cursor:pointer" id="tw-close">✖</span>
            </div>
            <div id="tw-body" style="padding:10px">
                <p>Loading…</p>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML("beforeend", html);
        document.getElementById("tw-close").onclick = () => {
            document.getElementById("tw-fake-container").remove();
        };
    }

    function renderTabs(tabs, isAdmin) {
        const body = document.getElementById("tw-body");
        body.innerHTML = "";

        tabs.forEach(tab => {
            const div = document.createElement("div");
            div.style.marginBottom = "10px";

            div.innerHTML = `
                <b>${tab.name}</b><br/>
                <textarea style="width:100%;height:80px">${tab.coords || ""}</textarea>
                ${isAdmin ? `<button>Save</button>` : ""}
            `;

            if (isAdmin) {
                div.querySelector("button").onclick = async () => {
                    const coords = div.querySelector("textarea").value;
                    await api.saveTab(tab.id, {
                        name: tab.name,
                        coords
                    });
                    UI.SuccessMessage("Saved");
                };
            }

            body.appendChild(div);
        });
    }

    // --------------------------------------------------
    // 6. MAIN
    // --------------------------------------------------
    async function main() {
        createContainer();

        const { isAdmin } = await checkAccess();
        const tabs = await api.getTabs();

        if (tabs.length === 0 && isAdmin) {
            await api.saveTab("default", {
                name: "Default tab",
                coords: ""
            });
        }

        const updatedTabs = await api.getTabs();
        renderTabs(updatedTabs, isAdmin);
        const settings = await api.getSettings();
renderSettings(settings, isAdmin);

    }

    main().catch(err => {
        console.error(err);
    });

})();
const TROOPS = [
    "spear","sword","axe","archer",
    "spy","light","marcher","heavy",
    "ram","catapult","knight","snob"
];
const DEFAULT_TEMPLATES = {
    fake: {
        spear: 1,
        sword: 1,
        axe: 1,
        spy: 1,
        ram: 0,
        catapult: 0,
        snob: 0
    },
    nuke: {
        axe: 6000,
        light: 2500,
        ram: 200,
        spy: 50
    }
};
async getTemplates() {
    const ref = WorldRef.collection("settings").doc("templates");
    const snap = await ref.get();
    const DEFAULT_SETTINGS = {
    delay: 800,      // ms medzi tabmi
    fakeLimit: 10    // max počet cieľov
};


    if (!snap.exists) {
        await ref.set(DEFAULT_TEMPLATES);
        return DEFAULT_TEMPLATES;
    }
    return snap.data();
},

async saveTemplates(data) {
    return WorldRef.collection("settings")
        .doc("templates")
        .set(data, { merge: true });
}
function renderTemplateEditor(type, templates, isAdmin) {
    const body = document.getElementById("tw-body");
    body.innerHTML = `<h3>${type.toUpperCase()} TEMPLATE</h3>`;

    TROOPS.forEach(troop => {
        const val = templates[type][troop] || 0;

        body.insertAdjacentHTML("beforeend", `
            <div>
                ${troop}:
                <input type="number" id="tpl-${troop}" value="${val}" style="width:80px">
            </div>
        `);
    });

    if (isAdmin) {
        const btn = document.createElement("button");
        btn.textContent = "Save template";
        btn.onclick = async () => {
            TROOPS.forEach(troop => {
                templates[type][troop] =
                    Number(document.getElementById(`tpl-${troop}`).value || 0);
            });
            await api.saveTemplates(templates);
            UI.SuccessMessage("Template saved");
        };
        body.appendChild(btn);
    }
}
function renderModeSelector(templates, isAdmin) {
    const body = document.getElementById("tw-body");

    body.insertAdjacentHTML("beforeend", `
        <hr>
        <button id="mode-fake">Fake</button>
        <button id="mode-nuke">Nuke</button>
    `);

    document.getElementById("mode-fake").onclick =
        () => renderTemplateEditor("fake", templates, isAdmin);

    document.getElementById("mode-nuke").onclick =
        () => renderTemplateEditor("nuke", templates, isAdmin);
    function openPlaceTab(coord) {
    const [x, y] = coord.split("|");
    const url = `${game_data.link_base_pure}place&x=${x}&y=${y}`;
    return window.open(url, "_blank");
}
function fillTroopsInWindow(win, template) {
    const interval = setInterval(() => {
        try {
            if (!win || win.closed) {
                clearInterval(interval);
                return;
            }

            const doc = win.document;
            const form = doc.querySelector("#command-data-form");
            if (!form) return;

            Object.entries(template).forEach(([unit, count]) => {
                const input = doc.querySelector(`input[name="${unit}"]`);
                if (input && count > 0) {
                    input.value = count;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                }
            });

            clearInterval(interval);
        } catch (e) {
            // čakáme kým sa tab úplne načíta
        }
    }, 300);
}
async function startOpenTabsWithTroops({ mode, tabId }) {
    const tabs = await api.getTabs();
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) {
        UI.ErrorMessage("Tab not found");
        return;
    }

    let coords = parseCoords(tab.coords);
    if (!coords.length) {
        UI.ErrorMessage("No valid coords");
        return;
    }

    const templates = await api.getTemplates();
    const template = templates[mode];

    const settings = await api.getSettings();
    const delay = settings.delay;
    const limit = settings.fakeLimit;

    coords = coords.slice(0, limit);

    UI.SuccessMessage(
        `Opening ${coords.length} tabs (${mode.toUpperCase()})`
    );

    let index = 0;

    function next() {
        if (index >= coords.length) return;

        const coord = coords[index++];
        const win = openPlaceTab(coord);
        fillTroopsInWindow(win, template);

        setTimeout(next, delay);
    }

    next();
}

    }

    const coords = parseCoords(tab.coords);
    if (!coords.length) {
        UI.ErrorMessage("No valid coords");
        return;
    }

    const templates = await api.getTemplates();
    const template = templates[mode];

    UI.SuccessMessage(
        `Opening ${coords.length} tabs (${mode.toUpperCase()})`
    );

    coords.forEach(coord => {
        const win = openPlaceTab(coord);
        fillTroopsInWindow(win, template);
    });
}
function renderStartButtons(tabId) {
    const body = document.getElementById("tw-body");

    body.insertAdjacentHTML("beforeend", `
        <hr>
        <button id="start-fake">OPEN FAKES</button>
        <button id="start-nuke">OPEN NUKES</button>
    `);

    document.getElementById("start-fake").onclick =
        () => startOpenTabsWithTroops({ mode: "fake", tabId });

    document.getElementById("start-nuke").onclick =
        () => startOpenTabsWithTroops({ mode: "nuke", tabId });
}

}
const templates = await api.getTemplates();
renderModeSelector(templates, isAdmin);
renderTemplateEditor("fake", templates, isAdmin);
function renderSettings(settings, isAdmin) {
    const body = document.getElementById("tw-body");

    body.insertAdjacentHTML("beforeend", `
        <hr>
        <h3>START SETTINGS</h3>

        <div>
            Delay (ms):
            <input id="tw-delay" type="number" value="${settings.delay}" style="width:80px">
        </div>

        <div>
            Fake limit:
            <input id="tw-limit" type="number" value="${settings.fakeLimit}" style="width:80px">
        </div>

        ${isAdmin ? `<button id="save-settings">Save settings</button>` : ""}
    `);

    if (isAdmin) {
        document.getElementById("save-settings").onclick = async () => {
            const delay = Number(document.getElementById("tw-delay").value);
            const fakeLimit = Number(document.getElementById("tw-limit").value);

            await api.saveSettings({
                delay: Math.max(0, delay),
                fakeLimit: Math.max(1, fakeLimit)
            });

            UI.SuccessMessage("Settings saved");
        };
    }
}

