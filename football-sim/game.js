const SAVE_KEY="gcs_v06_backbone";
let state;

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
    life:{grades:70,social:50,money:0},
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

function advanceWeek(){
  state.week++;
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

function render(){
  document.getElementById("careerSub").textContent =
    `${state.phase} • Year ${state.year} • Week ${state.week}`;

  document.getElementById("lifeStats").innerHTML =
    `Grades: ${state.life.grades}<br>
     Social: ${state.life.social}<br>
     Money: $${state.life.money}`;
}

document.addEventListener("DOMContentLoaded",()=>{
  if(!load())newCareer();else render();
  btnNew.onclick=newCareer;
  btnWipe.onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload();};
  btnAdvanceWeek.onclick=advanceWeek;
  btnTrain.onclick=()=>{state.player.ratings.speed++;log("Training improved speed");render();save();};
  btnStudy.onclick=()=>{state.life.grades+=2;log("Studied");render();save();};
  btnSocial.onclick=()=>{state.life.social+=2;log("Socialized");render();save();};
  btnWork.onclick=()=>{state.life.money+=100;log("Worked part-time");render();save();};
});
