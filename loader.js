javascript:(function(){
    // --- zabezpečíme jQuery ---
    var $jq = window.jQuery.noConflict(true);

    // --- základné farby ---
    var colors = {
        textColor: "#ffffff",
        backgroundContainer: "#2B193D",
        backgroundHeader: "#3C3C3C",
        borderColor: "#C5979D",
        backgroundInput: "#000000"
    };

    // --- odstránime predchádzajúce okno ---
    $jq("#div_container").remove();

    // --- vytvorenie hlavného okna ---
    var html = `
    <div id="div_container" style="position:fixed;top:50px;left:50px;width:400px;z-index:9999;
        background:${colors.backgroundContainer};color:${colors.textColor};border:2px solid ${colors.borderColor};
        padding:10px;border-radius:8px;font-family:Arial, sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3 style="margin:0;">Generate Fake Script</h3>
            <div>
                <button id="btn_minimize" style="margin-right:5px;">_</button>
                <button id="btn_close">X</button>
            </div>
        </div>
        <div id="div_body">
            <table style="width:100%;color:${colors.textColor}">
                <tr><td>Admin ID:</td><td><input type="text" id="input_admin_id" value="${game_data.player.id}" style="width:100%"></td></tr>
                <tr><td>World Number:</td><td><input type="text" id="input_number_world" value="${game_data.world.match(/\d+/)[0]}" style="width:100%"></td></tr>
                <tr><td>Database Name:</td><td><input type="text" id="input_database_name" value="PleaseWork" style="width:100%"></td></tr>
                <tr><td colspan="2"><button id="btn_start" style="width:100%;margin-top:5px;">Start</button></td></tr>
            </table>
            <textarea id="input_link_script" style="width:100%;height:100px;margin-top:10px;" placeholder="link sa zobrazí tu"></textarea>
        </div>
        <div style="text-align:right;margin-top:5px;font-size:12px;">made by Costache</div>
    </div>
    `;

    // vložíme okno do tela
    $jq("body").prepend(html);

    // --- funkcie pre minimalizáciu a zatvorenie ---
    $jq("#btn_close").on("click",function(){$jq("#div_container").remove();});
    $jq("#btn_minimize").on("click",function(){
        $jq("#div_body").toggle();
    });

    // --- funkcia pre generovanie skriptu ---
    async function generateScript(){
        let nameAdmin = $jq("#input_admin_id").val();
        let databaseName = $jq("#input_database_name").val();
        let numberWorld = $jq("#input_number_world").val();
        let playerName = game_data.player.name;

        let dbPath = `FakeScriptDB/${game_data.world.match(/[a-z]+/)[0]}/${numberWorld}/${databaseName}_${playerName}_${nameAdmin}`;

        let outputScript = `javascript:$.getScript('https://raw.githubusercontent.com/El-Cigino/fake-script/main/fakeScriptMain.js');void(0)`;

        $jq("#input_link_script").val(outputScript);
        alert("Script generated! Copy the code from the textarea.");
    }

    $jq("#btn_start").on("click", generateScript);

})();
