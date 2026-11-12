
const $ = id => document.getElementById(id);

let cookies = 0;
let totalCookies = 0;
let clickPower = 1;
let sound = false;
let audioContext = null;

const SAVE_KEY = "cookieClickerSave";
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

[...upgrades,...christmasUpgrades].forEach(upgrade => {
  counts[upgrade.id] = 0;
});

/* NUMBER FORMATTING */

function format(number) {
  if (!Number.isFinite(number)) return "∞";
  if (number < 1000) return Math.floor(number).toLocaleString();

  const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
  let index = -1;

  while (number >= 1000 && index < units.length - 1) {
    number /= 1000;
    index++;
  }

  return number.toFixed(2) + units[index];
}

function getCps() {
  return [...upgrades,...christmasUpgrades].reduce(
    (sum,upgrade) => sum + counts[upgrade.id] * upgrade.cps,
    0
  );
}

function getBuildingCount() {
  return Object.values(counts).reduce((sum,value) => sum + value,0);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.style.opacity = "1";

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.style.opacity = "0";
  },1900);
}

/* SOUND EFFECTS ONLY - NO MUSIC */

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

function tone(frequency,duration=.15,type="triangle",volume=.025,delay=0) {
  const context = getAudio();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency,start);

  gain.gain.setValueAtTime(.001,start);
  gain.gain.linearRampToValueAtTime(volume,start+.02);
  gain.gain.exponentialRampToValueAtTime(.001,end);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(end+.02);
}

function playClick() {
  if (!sound) return;
  tone(520,.045,"square",.018);
  tone(780,.06,"triangle",.014,.025);
}

function playPurchase() {
  if (!sound) return;
  [523,659,784,1047].forEach((frequency,index) => {
    tone(frequency,.15,"triangle",.035,index*.075);
  });
}

function playBonus() {
  if (!sound) return;
  [523,659,784,1047,1318,1568].forEach((frequency,index) => {
    tone(frequency,.2,"triangle",.04,index*.065);
  });
}

function setSound(enabled) {
  sound = enabled;

  try {
    localStorage.setItem("cookieClickerSound",sound ? "on" : "off");
  } catch {}

  $("soundBtn").textContent =
    sound ? "🔊 Sound Effects: On" : "🔇 Sound Effects: Off";

  $("musicSettingsBtn").textContent =
    sound ? "Turn Sound Effects Off" : "Turn Sound Effects On";
}

try {
  sound = localStorage.getItem("cookieClickerSound") === "on";
} catch {
  sound = false;
}

$("soundBtn").textContent =
  sound ? "🔊 Sound Effects: On" : "🔇 Sound Effects: Off";

$("musicSettingsBtn").textContent =
  sound ? "Turn Sound Effects Off" : "Turn Sound Effects On";

$("soundBtn").addEventListener("click",() => setSound(!sound));
$("musicSettingsBtn").addEventListener("click",() => setSound(!sound));

/* SHOP */

function getUpgradeCost(upgrade) {
  if (upgrade.id === "cursor") {
    return 15;
  }

  return Math.floor(
    upgrade.price * Math.pow(1.15,counts[upgrade.id])
  );
}

function buildShop(list,container) {
  container.innerHTML = "";

  list.forEach(upgrade => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade";

    const icon = document.createElement("div");
    icon.className = "upgradeIcon";
    icon.textContent = upgrade.icon;

    const info = document.createElement("div");
    info.className = "upgradeInfo";

    const name = document.createElement("div");
    name.className = "upgradeName";
    name.textContent = upgrade.name;

    const desc = document.createElement("div");
    desc.className = "upgradeDesc";
    desc.textContent = upgrade.desc;

    const cost = document.createElement("div");
    cost.className = "upgradeCost";

    info.append(name,desc,cost);

    const count = document.createElement("div");
    count.className = "upgradeCount";

    button.append(icon,info,count);
    button.addEventListener("click",() => buyUpgrade(upgrade));

    upgrade.button = button;
    upgrade.costElement = cost;
    upgrade.countElement = count;

    container.appendChild(button);
  });
}

function updateShop() {
  [...upgrades,...christmasUpgrades].forEach(upgrade => {
    const amount = counts[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade);

    upgrade.button.disabled = cookies < cost;
    upgrade.costElement.textContent = "🍪 " + format(cost) + " cookies";
    upgrade.countElement.textContent = amount;
  });
}

function renderStats() {
  $("cookieCount").textContent = format(cookies) + " cookies";
  $("cps").textContent = format(getCps()) + " cookies per second";
  $("clickPower").textContent = format(clickPower);

  $("totalBaked").textContent = format(totalCookies);
  $("powerDisplay").textContent = format(clickPower);
  $("buildingDisplay").textContent = format(getBuildingCount());
}

function render() {
  renderStats();
  updateShop();
}

function buyUpgrade(upgrade) {
  const cost = getUpgradeCost(upgrade);

  if (cookies < cost) return;

  cookies -= cost;
  counts[upgrade.id]++;

  playPurchase();
  showToast("Purchased " + upgrade.name + "!");

  render();
  saveGame();
}

/* COOKIE CLICKING */

function clickCookie() {
  cookies += clickPower;
  totalCookies += clickPower;

  playClick();

  $("cookie").style.transform = "scale(.95)";
  setTimeout(() => {
    $("cookie").style.transform = "";
  },90);

  renderStats();
  updateShop();
  saveGame();
}

$("cookie").addEventListener("click",clickCookie);

$("cookie").addEventListener("keydown",event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    clickCookie();
  }
});

/* CURSOR RINGS */

let cursorElements = [];
let lastCursorAmount = -1;

function ringCapacity(ring) {
  return 12 + ring * 6;
}

function getCursorRing(index) {
  let remaining = index;
  let ring = 0;

  while (remaining >= ringCapacity(ring)) {
    remaining -= ringCapacity(ring);
    ring++;
  }

  return {
    ring,
    position: remaining,
    capacity: ringCapacity(ring)
  };
}

function rebuildCursors() {
  cursorElements.forEach(element => element.remove());
  cursorElements = [];

  const amount = counts.cursor || 0;
  const layer = $("cursorLayer");

  for (let i = 0; i < amount; i++) {
    const cursor = document.createElement("div");
    cursor.className = "cursorSprite";
    cursor.textContent = "➤";

    layer.appendChild(cursor);
    cursorElements.push(cursor);
  }

  lastCursorAmount = amount;

  $("cursorCount").style.display = amount > 0 ? "block" : "none";
  $("cursorCount").textContent =
    amount + (amount === 1 ? " cursor" : " cursors");
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
    const innerRadius = Math.min(rect.width,rect.height) * .30;

    // Fixed size and fixed spacing. New rings keep moving outward.
    const ringSpacing = 30;
    const cursorSize = 20;
    const time = performance.now() / 1000;

    cursorElements.forEach((cursor,index) => {
      const data = getCursorRing(index);
      const radius = innerRadius + data.ring * ringSpacing;

      const direction = data.ring % 2 === 0 ? 1 : -1;

      const angle =
        (Math.PI * 2 * data.position / data.capacity) +
        time * .32 * direction;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const inwardAngle =
        Math.atan2(centerY-y,centerX-x) * 180 / Math.PI;

      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      cursor.style.width = cursorSize + "px";
      cursor.style.height = cursorSize + "px";
      cursor.style.fontSize = cursorSize + "px";

      cursor.style.transform =
        `translate(-50%,-50%) rotate(${inwardAngle}deg)`;
    });
  }

  requestAnimationFrame(animateCursors);
}

requestAnimationFrame(animateCursors);

/* GOLDEN COOKIE */

function spawnGolden() {
  const button = $("goldenCookie");

  button.style.display = "block";
  button.style.left = (10+Math.random()*70)+"%";
  button.style.top = (10+Math.random()*70)+"%";

  clearTimeout(spawnGolden.timeout);

  spawnGolden.timeout = setTimeout(() => {
    button.style.display = "none";
  },10000);
}

$("goldenCookie").addEventListener("click",() => {
  const reward = Math.max(50,getCps()*60,clickPower*50);

  cookies += reward;
  totalCookies += reward;

  $("goldenCookie").style.display = "none";
  clearTimeout(spawnGolden.timeout);

  playBonus();
  showToast("BONUS! +" + format(reward) + " cookies!");

  render();
  saveGame();
});

setInterval(() => {
  if (
    Math.random() < .65 &&
    $("goldenCookie").style.display !== "block"
  ) {
    spawnGolden();
  }
},35000);

/* LIMITED SEASONAL DECORATIONS */

function spawnSnowflake() {
  const flake = document.createElement("div");
  flake.className = "snowflake";

  const symbols = ["❄","✦","❅"];
  const colors = ["#fff","#e8f2ff","#f5d783"];

  flake.textContent = symbols[Math.floor(Math.random()*symbols.length)];
  flake.style.color = colors[Math.floor(Math.random()*colors.length)];
  flake.style.left = Math.random()*100+"vw";
  flake.style.fontSize = (11+Math.random()*12)+"px";

  const duration = 7+Math.random()*5;
  flake.style.animationDuration = duration+"s";

  document.body.appendChild(flake);
  setTimeout(() => flake.remove(),duration*1000);
}

setInterval(spawnSnowflake,1600);

/* SAVE SYSTEM */

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
    console.error("Save failed:",error);
    $("saveStatus").textContent = "Save failed. Check browser storage.";
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
    throw new Error("That is not a valid Cookie Clicker save.");
  }

  const nextCounts = {};

  Object.keys(counts).forEach(id => {
    const value = Number(data.counts[id] ?? 0);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error("The save contains an invalid upgrade count.");
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
    if (!raw) return;

    applySaveData(JSON.parse(raw));
  } catch (error) {
    console.error("Could not load save:",error);
    showToast("Couldn't load your save.");
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
  if (event.target === $("settingsOverlay")) closeSettings();
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
  showToast("Save downloaded!");
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
    showToast("Save imported!");
  } catch (error) {
    showToast(error.message || "Couldn't import that save.");
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

/* STARTUP */

buildShop(upgrades,$("normalShop"));
buildShop(christmasUpgrades,$("christmasShop"));

loadGame();
render();

document.addEventListener("visibilitychange",() => {
  if (document.visibilityState === "hidden") saveGame();
});

window.addEventListener("pagehide",saveGame);

/* COOKIE PRODUCTION */

setInterval(() => {
  const gain = getCps()/10;

  cookies += gain;
  totalCookies += gain;

  renderStats();
  updateShop();
},100);

/* AUTOSAVE */

setInterval(saveGame,5000);
