// made by Costache Madalin (lllll llll)
// discord: costache madalin#8472

var backgroundColor = "#32313f";
var borderColor = "#3e6147";
var headerColor = "#202825";
var titleColor = "#ffffdf";

var countApiKey = "generateFakeScript";
var countNameSpace="madalinoTribalWarsScripts"

var headerWood="#001a33"
var headerWoodEven="#002e5a"
var headerStone="#3b3b00"
var headerStoneEven="#626200"
var headerIron="#1e003b"
var headerIronEven="#3c0076"

var defaultTheme= '[["theme1",["#E0E0E0","#000000","#C5979D","#2B193D","#2C365E","#484D6D","#4B8F8C","35"]],["currentTheme","theme1"]]'
var localStorageThemeName = "generateFakeScript"

var textColor="#ffffff"
var backgroundInput="#000000"

var borderColor = "#C5979D";
var backgroundContainer="#2B193D"
var backgroundHeader="#2C365E"
var backgroundMainTable="#484D6D"
var backgroundInnerTable="#4B8F8C"

var widthInterface=50;
var headerColorDarken=-50
var headerColorAlternateTable=-30;
var headerColorAlternateHover=30;

var backgroundAlternateTableEven=backgroundContainer;
var backgroundAlternateTableOdd=getColorDarker(backgroundContainer,headerColorAlternateTable);

async function main(){
    initializationTheme()
    createMainInterface()
    changeTheme()
    hitCountApi()
}
main()

function getColorDarker(hexInput, percent) {
    let hex = hexInput.replace(/^\s*#|\s*$/g, "");
    if (hex.length === 3) { hex = hex.replace(/(.)/g, "$1$1"); }

    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    const calculatedPercent = (100 + percent) / 100;

    r = Math.round(Math.min(255, Math.max(0, r * calculatedPercent)));
    g = Math.round(Math.min(255, Math.max(0, g * calculatedPercent)));
    b = Math.round(Math.min(255, Math.max(0, b * calculatedPercent)));

    return `#${("00"+r.toString(16)).slice(-2).toUpperCase()}${("00"+g.toString(16)).slice(-2).toUpperCase()}${("00"+b.toString(16)).slice(-2).toUpperCase()}`
}

function createMainInterface(){
    let html=`
    <div id="div_container" class="scriptContainer">
        <div class="scriptHeader">
            <div style="margin-top:10px;"><h2>Generate fake script</h2></div>
            <div style="position:absolute;top:10px;right: 10px;"><a href="#" onclick="$('#div_container').remove()"><img src="https://img.icons8.com/emoji/24/000000/cross-mark-button-emoji.png"/></a></div>
            <div style="position:absolute;top:8px;right: 35px;" id="div_minimize"><a href="#"><img src="https://img.icons8.com/plasticine/28/000000/minimize-window.png"/></a></div>
            <div style="position:absolute;top:10px;right: 60px;" id="div_theme"><a href="#" onclick="$('#theme_settings').toggle()"><img src="https://img.icons8.com/material-sharp/24/fa314a/change-theme.png"/></a></div>
        </div>
        <div id="theme_settings"></div>

        <div id="div_body">
            <table id="settings_table" class="scriptTable">
                <tr><td style="width:30%">admin id</td><td><input type="text"  id="input_admin_id" class="scriptInput" placeholder="name" value="${game_data.player.id}"></td></tr>
                <tr><td>world number</td><td><input type="text"  id="input_number_world" class="scriptInput" placeholder="name" value="${game_data.world.match(/\d+/)[0]}"></td></tr>
                <tr><td>database name</td><td><input type="text"  id="input_database_name" class="scriptInput" placeholder="anything is good" value="PleaseWork"></td></tr>
                <tr><td colspan="2"><input class="btn evt-confirm-btn btn-confirm-yes" type="button" id="btn_start" value="Start"></td></tr>
            </table>
        </div>
        <div class="scriptFooter"><div style="margin-top:5px;"><h5>made by Costache</h5></div></div>
    </div>`;

    $("#div_container").remove();
    $("#contentContainer").eq(0).prepend(html);
    $("#mobileContent").eq(0).prepend(html);

    $("#div_container").css("position","fixed");
    $("#div_container").draggable();

    $("#div_minimize").on("click",()=>{
        let currentWidthPercentage=Math.ceil($('#div_container').width() / $('body').width() * 100);
        if(currentWidthPercentage >=widthInterface ){
            $('#div_container').css({'width' : '10%'}); $('#div_body').hide();
        } else {
            $('#div_container').css({'width' : `${widthInterface}%`}); $('#div_body').show();
        }
    });

    $("#btn_start").on("click", runFakeScript);
}

async function runFakeScript(){
    UI.SuccessMessage("Running fake script...");
    let market = game_data.world.match(/[a-z]+/)[0];
    let nameAdmin = document.getElementById("input_admin_id").value;
    let databaseName=document.getElementById("input_database_name").value
    let numberWorld=document.getElementById("input_number_world").value
    let playerName = game_data.player.name
    databaseName= `FakeScriptDB/${market}/${numberWorld}/${databaseName}_${playerName}_${nameAdmin}`

    await insertCryptoLibrary();

    // tu môžeš doplniť vytváranie súborov, ak chceš

    $.getScript('https://raw.githubusercontent.com/El-Cigino/fake-script/main/fakeScriptMain.js')
      .done(function(script, textStatus) {
          UI.SuccessMessage('Script loaded successfully!');
      })
      .fail(function(jqxhr, settings, exception) {
          UI.ErrorMessage('Failed to load script: ' + exception);
          console.error('Failed to load script:', exception);
      });
}

function insertCryptoLibrary(){
    return new Promise((resolve)=>{
        let script = document.createElement('script');
        script.type="text/javascript"
        script.src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"
        script.onload = function () { resolve("done"); };
        document.head.appendChild(script);
    });
}

function initializationTheme(){
    if(localStorage.getItem(localStorageThemeName) != undefined){
        let mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))
        let currentTheme=mapTheme.get("currentTheme")
        let colours=mapTheme.get(currentTheme)

        textColor=colours[0]; backgroundInput=colours[1];
        borderColor = colours[2]; backgroundContainer=colours[3];
        backgroundHeader=colours[4]; backgroundMainTable=colours[5];
        backgroundInnerTable=colours[6]; widthInterface=colours[7];

        backgroundAlternateTableEven=backgroundContainer;
        backgroundAlternateTableOdd=getColorDarker(backgroundContainer,headerColorAlternateTable);       
    } else {
        localStorage.setItem(localStorageThemeName, defaultTheme)
    }
}

function changeTheme(){ /* ponechané, ak chceš, môžeš ho doplniť */ }
function hitCountApi(){ /* ponechané, ak chceš, môžeš ho doplniť */ }
