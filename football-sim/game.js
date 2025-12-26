const SAVE_KEY="gcs_v062_hours";
let state;

const ENERGY_PER_HOUR = {
  train:8,
  study:6,
  social:4,
  work:6
};

const HOURS_PER_WEEK = 40;

const SHOP_ITEMS = [
  {id:"energy_drink", name:"Energy Drink", cost:75, restore:20},
  {id:"meal", name:"Protein Meal", cost:200, restore:45}
];

function log(msg){
  const el=document.getElementById("log");
  el.innerHTML=msg+"<br>"+el.innerHTML;
}

function newCareer(){
  state={
    phase:"HS",
    year:1,
    week:1,
    player:{
      position:"QB",
      ratings:{speed:70,strength:70,agility:70,awareness:70,stamina:70}
    },
    life:{
      grades:70,
      social:50,
      money:0,
      energy:100,
      hours:HOURS_PER_WEEK
    },
    hs:{wins:0,losses:0},
    college:{offers:[],committed:false},
    draft:{projection:null},
    pro:{team:null,season:0},
  };
  save();render();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function load(){
  const s=localStorage.getItem(SAVE_KEY);
  if(!s)return false;
  state=JSON.parse(s);return true;
}

function canSpend(hours, energy){
  if(state.life.hours < hours){
    log("Not enough hours left this week.");
    return false;
  }
  if(state.life.energy < energy){
    log("Not enough energy.");
    return false;
  }
  return true;
}

function spend(hours, energy){
  state.life.hours -= hours;
  state.life.energy -= energy;
}

function advanceWeek(){
  state.week++;
  state.life.energy = Math.min(100, state.life.energy + 30);
  state.life.hours = HOURS_PER_WEEK;

  if(state.week>12){
    state.week=1;
    state.year++;
    log(`Year ${state.year-1} complete.`);
  }

  if(state.phase==="HS" && state.year>4){
    state.phase="COLLEGE";
    log("High School complete. College recruiting begins.");
  }

  render();save();
}

function renderShop(){
  const el=document.getElementById("shop");
  el.innerHTML="";
  SHOP_ITEMS.forEach(item=>{
    const b=document.createElement("button");
    b.textContent=`${item.name} ($${item.cost})`;
    b.onclick=()=>{
      if(state.life.money < item.cost){
        log("Not enough money.");
        return;
      }
      state.life.money -= item.cost;
      state.life.energy = Math.min(100, state.life.energy + item.restore);
      log(`${item.name} used (+${item.restore} energy)`);
      render();save();
    };
    el.appendChild(b);
  });
}

function render(){
  document.getElementById("careerSub").textContent =
    `${state.phase} • Year ${state.year} • Week ${state.week}`;

  document.getElementById("lifeStats").innerHTML =
    `Grades: ${state.life.grades}<br>
     Social: ${state.life.social}<br>
     Money: $${state.life.money}`;

  document.getElementById("energyText").textContent =
    `${state.life.energy}/100`;
  document.getElementById("energyBar").style.width =
    state.life.energy + "%";

  document.getElementById("hoursText").textContent =
    `${state.life.hours}/${HOURS_PER_WEEK}`;
  document.getElementById("hoursBar").style.width =
    (state.life.hours/HOURS_PER_WEEK*100) + "%";

  renderShop();
}

document.addEventListener("DOMContentLoaded",()=>{
  if(!load())newCareer();else render();

  btnNew.onclick=newCareer;
  btnWipe.onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload();};

  btnAdvanceWeek.onclick=advanceWeek;

  btnTrain.onclick=()=>{
    const h=parseInt(trainHours.value,10);
    const e=h*ENERGY_PER_HOUR.train;
    if(canSpend(h,e)){
      spend(h,e);
      state.player.ratings.speed+=h;
      log(`Trained for ${h}h (+${h} speed)`);
      render();save();
    }
  };

  btnStudy.onclick=()=>{
    const h=parseInt(studyHours.value,10);
    const e=h*ENERGY_PER_HOUR.study;
    if(canSpend(h,e)){
      spend(h,e);
      state.life.grades+=h*2;
      log(`Studied for ${h}h`);
      render();save();
    }
  };

  btnSocial.onclick=()=>{
    const h=parseInt(socialHours.value,10);
    const e=h*ENERGY_PER_HOUR.social;
    if(canSpend(h,e)){
      spend(h,e);
      state.life.social+=h*2;
      log(`Socialized for ${h}h`);
      render();save();
    }
  };

  btnWork.onclick=()=>{
    const h=parseInt(workHours.value,10);
    const e=h*ENERGY_PER_HOUR.work;
    if(canSpend(h,e)){
      spend(h,e);
      state.life.money+=h*100;
      log(`Worked ${h}h (+$${h*100})`);
      render();save();
    }
  };
});
