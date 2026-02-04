// =================== BEZ-DROPBOX VERZIA ===================

// ======= ZÁKLADNÉ PREMENNÉ (ponechané) =======
var backgroundColor = "#32313f";
var borderColor = "#3e6147";
var headerColor = "#202825";
var titleColor = "#ffffdf";

var countApiKey = "generateFakeScript";
var countNameSpace="madalinoTribalWarsScripts";

var defaultTheme='[["theme1",["#E0E0E0","#000000","#C5979D","#2B193D","#2C365E","#484D6D","#4B8F8C","35"]],["currentTheme","theme1"]]';
var localStorageThemeName = "generateFakeScript";

var textColor="#ffffff";
var backgroundInput="#000000";
var backgroundContainer="#2B193D";
var backgroundHeader="#2C365E";
var backgroundMainTable="#484D6D";
var backgroundInnerTable="#4B8F8C";
var widthInterface=50;

// =================== BOOTSTRAP (istota že máme jQuery) ===================
async function ensureJQuery(){
    if (typeof $ === "undefined"){
        await new Promise(resolve=>{
            let s = document.createElement("script");
            s.src = "https://code.jquery.com/jquery-3.6.0.min.js";
            s.onload = resolve;
            document.head.appendChild(s);
        });
    }
}

// =================== HLAVNÁ FUNKCIA ===================
(async function main(){
    await ensureJQuery();
    initializationTheme();

    // Načítame len CSS z GitHubu (UI štýly)
    await $.getScript(
        "https://raw.githubusercontent.com/Cigino/tribal-wars/main/styleCSSGlobal.js"
    );

    createMainInterface();
    hitCountApi();
})();

// =================== UI (OKNO) ===================
function createMainInterface(){
    let html = `
    <div id="div_container" class="scriptContainer" style="z-index:99999;">
        <div class="scriptHeader">
            <h2>Generate fake script (NO DROPBOX)</h2>
        </div>
        <div id="div_body">
            <table class="scriptTable">
                <tr>
                    <td>Admin ID</td>
                    <td><input id="input_admin_id" value="${game_data.player.id}"></td>
                </tr>
                <tr>
                    <td>World</td>
                    <td><input id="input_number_world" value="${game_data.world.match(/\\d+/)[0]}"></td>
                </tr>
                <tr>
                    <td>Database name</td>
                    <td><input id="input_database_name" value="PleaseWork"></td>
                </tr>
                <tr>
                    <td>Generated script</td>
                    <td>
                        <textarea id="input_link_script" cols="40" rows="8"
                        placeholder="Press START"></textarea>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <input class="btn evt-confirm-btn btn-confirm-yes"
                        type="button"
                        id="btn_start"
                        onclick="generateScript()"
                        value="Start">
                    </td>
                </tr>
            </table>
        </div>
    </div>
    `;

    $("#div_container").remove();

    // Podpora pre STARÉ aj NOVÉ UI
    if ($("#contentContainer").length){
        $("#contentContainer").eq(0).prepend(html);
    } else {
        $("body").prepend(html);
    }

    $("#div_container").css({
        position:"fixed",
        top:"100px",
        left:"50px"
    });

    try {
        $("#div_container").draggable();
    } catch(e){}
}

// =================== GENEROVANIE SKRIPTU ===================
async function generateScript(){  
    UI.SuccessMessage("Generating local database...");

    await insertCryptoLibrary();

    let market = game_data.world.match(/[a-z]+/)[0];
    let nameAdmin = document.getElementById("input_admin_id").value;
    let databaseName = document.getElementById("input_database_name").value;
    let numberWorld = document.getElementById("input_number_world").value;
    let playerName = game_data.player.name;

    let fullDbPath = `FakeScriptDB/${market}/${numberWorld}/${databaseName}_${playerName}_${nameAdmin}`;

    // ==== NÁHRADA DROPBOXU (lokálna "databáza") ====
    localStorage.setItem(fullDbPath+"_ally", JSON.stringify([]));
    localStorage.setItem(fullDbPath+"_admin", JSON.stringify([]));

    for(let i=1;i<=10;i++){
        localStorage.setItem(fullDbPath+"_fakes"+i, JSON.stringify([]));
    }

    // ======= ŠIFROVANIE (rovnaký princíp ako originál) =======
    let plainText = `
        databaseName="${fullDbPath}";
        runWorld=${numberWorld};
        adminBoss="${nameAdmin}";
    `;

    let key = CryptoJS.AES.encrypt(
        plainText,
        "automateThisAnnoyingPart"
    ).toString();

    let outputfakeScript = `javascript:var encryptedData='${key}';
$.getScript('https://raw.githubusercontent.com/Cigino/tribal-wars/main/fakeScriptMain.js');
void(0);`;

    document.getElementById("input_link_script").value = outputfakeScript;

    UI.SuccessMessage("DONE — skopíruj vygenerovaný skript.");
}

// =================== CRYPTOJS ===================
function insertCryptoLibrary(){
    return new Promise(resolve=>{
        if (typeof CryptoJS !== "undefined") return resolve();

        let script = document.createElement("script");
        script.src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js";
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

// =================== COUNTER (voliteľné) ===================
function hitCountApi(){
    $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}/up`, ()=>{});
}

// =================== TÉMA (minimal nutné) ===================
function initializationTheme(){
    if(localStorage.getItem(localStorageThemeName) == null){
        localStorage.setItem(localStorageThemeName, defaultTheme);
    }
}
