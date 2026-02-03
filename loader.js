```js
// ===========================
//  GITHUB + FIREBASE LOADER
// ===========================

var GITHUB_USER = "Cigino";   // ← TU ZMENÍŠ
var REPO_NAME   = "triwal-wars";       // ← TU ZMENÍŠ (názov repo)

function gh(path){
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/scripts/${path}`;
}

async function main(){
  initializationTheme();

  // Načítame všetko z GitHubu (NIE z Dropboxu)
  await $.getScript(gh("styleCSSGlobal.js"));
  await $.getScript(gh("firebaseStorage.js"));
  await $.getScript(gh("fakemain.js"));

  // Inicializujeme Firebase
  await initFirebase();

  createMainInterface();
  changeTheme();
  hitCountApi();
}

main();
```
