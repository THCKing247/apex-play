// Logic preserved from v0.6.6
const WEEKS_PER_SEASON=12;
const HOURS_PER_WEEK=25;
const XP_PER_LEVEL=300;

let state;

function newCareer(){
state={
phase:"HS",year:1,week:1,
life:{energy:100,hours:HOURS_PER_WEEK,money:500},
xp:0,level:1,skillPts:0,
skills:{throwPower:70,accuracy:70,speed:70}
};
save();render();
}

function save(){localStorage.setItem("gcs_v067",JSON.stringify(state));}
function load(){let s=localStorage.getItem("gcs_v067");if(s){state=JSON.parse(s);return true;}return false;}

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
render();save();
}

function toggleSkills(){document.getElementById("skillsPanel").classList.toggle("hidden");}

function renderSkills(){
let el=document.getElementById("skillsPanel");
el.innerHTML="";
Object.entries(state.skills).forEach(([k,v])=>{
let r=document.createElement("div");
let b=document.createElement("button");
b.textContent="+";
b.onclick=()=>{if(state.skillPts>0){state.skills[k]++;state.skillPts--;render();save();}};
r.textContent=`${k}: ${v} `;
r.appendChild(b);
el.appendChild(r);
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
}

function log(m){logEl.innerHTML=m+"<br>"+logEl.innerHTML;}
const logEl=document.getElementById("log");

document.addEventListener("DOMContentLoaded",()=>{
if(!load())newCareer();
render();
});
