// == Tribal Wars Fake Script Loader ==
// Author: Costache Madalin (modified by ChatGPT)
// -------------------------------------------------

var settings = {
    backgroundContainer: "#f5f5f5", // svetlé pozadie hlavného okna
    textColor: "#000000",           // tmavý text
    backgroundHeader: "#dddddd",    // header okna
    borderColor: "#000000",         // rám
    buttonColor: "#4CAF50",         // farba tlačidiel
    buttonText: "#ffffff",
    widthInterface: 50,             // percentá
    localStorageThemeName: "fakeScriptTheme",
};

async function main() {
    initializeTheme();
    await loadCryptoJS();
    createInterface();
}

// ----------------- Helper Functions -----------------

function createInterface() {
    // odstráni starý loader ak existuje
    $("#div_container").remove();

    let html = `
    <div id="div_container" style="position:fixed; top:20px; left:20px; width:${settings.widthInterface}%; background:${settings.backgroundContainer}; color:${settings.textColor}; border:2px solid ${settings.borderColor}; z-index:99999; padding:10px; border-radius:8px;">
        <div id="div_header" style="background:${settings.backgroundHeader}; padding:5px; font-weight:bold; display:flex; justify-content:space-between; align-items:center; cursor:move;">
            <span>Generate Fake Script</span>
            <span>
                <button id="btn_minimize" style="margin-right:5px;">_</button>
                <button id="btn_close">X</button>
            </span>
        </div>

        <div id="div_body" style="margin-top:10px;">
            <label>Admin ID:</label><br>
            <input type="text" id="input_admin_id" value="${game_data.player.id}" style="width:95%; margin-bottom:5px;"><br>

            <label>World Number:</label><br>
            <input type="text" id="input_number_world" value="${game_data.world.match(/\d+/)[0]}" style="width:95%; margin-bottom:5px;"><br>

            <label>Database Name:</label><br>
            <input type="text" id="input_database_name" value="PleaseWork" style="width:95%; margin-bottom:5px;"><br>

            <label>Script Link:</label><br>
            <textarea id="input_link_script" style="width:95%; height:60px;" placeholder="Script will appear here"></textarea><br>

            <button id="btn_start" style="background:${settings.buttonColor}; color:${settings.buttonText}; border:none; padding:5px 10px; cursor:pointer;">Start</button>
        </div>
    </div>`;

    $("body").prepend(html);

    // draggable header
    $("#div_header").on("mousedown", function(e) {
        let $drag = $("#div_container").css("position","absolute");
        let offset = $drag.offset();
        let dx = e.pageX - offset.left, dy = e.pageY - offset.top;

        $(document).on("mousemove.drag", function(e) {
            $drag.offset({ top: e.pageY - dy, left: e.pageX - dx });
        });

        $(document).on("mouseup.drag", function() {
            $(document).off("mousemove.drag mouseup.drag");
        });
    });

    // close/minimize
    $("#btn_close").click(()=>$("#div_container").remove());
    $("#btn_minimize").click(()=>{
        $("#div_body").toggle();
        $("#div_container").css("width", $("#div_body").is(":visible") ? settings.widthInterface + "%" : "150px");
    });

    // Start button
    $("#btn_start").click(generateScript);
}

function initializeTheme() {
    if(localStorage.getItem(settings.localStorageThemeName)){
        let stored = JSON.parse(localStorage.getItem(settings.localStorageThemeName));
        Object.assign(settings, stored);
    }
}

function loadCryptoJS() {
    return new Promise((resolve)=>{
        if(window.CryptoJS) return resolve();
        let script = document.createElement("script");
        script.src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js";
        script.onload=()=>resolve();
        document.head.appendChild(script);
    });
}

// ----------------- Main Function -----------------

async function generateScript(){
    let nameAdmin = $("#input_admin_id").val();
    let databaseName = $("#input_database_name").val();
    let numberWorld = $("#input_number_world").val();
    let playerName = game_data.player.name;
    databaseName = `FakeScriptDB/${game_data.world.match(/[a-z]+/)[0]}/${numberWorld}/${databaseName}_${playerName}_${nameAdmin}`;

    let plainText = `
    dropboxToken="${CryptoJS.AES.decrypt("U2FsdGVkX1/XDlZAe4KUe0u3hR4rU2OQpzpEQo2LJ+nuYec+YxogJcbXoxoUMEx+XCUhoE5nPO8YRA2mQBb6PeuBx2RqMPf8DmclF3dfI1urOCUTyMS0kgJnN92BAdJN","whatup").toString(CryptoJS.enc.Utf8)}";
    databaseName="${databaseName}";
    runWorld=${numberWorld};
    adminBoss="${nameAdmin}";
    `;
    let key = CryptoJS.AES.encrypt(plainText, "automateThisAnnoyingPart").toString();

    let outputScript = `javascript:var encryptedData='${key}';$.getScript('https://cdn.jsdelivr.net/gh/El-Cigino/fake-script@main/fakeScriptMain.js');
    $("#input_link_script").val(outputScript);
    alert("Script generated! Copy the link above to run.");
}

// ----------------- Start -----------------
main();
