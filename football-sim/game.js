const VERSION="0.7.3";
const SAVE_KEY="gcs_v073";

const WEEKS_PER_SEASON=12;
const HOURS_PER_WEEK=25;
const XP_PER_LEVEL=300;

let state;

function newCareer(){
state={
phase:"HS",year:1,week:1,
life:{energy:100,hours:HOURS_PER_WEEK,money:500},
xp:0,level:1,skillPts:0,
skills:{throwPower:70,accuracy:70,speed:70},
teamOVR:70,
game:null
};
save();render();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function load(){let s=localStorage.getItem(SAVE_KEY);if(s){state=JSON.parse(s);return true;}return false;}

function calcOVR(){
let v=Object.values(state.skills);
return Math.min(99,Math.round(v.reduce((a,b)=>a+b,0)/v.length));
}

function gainXP(x){
state.xp+=x;
while(state.xp>=XP_PER_LEVEL){
state.xp-=XP_PER_LEVEL;
state.level++;
state.skillPts+=3;
log("Level up!");
}
}

function doAction(type,h){
const costEnergy={train:10,study:6,work:6,rest:-12}[type]*h;
if(state.life.energy<costEnergy||state.life.hours<h)return;
state.life.energy-=costEnergy;
state.life.hours-=h;
if(type==="train")gainXP(40*h);
if(type==="study")gainXP(20*h);
if(type==="work")state.life.money+=100*h;
if(type==="rest")state.life.energy=Math.min(100,state.life.energy+20*h);
render();save();
}

function advanceWeek(){
state.week++;
state.life.energy=Math.min(100,state.life.energy+30);
state.life.hours=HOURS_PER_WEEK;

if(state.week>WEEKS_PER_SEASON){
state.week=1;state.year++;
if(state.phase==="HS"&&state.year>4)state.phase="College";
}

state.game = Math.random()<0.75 ? createGame() : null;
render();save();
}

function createGame(){
return{
oppOVR:randomInt(65,85),
home:Math.random()<0.5,
drive:0,
momentum:0
};
}

function startGame(){
  // Prevent double-starts (can spam logs and break state)
  if(state.game && state.game.active) return;
  state.game = {
    active:true,
    // Drive-based mini game state
    driveIndex:0,
    maxDrives:4,
    driveState:null,
    // Scoring / momentum
    myPoints:0,
    oppPoints:0,
    momentum:0,
    // Interaction
    selectedPlay:null,
    meterWidth:0.18
  };
  // Some deployments can end up missing the mini-game markup (or it can be edited accidentally).
  // If key elements are missing, rebuild the mini-game panel so the game remains playable.
  ensureMiniGameDOM();
  showMiniGame(true);
  log("🏈 Game Day started! You get 4 drives — make them count.");
  nextDrive();
}

let _meterRAF = null;
let _meterRunning = false;
let _meterPlay = null;
let _meterStartT = 0;

const PLAYS = [
  {id:"run",   label:"Run",        stat:"speed",    base:0.62, speed:1.10, tdBoost:0.14},
  {id:"short", label:"Quick Pass",  stat:"accuracy", base:0.68, speed:1.20, tdBoost:0.10},
  {id:"deep",  label:"Deep Shot",   stat:"throw",    base:0.52, speed:1.35, tdBoost:0.24},
  {id:"trick", label:"Trick Play",  stat:"iq",       base:0.48, speed:1.45, tdBoost:0.30},
];

function showMiniGame(on){
  const mg = document.getElementById("miniGame");
  if(!mg) return;
  mg.classList.toggle("hidden", !on);
}

function ensureMiniGameDOM(){
  const mg = document.getElementById("miniGame");
  if(!mg) return;
  // If any critical element is missing, reconstruct the panel.
  const needsRebuild = !document.getElementById("driveCount") || !document.getElementById("driveTotal") ||
    !document.getElementById("downToGo") || !document.getElementById("ballPos") || !document.getElementById("driveChoices") ||
    !document.getElementById("meter") || !document.getElementById("meterMarker") || !document.getElementById("meterTarget") ||
    !document.getElementById("btnStart") || !document.getElementById("btnStop");

  if(!needsRebuild) return;

  mg.innerHTML = `
    <div class="mini-head">
      <div class="mini-title">Game Day — Drive <span id="driveCount">1</span>/<span id="driveTotal">4</span></div>
      <div class="mini-meta">
        <span id="ballPos">Ball: 25</span>
        <span id="downToGo">Down: 1 &amp; 10</span>
      </div>
    </div>

    <div class="mini-instructions">Pick a play, then stop the marker inside the green zone for a better outcome.</div>

    <div class="mini-choices" id="driveChoices"></div>

    <div class="meter" id="meter">
      <div class="meter-target" id="meterTarget"></div>
      <div class="meter-marker" id="meterMarker"></div>
    </div>

    <div class="mini-controls">
      <button class="btn" id="btnStart" type="button">Start</button>
      <button class="btn" id="btnStop" type="button" disabled>Stop</button>
    </div>
  `;

  // Re-bind controls
  const bStart = document.getElementById("btnStart");
  const bStop  = document.getElementById("btnStop");
  if(bStart) bStart.onclick = startMeter;
  if(bStop)  bStop.onclick  = stopMeter;
}

function statVal(stat){
  const s = state.skills || {};
  if(stat==="throw") return s.throwPower||50;
  if(stat==="accuracy") return s.accuracy||50;
  if(stat==="speed") return s.speed||50;
  if(stat==="iq") return s.footballIQ||50;
  return 50;
}

function setMeterTarget(widthPct){
  const t = document.getElementById("meterTarget");
  if(!t) return;
  const w = clamp(widthPct, 10, 32);
  t.style.width = w + "%";
  t.style.left = (50 - (w/2)) + "%";
  state.game.meterWidth = w/100;
}

function meterPos(now){
  // smooth sine sweep 0..1
  const play = _meterPlay || PLAYS[0];
  const t = (now - _meterStartT) / 1000;
  const sp = play.speed || 1.2;
  const p = (Math.sin(t * Math.PI * 2 * sp) + 1) / 2;
  return p;
}

function meterLoop(now){
  if(!_meterRunning) return;
  const needle = document.getElementById("meterNeedle");
  const p = meterPos(now);
  if(needle) needle.style.left = (p*100) + "%";
  _meterRAF = requestAnimationFrame(meterLoop);
}

function stopMeter(){
  _meterRunning = false;
  if(_meterRAF) cancelAnimationFrame(_meterRAF);
  _meterRAF = null;

  const now = performance.now();
  const p = meterPos(now);
  const w = state.game.meterWidth || 0.18;
  const delta = Math.abs(p - 0.5);
  const quality = clamp(1 - (delta / 0.5), 0, 1);
  const inTarget = delta <= (w/2);

  resolveDrive(_meterPlay, quality, inTarget);
}

function nextDrive(){
  ensureMiniGameDOM();
  if(!state.game?.active) return;
  if(!Number.isFinite(state.game.driveIndex)) state.game.driveIndex = 0;

  const driveNum = document.getElementById('driveNum');
  const driveStatus = document.getElementById('driveStatus');
  const drivePrompt = document.getElementById('drivePrompt');
  const driveChoices = document.getElementById('driveChoices');
  const track = document.getElementById('timingTrack');
  const marker = document.getElementById('timingMarker');
  const stopBtn = document.getElementById('timingStopBtn');
  const bar = document.getElementById('timingBar');
  const res = document.getElementById('driveResult');

  // Max drives per game
  if(state.game.driveIndex >= state.game.maxDrives){
    finishGame();
    return;
  }

  // Create a new drive if needed
  if(!state.game.driveState || state.game.driveState.done){
    state.game.driveIndex += 1;
    state.game.driveState = {
      ball: 25, // yards from your endzone
      down: 1,
      toGo: 10,
      plays: 0,
      done: false,
      lastPlay: null,
    };
  }

  const ds = state.game.driveState;

  // UI setup
  driveNum.textContent = `${state.game.driveIndex}/4`;
  driveStatus.textContent = `Ball: ${ds.ball} • Down: ${ds.down} & ${ds.toGo}`;
  drivePrompt.textContent = `Pick a play, then stop the marker in the green zone for a better outcome.`;
  res.textContent = '';

  // reset timing
  bar.classList.add('hidden');
  stopBtn.classList.add('hidden');
  track.classList.add('hidden');
  marker.style.left = '0%';
  state.game.timing = null;
  state.game.selectedPlay = null;

  // Build choices
  const inFgRange = ds.ball >= 65; // ~52 yard FG or closer
  const canKick = inFgRange && ds.down >= 3; // encourage some plays first

  const plays = [
    { id:'run', label:'Run', risk:0.10 },
    { id:'short', label:'Short Pass', risk:0.12 },
    { id:'deep', label:'Deep Pass', risk:0.20 },
  ];

  driveChoices.innerHTML = '';
  for(const p of plays){
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = p.label;
    b.onclick = () => {
      state.game.selectedPlay = p;
      bar.classList.remove('hidden');
      track.classList.remove('hidden');
      stopBtn.classList.remove('hidden');
      drivePrompt.textContent = `${p.label}: stop the marker in green. Great timing = more yards, bad timing = risk.`;
      playTiming();
    };
    driveChoices.appendChild(b);
  }

  if(canKick){
    const k = document.createElement('button');
    k.className = 'chip';
    k.textContent = 'Kick FG';
    k.onclick = () => {
      // Field goal mini-check: 1 timing stop, greener = higher chance
      state.game.selectedPlay = { id:'fg', label:'Field Goal', risk:0.00 };
      bar.classList.remove('hidden');
      track.classList.remove('hidden');
      stopBtn.classList.remove('hidden');
      drivePrompt.textContent = `Field Goal attempt: stop the marker in green to make the kick.`;
      playTiming();
    };
    driveChoices.appendChild(k);
  }

  stopBtn.onclick = () => {
    if(!state.game.selectedPlay) return;
    stopTiming();
    resolveDrive(state.game.selectedPlay);
  };
}

function resolveDrive(play){
  const ds = state.game.driveState;
  if(!ds || ds.done) return;

  const res = document.getElementById('driveResult');
  const drivePrompt = document.getElementById('drivePrompt');

  // Timing quality: 0..1
  const q = Math.max(0, Math.min(1, (state.game.timing ?? 0.5)));
  const skill = (state.skills.throwAcc + state.skills.speed + state.skills.awareness) / 3; // 1..99-ish
  const skillN = Math.max(0, Math.min(1, (skill-40)/59));

  const isGreat = q >= 0.40 && q <= 0.60;
  const isOk = q >= 0.25 && q <= 0.75;

  // Field goal attempt
  if(play.id === 'fg'){
    const dist = Math.max(18, 100 - ds.ball + 17); // rough kick distance
    const base = 0.88 - Math.max(0, (dist-35)) * 0.015; // harder as distance grows
    const timingBoost = isGreat ? 0.10 : (isOk ? 0.03 : -0.08);
    const skillBoost = (skillN - 0.5) * 0.10;
    const pMake = Math.max(0.10, Math.min(0.98, base + timingBoost + skillBoost));
    const made = Math.random() < pMake;
    if(made){
      state.game.myPoints += 3;
      ds.done = true;
      res.textContent = `FG is GOOD from ~${dist} yards! (+3)`;
    } else {
      ds.done = true;
      res.textContent = `FG is no good from ~${dist} yards.`;
    }
    save();
    setTimeout(()=> nextDrive(), 700);
    return;
  }

  // Yard ranges per play
  let yMin=0, yMax=0, turnoverBase=play.risk;
  if(play.id==='run') { yMin=1; yMax=8; }
  if(play.id==='short'){ yMin=3; yMax=12; }
  if(play.id==='deep') { yMin=6; yMax=28; }

  // Timing effect
  const timingMult = isGreat ? 1.25 : (isOk ? 1.0 : 0.75);
  const skillMult = 0.85 + skillN*0.35;

  // Turnover: worse timing and deep passes increase risk
  let tRisk = turnoverBase;
  if(!isOk) tRisk += 0.08;
  if(isGreat) tRisk -= 0.03;
  tRisk += (0.5 - skillN) * 0.06;
  tRisk = Math.max(0.02, Math.min(0.35, tRisk));

  // Sack/Stuff chance
  const negativeChance = (play.id==='deep' ? 0.12 : 0.06) + (0.5 - skillN)*0.05;

  let yards;
  if(Math.random() < negativeChance){
    yards = -1 * (1 + Math.floor(Math.random()*6));
  } else {
    const raw = yMin + Math.random()*(yMax-yMin);
    yards = Math.round(raw * timingMult * skillMult);
  }

  // Turnover check
  if(Math.random() < tRisk){
    ds.done = true;
    res.textContent = `${play.label}: TURNOVER!`;
    drivePrompt.textContent = `Drive over.`;
    save();
    setTimeout(()=> nextDrive(), 700);
    return;
  }

  ds.plays += 1;
  ds.ball = Math.max(1, Math.min(100, ds.ball + yards));

  // TD check
  if(ds.ball >= 100){
    state.game.myPoints += 7;
    ds.done = true;
    res.textContent = `${play.label}: ${yards>=0?'+':''}${yards} yards — TOUCHDOWN! (+7)`;
    save();
    setTimeout(()=> nextDrive(), 700);
    return;
  }

  // Update downs / distance
  if(yards >= ds.toGo){
    ds.down = 1;
    ds.toGo = 10;
    res.textContent = `${play.label}: ${yards>=0?'+':''}${yards} yards — First down!`;
  } else {
    ds.toGo = Math.min(25, Math.max(1, ds.toGo - yards));
    ds.down += 1;
    res.textContent = `${play.label}: ${yards>=0?'+':''}${yards} yards.`;

    if(ds.down > 4){
      ds.done = true;
      res.textContent += ` Turnover on downs.`;
      save();
      setTimeout(()=> nextDrive(), 700);
      return;
    }
  }

  // Small pacing rule: end drive if too many plays
  if(ds.plays >= 7){
    ds.done = true;
    res.textContent += ` Drive stalls.`;
    save();
    setTimeout(()=> nextDrive(), 700);
    return;
  }

  // Re-render with updated status
  save();
  nextDrive();
}

function finishGame(){
  // Decide outcome primarily by game-day points; use OVR as tiebreaker
  const my = state.game?.myPoints ?? 0;
  const opp = state.game?.oppPoints ?? 0;

  let result;
  if(my>opp) result = "W";
  else if(my<opp) result = "L";
  else {
    const diff = calcOVR() - (state.teamOppOVR||70);
    result = diff>=0 ? "W" : "L";
  }

  if(result==="W"){
    state.record.w++;
    state.money += 120;
    state.xp += 120;
    log(`✅ Final: You ${my}-${opp} (W) — +$120, +120 XP`);
  } else {
    state.record.l++;
    state.money += 40;
    state.xp += 60;
    log(`❌ Final: You ${my}-${opp} (L) — +$40, +60 XP`);
  }

  // weekly recovery after game
  state.energy = clamp(state.energy + 20, 0, state.maxEnergy);
  state.hours = clamp(state.hours + 5, 0, state.maxHours);

  state.game.active = false;
  showMiniGame(false);
  checkLevelUp();
  save();
  render();
}

function toggleSkills(){skillsPanel.classList.toggle("hidden");}

function renderSkills(){
skillsPanel.innerHTML="";
Object.entries(state.skills).forEach(([k,v])=>{
let r=document.createElement("div");
let b=document.createElement("button");
b.textContent="+";
b.onclick=()=>{if(state.skillPts>0){state.skills[k]++;state.skillPts--;render();save();}};
r.textContent=`${k}: ${v} `;
r.appendChild(b);
skillsPanel.appendChild(r);
});
}

function render(){
document.title=`Gridiron Career Sim v${VERSION}`;
careerHeader.textContent=`${state.phase} Year ${state.year} — Week ${state.week}/${WEEKS_PER_SEASON}`;
money.textContent=state.life.money;
ovr.textContent=calcOVR();
level.textContent=state.level;
xp.textContent=`${state.xp}/${XP_PER_LEVEL}`;
skillPts.textContent=state.skillPts;
energyBar.style.width=state.life.energy+"%";
hoursBar.style.width=(state.life.hours/HOURS_PER_WEEK*100)+"%";
renderSkills();

if(state.game){
gameCard.classList.remove("hidden");
gameInfo.innerHTML=`Opponent OVR: ${state.game.oppOVR}<br>${state.game.home?"Home":"Away"}`;
}else gameCard.classList.add("hidden");
}

function log(m){logEl.innerHTML=m+"<br>"+logEl.innerHTML;}
const logEl=document.getElementById("log");

function randomInt(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

document.addEventListener("DOMContentLoaded",()=>{
if(!load())newCareer();
render();
});
