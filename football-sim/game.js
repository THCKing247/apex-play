const SAVE_KEY="gcs_v051";
let state=null;

function log(msg){const l=document.getElementById("log");l.innerHTML=msg+"<br>"+l.innerHTML}

function newGame(){
  state={
    phase:"HS",
    year:1,week:1,
    hs:{completed:false},
    life:{energy:100},
    focus:null
  };
  save();render();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
function load(){const s=localStorage.getItem(SAVE_KEY);if(!s)return false;state=JSON.parse(s);return true}

function render(){
  document.getElementById("careerSub").textContent=`${state.phase} Year ${state.year} Week ${state.week}`;
  document.getElementById("energyText").textContent=`${state.life.energy}/100`;
  document.getElementById("energyBar").style.width=state.life.energy+"%";
}

function cost(n){
  if(state.life.energy<n){log("Not enough energy.");return false}
  state.life.energy-=n;return true
}

function advanceWeek(){
  if(state.phase==="HS" && state.year>4){
    state.hs.completed=true;
    log("High School complete. You must commit to a college.");
    return;
  }
  state.week++;
  state.life.energy=Math.min(100,state.life.energy+30);
  if(state.week>12){state.week=1;state.year++}
  render();save();
}

document.addEventListener("DOMContentLoaded",()=>{
  if(!load())newGame();else render();

  btnNew.onclick=newGame;
  btnWipe.onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload()}

  btnTrain.onclick=()=>{if(cost(20))log("Training complete");render()}
  btnStudy.onclick=()=>{if(cost(15))log("Studied");render()}
  btnSocial.onclick=()=>{if(cost(10))log("Socialized");render()}
  btnWork.onclick=()=>{if(cost(15))log("Worked");render()}
  btnAdvanceWeek.onclick=advanceWeek;
});
