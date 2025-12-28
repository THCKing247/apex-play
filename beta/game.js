/* Gridiron Career Sim — v1.3.3 */
(() => {
  'use strict';

  function escapeHtml(str){
    return String(str ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }


  const VERSION = 'v1.3.3';

  const LS_KEY = 'gcs_save_v133';

  const MAX_ENERGY = 100;
  const WEEK_HOURS = 25;

  const XP_BASE = 300;

  const POSITIONS = ['QB','RB','WR','TE','LB','CB','S','DL'];
  const STYLES_BY_POS = {
  QB: [
    { id:"Pocket",      name:"Pocket",      desc:"Safer, accurate passer / steady performer.", mods:{ throwPower:+1, accuracy:+2, speed:-1, stamina:+0, strength:+0 } },
    { id:"Scrambler",   name:"Scrambler",   desc:"More speed and improvisation.",               mods:{ throwPower:+0, accuracy:+0, speed:+3, stamina:+1, strength:+0 } },
    { id:"Gunslinger",  name:"Gunslinger",  desc:"Bigger plays, a bit riskier.",               mods:{ throwPower:+3, accuracy:-1, speed:+0, stamina:+0, strength:+0 } },
    { id:"Balanced",    name:"Balanced",    desc:"Even distribution.",                         mods:{ throwPower:+1, accuracy:+1, speed:+1, stamina:+1, strength:+0 } },
  ],
  RB: [
    { id:"Power Back",  name:"Power Back",  desc:"Runs through contact.",                      mods:{ speed:+0, stamina:+2, strength:+3, throwPower:+0, accuracy:+0 } },
    { id:"Elusive",     name:"Elusive",     desc:"Quick cuts and jukes.",                      mods:{ speed:+3, stamina:+1, strength:+0, throwPower:+0, accuracy:+0 } },
    { id:"Receiving",   name:"Receiving",   desc:"Great hands & routes out of the backfield.", mods:{ speed:+1, stamina:+1, strength:+0, throwPower:+0, accuracy:+2 } },
    { id:"Balanced",    name:"Balanced",    desc:"A bit of everything.",                       mods:{ speed:+2, stamina:+1, strength:+1, throwPower:+0, accuracy:+0 } },
  ],
  WR: [
    { id:"Route Runner",name:"Route Runner",desc:"Crisp routes and reliable hands.",           mods:{ speed:+2, stamina:+1, strength:+0, throwPower:+0, accuracy:+2 } },
    { id:"Deep Threat", name:"Deep Threat", desc:"Burns defenders over the top.",              mods:{ speed:+4, stamina:+0, strength:+0, throwPower:+0, accuracy:+0 } },
    { id:"Slot",        name:"Slot",        desc:"Quick separation underneath.",               mods:{ speed:+3, stamina:+1, strength:-1, throwPower:+0, accuracy:+1 } },
    { id:"YAC",         name:"YAC",         desc:"Turns short catches into big gains.",        mods:{ speed:+2, stamina:+2, strength:+0, throwPower:+0, accuracy:+0 } },
  ],
  TE: [
    { id:"Blocking",    name:"Blocking",    desc:"Extra strength at the line.",                mods:{ speed:-1, stamina:+1, strength:+4, throwPower:+0, accuracy:+0 } },
    { id:"Receiving",   name:"Receiving",   desc:"Mismatch in the middle.",                    mods:{ speed:+1, stamina:+2, strength:+1, throwPower:+0, accuracy:+2 } },
    { id:"Red Zone",    name:"Red Zone",    desc:"Big body, tough catches.",                   mods:{ speed:+0, stamina:+1, strength:+3, throwPower:+0, accuracy:+1 } },
    { id:"Balanced",    name:"Balanced",    desc:"Reliable all-around tight end.",            mods:{ speed:+1, stamina:+1, strength:+2, throwPower:+0, accuracy:+1 } },
  ],
  LB: [
    { id:"Run Stopper", name:"Run Stopper", desc:"Fills gaps and hits hard.",                  mods:{ speed:+0, stamina:+2, strength:+4, throwPower:+0, accuracy:+0 } },
    { id:"Coverage",    name:"Coverage",    desc:"Better in space and zones.",                 mods:{ speed:+2, stamina:+2, strength:+0, throwPower:+0, accuracy:+2 } },
    { id:"Blitzer",     name:"Blitzer",     desc:"Gets after the QB.",                         mods:{ speed:+1, stamina:+1, strength:+3, throwPower:+0, accuracy:+0 } },
    { id:"Balanced",    name:"Balanced",    desc:"Solid at everything.",                       mods:{ speed:+1, stamina:+2, strength:+2, throwPower:+0, accuracy:+1 } },
  ],
  CB: [
    { id:"Man Cover",   name:"Man Cover",   desc:"Sticks tight in man coverage.",              mods:{ speed:+3, stamina:+1, strength:-1, throwPower:+0, accuracy:+2 } },
    { id:"Zone Cover",  name:"Zone Cover",  desc:"Reads routes and breaks on the ball.",       mods:{ speed:+2, stamina:+2, strength:-1, throwPower:+0, accuracy:+2 } },
    { id:"Ball Hawk",   name:"Ball Hawk",   desc:"Hunts interceptions.",                       mods:{ speed:+2, stamina:+1, strength:-1, throwPower:+0, accuracy:+3 } },
    { id:"Balanced",    name:"Balanced",    desc:"Reliable all-around corner.",               mods:{ speed:+2, stamina:+1, strength:+0, throwPower:+0, accuracy:+1 } },
  ],
  S: [
    { id:"Free Safety", name:"Free Safety", desc:"Deep coverage and ball skills.",            mods:{ speed:+2, stamina:+2, strength:-1, throwPower:+0, accuracy:+3 } },
    { id:"Strong Safety",name:"Strong Safety",desc:"Hard hitter, supports the run.",          mods:{ speed:+1, stamina:+2, strength:+2, throwPower:+0, accuracy:+1 } },
    { id:"Ball Hawk",   name:"Ball Hawk",   desc:"Hunts interceptions.",                       mods:{ speed:+2, stamina:+1, strength:-1, throwPower:+0, accuracy:+3 } },
    { id:"Balanced",    name:"Balanced",    desc:"Reliable all-around safety.",               mods:{ speed:+2, stamina:+2, strength:+0, throwPower:+0, accuracy:+2 } },
  ],
  DL: [
    { id:"Pass Rusher", name:"Pass Rusher", desc:"Gets after the quarterback.",               mods:{ speed:+1, stamina:+1, strength:+3, throwPower:+0, accuracy:+0 } },
    { id:"Run Stopper", name:"Run Stopper", desc:"Plugs gaps and stops the run.",             mods:{ speed:-1, stamina:+2, strength:+4, throwPower:+0, accuracy:+0 } },
    { id:"Versatile",   name:"Versatile",   desc:"Balanced pass rush and run defense.",        mods:{ speed:+0, stamina:+2, strength:+3, throwPower:+0, accuracy:+0 } },
    { id:"Balanced",    name:"Balanced",    desc:"Reliable all-around defensive lineman.",    mods:{ speed:+0, stamina:+1, strength:+2, throwPower:+0, accuracy:+0 } },
  ]
};

function getStylesForPosition(pos){
  return STYLES_BY_POS[pos] || STYLES_BY_POS.QB;
}

  const JOBS = [
    { id:'none', name:'No Job', hours:0, pay:0, desc:'Focus entirely on football.' },
    { id:'dogwalker', name:'Dog Walker', hours:4, pay:90, desc:'Walk neighborhood dogs after school.' },
    { id:'grocery', name:'Grocery Clerk', hours:6, pay:120, desc:'Stock shelves and bag groceries.' },
    { id:'tutor', name:'Math Tutor', hours:7, pay:200, desc:'Help classmates with math homework.' },
    { id:'lifeguard', name:'Lifeguard', hours:8, pay:180, desc:'Keep the pool safe on weekends.' },
  ];

  // Equipment: can be equipped (one per slot)
  // Consumable: can be used from inventory (applies immediate effect, then removed)
  const STORE_ITEMS = [
    { id:'protein_snack', name:'Protein Snack', type:'consumable', price:25, effects:{ energy:+20 }, desc:'+20 energy.' },
    { id:'energy_drink', name:'Energy Drink', type:'consumable', price:40, effects:{ energy:+35 }, desc:'+35 energy.' },
    { id:'meal_prep', name:'Meal Prep Kit', type:'consumable', price:60, effects:{ energy:+55 }, desc:'+55 energy.' },
    { id:'planner', name:'Study Planner', type:'consumable', price:35, effects:{ hours:+3 }, desc:'+3 weekly hours (this week only).' },

    { id:'cleats', name:'Speed Cleats', type:'equipment', slot:'shoes', price:175, effects:{ speed:+2 }, desc:'+2 Speed (equipped).' },
    { id:'gloves', name:'Grip Gloves', type:'equipment', slot:'gloves', price:165, effects:{ accuracy:+2 }, desc:'+2 Accuracy (equipped).' },
    { id:'arm_sleeve', name:'QB Arm Sleeve', type:'equipment', slot:'accessory', price:210, effects:{ throwPower:+2 }, desc:'+2 Throw Power (equipped).' },
    { id:'wristband', name:'Playcall Wristband', type:'equipment', slot:'accessory', price:190, effects:{ accuracy:+1, stamina:+1 }, desc:'+1 Accuracy, +1 Stamina (equipped).' },
    { id:'weight_vest', name:'Training Weight Vest', type:'equipment', slot:'training', price:240, effects:{ strength:+2, stamina:+1 }, desc:'+2 Strength, +1 Stamina (equipped).' },
    { id:'compression', name:'Recovery Compression', type:'equipment', slot:'recovery', price:220, effects:{ stamina:+2 }, desc:'+2 Stamina (equipped).' },
  ];

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function rint(n){ return Math.round(n); }
  function fmtMoney(n){ return '$' + n.toLocaleString(); }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function toast(msg){ alert(msg); }
  function loadState(){ return load(); }
  function saveState(s){ save(s); }

  function basePlayerFromArchetype(position, styleId){
  const pos = (position || "QB").toUpperCase();

  const baseByPos = {
    QB: { throwPower:70, accuracy:70, speed:60, stamina:65, strength:60 },
    RB: { throwPower:40, accuracy:55, speed:70, stamina:70, strength:65 },
    WR: { throwPower:40, accuracy:65, speed:72, stamina:68, strength:55 },
    TE: { throwPower:40, accuracy:60, speed:62, stamina:70, strength:72 },
    LB: { throwPower:40, accuracy:55, speed:62, stamina:72, strength:75 },
    CB: { throwPower:40, accuracy:65, speed:74, stamina:66, strength:52 },
    S:  { throwPower:40, accuracy:65, speed:72, stamina:70, strength:58 },
    DL: { throwPower:40, accuracy:50, speed:58, stamina:70, strength:78 },
  };

  const base = { ...(baseByPos[pos] || baseByPos.QB) };

  // Apply style mods (small boosts)
  const style = (getStylesForPosition(pos) || []).find(x => x.id === styleId) || getStylesForPosition(pos)[0];
  const mods = style?.mods || {};
  for(const k of ["throwPower","accuracy","speed","stamina","strength"]){
    base[k] = clamp((base[k]||60) + (mods[k]||0), 40, 99);
  }

  return {
    name: "Player",
    position: pos,
    archetype: style?.id || styleId || "Balanced",
    highSchool: "High School",
    throwPower: base.throwPower,
    accuracy: base.accuracy,
    speed: base.speed,
    stamina: base.stamina,
    strength: base.strength,
  };
}


  function calcOVR(stats){
    const keys = ['throwPower','accuracy','speed','strength','stamina'];
    const avg = keys.reduce((a,k)=>a+stats[k],0)/keys.length;
    return clamp(rint(avg), 50, 99);
  }

  function xpNeeded(level){
    return rint(XP_BASE * Math.pow(1.12, level-1));
  }

  function defaultState(){
    return {
      version: VERSION,
      createdAt: Date.now(),
      player: null, // set after creation
      statsBase: null,
      level: 1,
      xp: 0,
      skillPoints: 0,
      money: 250,
      energy: 100,
      hours: WEEK_HOURS,
      prep: 0, // study prep this week
      career: {
        year: 1,
        week: 1,
        maxWeeks: 12,
        recordW: 0,
        recordL: 0,
        inPost: false,
        postWeek: 0, // 1..3 when in postseason
        jobId: 'none',
      },
      gameStats: {
        gamesPlayed: 0,
        // Career totals
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        completions: 0,
        attempts: 0,
        rushingYards: 0,
        rushingTDs: 0,
        carries: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTDs: 0,
        tackles: 0,
        sacks: 0,
        defInterceptions: 0,
        forcedFumbles: 0,
        fumbleRecoveries: 0,
        defTDs: 0,
        // Per-game tracking
        gameLog: [],
        // Per-season tracking
        seasonStats: {},
      },
      inventory: {
        owned: [], // array of item ids (including duplicates for consumables)
        equipped: { shoes:null, gloves:null, accessory:null, training:null, recovery:null }
      },
      log: []
    };
  }

  function load(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return defaultState();
      const s = JSON.parse(raw);
      // migrate minimal
      if(!s.version) s.version = VERSION;
      if(!s.inventory) s.inventory = defaultState().inventory;
      if(!s.career) s.career = defaultState().career;
      if(!s.log) s.log = [];
      if(!s.gameStats) s.gameStats = defaultState().gameStats;
      if(s.gameStats && !s.gameStats.gameLog) s.gameStats.gameLog = [];
      if(s.gameStats && !s.gameStats.seasonStats) s.gameStats.seasonStats = {};
      return s;
    }catch(e){
      console.warn('load failed', e);
      return defaultState();
    }
  }
  function save(s){
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }

  function logPush(s, title, msg){
    s.log.unshift({
      t: Date.now(),
      title,
      msg
    });
    s.log = s.log.slice(0, 200);
  }

  function openModal({title, bodyHTML, footHTML, onClose}){
    const dlg = $('#modal');
    $('#modalTitle').textContent = title || 'Modal';
    $('#modalBody').innerHTML = bodyHTML || '';
    $('#modalFoot').innerHTML = footHTML || '';
    const close = () => {
      if(dlg.open) dlg.close();
      if(typeof onClose === 'function') onClose();
    };
    $('#modalClose').onclick = close;
    dlg.oncancel = (e) => { e.preventDefault(); close(); };
    dlg.showModal();
    // click outside to close
    dlg.addEventListener('click', (ev) => {
      const r = dlg.getBoundingClientRect();
      const inBox = (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom);
      // dialog's rect is the whole element; need inner
      const inner = $('.modal-inner', dlg);
      if(inner && !inner.contains(ev.target)) close();
    }, { once:true });
  }

  // Backwards-compatible helper used by earlier UI code.
  // Some flows (e.g., character creator) call setModal(title, bodyHTML, footHTML).
  function setModal(title, bodyHTML, footHTML, onClose){
    openModal({
      title: title || 'Modal',
      bodyHTML: bodyHTML || '',
      footHTML: footHTML || '',
      onClose
    });
  }

  // Some UI buttons/flows call closeModal() directly (inline onclick handlers).
  // A previous refactor removed this helper which caused "closeModal is not defined".
  function closeModal(){
    const dlg = $('#modal');
    if(dlg && dlg.open){
      try { dlg.close(); } catch(e) { /* ignore */ }
    }
  }

  function derivedStats(s){
    if(!s.statsBase) return {};
    const base = {...s.statsBase};
    // apply equipped bonuses
    const eq = s.inventory?.equipped || {};
    for(const slot of Object.keys(eq)){
      const id = eq[slot];
      if(!id) continue;
      const item = STORE_ITEMS.find(it=>it.id===id);
      if(!item) continue;
      if(item.effects){
        for(const [k,v] of Object.entries(item.effects)){
          if(typeof base[k] === 'number') base[k] += v;
        }
      }
    }
    for(const k of Object.keys(base)) base[k] = clamp(base[k], 40, 99);
    return base;
  }

  function canAfford(s, price){ return s.money >= price; }

  function addOwned(s, itemId){
    s.inventory.owned.push(itemId);
  }

  function removeOneOwned(s, itemId){
    const idx = s.inventory.owned.indexOf(itemId);
    if(idx>=0) s.inventory.owned.splice(idx,1);
  }

  function useConsumable(s, itemId){
    const item = STORE_ITEMS.find(it=>it.id===itemId);
    if(!item || item.type!=='consumable') return;
    if(!s.inventory.owned.includes(itemId)) return;
    const eff = item.effects || {};
    if(typeof eff.energy === 'number') s.energy = clamp(s.energy + eff.energy, 0, MAX_ENERGY);
    if(typeof eff.hours === 'number') s.hours = clamp(s.hours + eff.hours, 0, WEEK_HOURS);
    removeOneOwned(s, itemId);
    logPush(s, 'Used Item', `Used ${item.name}.`);
  }

  function handlePositionChange(newPos){
    if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
    window.__draftPlayer.position = newPos;
    const styles = getStylesForPosition(newPos);
    if(styles && styles.length > 0){
      window.__draftPlayer.style = styles[0].id;
    }
    openCreatePlayer(loadState());
  }

  function handleStyleChange(newStyle){
    if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
    window.__draftPlayer.style = newStyle;
    // Update visual selection
    document.querySelectorAll('.radioCard').forEach(card => {
      card.classList.remove('selected');
      const input = card.querySelector('input[type="radio"]');
      if(input && input.value === newStyle){
        card.classList.add('selected');
        input.checked = true;
      }
    });
  }

  function openCreatePlayer(s){
  // Persist draft across re-renders while the modal is open
  const st = s || loadState();
  window.__draftPlayer = window.__draftPlayer || {
    name: "",
    position: "QB",
    highSchool: "",
    style: "Pocket",
    height: "",
    weight: "",
    hometown: "",
    jerseyNumber: ""
  };
  const d = window.__draftPlayer;

  const positions = Object.keys(STYLES_BY_POS);
  // include older positions list if present
  const allPos = Array.from(new Set([...(Array.isArray(POSITIONS)?POSITIONS:[]), ...positions]));
  const posOptions = allPos.map(p => `<option value="${escapeHtml(p)}" ${d.position===p?"selected":""}>${escapeHtml(p)}</option>`).join("");

  const styles = getStylesForPosition(d.position);
  if(!styles.some(x=>x.id===d.style)) d.style = styles[0].id;

  const styleCards = styles.map(sty => {
    const sel = d.style===sty.id;
    const mods = sty.mods || {};
    const modLine = (k,label)=> (mods[k]||0)!==0 ? `<span class="chip ${mods[k]>0?"good":"bad"}">${label} ${mods[k]>0?"+":""}${mods[k]}</span>` : "";
    return `
      <label class="radioCard ${sel?"selected":""}">
        <input type="radio" name="pstyle" value="${escapeHtml(sty.id)}" ${sel?"checked":""}
          onchange="handleStyleChange(this.value)">
        <div class="radioCardMain">
          <div class="radioCardTop">
            <div class="radioTitle">${escapeHtml(sty.name)}</div>
            <div class="radioDot" aria-hidden="true"></div>
          </div>
          <div class="radioDesc">${escapeHtml(sty.desc||"")}</div>
          <div class="radioMods">
            ${modLine("throwPower","Throw")}
            ${modLine("accuracy","Acc")}
            ${modLine("speed","Spd")}
            ${modLine("stamina","Stam")}
            ${modLine("strength","Str")}
          </div>
        </div>
      </label>
    `;
  }).join("");

  const body = `
    <div class="muted small">Enter your player details to start a 4-year high school career (12 regular season games + up to 3 postseason games).</div>

    <div class="form">
      <div class="field">
        <label>Player Name</label>
        <div class="row">
          <input id="cp_name" value="${escapeHtml(d.name)}" placeholder="e.g., Kenny King" oninput="window.__draftPlayer.name=this.value">
          <button class="btn ghost" type="button" onclick="randomizeName()">Random</button>
        </div>
      </div>

      <div class="field two">
        <div>
          <label>Position</label>
          <select id="cp_pos" onchange="handlePositionChange(this.value)">
            ${posOptions}
          </select>
        </div>
        <div>
          <label>High School</label>
          <div class="row">
            <input id="cp_school" value="${escapeHtml(d.highSchool)}" placeholder="e.g., Lake Wales HS" oninput="window.__draftPlayer.highSchool=this.value">
            <button class="btn ghost" type="button" onclick="randomizeSchool()">Random</button>
          </div>
        </div>
      </div>

      <div class="field two">
        <div>
          <label>Height</label>
          <div class="row">
            <input id="cp_height" type="text" value="${escapeHtml(d.height || "")}" placeholder="e.g., 6'2&quot;" oninput="window.__draftPlayer.height=this.value">
            <button class="btn ghost" type="button" onclick="randomizeHeight()">Random</button>
          </div>
        </div>
        <div>
          <label>Weight</label>
          <div class="row">
            <input id="cp_weight" type="text" value="${escapeHtml(d.weight || "")}" placeholder="e.g., 215 lbs" oninput="window.__draftPlayer.weight=this.value">
            <button class="btn ghost" type="button" onclick="randomizeWeight()">Random</button>
          </div>
        </div>
      </div>

      <div class="field two">
        <div>
          <label>Hometown</label>
          <div class="row">
            <input id="cp_hometown" type="text" value="${escapeHtml(d.hometown || "")}" placeholder="e.g., Miami, FL" oninput="window.__draftPlayer.hometown=this.value">
            <button class="btn ghost" type="button" onclick="randomizeHometown()">Random</button>
          </div>
        </div>
        <div>
          <label>Jersey Number</label>
          <input id="cp_jersey" type="number" min="1" max="99" value="${escapeHtml(d.jerseyNumber || "")}" placeholder="e.g., 7" oninput="window.__draftPlayer.jerseyNumber=this.value">
        </div>
      </div>

      <div class="field">
        <label>Play Style</label>
        <div class="radioGrid">
          ${styleCards}
        </div>
      </div>

      <div class="muted tiny">Tip: You can change jobs later. Your style adds small starting stat bonuses.</div>
    </div>
  `;

  setModal('Create Your Player', body, `
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="startCareerFromCreator()">Start Career</button>
  `);
}

  function randomizeName(){
    try {
      const first = ["Kenny","Jayden","Marcus","Darius","Eli","Noah","Ty","Chris","Jordan","Malik","Cameron","Drew","Logan","Zeke","Mason"];
      const last  = ["King","Johnson","Carter","Harris","Walker","Reed","Bennett","Collins","Moore","Brooks","Sanders","Foster","Allen","Graham","Turner"];
      if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
      window.__draftPlayer.name = `${pick(first)} ${pick(last)}`;
      const el = document.getElementById("cp_name");
      if(el) {
        el.value = window.__draftPlayer.name;
        // Trigger input event to ensure the value is properly set
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch(e) {
      console.error('randomizeName error:', e);
    }
  }
  function randomizeSchool(){
    try {
      const cities = ["Lake Wales","Tampa","Orlando","Miami","Jacksonville","Sarasota","Lakeland","Gainesville","Tallahassee","Pensacola"];
      const mascots = ["High","Prep","Central","North","South","East","West","Academy"];
      if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
      window.__draftPlayer.highSchool = `${pick(cities)} ${pick(mascots)} HS`;
      const el = document.getElementById("cp_school");
      if(el) {
        el.value = window.__draftPlayer.highSchool;
        // Trigger input event to ensure the value is properly set
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch(e) {
      console.error('randomizeSchool error:', e);
    }
  }

  function randomizeHeight(){
    try {
      const feet = [5, 6];
      const inches = Array.from({length: 12}, (_, i) => i);
      const f = pick(feet);
      const i = pick(inches);
      if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
      window.__draftPlayer.height = `${f}'${i}"`;
      const el = document.getElementById("cp_height");
      if(el) {
        el.value = window.__draftPlayer.height;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch(e) {
      console.error('randomizeHeight error:', e);
    }
  }

  function randomizeWeight(){
    try {
      const weights = [180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280];
      if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
      window.__draftPlayer.weight = `${pick(weights)} lbs`;
      const el = document.getElementById("cp_weight");
      if(el) {
        el.value = window.__draftPlayer.weight;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch(e) {
      console.error('randomizeWeight error:', e);
    }
  }

  function randomizeHometown(){
    try {
      const cities = ["Miami", "Tampa", "Orlando", "Jacksonville", "Tallahassee", "Gainesville", "Fort Lauderdale", "Pensacola", "Sarasota", "Lakeland", "West Palm Beach", "Clearwater", "St. Petersburg", "Hialeah", "Port St. Lucie"];
      const states = ["FL", "GA", "AL", "SC", "NC", "TN"];
      if(!window.__draftPlayer) window.__draftPlayer = { name: "", position: "QB", highSchool: "", style: "Pocket", height: "", weight: "", hometown: "", jerseyNumber: "" };
      window.__draftPlayer.hometown = `${pick(cities)}, ${pick(states)}`;
      const el = document.getElementById("cp_hometown");
      if(el) {
        el.value = window.__draftPlayer.hometown;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch(e) {
      console.error('randomizeHometown error:', e);
    }
  }

  // Expose randomizer functions immediately after definition
  window.randomizeName = randomizeName;
  window.randomizeSchool = randomizeSchool;
  window.randomizeHeight = randomizeHeight;
  window.randomizeWeight = randomizeWeight;
  window.randomizeHometown = randomizeHometown;
function startCareerFromCreator(){
  const d = window.__draftPlayer || {};
  const name = (d.name||"").trim();
  const hs = (d.highSchool||"").trim();
  if(!name){ toast("Please enter a player name."); return; }
  if(!hs){ toast("Please enter a high school name."); return; }
  const pos = d.position || "QB";
  const style = d.style || getStylesForPosition(pos)[0].id;

  const st = loadState();
  st.player = basePlayerFromArchetype(pos, style);
  st.player.name = name;
  st.player.position = pos;
  st.player.archetype = style;
  st.player.highSchool = hs;
  st.player.height = (d.height || "").trim() || "6'0\"";
  st.player.weight = (d.weight || "").trim() || "200 lbs";
  st.player.hometown = (d.hometown || "").trim() || "Unknown";
  st.player.jerseyNumber = (d.jerseyNumber || "").trim() || "00";

  // Career reset
  st.career = { year:1, week:1, maxWeeks:12, recordW:0, recordL:0, inPost:false, postWeek:0, jobId:'none' };
  st.money = 250;
  st.xp = 0;
  st.level = 1;
  st.skillPoints = 0;
  st.energy = 100;
  st.hours = 25;
  st.prep = 0;
  st.inventory = st.inventory || { owned:[], equipped:{ shoes:null, gloves:null, accessory:null, training:null, recovery:null } };
  st.gameStats = defaultState().gameStats;
  st.statsBase = {
    throwPower: st.player.throwPower,
    accuracy: st.player.accuracy,
    speed: st.player.speed,
    stamina: st.player.stamina,
    strength: st.player.strength
  };

  st.log = [];
  logPush(st, "Career Started", `${name} begins at ${hs} as a ${pos} (${style}).`);
  saveState(st);
  closeModal();
  render(st);
}


  function doAction(s, kind, hours){
    hours = Number(hours)||1;
    if(!s.player) return;
    if(s.hours < hours){
      logPush(s, 'Not enough hours', `You only have ${s.hours} hour(s) left this week.`);
      return;
    }
    const costs = {
      train: { e:-12, xp:+28, prep:0 },
      rest:  { e:+18, xp:+6,  prep:0 },
      study: { e:-8,  xp:+18, prep:+10 },
    };
    const c = costs[kind];
    if(!c) return;

    const totalE = c.e * hours;
    if(totalE < 0 && s.energy < Math.abs(totalE)){
      logPush(s, 'Too tired', `You need more energy for that. Try resting or buying energy items.`);
      return;
    }

    s.hours = clamp(s.hours - hours, 0, WEEK_HOURS);
    s.energy = clamp(s.energy + totalE, 0, MAX_ENERGY);
    const gainedXP = rint(c.xp * hours);
    s.xp += gainedXP;
    if(c.prep) s.prep += rint(c.prep * hours);

    logPush(s, kind==='train'?'Training':'Action', `${kind==='train'?'Trained':kind==='rest'?'Rested':'Studied'} ${hours}h. ${totalE>=0?'+':''}${totalE} energy, +${gainedXP} XP${c.prep?`, +${rint(c.prep*hours)} prep`:''}.`);
    handleLevelUp(s);
    save(s);
    render(s);
  }

  function handleLevelUp(s){
    let needed = xpNeeded(s.level);
    while(s.xp >= needed){
      s.xp -= needed;
      s.level += 1;
      s.skillPoints += 3;
      // tiny base growth per level
      for(const k of Object.keys(s.statsBase)){
        s.statsBase[k] = clamp(s.statsBase[k] + 1, 40, 99);
      }
      logPush(s, 'Level Up', `You reached Level ${s.level}! +3 skill points.`);
      needed = xpNeeded(s.level);
    }
  }

  function weeklyJobApply(s){
    const job = JOBS.find(j=>j.id===s.career.jobId) || JOBS[0];
    if(job.id === 'none') return;
    // If you have hours, deduct; otherwise, still pay but lose energy a bit (overworked)
    s.money += job.pay;
    const before = s.hours;
    s.hours = clamp(s.hours - job.hours, 0, WEEK_HOURS);
    if(before < job.hours){
      s.energy = clamp(s.energy - 10, 0, MAX_ENERGY);
      logPush(s, 'Payday', `Job: ${job.name}. Earned ${fmtMoney(job.pay)}. You were short on hours and got overworked (-10 energy).`);
    } else {
      logPush(s, 'Payday', `Job: ${job.name}. Earned ${fmtMoney(job.pay)}. Job hours auto-used: ${job.hours}h.`);
    }
  }

  function startNewWeek(s){
    // partial energy recharge each week
    const gain = rint(10 + s.level * 0.5);
    s.energy = clamp(s.energy + gain, 0, MAX_ENERGY);
    s.hours = WEEK_HOURS;
    s.prep = 0;
    logPush(s, 'New Week', `Energy partially recharged (+${gain}). Weekly hours reset (${WEEK_HOURS}h).`);
    weeklyJobApply(s);
  }

  function simulateGame(s){
    const stats = derivedStats(s);
    const ovr = calcOVR(stats);
    // Opponent revealed only on game week UI; internally we generate now
    const opp = clamp(rint(ovr + (Math.random()*18 - 9)), 55, 99);

    // performance factors
    const prepBonus = clamp(s.prep, 0, 60) / 100; // up to +0.6
    const energyFactor = (0.6 + (s.energy/MAX_ENERGY)*0.4); // 0.6..1.0
    const base = (ovr - opp) / 28; // -1..1ish
    const style = s.player.archetype;
    let variance = 0.10;
    if(style === 'Gunslinger') variance = 0.16;
    if(style === 'Pocket') variance = 0.08;

    const winP = clamp(0.48 + base*0.22 + prepBonus*0.10, 0.12, 0.88);
    const didWin = Math.random() < winP;

    // produce a scoreline
    const offense = (ovr*energyFactor) + (prepBonus*12) + (Math.random()*12 - 6);
    const defense = (opp*0.95) + (Math.random()*10 - 5);
    let ptsFor = clamp(rint(offense - defense + 24), 7, 56);
    let ptsAg  = clamp(rint((opp - ovr)*0.5 + 21 + (Math.random()*10 - 5)), 3, 52);
    if(didWin && ptsFor <= ptsAg) ptsFor = ptsAg + rint(3 + Math.random()*10);
    if(!didWin && ptsFor >= ptsAg) ptsAg = ptsFor + rint(3 + Math.random()*10);

    // Generate game stats based on position and performance
    const pos = s.player.position;
    const perfFactor = energyFactor * (1 + prepBonus * 0.3);
    const gs = s.gameStats || { gamesPlayed: 0, passingYards: 0, passingTDs: 0, interceptions: 0, completions: 0, attempts: 0, rushingYards: 0, rushingTDs: 0, carries: 0, receptions: 0, receivingYards: 0, receivingTDs: 0, tackles: 0, sacks: 0, defInterceptions: 0, forcedFumbles: 0, fumbleRecoveries: 0, defTDs: 0, gameLog: [], seasonStats: {} };
    
    // Initialize current game stats
    const gameStats = {
      week: s.career.week,
      year: s.career.year,
      opponent: opp,
      win: didWin,
      scoreFor: ptsFor,
      scoreAgainst: ptsAg,
      passingYards: 0, passingTDs: 0, interceptions: 0, completions: 0, attempts: 0,
      rushingYards: 0, rushingTDs: 0, carries: 0,
      receptions: 0, receivingYards: 0, receivingTDs: 0,
      tackles: 0, sacks: 0, defInterceptions: 0, forcedFumbles: 0, fumbleRecoveries: 0, defTDs: 0,
    };
    
    gs.gamesPlayed += 1;
    
    if(pos === 'QB'){
      const att = rint(20 + stats.throwPower * 0.3 + Math.random() * 15);
      const compRate = clamp(stats.accuracy / 100 + (perfFactor - 1) * 0.1, 0.45, 0.85);
      const comp = rint(att * compRate);
      const yards = rint(comp * (8 + stats.throwPower * 0.15 + Math.random() * 8));
      const tds = rint(comp * 0.12 + Math.random() * 2);
      const ints = rint((att - comp) * 0.08 + Math.random() * 1.5);
      const rushYds = rint(stats.speed * 0.5 + Math.random() * 30);
      const rushTDs = Math.random() < 0.15 ? 1 : 0;
      
      gameStats.attempts = att;
      gameStats.completions = comp;
      gameStats.passingYards = yards;
      gameStats.passingTDs = tds;
      gameStats.interceptions = ints;
      gameStats.carries = rint(3 + Math.random() * 5);
      gameStats.rushingYards = rushYds;
      gameStats.rushingTDs = rushTDs;
      
      gs.attempts += att;
      gs.completions += comp;
      gs.passingYards += yards;
      gs.passingTDs += tds;
      gs.interceptions += ints;
      gs.carries += gameStats.carries;
      gs.rushingYards += rushYds;
      gs.rushingTDs += rushTDs;
    } else if(pos === 'RB'){
      const carries = rint(15 + stats.stamina * 0.2 + Math.random() * 10);
      const ypc = 3 + stats.speed * 0.08 + stats.strength * 0.05 + (perfFactor - 1) * 2;
      const yards = rint(carries * ypc + Math.random() * 50);
      const tds = rint(carries * 0.08 + Math.random() * 1.5);
      const rec = rint(2 + stats.accuracy * 0.05 + Math.random() * 4);
      const recYds = rint(rec * (5 + stats.speed * 0.1 + Math.random() * 5));
      const recTDs = Math.random() < 0.1 ? 1 : 0;
      
      gameStats.carries = carries;
      gameStats.rushingYards = yards;
      gameStats.rushingTDs = tds;
      gameStats.receptions = rec;
      gameStats.receivingYards = recYds;
      gameStats.receivingTDs = recTDs;
      
      gs.carries += carries;
      gs.rushingYards += yards;
      gs.rushingTDs += tds;
      gs.receptions += rec;
      gs.receivingYards += recYds;
      gs.receivingTDs += recTDs;
    } else if(pos === 'WR' || pos === 'TE'){
      const targets = rint(6 + stats.accuracy * 0.15 + Math.random() * 6);
      const catchRate = clamp(stats.accuracy / 100 + (perfFactor - 1) * 0.15, 0.5, 0.9);
      const rec = rint(targets * catchRate);
      const ypr = 8 + stats.speed * 0.2 + Math.random() * 8;
      const yards = rint(rec * ypr);
      const tds = rint(rec * 0.15 + Math.random() * 1.5);
      const rushYds = pos === 'WR' ? rint(Math.random() * 20) : 0;
      
      gameStats.receptions = rec;
      gameStats.receivingYards = yards;
      gameStats.receivingTDs = tds;
      if(rushYds > 0) {
        gameStats.carries = rint(1 + Math.random() * 2);
        gameStats.rushingYards = rushYds;
      }
      
      gs.receptions += rec;
      gs.receivingYards += yards;
      gs.receivingTDs += tds;
      if(rushYds > 0) {
        gs.carries += gameStats.carries;
        gs.rushingYards += rushYds;
      }
    } else {
      // Defense positions (LB, CB, S, DL)
      const baseTackles = pos === 'DL' ? 4 : pos === 'LB' ? 8 : 3;
      const tackles = rint(baseTackles + stats.strength * 0.1 + stats.stamina * 0.1 + Math.random() * 4);
      const sacks = pos === 'DL' || pos === 'LB' ? (Math.random() < 0.4 ? rint(1 + Math.random() * 1.5) : 0) : 0;
      const ints = (pos === 'CB' || pos === 'S') ? (Math.random() < 0.25 ? 1 : 0) : 0;
      const ff = Math.random() < 0.15 ? 1 : 0;
      const fr = Math.random() < 0.2 ? 1 : 0;
      const defTD = (ints > 0 || fr > 0) && Math.random() < 0.3 ? 1 : 0;
      
      gameStats.tackles = tackles;
      gameStats.sacks = sacks;
      gameStats.defInterceptions = ints;
      gameStats.forcedFumbles = ff;
      gameStats.fumbleRecoveries = fr;
      gameStats.defTDs = defTD;
      
      gs.tackles += tackles;
      gs.sacks += sacks;
      gs.defInterceptions += ints;
      gs.forcedFumbles += ff;
      gs.fumbleRecoveries += fr;
      gs.defTDs += defTD;
    }
    
    // Add to game log
    if(!gs.gameLog) gs.gameLog = [];
    gs.gameLog.push(gameStats);
    
    // Update season stats
    const seasonKey = `Y${s.career.year}`;
    if(!gs.seasonStats) gs.seasonStats = {};
    if(!gs.seasonStats[seasonKey]) {
      gs.seasonStats[seasonKey] = {
        gamesPlayed: 0,
        passingYards: 0, passingTDs: 0, interceptions: 0, completions: 0, attempts: 0,
        rushingYards: 0, rushingTDs: 0, carries: 0,
        receptions: 0, receivingYards: 0, receivingTDs: 0,
        tackles: 0, sacks: 0, defInterceptions: 0, forcedFumbles: 0, fumbleRecoveries: 0, defTDs: 0
      };
    }
    const season = gs.seasonStats[seasonKey];
    season.gamesPlayed += 1;
    Object.keys(gameStats).forEach(k => {
      if(typeof gameStats[k] === 'number' && k !== 'week' && k !== 'year' && k !== 'opponent' && k !== 'win' && k !== 'scoreFor' && k !== 'scoreAgainst') {
        season[k] = (season[k] || 0) + gameStats[k];
      }
    });
    
    s.gameStats = gs;

    // XP: base on closeness and performance
    const margin = Math.abs(ptsFor - ptsAg);
    const xpGain = clamp(rint(55 + (didWin?30:10) + prepBonus*35 + (energyFactor*20) - margin*0.8 + (Math.random()*10)), 25, 140);
    s.xp += xpGain;

    // energy cost
    const eCost = clamp(rint(22 + (Math.random()*10) - s.level*0.3), 12, 35);
    s.energy = clamp(s.energy - eCost, 0, MAX_ENERGY);

    // update record and week progression
    if(didWin) s.career.recordW += 1; else s.career.recordL += 1;

    const weekLabel = s.career.inPost ? `Postseason G${s.career.postWeek}/3` : `Week ${s.career.week}/${s.career.maxWeeks}`;
    logPush(s, 'Game', `${weekLabel} vs Opponent (OVR ${opp}) — ${didWin?'W':'L'} ${ptsFor}-${ptsAg}. (+${xpGain} XP, -${eCost} energy)`);

    handleLevelUp(s);

    // advance schedule within the "Play Game" action
    if(!s.career.inPost){
      if(s.career.week < s.career.maxWeeks){
        s.career.week += 1;
      } else {
        // decide postseason
        const qualifies = s.career.recordW >= 8;
        if(qualifies){
          s.career.inPost = true;
          s.career.postWeek = 1;
          logPush(s, 'Playoffs', 'You qualified for the postseason! Up to 3 games.');
        } else {
          endOfSeason(s);
        }
      }
    } else {
      // in postseason
      if(s.career.postWeek < 3){
        s.career.postWeek += 1;
      } else {
        endOfSeason(s);
      }
    }
  }

  function endOfSeason(s){
    const y = s.career.year;
    const rec = `${s.career.recordW}-${s.career.recordL}`;
    logPush(s, 'Season End', `High School Year ${y} complete. Record: ${rec}.`);
    // reset for next year or end
    if(y >= 4){
      promptCommit(s);
      return;
    }
    s.career.year += 1;
    s.career.week = 1;
    s.career.maxWeeks = 12;
    s.career.recordW = 0;
    s.career.recordL = 0;
    s.career.inPost = false;
    s.career.postWeek = 0;
    startNewWeek(s);
  }

  function promptCommit(s){
    openModal({
      title: 'Recruiting — Commit to a College',
      bodyHTML: `
        <div class="muted">You finished 4 years of high school. For now, the game ends here — but we can expand to college next.</div>
        <div class="form">
          <label class="field">
            <span>Choose a college to commit to</span>
            <select id="commit">
              <option>State University</option>
              <option>Coastal Tech</option>
              <option>Midwest A&amp;M</option>
              <option>North Valley College</option>
              <option>Sunrise University</option>
            </select>
          </label>
        </div>
      `,
      footHTML: `<button class="btn primary" id="btnCommit">Commit</button>`,
      onClose: () => {}
    });
    $('#btnCommit').onclick = () => {
      const college = $('#commit').value;
      logPush(s, 'Committed', `${s.player.name} committed to ${college}. (End of demo)`);
      save(s);
      $('#modal').close();
      render(s);
    };
  }

  function openSkills(s){
    const stats = derivedStats(s);
    const keys = [
      ['throwPower','Throw Power'],
      ['accuracy','Accuracy'],
      ['speed','Speed'],
      ['strength','Strength'],
      ['stamina','Stamina'],
    ];

    const rows = keys.map(([k, label]) => {
      const base = s.statsBase[k];
      const shown = stats[k];
      const bonus = shown - base;
      return `
        <tr>
          <td>${label}</td>
          <td><span class="pill2">${shown}${bonus?` <span class="muted">(base ${base}${bonus>0?` +${bonus}`:''})</span>`:''}</span></td>
          <td class="right"><button class="btn small" data-up="${k}" ${s.skillPoints<=0?'disabled':''}>+1</button></td>
        </tr>
      `;
    }).join('');

    openModal({
      title: 'Spend Skill Points',
      bodyHTML: `
        <div class="muted">Skill points available: <b>${s.skillPoints}</b></div>
        <table class="table">
          <thead><tr><th>Skill</th><th>Value</th><th class="right">Upgrade</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="tiny muted">Upgrades increase your base stats. OVR is calculated from your equipped bonuses + base stats.</div>
      `,
      footHTML: `<button class="btn" id="closeSkills">Close</button>`,
      onClose: () => {}
    });

    $('#closeSkills').onclick = () => $('#modal').close();

    $$('button[data-up]').forEach(btn => {
      btn.onclick = () => {
        const k = btn.getAttribute('data-up');
        if(s.skillPoints <= 0) return;
        s.skillPoints -= 1;
        s.statsBase[k] = clamp(s.statsBase[k] + 1, 40, 99);
        logPush(s, 'Skill Up', `+1 ${k}.`);
        save(s);
        $('#modal').close();
        render(s);
      };
    });
  }

  function openJobs(s){
    const current = JOBS.find(j=>j.id===s.career.jobId) || JOBS[0];
    const rows = JOBS.map(j => `
      <tr>
        <td><b>${j.name}</b><div class="tiny muted">${j.desc}</div></td>
        <td>${j.hours}h</td>
        <td>${fmtMoney(j.pay)}/wk</td>
        <td class="right"><button class="btn small" data-job="${j.id}" ${j.id===current.id?'disabled':''}>Select</button></td>
      </tr>
    `).join('');

    openModal({
      title:'Choose a Part-time Job',
      bodyHTML: `
        <div class="muted">Your current job is <b>${current.name}</b>. Jobs pay weekly and automatically use hours each week.</div>
        <table class="table">
          <thead><tr><th>Job</th><th>Hours</th><th>Pay</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `,
      footHTML: `<button class="btn" id="closeJobs">Close</button>`,
    });

    $('#closeJobs').onclick = () => $('#modal').close();
    $$('button[data-job]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-job');
        s.career.jobId = id;
        const j = JOBS.find(x=>x.id===id) || JOBS[0];
        logPush(s, 'Job Updated', `You are now working as: ${j.name} (${j.hours}h/week, ${fmtMoney(j.pay)}/week).`);
        save(s);
        $('#modal').close();
        render(s);
      };
    });
  }

  function openStore(s){
    const ownedCount = (id) => s.inventory.owned.filter(x=>x===id).length;
    const eq = s.inventory.equipped;

    const rows = STORE_ITEMS.map(it => {
      const count = ownedCount(it.id);
      const ownedText = it.type==='consumable'
        ? (count>0 ? `<span class="pill2">Owned: ${count}</span>` : `<span class="pill2">Owned: 0</span>`)
        : (Object.values(eq).includes(it.id) ? `<span class="pill2">Equipped</span>` : (count>0 ? `<span class="pill2">Owned</span>` : `<span class="pill2">—</span>`));
      const afford = canAfford(s, it.price);
      return `
        <tr>
          <td><b>${it.name}</b><div class="tiny muted">${it.desc}</div></td>
          <td><span class="pill2">${it.type==='equipment' ? ('Equip • ' + (it.slot||'slot')) : 'Consumable'}</span></td>
          <td>${fmtMoney(it.price)}</td>
          <td>${ownedText}</td>
          <td class="right"><button class="btn small" data-buy="${it.id}" ${afford?'':'disabled'}>Buy</button></td>
        </tr>
      `;
    }).join('');

    openModal({
      title:'Store',
      bodyHTML: `
        <div class="muted">Money: <b>${fmtMoney(s.money)}</b></div>
        <table class="table">
          <thead><tr><th>Item</th><th>Type</th><th>Price</th><th>Owned</th><th class="right"></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="tiny muted">Equipment bonuses apply only when equipped. Consumables can be used from Inventory.</div>
      `,
      footHTML: `<button class="btn" id="closeStore">Close</button>`,
    });
    $('#closeStore').onclick = () => $('#modal').close();

    $$('button[data-buy]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-buy');
        const it = STORE_ITEMS.find(x=>x.id===id);
        if(!it) return;
        if(!canAfford(s, it.price)) return;
        s.money -= it.price;
        addOwned(s, id);
        logPush(s, 'Purchased', `Bought ${it.name} for ${fmtMoney(it.price)}.`);
        save(s);
        $('#modal').close();
        render(s);
      };
    });
  }

  function generateNPCPlayers(position, count = 8){
    const firstNames = ["Alex", "Blake", "Cameron", "Drew", "Ethan", "Finn", "Grant", "Hayden", "Isaiah", "Jake", "Kai", "Logan", "Mason", "Noah", "Owen", "Parker", "Quinn", "Riley", "Sam", "Tyler"];
    const lastNames = ["Anderson", "Brooks", "Carter", "Davis", "Evans", "Foster", "Gray", "Harris", "Jackson", "Kelly", "Lewis", "Martinez", "Nelson", "Parker", "Reed", "Smith", "Taylor", "Walker", "White", "Young"];
    
    const baseStats = {
      QB: { passingYards: 180, passingTDs: 1.2, interceptions: 0.8, completions: 14, attempts: 24, rushingYards: 25, rushingTDs: 0.2 },
      RB: { rushingYards: 85, rushingTDs: 0.8, carries: 18, receptions: 2.5, receivingYards: 20, receivingTDs: 0.1 },
      WR: { receptions: 4.5, receivingYards: 65, receivingTDs: 0.5, rushingYards: 5 },
      TE: { receptions: 3.2, receivingYards: 45, receivingTDs: 0.4 },
      LB: { tackles: 7.5, sacks: 0.4, defInterceptions: 0.2, forcedFumbles: 0.15, fumbleRecoveries: 0.2, defTDs: 0.05 },
      CB: { tackles: 4.2, sacks: 0.1, defInterceptions: 0.3, forcedFumbles: 0.1, fumbleRecoveries: 0.15, defTDs: 0.08 },
      S: { tackles: 5.8, sacks: 0.15, defInterceptions: 0.35, forcedFumbles: 0.12, fumbleRecoveries: 0.18, defTDs: 0.1 },
      DL: { tackles: 5.5, sacks: 0.6, defInterceptions: 0.05, forcedFumbles: 0.2, fumbleRecoveries: 0.15, defTDs: 0.03 }
    };
    
    const base = baseStats[position] || {};
    const npcs = [];
    
    for(let i = 0; i < count; i++){
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      const stats = {};
      
      // Generate stats with variance around base
      Object.keys(base).forEach(key => {
        const baseVal = base[key];
        const variance = baseVal * 0.4; // ±40% variance
        stats[key] = Math.max(0, baseVal + (Math.random() * variance * 2 - variance));
      });
      
      npcs.push({ name, stats });
    }
    
    // Sort by primary stat for the position
    if(position === 'QB') npcs.sort((a, b) => b.stats.passingYards - a.stats.passingYards);
    else if(position === 'RB') npcs.sort((a, b) => b.stats.rushingYards - a.stats.rushingYards);
    else if(position === 'WR' || position === 'TE') npcs.sort((a, b) => b.stats.receivingYards - a.stats.receivingYards);
    else npcs.sort((a, b) => b.stats.tackles - a.stats.tackles);
    
    return npcs;
  }

  function openStats(s){
    const gs = s.gameStats || { gamesPlayed: 0, passingYards: 0, passingTDs: 0, interceptions: 0, completions: 0, attempts: 0, rushingYards: 0, rushingTDs: 0, carries: 0, receptions: 0, receivingYards: 0, receivingTDs: 0, tackles: 0, sacks: 0, defInterceptions: 0, forcedFumbles: 0, fumbleRecoveries: 0, defTDs: 0, gameLog: [], seasonStats: {} };
    const pos = s.player.position;
    
    // Get latest game stats
    const latestGame = gs.gameLog && gs.gameLog.length > 0 ? gs.gameLog[gs.gameLog.length - 1] : null;
    
    // Get current season stats
    const seasonKey = `Y${s.career.year}`;
    const seasonStats = gs.seasonStats && gs.seasonStats[seasonKey] ? gs.seasonStats[seasonKey] : null;
    const seasonGames = seasonStats ? seasonStats.gamesPlayed || 1 : 1;
    
    // Career totals
    const careerGames = gs.gamesPlayed || 1;
    
    // Generate NPC players for comparison
    const npcPlayers = generateNPCPlayers(pos, 8);
    
    // Build stat tables by category with NPC player list
    const buildPassingStats = (stats, games, npcs) => {
      if(pos !== 'QB') return '';
      const playerPerGame = games > 0 ? games : 1;
      const compPct = stats.attempts > 0 ? ((stats.completions / stats.attempts) * 100).toFixed(1) : '0.0';
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.passingYards / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.passingTDs / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.completions / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.attempts / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${compPct}%</td>
          <td style="text-align:right; font-weight:700;">${(stats.interceptions / playerPerGame).toFixed(1)}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const npcCompPct = npc.stats.attempts > 0 ? ((npc.stats.completions / npc.stats.attempts) * 100).toFixed(1) : '0.0';
        return `
          <tr>
            <td>${npc.name}</td>
            <td style="text-align:right;">${npc.stats.passingYards.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.passingTDs.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.completions.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.attempts.toFixed(1)}</td>
            <td style="text-align:right;">${npcCompPct}%</td>
            <td style="text-align:right;">${npc.stats.interceptions.toFixed(1)}</td>
          </tr>
        `;
      }).join('');
      
      return playerRow + npcRows;
    };
    
    const buildRushingStats = (stats, games, npcs) => {
      if(pos === 'CB' || pos === 'S' || pos === 'DL' || pos === 'LB') return '';
      const playerPerGame = games > 0 ? games : 1;
      const playerYPC = stats.carries > 0 ? (stats.rushingYards / stats.carries).toFixed(1) : '0.0';
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.rushingYards / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.rushingTDs / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.carries / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${playerYPC}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const npcYPC = npc.stats.carries > 0 ? (npc.stats.rushingYards / npc.stats.carries).toFixed(1) : '0.0';
        return `
          <tr>
            <td>${npc.name}</td>
            <td style="text-align:right;">${npc.stats.rushingYards.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.rushingTDs.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.carries.toFixed(1)}</td>
            <td style="text-align:right;">${npcYPC}</td>
          </tr>
        `;
      }).join('');
      
      return playerRow + npcRows;
    };
    
    const buildReceivingStats = (stats, games, npcs) => {
      if(pos === 'QB' || pos === 'DL') return '';
      const playerPerGame = games > 0 ? games : 1;
      const playerYPR = stats.receptions > 0 ? (stats.receivingYards / stats.receptions).toFixed(1) : '0.0';
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.receptions / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.receivingYards / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.receivingTDs / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${playerYPR}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const npcYPR = npc.stats.receptions > 0 ? (npc.stats.receivingYards / npc.stats.receptions).toFixed(1) : '0.0';
        return `
          <tr>
            <td>${npc.name}</td>
            <td style="text-align:right;">${npc.stats.receptions.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.receivingYards.toFixed(1)}</td>
            <td style="text-align:right;">${npc.stats.receivingTDs.toFixed(1)}</td>
            <td style="text-align:right;">${npcYPR}</td>
          </tr>
        `;
      }).join('');
      
      return playerRow + npcRows;
    };
    
    const buildDefenseStats = (stats, games, npcs) => {
      if(pos !== 'LB' && pos !== 'CB' && pos !== 'S' && pos !== 'DL') return '';
      const playerPerGame = games > 0 ? games : 1;
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.tackles / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.sacks / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.defInterceptions / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.forcedFumbles / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.fumbleRecoveries / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.defTDs / playerPerGame).toFixed(1)}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => `
        <tr>
          <td>${npc.name}</td>
          <td style="text-align:right;">${npc.stats.tackles.toFixed(1)}</td>
          <td style="text-align:right;">${npc.stats.sacks.toFixed(1)}</td>
          <td style="text-align:right;">${npc.stats.defInterceptions.toFixed(1)}</td>
          <td style="text-align:right;">${npc.stats.forcedFumbles.toFixed(1)}</td>
          <td style="text-align:right;">${npc.stats.fumbleRecoveries.toFixed(1)}</td>
          <td style="text-align:right;">${npc.stats.defTDs.toFixed(1)}</td>
        </tr>
      `).join('');
      
      return playerRow + npcRows;
    };
    
    // Get stats for current view
    const getStatsForPeriod = (period) => {
      if(period === 'game') return latestGame || {};
      if(period === 'season') return seasonStats || {};
      return gs; // career
    };
    
    const getGamesForPeriod = (period) => {
      if(period === 'game') return 1;
      if(period === 'season') return seasonGames;
      return careerGames;
    };
    
    // Build content for each period
    const buildPeriodContent = (period) => {
      const stats = getStatsForPeriod(period);
      const games = getGamesForPeriod(period);
      const periodLabel = period === 'game' ? 'Last Game' : period === 'season' ? `Season ${s.career.year}` : 'Career';
      
      let categories = [];
      if(pos === 'QB') {
        categories = [
          { 
            id: 'passing', 
            name: 'Passing', 
            content: buildPassingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Pass Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Comp/G</th><th style="text-align:right;">Att/G</th><th style="text-align:right;">Comp %</th><th style="text-align:right;">INT/G</th>'
          },
          { 
            id: 'rushing', 
            name: 'Rushing', 
            content: buildRushingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rush Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Carries/G</th><th style="text-align:right;">YPC</th>'
          }
        ];
      } else if(pos === 'RB') {
        categories = [
          { 
            id: 'rushing', 
            name: 'Rushing', 
            content: buildRushingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rush Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Carries/G</th><th style="text-align:right;">YPC</th>'
          },
          { 
            id: 'receiving', 
            name: 'Receiving', 
            content: buildReceivingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rec/G</th><th style="text-align:right;">Rec Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">YPR</th>'
          }
        ];
      } else if(pos === 'WR' || pos === 'TE') {
        categories = [
          { 
            id: 'receiving', 
            name: 'Receiving', 
            content: buildReceivingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rec/G</th><th style="text-align:right;">Rec Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">YPR</th>'
          },
          { 
            id: 'rushing', 
            name: 'Rushing', 
            content: buildRushingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rush Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Carries/G</th><th style="text-align:right;">YPC</th>'
          }
        ];
      } else {
        categories = [
          { 
            id: 'defense', 
            name: 'Defense', 
            content: buildDefenseStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Tackles/G</th><th style="text-align:right;">Sacks/G</th><th style="text-align:right;">INT/G</th><th style="text-align:right;">FF/G</th><th style="text-align:right;">FR/G</th><th style="text-align:right;">TDs/G</th>'
          }
        ];
      }
      
      const categoryTabs = categories.map((cat, idx) => 
        `<button class="stats-category-tab ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}" data-period="${period}">${cat.name}</button>`
      ).join('');
      
      const categoryContents = categories.map((cat, idx) => 
        `<div class="stats-content ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}" data-period="${period}">
          <table class="table">
            <thead><tr>${cat.headers}</tr></thead>
            <tbody>${cat.content || '<tr><td colspan="10" class="muted">No stats available</td></tr>'}</tbody>
          </table>
        </div>`
      ).join('');
      
      return `
        <div class="muted" style="margin-bottom:8px; font-size:13px;">${periodLabel} • ${games} game${games !== 1 ? 's' : ''}</div>
        <div class="stats-category-tabs">${categoryTabs}</div>
        ${categoryContents}
      `;
    };
    
    const bodyHTML = `
      <div class="stats-tabs">
        <button class="stats-tab ${latestGame ? '' : 'disabled'}" data-period="game" ${!latestGame ? 'disabled' : ''}>Last Game</button>
        <button class="stats-tab ${seasonStats ? 'active' : ''}" data-period="season" ${!seasonStats ? 'disabled' : ''}>Season ${s.career.year}</button>
        <button class="stats-tab ${!seasonStats ? 'active' : ''}" data-period="career">Career</button>
      </div>
      <div id="stats-period-content">
        ${buildPeriodContent(seasonStats ? 'season' : 'career')}
      </div>
    `;
    
    openModal({
      title: 'Game Statistics',
      bodyHTML: bodyHTML,
      footHTML: `<button class="btn" id="closeStats">Close</button>`,
      onClose: () => {}
    });
    
    // Tab switching
    $$('.stats-tab').forEach(tab => {
      tab.onclick = () => {
        if(tab.disabled) return;
        const period = tab.getAttribute('data-period');
        $$('.stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $('#stats-period-content').innerHTML = buildPeriodContent(period);
        // Re-attach category tab handlers
        $$('.stats-category-tab').forEach(catTab => {
          catTab.onclick = () => {
            const cat = catTab.getAttribute('data-cat');
            const p = catTab.getAttribute('data-period');
            $$(`.stats-category-tab[data-period="${p}"]`).forEach(t => t.classList.remove('active'));
            $$(`.stats-content[data-period="${p}"]`).forEach(c => c.classList.remove('active'));
            catTab.classList.add('active');
            $(`.stats-content[data-cat="${cat}"][data-period="${p}"]`).classList.add('active');
          };
        });
      };
    });
    
    $$('.stats-category-tab').forEach(catTab => {
      catTab.onclick = () => {
        const cat = catTab.getAttribute('data-cat');
        const p = catTab.getAttribute('data-period');
        $$(`.stats-category-tab[data-period="${p}"]`).forEach(t => t.classList.remove('active'));
        $$(`.stats-content[data-period="${p}"]`).forEach(c => c.classList.remove('active'));
        catTab.classList.add('active');
        $(`.stats-content[data-cat="${cat}"][data-period="${p}"]`).classList.add('active');
      };
    });
    
    $('#closeStats').onclick = () => $('#modal').close();
  }

  function openInventory(s){
    const owned = s.inventory.owned.slice();
    const eq = s.inventory.equipped;

    const counts = owned.reduce((m,id)=>{ m[id]=(m[id]||0)+1; return m; }, {});
    const ownedItems = Object.keys(counts).map(id => {
      const it = STORE_ITEMS.find(x=>x.id===id);
      if(!it) return null;
      return { ...it, count: counts[id] };
    }).filter(Boolean);

    const slots = Object.keys(eq).map(slot => {
      const id = eq[slot];
      const it = id ? STORE_ITEMS.find(x=>x.id===id) : null;
      return `
        <tr>
          <td><b>${slot}</b></td>
          <td>${it ? it.name : '<span class="muted">None</span>'}</td>
          <td class="right">${it ? `<button class="btn small" data-unequip="${slot}">Unequip</button>` : ''}</td>
        </tr>
      `;
    }).join('');

    const rows = ownedItems.map(it => {
      const isEq = Object.values(eq).includes(it.id);
      const actions = it.type==='consumable'
        ? `<button class="btn small" data-use="${it.id}" ${it.count>0?'':'disabled'}>Use</button>`
        : `<button class="btn small" data-eq="${it.id}" ${isEq?'disabled':''}>Equip</button>`;
      return `
        <tr>
          <td><b>${it.name}</b><div class="tiny muted">${it.desc}</div></td>
          <td>${it.type==='consumable' ? `x${it.count}` : (isEq ? 'Equipped' : 'Owned')}</td>
          <td class="right">${actions}</td>
        </tr>
      `;
    }).join('');

    openModal({
      title:'Inventory',
      bodyHTML: `
        <div class="muted">Energy: <b>${s.energy}/${MAX_ENERGY}</b> • Hours: <b>${s.hours}/${WEEK_HOURS}</b></div>

        <div style="margin-top:10px" class="muted"><b>Equipped</b></div>
        <table class="table">
          <thead><tr><th>Slot</th><th>Item</th><th class="right"></th></tr></thead>
          <tbody>${slots}</tbody>
        </table>

        <div style="margin-top:10px" class="muted"><b>Owned Items</b></div>
        <table class="table">
          <thead><tr><th>Item</th><th>Status</th><th class="right">Action</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="3" class="muted">Your inventory is empty. Buy items in the Store.</td></tr>`}</tbody>
        </table>
      `,
      footHTML: `<button class="btn" id="closeInv">Close</button>`,
    });
    $('#closeInv').onclick = () => $('#modal').close();

    $$('button[data-use]').forEach(btn=>{
      btn.onclick = () => {
        const id = btn.getAttribute('data-use');
        useConsumable(s, id);
        save(s);
        $('#modal').close();
        render(s);
      };
    });

    $$('button[data-eq]').forEach(btn=>{
      btn.onclick = () => {
        const id = btn.getAttribute('data-eq');
        const it = STORE_ITEMS.find(x=>x.id===id);
        if(!it || it.type!=='equipment') return;
        const slot = it.slot || 'accessory';
        // ensure owned
        if(!s.inventory.owned.includes(id)) return;
        // if already something in slot, unequip
        s.inventory.equipped[slot] = id;
        logPush(s, 'Equipped', `Equipped ${it.name} (${slot}).`);
        save(s);
        $('#modal').close();
        render(s);
      };
    });

    $$('button[data-unequip]').forEach(btn=>{
      btn.onclick = () => {
        const slot = btn.getAttribute('data-unequip');
        s.inventory.equipped[slot] = null;
        logPush(s, 'Unequipped', `Unequipped ${slot}.`);
        save(s);
        $('#modal').close();
        render(s);
      };
    });
  }

  function openLogAll(s){
    const items = s.log.slice(0, 200).map(it => {
      const d = new Date(it.t);
      const stamp = d.toLocaleString();
      return `<div class="logitem"><div class="logmeta">${stamp} • ${it.title}</div><div class="logmsg">${it.msg}</div></div>`;
    }).join('');
    openModal({
      title:'Full Game Log',
      bodyHTML: `<div class="log" style="max-height:60vh">${items || '<div class="muted">No log yet.</div>'}</div>`,
      footHTML: `<button class="btn" id="closeLog">Close</button>`,
    });
    $('#closeLog').onclick = () => $('#modal').close();
  }

  function wireUI(s){
    // action buttons
    $$('#careerCard button[data-act]').forEach(b => {
      b.onclick = () => {
        const currentState = loadState();
        doAction(currentState, b.dataset.act, b.dataset.h);
      };
    });
    $('#btnAdvance').onclick = () => {
      const currentState = loadState();
      if(!currentState.player) return openCreatePlayer(currentState);
      // advance without playing game: new week
      startNewWeek(currentState);
      // advance schedule but keep game for week
      if(!currentState.career.inPost){
        if(currentState.career.week < currentState.career.maxWeeks) currentState.career.week += 1;
        else {
          // season end check
          const qualifies = currentState.career.recordW >= 8;
          if(qualifies){
            currentState.career.inPost = true; currentState.career.postWeek = 1;
            logPush(currentState, 'Playoffs', 'You qualified for the postseason! Up to 3 games.');
          } else endOfSeason(currentState);
        }
      } else {
        if(currentState.career.postWeek < 3) currentState.career.postWeek += 1;
        else endOfSeason(currentState);
      }
      save(currentState);
      render(currentState);
    };

    $('#btnPlayGame').onclick = () => {
      const currentState = loadState();
      if(!currentState.player) return openCreatePlayer(currentState);
      simulateGame(currentState);
      save(currentState);
      render(currentState);
    };

    $('#btnSkills').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openSkills(currentState) : openCreatePlayer(currentState);
    };
    $('#btnJob').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openJobs(currentState) : openCreatePlayer(currentState);
    };
    $('#btnStore').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openStore(currentState) : openCreatePlayer(currentState);
    };
    $('#btnInv').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openInventory(currentState) : openCreatePlayer(currentState);
    };
    $('#btnStats').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openStats(currentState) : openCreatePlayer(currentState);
    };
    $('#btnLog').onclick = () => {
      const currentState = loadState();
      openLogAll(currentState);
    };

    $('#btnReset').onclick = () => {
      if(confirm('Reset your save?')){
        localStorage.removeItem(LS_KEY);
        const ns = defaultState();
        save(ns);
        location.reload();
      }
    };

    $('#btnExport').onclick = () => {
      const currentState = loadState();
      const blob = new Blob([JSON.stringify(currentState, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gridiron-save-v133.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    $('#fileImport').onchange = async (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      try{
        const txt = await f.text();
        const obj = JSON.parse(txt);
        localStorage.setItem(LS_KEY, JSON.stringify(obj));
        location.reload();
      }catch(e){
        alert('Import failed: invalid JSON.');
      }finally{
        ev.target.value = '';
      }
    };
  }

  function render(s){
    document.title = `Gridiron Career Sim ${VERSION}`;

    // create if missing
    if(!s.player){
      $('#careerTitle').textContent = 'New Career';
      $('#careerSub').textContent = 'Create your player to begin.';
      $('#money').textContent = '$0';
      $('#ovr').textContent = '—';
      $('#level').textContent = '—';
      $('#xp').textContent = '—';
      $('#sp').textContent = '—';
      $('#seasonTag').textContent = '—';
      $('#gameWeekTag').textContent = '—';
      setBars(0,0,0);
      $('#jobName').textContent = 'No Job';
      $('#jobMeta').textContent = 'Auto: 0h/week • $0/week';
      renderLog(s);
      // prompt create
      openCreatePlayer(s);
      return;
    }

    const stats = derivedStats(s);
    const ovr = calcOVR(stats);

    $('#careerTitle').textContent = `${s.player.name} — High School Year ${s.career.year}`;
    const styleList = getStylesForPosition(s.player.position);
    const styleName = styleList.find(x=>x.id===s.player.archetype)?.name || s.player.archetype;
    const playerInfo = [
      s.player.highSchool,
      s.player.position,
      styleName,
      s.player.jerseyNumber ? `#${s.player.jerseyNumber}` : '',
      s.player.height || '',
      s.player.weight || '',
      s.player.hometown || ''
    ].filter(Boolean).join(' • ');
    $('#careerSub').textContent = playerInfo;
    $('#seasonTag').textContent = `Week ${s.career.week}/${s.career.maxWeeks}`;
    $('#gameWeekTag').textContent = s.career.inPost ? `Postseason G${s.career.postWeek}/3` : 'Regular Season';

    $('#money').textContent = fmtMoney(s.money);
    $('#ovr').textContent = String(ovr);
    $('#level').textContent = String(s.level);
    $('#xp').textContent = `${s.xp}/${xpNeeded(s.level)}`;
    $('#sp').textContent = String(s.skillPoints);

    const job = JOBS.find(j=>j.id===s.career.jobId) || JOBS[0];
    $('#jobName').textContent = job.name;
    $('#jobMeta').textContent = `Auto: ${job.hours}h/week • ${fmtMoney(job.pay)}/week`;

    setBars(s.energy/MAX_ENERGY, s.hours/WEEK_HOURS, s.xp/xpNeeded(s.level));

    // enable/disable play button: if already committed end-of-demo, still allow?
    $('#btnPlayGame').disabled = false;

    renderLog(s);
  }

  function setBars(energyP, hoursP, xpP){
    $('#energyFill').style.width = `${clamp(energyP*100, 0, 100)}%`;
    $('#hoursFill').style.width = `${clamp(hoursP*100, 0, 100)}%`;
    $('#xpFill').style.width = `${clamp(xpP*100, 0, 100)}%`;
    const energyVal = Math.round(energyP*MAX_ENERGY);
    const hoursVal = Math.round(hoursP*WEEK_HOURS);
    $('#energyTxt').textContent = `${energyVal}/${MAX_ENERGY}`;
    $('#hoursTxt').textContent = `${hoursVal}/${WEEK_HOURS}`;
    $('#xpTxt').textContent = `${Math.round(clamp(xpP*100,0,100))}%`;
  }

  function renderLog(s){
    const el = $('#log');
    const items = s.log.slice(0, 8).map(it => {
      const d = new Date(it.t);
      const stamp = d.toLocaleString();
      return `<div class="logitem"><div class="logmeta">${stamp} • ${it.title}</div><div class="logmsg">${it.msg}</div></div>`;
    }).join('');
    el.innerHTML = items || '<div class="muted">No activity yet.</div>';
  }

  // Extra CSS for modal form controls (injected once)
  const extra = document.createElement('style');
  extra.textContent = `
    .form{margin-top:12px; display:grid; gap:12px}
    .field{display:grid; gap:6px}
    .field > span{font-size:12px; color: #b8d4ff}
    .field label{font-size:13px; color: #b8d4ff; font-weight:600; margin-bottom:4px}
    input, select{
      width:100%;
      padding:10px 12px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.20);
      background: rgba(10,14,28,.85);
      color: #fff8f0;
      outline:none;
      font-weight:500;
      transition: border-color .2s ease, background .2s ease;
    }
    select{
      cursor:pointer;
      appearance:none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23b8d4ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
    select option{
      background: #0a0e1c;
      color: #fff8f0;
      padding: 8px;
    }
    input::placeholder{color: rgba(184,212,255,.50)}
    input:focus, select:focus{
      border-color: rgba(124,92,255,.65);
      background: rgba(10,14,28,.95);
      box-shadow: 0 0 0 3px rgba(124,92,255,.15);
    }
    select:hover{
      background-color: rgba(10,14,28,.95);
    }
    .row{display:grid; grid-template-columns: 1fr 1fr; gap:12px}
    @media (max-width: 520px){ .row{grid-template-columns:1fr} }
    .radios{display:grid; gap:10px; margin-top:8px}
    .radio{
      display:flex; gap:10px; align-items:flex-start;
      padding:10px 10px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.06);
      cursor:pointer;
      transition: all .15s ease;
    }
    .radio:hover{background: rgba(255,255,255,.10); border-color: rgba(124,92,255,.40)}
    .radio input{margin-top:4px}
    .r-title{font-weight:900; color: #fff8f0}
  `;
  document.head.appendChild(extra);


  // expose functions needed by inline onclick handlers (GitHub Pages-safe)
  // --- Global wrappers/aliases for inline handlers (keeps older HTML strings working) ---
  function exportSave(){ const b = document.getElementById('btnExport'); if(b) b.click(); }
  function importSave(){ const f = document.getElementById('importFile'); if(f) f.click(); }
  function importSaveFromFile(){ importSave(); }
  function resetAll(){ const b = document.getElementById('btnReset'); if(b) b.click(); }
  function openSkillsModal(){ return openSkills(); }
  function openStoreModal(){ return openStore(); }
  function openInventoryModal(){ return openInventory(); }
  function openJobModal(){ return openJobs(); }

  Object.assign(window, {
    // Career / UI
    openCreatePlayer,
    startCareerFromCreator,
    setModal,
    closeModal,
    // Position/Style utilities
    getStylesForPosition,
    handlePositionChange,
    handleStyleChange,
    // Randomizers
    randomizeName,
    randomizeSchool,
    randomizeHeight,
    randomizeWeight,
    randomizeHometown,
    // Modals
    openSkillsModal,
    openJobModal,
    openStoreModal,
    openInventoryModal,
    openStats,
    // Save utilities
    exportSave,
    importSave,
    importSaveFromFile,
    resetAll,
  });


  // boot
  const state = load();
  // Modal open helpers (kept for older onclick hooks / compatibility)
  function openSkillsModal(){ openSkills(state); }
  function openJobModal(){ openJobs(state); }
  function openStoreModal(){ openStore(state); }
  function openInventoryModal(){ openInventory(state); }
  function openStatsModal(){ openStats(state); }

  $('#ver').textContent = VERSION.replace('v','v');
  document.title = `Gridiron Career Sim ${VERSION}`;
  wireUI(state);
  render(state);

})();
