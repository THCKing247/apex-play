const VERSION="v1.0.1";
document.title = "Gridiron Career Sim " + VERSION;

let state={
 money:500,
 xp:0,
 level:1,
 skillPoints:0,
 stats:{power:70,speed:70,accuracy:70},
 inventory:[]
};

function save(){localStorage.setItem("gcs_v101",JSON.stringify(state));}
function load(){let s=localStorage.getItem("gcs_v101");if(s)state=JSON.parse(s);}

function recalc(){
 document.getElementById("money").textContent=state.money;
 document.getElementById("level").textContent=state.level;
 document.getElementById("xp").textContent=state.xp;
 document.getElementById("skillPoints").textContent=state.skillPoints;
 document.getElementById("ovr").textContent=Math.min(99,Math.floor((state.stats.power+state.stats.speed+state.stats.accuracy)/3));
 save();
}

function gainXP(x){
 state.xp+=x;
 if(state.xp>=100){
  state.xp-=100;
  state.level++;
  state.skillPoints+=3;
 }
 recalc();
}

function train(){gainXP(25);}
function rest(){}
function advanceWeek(){state.money+=50;gainXP(10);}

function openSkills(){
 const m=document.getElementById("skillsModal");
 m.innerHTML='<div><h2>Skills</h2>'+Object.keys(state.stats).map(s=>`${s}: ${state.stats[s]} <button onclick="upgrade(\'${s}\')">+</button>`).join("<br>")+'<br><button onclick="closeModals()">Close</button></div>';
 m.classList.remove("hidden");
}

function upgrade(s){
 if(state.skillPoints>0){state.stats[s]++;state.skillPoints--;recalc();openSkills();}
}

const STORE=[
 {id:"cleats",name:"Cleats",price:100,boost:{speed:5}},
 {id:"gloves",name:"Gloves",price:80,boost:{accuracy:5}},
 {id:"drink",name:"Energy Drink",price:20}
];

function openStore(){
 const m=document.getElementById("storeModal");
 m.innerHTML='<div><h2>Store</h2>'+STORE.map(i=>`${i.name} ($${i.price}) <button onclick="buy(\'${i.id}\')">Buy</button>`).join("<br>")+'<br><button onclick="closeModals()">Close</button></div>';
 m.classList.remove("hidden");
}

function buy(id){
 const item=STORE.find(i=>i.id===id);
 if(!item||state.money<item.price)return;
 state.money-=item.price;
 state.inventory.push(item);
 recalc();
}

function openInventory(){
 const m=document.getElementById("inventoryModal");
 m.innerHTML='<div><h2>Inventory</h2>'+state.inventory.map((i,idx)=>`${i.name} <button onclick="equip(${idx})">Equip</button>`).join("<br>")+'<br><button onclick="closeModals()">Close</button></div>';
 m.classList.remove("hidden");
}

function equip(idx){
 const i=state.inventory[idx];
 if(i.boost){Object.keys(i.boost).forEach(k=>state.stats[k]+=i.boost[k]);}
 state.inventory.splice(idx,1);
 recalc();
}

function closeModals(){document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"));}

load();recalc();

window.openStore=openStore;
window.openInventory=openInventory;
window.openSkills=openSkills;
