const SAVE_KEY="gcs_v063_cheats";
let state;

const ENERGY_PER_HOUR={train:8,study:6,social:4,work:6};
const HOURS_PER_WEEK=40;

const SHOP_ITEMS=[
  {id:"energy_drink",name:"Energy Drink",cost:75,restore:20},
  {id:"meal",name:"Protein Meal",cost:200,restore:45}
];

function log(msg){
  const el=document.getElementById("log");
  el.innerHTML=msg+"<br>"+el.innerHTML;
}

function newCareer(){
  state={
    phase:"HS",
    year:1,week:1,
    player:{ratings:{speed:70,strength:70,agility:70,awareness:70,stamina:70}},
    life:{grades:70,social:50,money:0,energy:100,hours:HOURS_PER_WEEK}
  };
  save();render();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function load(){const s=localStorage.getItem(SAVE_KEY);if(!s)return false;state=JSON.parse(s);return true}

function canSpend(h,e){
  if(state.life.hours<h){log("Not enough hours.");return false}
  if(state.life.energy<e){log("Not enough energy.");return false}
  return true
}
function spend(h,e){state.life.hours-=h;state.life.energy-=e}

function advanceWeek(){
  state.week++;
  state.life.energy=Math.min(100,state.life.energy+30);
  state.life.hours=HOURS_PER_WEEK;
  if(state.week>12){state.week=1;state.year++}
  if(state.phase==="HS" && state.year>4){state.phase="COLLEGE";log("HS complete. College begins.")}
  render();save();
}

function renderShop(){
  const el=document.getElementById("shop");
  el.innerHTML="";
  SHOP_ITEMS.forEach(i=>{
    const b=document.createElement("button");
    b.textContent=`${i.name} ($${i.cost})`;
    b.onclick=()=>{
      if(state.life.money<i.cost){log("Not enough money");return}
      state.life.money-=i.cost;
      state.life.energy=Math.min(100,state.life.energy+i.restore);
      log(`${i.name} used`);
      render();save();
    };
    el.appendChild(b);
  });
}

function render(){
  careerSub.textContent=`${state.phase} • Year ${state.year} • Week ${state.week}`;
  lifeStats.innerHTML=`Grades: ${state.life.grades}<br>Social: ${state.life.social}<br>Money: $${state.life.money}`;
  energyText.textContent=`${state.life.energy}/100`;
  energyBar.style.width=state.life.energy+"%";
  hoursText.textContent=`${state.life.hours}/${HOURS_PER_WEEK}`;
  hoursBar.style.width=(state.life.hours/HOURS_PER_WEEK*100)+"%";
  renderShop();
}

document.addEventListener("DOMContentLoaded",()=>{
  if(!load())newCareer();else render();

  btnNew.onclick=newCareer;
  btnWipe.onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload()};
  btnAdvanceWeek.onclick=advanceWeek;

  btnTrain.onclick=()=>{
    const h=parseInt(trainHours.value);
    const e=h*ENERGY_PER_HOUR.train;
    if(canSpend(h,e)){spend(h,e);state.player.ratings.speed+=h;log(`Train ${h}h`);render();save()}
  };
  btnStudy.onclick=()=>{
    const h=parseInt(studyHours.value);
    const e=h*ENERGY_PER_HOUR.study;
    if(canSpend(h,e)){spend(h,e);state.life.grades+=h*2;log(`Study ${h}h`);render();save()}
  };
  btnSocial.onclick=()=>{
    const h=parseInt(socialHours.value);
    const e=h*ENERGY_PER_HOUR.social;
    if(canSpend(h,e)){spend(h,e);state.life.social+=h*2;log(`Social ${h}h`);render();save()}
  };
  btnWork.onclick=()=>{
    const h=parseInt(workHours.value);
    const e=h*ENERGY_PER_HOUR.work;
    if(canSpend(h,e)){spend(h,e);state.life.money+=h*100;log(`Work ${h}h`);render();save()}
  };

  // CHEATS
  cheatEnergy.onclick=()=>{state.life.energy=100;log("CHEAT: Energy maxed");render();save()}
  cheatHours.onclick=()=>{state.life.hours=HOURS_PER_WEEK;log("CHEAT: Hours reset");render();save()}
  cheatMoney.onclick=()=>{state.life.money+=10000;log("CHEAT: +$10,000");render();save()}
  cheatStats.onclick=()=>{
    Object.keys(state.player.ratings).forEach(k=>state.player.ratings[k]+=5);
    log("CHEAT: +5 all stats");render();save()
  }
  cheatWeek.onclick=()=>{advanceWeek();log("CHEAT: Advanced week")}
  cheatYear.onclick=()=>{state.year++;log("CHEAT: +1 year");render();save()}
  cheatPhase.onclick=()=>{
    state.phase=state.phase==="HS"?"COLLEGE":state.phase==="COLLEGE"?"PRO":"HS";
    log("CHEAT: Phase advanced");render();save()
  }
  toggleCheats.onclick=()=>cheatBar.classList.toggle("hidden");
});
