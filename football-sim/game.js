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

function save(){localStorage.setItem("gcs_v068",JSON.stringify(state));}
function load(){let s=localStorage.getItem("gcs_v068");if(s){state=JSON.parse(s);return true;}return false;}

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
  state.game = { active:true, drive:0, myPoints:0, oppPoints:0, momentum:0, selectedPlay:null, meterWidth:0.18 };
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
  if(!state.game?.active) return;

  if(state.game.drive >= 4){
    finishGame();
    return;
  }

  const driveNumEl = document.getElementById("driveNum");
  const promptEl = document.getElementById("drivePrompt");
  const choicesEl = document.getElementById("driveChoices");
  const startBtn = document.getElementById("meterStart");
  const stopBtn  = document.getElementById("meterStop");
  const resEl    = document.getElementById("meterResult");

  if(driveNumEl) driveNumEl.textContent = String(state.game.drive+1) + "/4";
  if(promptEl) promptEl.textContent = "Pick a play. Then click Start and hit Stop as close to the green zone as you can.";
  if(resEl) resEl.textContent = "";

  _meterPlay = null;
  if(startBtn){ startBtn.disabled = true; startBtn.textContent="Start"; }
  if(stopBtn){ stopBtn.disabled = true; stopBtn.textContent="Stop"; }

  // reset needle
  const needle = document.getElementById("meterNeedle");
  if(needle) needle.style.left = "0%";

  // build play buttons
  if(choicesEl){
    choicesEl.innerHTML = "";
    PLAYS.forEach(p=>{
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn chip";
      b.textContent = p.label;
      b.addEventListener("click", ()=>{
        _meterPlay = p;
        // target width scales with stat
        const sv = statVal(p.stat);
        const widthPct = 12 + (sv/5); // 12..32
        setMeterTarget(widthPct);

        // highlight selection
        [...choicesEl.querySelectorAll("button")].forEach(x=>x.classList.remove("active"));
        b.classList.add("active");

        if(startBtn){ startBtn.disabled = false; }
        if(resEl) resEl.textContent = `Selected: ${p.label}`;
      });
      choicesEl.appendChild(b);
    });
  }

  // bind buttons once (safe to rebind)
  if(startBtn && !startBtn.dataset.bound){
    startBtn.dataset.bound="1";
    startBtn.addEventListener("click", ()=>{
      if(!_meterPlay) return;
      const res = document.getElementById("meterResult");
      if(res) res.textContent = "Timing…";
      _meterStartT = performance.now();
      _meterRunning = true;
      startBtn.disabled = true;
      const stop = document.getElementById("meterStop");
      if(stop) stop.disabled = false;
      _meterRAF = requestAnimationFrame(meterLoop);
    });
  }
  if(stopBtn && !stopBtn.dataset.bound){
    stopBtn.dataset.bound="1";
    stopBtn.addEventListener("click", ()=>{
      stopBtn.disabled = true;
      stopMeter();
    });
  }

  const hideBtn = document.getElementById("miniHide");
  if(hideBtn && !hideBtn.dataset.bound){
    hideBtn.dataset.bound="1";
    hideBtn.addEventListener("click", ()=>{
      const mg = document.getElementById("miniGame");
      if(!mg) return;
      const hidden = mg.classList.toggle("hidden");
      if(hidden && state.game?.active){
        log("ℹ️ Game Day is still active — open the Game Day panel to continue your drives.");
      }
    });
  }
}
driveNum.textContent=state.game.drive;
drivePrompt.textContent="Choose your play:";
driveChoices.innerHTML="";
["Quick Pass","Deep Shot","Scramble"].forEach(p=>{
let b=document.createElement("button");
b.textContent=p;
b.onclick=()=>resolveDrive(p);
driveChoices.appendChild(b);
});
}

function resolveDrive(play, quality, inTarget){
  const resEl = document.getElementById("meterResult");
  const stopBtn = document.getElementById("meterStop");

  const p = play || {label:"Play", base:0.6, tdBoost:0.12, stat:"accuracy"};
  const sv = statVal(p.stat);

  // success chance blends timing + skill
  let success = p.base + (quality * 0.22) + ((sv - 50) / 250);
  if(inTarget) success += 0.08;
  success = clamp(success, 0.20, 0.93);

  // determine your points
  let myPts = 0;
  const r1 = Math.random();
  if(r1 < success){
    const tdChance = (0.10 + p.tdBoost) + (quality*0.20);
    myPts = (Math.random() < tdChance) ? 7 : 3;
  } else {
    myPts = 0;
  }

  // opponent response drive
  let oppPts = 0;
  const myOVR = calcOVR();
  const oppOVR = state.teamOppOVR || 70;
  let oppSuccess = 0.58 + ((oppOVR - myOVR)/180);
  // if you fail badly, give them a bit more
  if(quality < 0.25) oppSuccess += 0.06;
  oppSuccess = clamp(oppSuccess, 0.25, 0.85);

  if(Math.random() < oppSuccess){
    oppPts = (Math.random() < (0.22 + (oppOVR-70)/200)) ? 7 : 3;
  }

  state.game.myPoints += myPts;
  state.game.oppPoints += oppPts;

  const driveNo = state.game.drive + 1;
  const you = state.game.myPoints;
  const opp = state.game.oppPoints;

  const qualLabel = quality >= 0.85 ? "Perfect" :
                    quality >= 0.65 ? "Great" :
                    quality >= 0.45 ? "Okay" : "Miss";
  const myLabel = myPts===7 ? "TD" : (myPts===3 ? "FG" : "No score");
  const oppLabel = oppPts===7 ? "TD" : (oppPts===3 ? "FG" : "No score");

  log(`Drive ${driveNo}: ${p.label} — ${myLabel}. Opponent: ${oppLabel}. Score: You ${you}-${opp}`);

  if(resEl){
    resEl.innerHTML = `
      <div class="result-line"><strong>${qualLabel}</strong> timing • ${p.label}</div>
      <div class="result-line">Drive result: <strong>You ${myPts}</strong> / Opp <strong>${oppPts}</strong></div>
      <div class="result-line">Total: <strong>You ${you}-${opp}</strong></div>
      <button class="btn" id="nextDriveBtn" type="button">Next Drive</button>
    `;
    const btn = document.getElementById("nextDriveBtn");
    if(btn){
      btn.addEventListener("click", ()=>{
        state.game.drive++;
        save();
        render();
        nextDrive();
      });
    }
  }

  if(stopBtn) stopBtn.disabled = true;
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
