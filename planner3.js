// ==UserScript==
// @name         TW Fake Tabs – All Units Except Noble
// @namespace    tw.fake.tabs.allunits
// @version      1.5
// @match        https://*.tribalwars.*/game.php*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (!window.game_data || !game_data.village) {
    alert("Spusť to priamo v Tribal Wars.");
    return;
  }

  // POP ceny jednotiek
  const POP = {
    spy: 2,
    spear: 1,
    axe: 1,
    light: 4,
    heavy: 6,
    ram: 5,
    catapult: 8
    // noble excluded
  };

  function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

  const box = document.createElement("div");
  box.style = `
    position:fixed;
    top:70px;
    right:40px;
    width:460px;
    background:#1b2b1b;
    color:#eee;
    padding:10px;
    z-index:99999;
    border:2px solid #3f6b3f;
  `;

  box.innerHTML = `
    <h3>⚔️ Fake → All Units Except Noble</h3>

    <b>Ciele (x|y, jeden na riadok)</b>
    <textarea id="ft_targets" rows="4" style="width:100%"></textarea>

    <hr>
    <b>Minimálne jednotky</b>
    <input id="min_spy" type="number" value="1" style="width:100%"> Spy
    <input id="min_ram" type="number" value="3" style="width:100%"> Ram
    <input id="min_cat" type="number" value="5" style="width:100%"> Cat
    <input id="min_spear" type="number" value="0" style="width:100%"> Spear
    <input id="min_axe" type="number" value="0" style="width:100%"> Axe
    <input id="min_light" type="number" value="0" style="width:100%"> Light
    <input id="min_heavy" type="number" value="0" style="width:100%"> Heavy

    <button id="ft_run" style="width:100%;margin-top:8px">
      OTVORIŤ TABY + AUTO FAKE (ALL UNITS)
    </button>
  `;

  document.body.appendChild(box);

  function getFreePop(){
    try{
      const el = document.querySelector("#pop_current_label");
      if(!el) return 120;
      return parseInt(el.textContent.replace(/[^\d]/g,'')) || 120;
    } catch { return 120; }
  }

  document.getElementById("ft_run").onclick = () => {
    const targets = (ft_targets.value.match(/\d+\|\d+/g) || []);
    if(!targets.length) return alert("Žiadne ciele!");

    const minUnits = {
      spy: +min_spy.value || 1,
      ram: +min_ram.value || 3,
      cat: +min_cat.value || 5,
      spear: +min_spear.value || 0,
      axe: +min_axe.value || 0,
      light: +min_light.value || 0,
      heavy: +min_heavy.value || 0
    };

    targets.forEach(t=>{
      const url = `${game_data.link_base_pure}game.php?screen=place&mode=attack&target=${t}`;
      const tab = window.open(url, "_blank");

      const injector = `
        (function(){
          const POP = { spy:2, spear:1, axe:1, light:4, heavy:6, ram:5, catapult:8 };

          function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
          function getFreePop(){
            try{
              const el = document.querySelector("#pop_current_label");
              if(!el) return 120;
              return parseInt(el.textContent.replace(/[^0-9]/g,''))||120;
            }catch{return 120;}
          }

          function fill(){
            let u = {};
            ["spy","ram","catapult","spear","axe","light","heavy"].forEach(x=>{
              u[x] = document.querySelector('input[name="'+x+'"]');
            });
            if(Object.values(u).some(x=>!x)){return setTimeout(fill,300);}

            let pop = getFreePop();
            let remaining = pop;

            // Minimálne jednotky
            let minU = ${JSON.stringify(minUnits)};
            Object.keys(minU).forEach(k=>{
              u[k].value = minU[k];
              remaining -= minU[k]*POP[k];
            });

            if(remaining<0) remaining = 0;

            // Náhodne rozdelíme zostávajúci pop medzi všetky jednotky okrem spy/minUnits
            let extraUnits = ["ram","catapult","spear","axe","light","heavy"];
            extraUnits.forEach(k=>{
              let maxAdd = Math.floor(remaining/POP[k]);
              let add = rand(0,maxAdd);
              u[k].value = parseInt(u[k].value)+add;
              remaining -= add*POP[k];
            });

            console.log("AUTO FAKE ALL UNITS:", Object.fromEntries(Object.entries(u).map(([k,v])=>[k,v.value])));
          }

          setTimeout(fill,800);
        })();
      `;

      setTimeout(()=>{tab.eval(injector)},1200);
    });
  };
})();
