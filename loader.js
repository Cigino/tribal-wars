// made by Costache Madalin (lllll llll)
// modified only to replace Dropbox with GitHub
// repo: https://github.com/Cigino/tribal-wars

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

async function main(){
    initializationTheme();

    // 🔥 DROPBOX → GITHUB
    await $.getScript(
        "https://raw.githubusercontent.com/Cigino/tribal-wars/main/styleCSSGlobal.js"
    );

    createMainInterface();
    changeTheme();
    hitCountApi();
}
main();

function createMainInterface(){
    let html=`
    <div id="div_container" class="scriptContainer">
        <div class="scriptHeader">
            <h2>Generate fake script</h2>
        </div>
        <div id="div_body">
            <table class="scriptTable">
                <tr>
                    <td>admin id</td>
                    <td><input id="input_admin_id" value="${game_data.player.id}"></td>
                </tr>
                <tr>
                    <td>world</td>
                    <td><input id="input_number_world" value="${game_data.world.match(/\d+/)[0]}"></td>
                </tr>
                <tr>
                    <td>database</td>
                    <td><input id="input_database_name" value="PleaseWork"></td>
                </tr>
                <tr>
                    <td>link script</td>
                    <td><textarea id="input_link_script"></textarea></td>
                </tr>
                <tr>
