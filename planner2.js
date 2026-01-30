// ==UserScript==
// @name         TW Fake Planner Advanced
// @version      1.0
// @description  Fake/Nuke planner with limits, night block, pagination
// ==/UserScript==

(function () {
  'use strict';

  /* ===================== CONFIG ===================== */

  const STORAGE_KEY = 'tw_fake_planner_sets';

  const DEFAULT_CONFIG = {
    fakeLimit: 1,          // %
    delay: 200,            // ms
    split: 10,             // tabs per page
    nightBlock: true,      // 00-08
    unitPolicy: 'ram'      // ram | catapult | rotate
  };

  const UNIT_LIMITS = {
    1: { spear: 1, spy: 1, ram: 1 },
    2: { spear: 2, spy: 1, ram: 1 },
    5: { spear: 5, spy: 1, ram: 1 }
  };

  /* ===================== STORAGE ===================== */

  function loadData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      config: DEFAULT_CONFIG,
      sets: { fakes: [] }
    };
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let DATA = loadData();

  /* ===================== UTILS ===================== */

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function isNight(date) {
    const h = date.getHours();
    return h >= 0 && h < 8;
  }

  function buildAttackUrl(coord) {
    return `/game.php?screen=place&target=${coord}`;
  }

  function getUnits() {
    const limit = DATA.config.fakeLimit;
    let units = { ...UNIT_LIMITS[limit] };

    // always spy
    units.spy = 1;

    if (DATA.config.unitPolicy === 'catapult') {
      units.catapult = 1;
      units.ram = 0;
    } else if (DATA.config.unitPolicy === 'rotate') {
      units.ram = Math.random() > 0.5 ? 1 : 0;
      units.catapult = units.ram ? 0 : 1;
    } else {
      units.ram = 1;
      units.cata
