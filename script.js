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

/* Keep these IDs so older saves still work. */
const christmasUpgrades = [
  {id:"tree",name:"Houseplant Shelf",icon:"🎄",desc:"A little greenery for the bakery.",price:500,cps:5},
  {id:"snowman",name:"Sunny Window",icon:"⛄",desc:"A lovely place to watch the weather.",price:5000,cps:35},
  {id:"santa",name:"Coffee Corner",icon:"☕",desc:"Coffee and cookies for everyone.",price:100000,cps:550},
  {id:"reindeer",name:"Helper",icon:"🦌",desc:"A helpful friend for the bakery.",price:2500000,cps:12000},
  {id:"gift",name:"Gift Factory",icon:"🎁",desc:"A present under every tree.",price:50000000,cps:300000},
  {id:"elf",name:"Workshop",icon:"🧝",desc:"Little helpers make lots of cookies.",price:900000000,cps:5000000},
  {id:"northpole",name:"Super Oven",icon:"❄️",desc:"The ultimate cookie oven.",price:25000000000,cps:180000000}
];

[...upgrades,...christmasUpgrades].forEach(u => counts[u.id] = 0);

function format(n){
  if(n < 1000) return Math.floor(n).toLocaleString();

  const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
  let i = -1;

  while(n >= 1000 && i < units.length - 1){
    n /= 1000;
    i++;
  }

  return n.toFixed(2) + units[i];
}

function getCps(){
  return [...upgrades,...christmasUpgrades]
    .reduce((s,u) => s + counts[u.id] * u.cps,0);
}

function getBuildingCount(){
  return Object.values(counts).reduce((a,b) => a + b,0);
}

function showToast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.style.opacity = 1;

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => t.style.opacity = 0,1800);
}

/* =====================================================
   NEW RETRO MUSIC SYSTEM
   Layered melody, bass, chords and percussion.
   ===================================================== */

let audioContext = null;
let masterGain = null;
let musicTimer = null;
let musicStep = 0;
let audioUnlocked = false;

const SOUND_KEY = "cookieClickerSound";

function getAudio(){
  if(!audioContext){
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx) return null;

    audioContext = new AudioCtx();

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(audioContext.destination);
  }

  if(audioContext.state === "suspended"){
    audioContext.resume();
  }

  return audioContext;
}

function note(freq,duration,options = {}){
  const ctx = getAudio();
  if(!ctx || !masterGain) return;

  const {
    type = "square",
    volume = .04,
    delay = 0,
    endVolume = .001,
    detune = 0
  } = options;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq,start);
  osc.detune.setValueAtTime(detune,start);

  gain.gain.setValueAtTime(.001,start);
  gain.gain.linearRampToValueAtTime(volume,start + .012);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(.0001,endVolume),
    start + duration
  );

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(start);
  osc.stop(start + duration + .02);
}

function playKick(delay = 0){
  const ctx = getAudio();
  if(!ctx || !masterGain) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(130,start);
  osc.frequency.exponentialRampToValueAtTime(42,start + .13);

  gain.gain.setValueAtTime(.16,start);
  gain.gain.exponentialRampToValueAtTime(.001,start + .15);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(start);
  osc.stop(start + .16);
}

function playSnare(delay = 0){
  const ctx = getAudio();
  if(!ctx || !masterGain) return;

  const length = Math.floor(ctx.sampleRate * .12);
  const buffer = ctx.createBuffer(1,length,ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for(let i = 0; i < length; i++){
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  noise.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 1200;

  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(.09,start);
  gain.gain.exponentialRampToValueAtTime(.001,start + .12);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  noise.start(start);
  noise.stop(start + .13);
}

function playHat(delay = 0){
  const ctx = getAudio();
  if(!ctx || !masterGain) return;

  const length = Math.floor(ctx.sampleRate * .045);
  const buffer = ctx.createBuffer(1,length,ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for(let i = 0; i < length; i++){
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  noise.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 7000;

  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(.035,start);
  gain.gain.exponentialRampToValueAtTime(.001,start + .045);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  noise.start(start);
  noise.stop(start + .05);
}

/* Notes for a cheerful original 90s-style chiptune melody. */
const melody = [
  659, null, 784, null, 880, null, 784, null,
  659, null, 523, null, 587, null, 659, null,
  784, null, 880, null, 988, null, 880, null,
  784, null, 659, null, 587, null, 523, null,

  659, null, 784, null, 880, null, 1047, null,
  988, null, 880, null, 784, null, 659, null,
  587, null, 659, null, 784, null, 880, null,
  784, null, 659, null, 523, null, 587, null
];

/* Chord progressions: C, G, Am, F. */
const chords = [
  [262,330,392],
  [196,247,294],
  [220,262,330],
  [175,220,262]
];

const bassNotes = [65.41,49,55,43.65];

function musicTick(){
  if(!sound || !audioContext) return;

  const step = musicStep % 64;
  const bar = Math.floor(step / 16);
  const beat = step % 16;

  const melodyNote = melody[step];

  if(melodyNote){
    note(melodyNote,.19,{
      type:"square",
      volume:.027
    });

    if(step % 8 === 0){
      note(melodyNote * 2,.12,{
        type:"triangle",
        volume:.012,
        delay:.035
      });
    }
  }

  /* Warm chord layer. */
  if(beat === 0){
    chords[bar % 4].forEach((freq,i) => {
      note(freq,.48,{
        type:"triangle",
        volume:.018,
        delay:i * .012
      });
    });

    note(bassNotes[bar % 4],.42,{
      type:"triangle",
      volume:.065
    });
  }

  /* Extra bass movement. */
  if(beat === 8){
    note(bassNotes[bar % 4] * 2,.22,{
      type:"triangle",
      volume:.035
    });
  }

  /* Drum pattern. */
  if(beat === 0 || beat === 8) playKick();
  if(beat === 4 || beat === 12) playSnare();

  if(beat % 2 === 0) playHat();

  musicStep++;
}

function startMusic(){
  if(!sound || musicTimer) return;

  getAudio();
  if(!audioContext) return;

  musicTimer = setInterval(musicTick,125);
}

function stopMusic(){
  if(musicTimer){
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function playClick(){
  if(!sound) return;

  note(660,.055,{type:"square",volume:.025});
  note(880,.045,{type:"triangle",volume:.012,delay:.025});
}

function playPurchase(){
  if(!sound) return;

  [523,659,784,1047].forEach((n,i) => {
    note(n,.13,{
      type:"triangle",
      volume:.045,
      delay:i * .065
    });
  });
}

function playBonus(){
  if(!sound) return;

  [523,659,784,988,1175,1397].forEach((n,i) => {
    note(n,.22,{
      type:"triangle",
      volume:.055,
      delay:i * .07
    });
  });
}

function setSound(enabled){
  sound = enabled;

  try{
    localStorage.setItem(SOUND_KEY,sound ? "on" : "off");
  }catch(e){}

  $("soundBtn").textContent = sound ? "🔊 Sound: On" : "🔇 Sound: Off";
  $("musicSettingsBtn").textContent = sound ? "🔊 Turn Sound Off" : "🎵 Turn Sound On";

  if(sound){
    getAudio();
    startMusic();
    playPurchase();
  }else{
    stopMusic();
  }
}

/* Browsers require user interaction before audio can play. */
function unlockAudio(){
  if(audioUnlocked) return;

  audioUnlocked = true;

  if(sound){
    getAudio();
    startMusic();
  }
}

document.addEventListener("pointerdown",unlockAudio);
document.addEventListener("keydown",unlockAudio);

$("soundBtn").addEventListener("click",() => setSound(!sound));
$("musicSettingsBtn").addEventListener("click",() => setSound(!sound));

/* Restore the sound preference without trying to autoplay. */
try{
  sound = localStorage.getItem(SOUND_KEY) === "on";
}catch(e){
  sound = false;
}

$("soundBtn").textContent = sound ? "🔊 Sound: On" : "🔇 Sound: Off";
$("musicSettingsBtn").textContent = sound ? "🔊 Turn Sound Off" : "🎵 Turn Sound On";

/* Build the shop once to keep buttons from jumping. */

function buildShop(list,container){
  container.innerHTML = "";

  list.forEach(u => {
    const b = document.createElement("button");
    b.className = "upgrade";
    b.type = "button";

    b.innerHTML = `
      <div class="upgradeIcon">${u.icon}</div>
      <div class="upgradeInfo">
        <div class="upgradeName">${u.name}</div>
        <div class="upgradeDesc">${u.desc}</div>
        <div class="upgradeCost"></div>
      </div>
      <div class="upgradeCount">0</div>
    `;

    b.addEventListener("click",() => buyUpgrade(u));

    u.button = b;
    u.costElement = b.querySelector(".upgradeCost");
    u.countElement = b.querySelector(".upgradeCount");

    container.appendChild(b);
  });
}

function updateShop(){
  [...upgrades,...christmasUpgrades].forEach(u => {
    const count = counts[u.id] || 0;
    const cost = Math.floor(u.price * Math.pow(1.15,count));

    u.button.disabled = cookies < cost;
    u.costElement.textContent = "🍪 " + format(cost) + " cookies";
    u.countElement.textContent = count;
  });
}

function renderStats(){
  $("cookieCount").textContent = format(cookies) + " cookies";
  $("cps").textContent = "⚡ " + format(getCps()) + " cookies per second";
  $("clickPower").textContent = "🍪 Per click: " + format(clickPower);
  $("totalBaked").textContent = format(totalCookies);
  $("powerDisplay").textContent = format(clickPower);
  $("buildingDisplay").textContent = format(getBuildingCount());
}

function render(){
  renderStats();
  updateShop();
}

function buyUpgrade(u){
  const cost = Math.floor(u.price * Math.pow(1.15,counts[u.id]));

  if(cookies < cost) return;

  cookies -= cost;
  counts[u.id]++;

  playPurchase();
  showToast("✨ Purchased " + u.name + "!");

  render();
  saveGame();
  updateCursorSprites();
}

/* Cookie clicking. */

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

/* =====================================================
   MULTI-ROW CURSORS
   The first ring fills up, then another ring appears.
   ===================================================== */

let cursorElements = [];
let cursorAmountBuilt = -1;

const cursorRingCapacities = [12,18,24,30];
const MAX_VISIBLE_CURSORS = 84;

function getCursorRing(index){
  let remaining = index;

  for(let ring = 0; ring < cursorRingCapacities.length; ring++){
    const capacity = cursorRingCapacities[ring];

    if(remaining < capacity){
      return {
        ring,
        position:remaining,
        capacity
      };
    }

    remaining -= capacity;
  }

  return null;
}

function updateCursorSprites(){
  const stage = $("cookieStage");
  const amount = Math.min(counts.cursor || 0,MAX_VISIBLE_CURSORS);

  if(amount === cursorAmountBuilt) return;

  cursorAmountBuilt = amount;

  cursorElements.forEach(el => el.remove());
  cursorElements = [];

  for(let i = 0; i < amount; i++){
    const cursor = document.createElement("div");
    cursor.className = "cursorSprite";
    cursor.textContent = "➤";

    stage.appendChild(cursor);
    cursorElements.push(cursor);
  }

  const badge = $("cursorCount");

  if((counts.cursor || 0) > MAX_VISIBLE_CURSORS){
    badge.style.display = "block";
    badge.textContent = "+" + ((counts.cursor || 0) - MAX_VISIBLE_CURSORS) + " more cursors";
  }else{
    badge.style.display = "none";
  }
}

function animateCursors(){
  const stage = $("cookieStage");
  const rect = stage.getBoundingClientRect();

  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const time = performance.now() / 1000;

  cursorElements.forEach((cursor,i) => {
    const ringInfo = getCursorRing(i);
    if(!ringInfo) return;

    const {ring,position,capacity} = ringInfo;

    /* Each new row sits farther away from the cookie. */
    const radius = Math.min(rect.width,rect.height) * (
      .31 + ring * .045
    );

    const rotation = time * (.55 - ring * .07);
    const angle = (Math.PI * 2 * position / capacity) + rotation;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    const towardCenter = Math.atan2(cy-y,cx-x) * 180 / Math.PI;

    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
    cursor.style.transform =
      `translate(-50%,-50%) rotate(${towardCenter}deg)`;
  });

  requestAnimationFrame(animateCursors);
}

/* Bonus cookie. */

function spawnGolden(){
  const btn = $("goldenCookie");

  btn.style.display = "block";
  btn.style.left = (10 + Math.random() * 70) + "%";
  btn.style.top = (10 + Math.random() * 70) + "%";

  goldenTimeout = setTimeout(() => btn.style.display = "none",10000);
}

$("goldenCookie").addEventListener("click",() => {
  const reward = Math.max(50,getCps() * 60,clickPower * 50);

  cookies += reward;
  totalCookies += reward;

  $("goldenCookie").style.display = "none";
  clearTimeout(goldenTimeout);

  playBonus();
  showToast("✨ BONUS! +" + format(reward) + " cookies!");

  render();
  saveGame();
});

/* Falling colorful decorations. */

function snow(){
  const f = document.createElement("div");
  f.className = "snowflake";

  const symbols = ["❄","✦","✧","⭐","🎄","🎁","❅"];
  const colors = [
    "#ff3155","#00b978","#218cff",
    "#b45cff","#ffbd25","#ff72c5","#ffffff"
  ];

  const i = Math.floor(Math.random() * symbols.length);

  f.textContent = symbols[i];
  f.style.color = colors[Math.floor(Math.random() * colors.length)];
  f.style.left = Math.random() * 100 + "vw";
  f.style.fontSize = (12 + Math.random() * 18) + "px";

  const d = 5 + Math.random() * 7;
  f.style.animationDuration = d + "s";

  document.body.appendChild(f);
  setTimeout(() => f.remove(),d * 1000);
}

setInterval(snow,450);

/* Save system: original save key and data format preserved. */

const SAVE_KEY = "cookieClickerSave";

function getSaveData(){
  return {
    version:1,
    savedAt:new Date().toISOString(),
    cookies,
    totalCookies,
    clickPower,
    counts:{...counts}
  };
}

function saveGame(){
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify(getSaveData()));

    $("saveStatus").textContent =
      "Last saved: " + new Date().toLocaleTimeString();

    return true;
  }catch(e){
    showToast("Couldn't save: browser storage may be full.");
    return false;
  }
}

function applySaveData(d){
  if(
    !d ||
    typeof d !== "object" ||
    !Number.isFinite(Number(d.cookies)) ||
    Number(d.cookies) < 0 ||
    !Number.isFinite(Number(d.totalCookies)) ||
    Number(d.totalCookies) < 0 ||
    !Number.isFinite(Number(d.clickPower)) ||
    Number(d.clickPower) < 1 ||
    !d.counts ||
    typeof d.counts !== "object"
  ){
    throw new Error("That file isn't a valid Cookie Clicker save.");
  }

  const nextCounts = {};

  Object.keys(counts).forEach(id => {
    const value = Number(d.counts[id] ?? 0);

    if(!Number.isFinite(value) || value < 0){
      throw new Error("The save has invalid upgrade counts.");
    }

    nextCounts[id] = Math.floor(value);
  });

  cookies = Number(d.cookies);
  totalCookies = Number(d.totalCookies);
  clickPower = Number(d.clickPower);

  Object.assign(counts,nextCounts);

  render();
  updateCursorSprites();
  saveGame();
}

function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);

    if(raw){
      applySaveData(JSON.parse(raw));
    }
  }catch(e){
    console.warn("Could not load save:",e);
    showToast("Couldn't load saved game. Starting fresh.");
  }
}

/* Settings. */

function openSettings(){
  $("settingsOverlay").classList.add("open");
}

function closeSettings(){
  $("settingsOverlay").classList.remove("open");
}

$("settingsBtn").addEventListener("click",openSettings);
$("closeSettings").addEventListener("click",closeSettings);

$("settingsOverlay").addEventListener("click",e => {
  if(e.target === $("settingsOverlay")) closeSettings();
});

document.addEventListener("keydown",e => {
  if(e.key === "Escape") closeSettings();
});

/* Manual save. */

$("saveBtn").addEventListener("click",() => {
  if(saveGame()) showToast("💾 Game saved!");
});

/* Download save. */

$("downloadBtn").addEventListener("click",() => {
  const blob = new Blob(
    [JSON.stringify(getSaveData(),null,2)],
    {type:"application/json"}
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "cookie-clicker-save.json";

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url),1000);

  showToast("Save file downloaded!");
});

/* Upload save. */

$("uploadBtn").addEventListener("click",() => $("uploadInput").click());

$("uploadInput").addEventListener("change",async event => {
  const file = event.target.files[0];
  if(!file) return;

  try{
    const data = JSON.parse(await file.text());

    if(!confirm("Import this save and replace your current progress?")) return;

    applySaveData(data);
    showToast("Save imported successfully!");
  }catch(e){
    showToast(e.message || "Couldn't import that save file.");
  }finally{
    event.target.value = "";
  }
});

/* Reset. */

$("resetBtn").addEventListener("click",() => {
  if(!confirm("Are you sure you want to reset your bakery?")) return;

  cookies = 0;
  totalCookies = 0;
  clickPower = 1;

  Object.keys(counts).forEach(id => counts[id] = 0);

  localStorage.removeItem(SAVE_KEY);

  render();
  updateCursorSprites();
  saveGame();

  showToast("Bakery reset!");
  closeSettings();
});

/* Start game. */

buildShop(upgrades,$("normalShop"));
buildShop(christmasUpgrades,$("christmasShop"));

loadGame();
render();
updateCursorSprites();

requestAnimationFrame(animateCursors);

document.addEventListener("visibilitychange",() => {
  if(document.visibilityState === "hidden"){
    saveGame();
    stopMusic();
  }else if(sound && audioUnlocked){
    startMusic();
  }
});

window.addEventListener("pagehide",saveGame);

/* Cookie production. */

setInterval(() => {
  const gain = getCps() / 10;

  cookies += gain;
  totalCookies += gain;

  renderStats();
  updateShop();
},100);

/* Autosave. */

setInterval(saveGame,5000);

/* Bonus cookie appearances. */

setInterval(() => {
  if(
    Math.random() < .65 &&
    $("goldenCookie").style.display !== "block"
  ){
    spawnGolden();
  }
},35000);
