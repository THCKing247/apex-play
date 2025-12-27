// ===== helpers =====
const qs = (s, el=document)=>el.querySelector(s);
const fmtInt = n => Math.floor(n).toLocaleString();
const escapeHtml = s => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ===== state =====
const VERSION = "v1.1.1";
document.title = "Gridiron Career Sim " + VERSION;

let state = {
  money: 500,
  level: 1,
  xp: 0,
  skillPts: 0,
  skills: { power:70, accuracy:70, speed:70 },
  inventory: [],
  equipped: {}
};

const STORE_ITEMS = [
  {id:'cleats_basic', name:'Basic Cleats', price:150, desc:'+3 Speed', boost:{speed:3}},
  {id:'gloves_basic', name:'Receiver Gloves', price:120, desc:'+3 Accuracy', boost:{accuracy:3}},
  {id:'weights', name:'Weight Kit', price:200, desc:'+3 Power', boost:{power:3}},
];

// Keep a safe fallback in case STORE_ITEMS gets accidentally cleared/overwritten
// during future edits/merges.
const DEFAULT_STORE_ITEMS = JSON.parse(JSON.stringify(STORE_ITEMS));

// ===== persistence =====
function save(){ localStorage.setItem('gcs_v111', JSON.stringify(state)); }
function load(){ const s=localStorage.getItem('gcs_v111'); if(s) state=JSON.parse(s); }

// ===== ui =====
function calcOVR(){
  const v=Object.values(state.skills);
  return Math.min(99, Math.round(v.reduce((a,b)=>a+b,0)/v.length));
}

function render(){
  qs('#money').textContent = fmtInt(state.money);
  qs('#level').textContent = state.level;
  qs('#xp').textContent = state.xp;
  qs('#skillPts').textContent = state.skillPts;
  qs('#ovr').textContent = calcOVR();
  save();
}

function log(msg){
  qs('#log').innerHTML = escapeHtml(msg) + '<br>' + qs('#log').innerHTML;
}

// ===== skills =====
function openSkills(){
  const d = qs('#modal');
  d.innerHTML = `<h3>Skills</h3>
    ${Object.entries(state.skills).map(([k,v])=>
      `<div>${k}: ${v} <button onclick="incSkill('${k}')">+</button></div>`
    ).join('')}
    <button onclick="closeModal()">Close</button>`;
  d.showModal();
}
function incSkill(k){
  if(state.skillPts<=0) return;
  state.skills[k]++;
  state.skillPts--;
  render();
  openSkills();
}

// ===== store =====
function openStore(){
  const d = qs('#modal');
  d.innerHTML = `<h3>Store</h3>
    <div id="storeItems" class="store-grid"></div>
    <button onclick="closeModal()">Close</button>`;
  d.showModal();
  renderStoreItems();
}

function renderStoreItems(){
  const box = qs('#storeItems');
  if(!box) return;

  // If STORE_ITEMS somehow becomes empty/undefined, fall back to defaults.
  const items = (Array.isArray(STORE_ITEMS) && STORE_ITEMS.length)
    ? STORE_ITEMS
    : DEFAULT_STORE_ITEMS;

  box.innerHTML = items.map(it=>`
    <div class="store-item">
      <b>${escapeHtml(it.name)}</b><br>
      ${escapeHtml(it.desc)}<br>
      $${fmtInt(it.price)}
      <br><button onclick="buyItem('${it.id}')">Buy</button>
    </div>
  `).join('');
}

function buyItem(id){
  const items = (Array.isArray(STORE_ITEMS) && STORE_ITEMS.length)
    ? STORE_ITEMS
    : DEFAULT_STORE_ITEMS;
  const it = items.find(i=>i.id===id);
  if(!it || state.money < it.price) return;
  state.money -= it.price;
  state.inventory.push(it);
  log(`Purchased ${it.name}`);
  render();
}

// ===== inventory =====
function openInventory(){
  const d = qs('#modal');
  d.innerHTML = `<h3>Inventory</h3>
    ${state.inventory.length===0 ? 'No items.' :
      state.inventory.map((it,i)=>`
        <div>
          ${escapeHtml(it.name)}
          <button onclick="equipItem(${i})">Equip</button>
        </div>`).join('')
    }
    <button onclick="closeModal()">Close</button>`;
  d.showModal();
}

function equipItem(idx){
  const it = state.inventory[idx];
  if(!it || !it.boost) return;
  Object.entries(it.boost).forEach(([k,v])=>state.skills[k]+=v);
  state.inventory.splice(idx,1);
  log(`Equipped ${it.name}`);
  render();
  openInventory();
}

// ===== misc =====
function closeModal(){ qs('#modal').close(); }
function resetSave(){ localStorage.removeItem('gcs_v111'); location.reload(); }
function exportSave(){ navigator.clipboard.writeText(JSON.stringify(state)); alert('Save copied'); }
function importSave(){
  const t = prompt('Paste save data:');
  if(!t) return;
  try{ state=JSON.parse(t); save(); render(); }
  catch{ alert('Invalid save'); }
}

// ===== init =====
load();
render();

window.openStore = openStore;
window.openInventory = openInventory;
window.openSkills = openSkills;
window.renderStoreItems = renderStoreItems;
window.STORE_ITEMS = STORE_ITEMS;
