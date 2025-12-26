const SAVE_KEY="gcs_v061_energy";
let state;

const ENERGY_COSTS = {
  train:20,
  study:15,
  social:10,
  work:15
};

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
      energy:100
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

function spendEnergy(cost){
  if(state.life.energy < cost){
    log("Not enough energy.");
    return false;
  }
  state.life.energy -= cost;
  return true;
}

function advanceWeek(){
  state.week++;
  state.life.energy = Math.min(100, state.life.energy + 30);

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

  renderShop();
}

document.addEventListener("DOMContentLoaded",()=>{
  if(!load())newCareer();else render();

  btnNew.onclick=newCareer;
  btnWipe.onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload();};

  btnAdvanceWeek.onclick=advanceWeek;

  btnTrain.onclick=()=>{
    if(spendEnergy(ENERGY_COSTS.train)){
      state.player.ratings.speed++;
      log("Training improved speed");
      render();save();
    }
  };

  btnStudy.onclick=()=>{
    if(spendEnergy(ENERGY_COSTS.study)){
      state.life.grades+=2;
      log("Studied");
      render();save();
    }
  };

  btnSocial.onclick=()=>{
    if(spendEnergy(ENERGY_COSTS.social)){
      state.life.social+=2;
      log("Socialized");
      render();save();
    }
  };

  btnWork.onclick=()=>{
    if(spendEnergy(ENERGY_COSTS.work)){
      state.life.money+=100;
      log("Worked part-time");
      render();save();
    }
  };
});
