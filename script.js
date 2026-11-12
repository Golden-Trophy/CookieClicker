const $ = id => document.getElementById(id);

let cookies = 0;
let totalCookies = 0;
let clickPower = 1;
let sound = false;
let goldenTimeout = null;

const counts = {};

const upgrades = [
  {id:"cursor",name:"Cursor",icon:"🖱️",desc:"Automatically clicks cookies.",price:15,cps:.1},
  {id:"grandma",name:"Grandma",icon:"👵",desc:"A grandma who loves baking.",price:100,cps:1},
  {id:"farm",name:"Cookie Farm",icon:"🌱",desc:"Grow your own cookie ingredients.",price:1100,cps:8},
  {id:"mine",name:"Cookie Mine",icon:"⛏️",desc:"Dig up delicious cookie dough.",price:12000,cps:47},
  {id:"factory",name:"Factory",icon:"🏭",desc:"A whole building full of ovens.",price:130000,cps:260},
  {id:"bank",name:"Cookie Bank",icon:"🏦",desc:"Your cookies earn more cookies.",price:1400000,cps:1400},
  {id:"temple",name:"Cookie Temple",icon:"🏛️",desc:"A peaceful place of cookie worship.",price:20000000,cps:7800},
  {id:"wizard",name:"Wizard Tower",icon:"🧙",desc:"Magic makes the best cookies.",price:330000000,cps:44000},
  {id:"shipment",name:"Cookie Delivery",icon:"🚚",desc:"Cookies from faraway bakeries.",price:5100000000,cps:260000},
  {id:"alchemy",name:"Alchemy Lab",icon:"⚗️",desc:"Turn ordinary things into cookies.",price:75000000000,cps:1600000},
  {id:"portal",name:"Cookie Portal",icon:"🌀",desc:"A doorway to a cookie dimension.",price:1000000000000,cps:10000000},
  {id:"time",name:"Time Machine",icon:"⏰",desc:"Borrow cookies from tomorrow.",price:14000000000000,cps:65000000},
  {id:"antimatter",name:"Antimatter Condenser",icon:"⚛️",desc:"Condense the universe into cookies.",price:170000000000000,cps:430000000},
  {id:"prism",name:"Prism",icon:"💎",desc:"Turn light into delicious cookies.",price:2100000000000000,cps:2900000000},
  {id:"chance",name:"Chance Maker",icon:"🎲",desc:"A little luck goes a long way.",price:26000000000000000,cps:21000000000},
  {id:"fractal",name:"Fractal Engine",icon:"🔷",desc:"Cookies make even more cookies.",price:310000000000000000,cps:150000000000},
  {id:"oven",name:"Extra Oven",icon:"🔥",desc:"More ovens, more cookies.",price:500000000000000000,cps:900000000000},
  {id:"mixer",name:"Stand Mixer",icon:"🥣",desc:"Mixes cookie dough all day.",price:800000000000000000,cps:1800000000000},
  {id:"bakery",name:"Mega Bakery",icon:"🥐",desc:"A bakery on every street.",price:1200000000000000000,cps:3500000000000},
  {id:"robot",name:"Baking Robot",icon:"🤖",desc:"Never gets tired of baking.",price:2000000000000000000,cps:7000000000000},
  {id:"moon",name:"Moon Bakery",icon:"🌙",desc:"Bakes cookies under the stars.",price:5000000000000000000,cps:16000000000000}
];

const christmasUpgrades = [
  {id:"tree",name:"Decorated Tree",icon:"🎄",desc:"A little festive sparkle for the bakery.",price:500,cps:5},
  {id:"snowman",name:"Snowman Helper",icon:"⛄",desc:"A chilly friend who loves cookies.",price:5000,cps:35},
  {id:"santa",name:"Santa's Cookie Break",icon:"🎅",desc:"Santa stops by for a snack.",price:100000,cps:550},
  {id:"reindeer",name:"Reindeer Helper",icon:"🦌",desc:"A festive helper for the bakery.",price:2500000,cps:12000},
  {id:"gift",name:"Gift Workshop",icon:"🎁",desc:"A few extra presents and cookies.",price:50000000,cps:300000},
  {id:"elf",name:"Elf Helper",icon:"🧝",desc:"Little helpers make lots of cookies.",price:900000000,cps:5000000},
  {id:"northpole",name:"Winter Oven",icon:"❄️",desc:"A special seasonal baking oven.",price:25000000000,cps:180000000}
];

[...upgrades, ...christmasUpgrades].forEach(upgrade => {
  counts[upgrade.id] = 0;
});

/* Number formatting */

function format(number) {
  if (number < 1000) {
    return Math.floor(number).toLocaleString();
  }

  const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
  let index = -1;

  while (number >= 1000 && index < units.length - 1) {
    number /= 1000;
    index++;
  }

  return number.toFixed(2) + units[index];
}

function getCps() {
  return [...upgrades, ...christmasUpgrades].reduce(
    (sum, upgrade) => sum + counts[upgrade.id] * upgrade.cps,
    0
  );
}

function getBuildingCount() {
  return Object.values(counts).reduce((sum, amount) => sum + amount, 0);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.style.opacity = 1;

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.style.opacity = 0;
  }, 1800);
}

/* MUSIC AND SOUND */

let audioContext = null;
let musicTimer = null;
let musicStep = 0;

const melody = [
  659,784,880,784,659,523,587,659,
  587,523,440,523,587,659,784,659,
  880,784,659,587,523,587,659,784
];

const bassNotes = [
  130.81,130.81,164.81,164.81,
  174.61,174.61,146.83,146.83
];

const chords = [
  [261.63,329.63,392],
  [220,261.63,329.63],
  [174.61,220,261.63],
  [196,246.94,293.66]
];

function getAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function tone(frequency, duration = .12, type = "square", volume = .035, delay = 0) {
  const context = getAudio();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  const startTime = context.currentTime + delay;
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + .015);
  gain.gain.exponentialRampToValueAtTime(.001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime + .02);
}

function playClick() {
  if (!sound) return;
  tone(520,.045,"square",.025);
  tone(780,.035,"triangle",.012,.025);
}

function playPurchase() {
  if (!sound) return;
  [523,659,784,1047].forEach((n,i) => {
    tone(n,.13,"triangle",.04,i*.08);
  });
}

function playBonus() {
  if (!sound) return;
  [523,659,784,1047,1318].forEach((n,i) => {
    tone(n,.2,"triangle",.05,i*.075);
  });
}

function playMusicBeat() {
  if (!sound) return;

  const note = melody[musicStep % melody.length];
  const bass = bassNotes[musicStep % bassNotes.length];

  tone(note,.19,"square",.018);

  if (musicStep % 2 === 0) {
    tone(note * 1.5,.13,"triangle",.009,.025);
    tone(bass,.28,"triangle",.025);
  }

  if (musicStep % 4 === 0) {
    const chord = chords[Math.floor(musicStep / 4) % chords.length];

    chord.forEach((frequency,index) => {
      tone(frequency,.32,"triangle",.009,index*.015);
    });
  }

  if (musicStep % 2 === 1) {
    tone(110,.035,"sine",.018);
  }

  musicStep++;
}

function startMusic() {
  if (!sound || musicTimer) return;
  playMusicBeat();
  musicTimer = setInterval(playMusicBeat,220);
}

function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function setSound(enabled) {
  sound = enabled;
  localStorage.setItem("cookieClickerSound",sound ? "on" : "off");

  $("soundBtn").textContent = sound ? "🔊 Sound: On" : "🔇 Sound: Off";
  $("musicSettingsBtn").textContent = sound ? "🔊 Turn Sound Off" : "🎵 Turn Sound On";

  if (sound) {
    getAudio();
    startMusic();
    playPurchase();
  } else {
    stopMusic();
  }
}

$("soundBtn").addEventListener("click",() => setSound(!sound));
$("musicSettingsBtn").addEventListener("click",() => setSound(!sound));

try {
  sound = localStorage.getItem("cookieClickerSound") === "on";
} catch {
  sound = false;
}

function restartRememberedMusic() {
  if (!sound) return;

  getAudio();
  startMusic();

  document.removeEventListener("pointerdown",restartRememberedMusic);
  document.removeEventListener("keydown",restartRememberedMusic);
}

if (sound) {
  document.addEventListener("pointerdown",restartRememberedMusic);
  document.addEventListener("keydown",restartRememberedMusic);
}

$("soundBtn").textContent = sound ? "🔊 Sound: On" : "🔇 Sound: Off";
$("musicSettingsBtn").textContent = sound ? "🔊 Turn Sound Off" : "🎵 Turn Sound On";

/* SHOP */

function buildShop(list,container) {
  container.innerHTML = "";

  list.forEach(upgrade => {
    const button = document.createElement("button");
    button.className = "upgrade";
    button.type = "button";

    button.innerHTML = `
      <div class="upgradeIcon">${upgrade.icon}</div>
      <div class="upgradeInfo">
        <div class="upgradeName">${upgrade.name}</div>
        <div class="upgradeDesc">${upgrade.desc}</div>
        <div class="upgradeCost"></div>
      </div>
      <div class="upgradeCount">0</div>
    `;

    button.addEventListener("click",() => buyUpgrade(upgrade));

    upgrade.button = button;
    upgrade.costElement = button.querySelector(".upgradeCost");
    upgrade.countElement = button.querySelector(".upgradeCount");

    container.appendChild(button);
  });
}

function updateShop() {
  [...upgrades,...christmasUpgrades].forEach(upgrade => {
    const count = counts[upgrade.id] || 0;
    const cost = Math.floor(upgrade.price * Math.pow(1.15,count));

    upgrade.button.disabled = cookies < cost;
    upgrade.costElement.textContent = "🍪 " + format(cost) + " cookies";
    upgrade.countElement.textContent = count;
  });
}

function renderStats() {
  $("cookieCount").textContent = format(cookies) + " cookies";
  $("cps").textContent = "⚡ " + format(getCps()) + " cookies per second";
  $("clickPower").textContent = "🍪 Per click: " + format(clickPower);

  $("totalBaked").textContent = format(totalCookies);
  $("powerDisplay").textContent = format(clickPower);
  $("buildingDisplay").textContent = format(getBuildingCount());
}

function render() {
  renderStats();
  updateShop();
}

function buyUpgrade(upgrade) {
  const cost = Math.floor(upgrade.price * Math.pow(1.15,counts[upgrade.id]));

  if (cookies < cost) return;

  cookies -= cost;
  counts[upgrade.id]++;

  playPurchase();
  showToast("Purchased " + upgrade.name + "!");

  render();
  saveGame();
}

/* COOKIE CLICKING */

$("cookie").addEventListener("click",() => {
  cookies += clickPower;
  totalCookies += clickPower;

  playClick();

  $("cookie").style.transform = "scale(.94)";
  setTimeout(() => $("cookie").style.transform = "",80);

  renderStats();
  updateShop();
  saveGame();
});

/* CURSOR RINGS */

/*
  Ring capacities:
  12, 18, 24, 30, 36, 42...

  The ring radii are distributed across the available area.
  Cursor size is calculated from both ring spacing and
  the space between cursors on each individual ring.
*/

let cursorElements = [];
let lastCursorAmount = -1;
let cursorAnimationFrame = null;

function getRingCapacity(ring) {
  return 12 + ring * 6;
}

function getCursorRing(index) {
  let remaining = index;
  let ring = 0;

  while (remaining >= getRingCapacity(ring)) {
    remaining -= getRingCapacity(ring);
    ring++;
  }

  return {
    ring,
    position: remaining,
    capacity: getRingCapacity(ring)
  };
}

function getTotalCursorRings(amount) {
  let total = 0;
  let ring = 0;

  while (total < amount) {
    total += getRingCapacity(ring);
    ring++;
  }

  return ring;
}

function rebuildCursors() {
  const stage = $("cookieStage");

  cursorElements.forEach(cursor => cursor.remove());
  cursorElements = [];

  const amount = counts.cursor || 0;

  for (let i = 0; i < amount; i++) {
    const cursor = document.createElement("div");
    cursor.className = "cursorSprite";
    cursor.textContent = "➤";

    stage.appendChild(cursor);
    cursorElements.push(cursor);
  }

  lastCursorAmount = amount;

  const badge = $("cursorCount");

  if (amount > 0) {
    badge.style.display = "block";
    badge.textContent = amount + (amount === 1 ? " cursor" : " cursors");
  } else {
    badge.style.display = "none";
  }
}

function animateCursors() {
  const amount = counts.cursor || 0;

  if (amount !== lastCursorAmount) {
    rebuildCursors();
  }

  if (amount > 0) {
    const stage = $("cookieStage");
    const rect = stage.getBoundingClientRect();

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const stageSize = Math.min(rect.width,rect.height);

    // The cookie occupies the middle; cursors start just outside it.
    const innerRadius = stageSize * .32;
    const outerRadius = stageSize * .48;

    const totalRings = getTotalCursorRings(amount);

    // Give every ring its own radius.
    const ringSpacing = totalRings > 1
      ? (outerRadius - innerRadius) / (totalRings - 1)
      : 0;

    const time = performance.now() / 1000;

    cursorElements.forEach((cursor,index) => {
      const data = getCursorRing(index);

      const radius = innerRadius + data.ring * ringSpacing;

      // Calculate tangential spacing between neighboring cursors.
      const circumference = Math.PI * 2 * radius;
      const tangentialSpacing = circumference / data.capacity;

      // Cursor icons shrink if rings get crowded.
      const radialSize = ringSpacing > 0 ? ringSpacing * .68 : 22;
      const iconSize = Math.max(
        5,
        Math.min(22,radialSize,tangentialSpacing * .65)
      );

      const angle =
        (Math.PI * 2 * data.position / data.capacity) +
        time * (data.ring % 2 === 0 ? .35 : -.35);

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Point each cursor inward toward the cookie.
      const towardCenter = Math.atan2(
        centerY - y,
        centerX - x
      ) * 180 / Math.PI;

      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      cursor.style.width = iconSize + "px";
      cursor.style.height = iconSize + "px";
      cursor.style.fontSize = iconSize + "px";
      cursor.style.transform =
        `translate(-50%, -50%) rotate(${towardCenter}deg)`;
    });
  }

  cursorAnimationFrame = requestAnimationFrame(animateCursors);
}

requestAnimationFrame(animateCursors);

/* BONUS COOKIE */

function spawnGolden() {
  const button = $("goldenCookie");

  button.style.display = "block";
  button.style.left = (10 + Math.random() * 70) + "%";
  button.style.top = (10 + Math.random() * 70) + "%";

  clearTimeout(goldenTimeout);

  goldenTimeout = setTimeout(() => {
    button.style.display = "none";
  },10000);
}

$("goldenCookie").addEventListener("click",() => {
  const reward = Math.max(50,getCps() * 60,clickPower * 50);

  cookies += reward;
  totalCookies += reward;

  $("goldenCookie").style.display = "none";
  clearTimeout(goldenTimeout);

  playBonus();
  showToast("BONUS! +" + format(reward) + " cookies!");

  render();
  saveGame();
});

/* LIMITED SEASONAL DECORATIONS */

function spawnDecoration() {
  const decoration = document.createElement("div");
  decoration.className = "snowflake";

  const symbols = ["❄","✦","✧","⭐","❅"];
  const colors = [
    "#ff3155","#00b978","#218cff",
    "#b45cff","#ffbd25","#ff72c5","#ffffff"
  ];

  decoration.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  decoration.style.color = colors[Math.floor(Math.random() * colors.length)];
  decoration.style.left = Math.random() * 100 + "vw";
  decoration.style.fontSize = (12 + Math.random() * 18) + "px";

  const duration = 6 + Math.random() * 6;
  decoration.style.animationDuration = duration + "s";

  document.body.appendChild(decoration);

  setTimeout(() => decoration.remove(),duration * 1000);
}

setInterval(spawnDecoration,1100);

/* SAVE SYSTEM */

const SAVE_KEY = "cookieClickerSave";

function getSaveData() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    cookies,
    totalCookies,
    clickPower,
    counts: {...counts}
  };
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY,JSON.stringify(getSaveData()));

    $("saveStatus").textContent =
      "Last saved: " + new Date().toLocaleTimeString();

    return true;
  } catch (error) {
    showToast("Couldn't save: browser storage may be full.");
    return false;
  }
}

function applySaveData(data) {
  if (
    !data ||
    typeof data !== "object" ||
    !Number.isFinite(Number(data.cookies)) ||
    Number(data.cookies) < 0 ||
    !Number.isFinite(Number(data.totalCookies)) ||
    Number(data.totalCookies) < 0 ||
    !Number.isFinite(Number(data.clickPower)) ||
    Number(data.clickPower) < 1 ||
    !data.counts ||
    typeof data.counts !== "object"
  ) {
    throw new Error("That file isn't a valid Cookie Clicker save.");
  }

  const nextCounts = {};

  Object.keys(counts).forEach(id => {
    const value = Number(data.counts[id] ?? 0);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error("The save has invalid upgrade counts.");
    }

    nextCounts[id] = Math.floor(value);
  });

  cookies = Number(data.cookies);
  totalCookies = Number(data.totalCookies);
  clickPower = Number(data.clickPower);

  Object.assign(counts,nextCounts);

  render();
  saveGame();
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (raw) {
      applySaveData(JSON.parse(raw));
    }
  } catch (error) {
    console.warn("Could not load save:",error);
    showToast("Couldn't load saved game. Starting fresh.");
  }
}

/* SETTINGS */

function openSettings() {
  $("settingsOverlay").classList.add("open");
}

function closeSettings() {
  $("settingsOverlay").classList.remove("open");
}

$("settingsBtn").addEventListener("click",openSettings);
$("closeSettings").addEventListener("click",closeSettings);

$("settingsOverlay").addEventListener("click",event => {
  if (event.target === $("settingsOverlay")) {
    closeSettings();
  }
});

document.addEventListener("keydown",event => {
  if (event.key === "Escape") closeSettings();
});

$("saveBtn").addEventListener("click",() => {
  if (saveGame()) showToast("Game saved!");
});

$("downloadBtn").addEventListener("click",() => {
  const blob = new Blob(
    [JSON.stringify(getSaveData(),null,2)],
    {type:"application/json"}
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "cookie-clicker-save.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url),1000);

  showToast("Save file downloaded!");
});

$("uploadBtn").addEventListener("click",() => {
  $("uploadInput").click();
});

$("uploadInput").addEventListener("change",async event => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = JSON.parse(await file.text());

    if (!confirm("Import this save and replace your current progress?")) {
      return;
    }

    applySaveData(data);
    showToast("Save imported successfully!");
  } catch (error) {
    showToast(error.message || "Couldn't import that save file.");
  } finally {
    event.target.value = "";
  }
});

$("resetBtn").addEventListener("click",() => {
  if (!confirm("Are you sure you want to reset your bakery?")) return;

  cookies = 0;
  totalCookies = 0;
  clickPower = 1;

  Object.keys(counts).forEach(id => {
    counts[id] = 0;
  });

  localStorage.removeItem(SAVE_KEY);

  render();
  saveGame();

  showToast("Bakery reset!");
  closeSettings();
});

/* START GAME */

buildShop(upgrades,$("normalShop"));
buildShop(christmasUpgrades,$("christmasShop"));

loadGame();
render();

document.addEventListener("visibilitychange",() => {
  if (document.visibilityState === "hidden") saveGame();
});

window.addEventListener("pagehide",saveGame);

/* Cookie production */

setInterval(() => {
  const gain = getCps() / 10;

  cookies += gain;
  totalCookies += gain;

  renderStats();
  updateShop();
},100);

/* Autosave */

setInterval(saveGame,5000);

/* Bonus cookie appearances */

setInterval(() => {
  if (
    Math.random() < .65 &&
    $("goldenCookie").style.display !== "block"
  ) {
    spawnGolden();
  }
},35000);