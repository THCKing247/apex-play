const WEEKS_PER_SEASON=12;
const HOURS_PER_WEEK=25;
const XP_PER_LEVEL=300;

let state={};

function newCareer(){
state={
phase:"HS",year:1,week:1,
life:{energy:100,hours:HOURS_PER_WEEK,money:500},
xp:0,level:1,skillPts:0,
skills:{throwPower:70,accuracy:70,speed:70},
};
save();render();
}

function save(){localStorage.setItem("gcs_v066",JSON.stringify(state));}
function load(){let s=localStorage.getItem("gcs_v066");if(s){state=JSON.parse(s);return true;}return false;}

function calcOVR(){
let vals=Object.values(state.skills);
let avg=vals.reduce((a,b)=>a+b,0)/vals.length;
return Math.min(99,Math.round(avg));
}

function gainXP(x){
state.xp+=x;
while(state.xp>=XP_PER_LEVEL){
state.xp-=XP_PER_LEVEL;
state.level++;
state.skillPts+=3;
log("Leveled up!");
}
}

function doAction(type,h){
const costEnergy={train:10,study:6,work:6,rest:-12}[type]*h;
const costHours=1*h;
if(state.life.energy<costEnergy||state.life.hours<costHours)return;
state.life.energy-=costEnergy;
state.life.hours-=costHours;
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
state.week=1;
state.year++;
log("Season complete.");
if(state.phase==="HS"&&state.year>4){state.phase="College";}
}
render();save();
}

function renderSkills(){
let el=document.getElementById("skillsPanel");
el.innerHTML="";
Object.entries(state.skills).forEach(([k,v])=>{
let row=document.createElement("div");
let btn=document.createElement("button");
btn.textContent="+";
btn.onclick=()=>{
if(state.skillPts>0){
state.skills[k]++;
state.skillPts--;
render();save();
}
};
row.innerHTML=`${k}: ${v} `;
row.appendChild(btn);
el.appendChild(row);
});
}

function render(){
careerHeader.textContent=`${state.phase} Year ${state.year} - Week ${state.week}/${WEEKS_PER_SEASON}`;
money.textContent=state.life.money;
ovr.textContent=calcOVR();
level.textContent=state.level;
xp.textContent=`${state.xp}/${XP_PER_LEVEL}`;
skillPts.textContent=state.skillPts;
energyBar.style.width=state.life.energy+"%";
hoursBar.style.width=(state.life.hours/HOURS_PER_WEEK*100)+"%";
renderSkills();
}

function log(msg){document.getElementById("log").innerHTML=msg+"<br>"+document.getElementById("log").innerHTML;}

document.getElementById("toggleSkills").onclick=()=>{
skillsPanel.classList.toggle("hidden");
};

const cheat={
energy:()=>{state.life.energy=100;render();save();},
hours:()=>{state.life.hours=HOURS_PER_WEEK;render();save();},
money:()=>{state.life.money+=1000;render();save();},
week:()=>{advanceWeek();},
year:()=>{state.year++;render();save();}
};

document.addEventListener("DOMContentLoaded",()=>{
if(!load())newCareer();
render();
});
