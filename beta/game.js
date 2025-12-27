/* Gridiron Career Sim — v1.1.3 */
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


  const VERSION = 'v1.1.6';

  const LS_KEY = 'gcs_save_v112';

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

  function basePlayerFromArchetype(position, styleId){
  const pos = (position || "QB").toUpperCase();

  const baseByPos = {
    QB: { throwPower:70, accuracy:70, speed:60, stamina:65, strength:60 },
    RB: { throwPower:40, accuracy:55, speed:70, stamina:70, strength:65 },
    WR: { throwPower:40, accuracy:65, speed:72, stamina:68, strength:55 },
    TE: { throwPower:40, accuracy:60, speed:62, stamina:70, strength:72 },
    LB: { throwPower:40, accuracy:55, speed:62, stamina:72, strength:75 },
    CB: { throwPower:40, accuracy:65, speed:74, stamina:66, strength:52 },
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

  function derivedStats(s){
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

  function openCreatePlayer(s){
  // Persist draft across re-renders while the modal is open
  const st = s || loadState();
  window.__draftPlayer = window.__draftPlayer || {
    name: "",
    position: "QB",
    highSchool: "",
    style: "Pocket"
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
          onchange="window.__draftPlayer.style=this.value">
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
    <div class="modalTitle">Create Your Player</div>
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
          <select id="cp_pos" onchange="window.__draftPlayer.position=this.value; window.__draftPlayer.style=getStylesForPosition(this.value)[0].id; openCreatePlayer(loadState())">
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

      <div class="field">
        <label>Play Style</label>
        <div class="radioGrid">
          ${styleCards}
        </div>
      </div>

      <div class="muted tiny">Tip: You can change jobs later. Your style adds small starting stat bonuses.</div>
    </div>
  `;

  setModal(body, `
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="startCareerFromCreator()">Start Career</button>
  `);
}

function randomizeName(){
  const first = ["Kenny","Jayden","Marcus","Darius","Eli","Noah","Ty","Chris","Jordan","Malik","Cameron","Drew","Logan","Zeke","Mason"];
  const last  = ["King","Johnson","Carter","Harris","Walker","Reed","Bennett","Collins","Moore","Brooks","Sanders","Foster","Allen","Graham","Turner"];
  window.__draftPlayer.name = `${pick(first)} ${pick(last)}`;
  const el = document.getElementById("cp_name"); if(el) el.value = window.__draftPlayer.name;
}
function randomizeSchool(){
  const cities = ["Lake Wales","Tampa","Orlando","Miami","Jacksonville","Sarasota","Lakeland","Gainesville","Tallahassee","Pensacola"];
  const mascots = ["High","Prep","Central","North","South","East","West","Academy"];
  window.__draftPlayer.highSchool = `${pick(cities)} ${pick(mascots)} HS`;
  const el = document.getElementById("cp_school"); if(el) el.value = window.__draftPlayer.highSchool;
}
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

  // Career reset
  st.career = { stage:"HS", year:1, week:1, seasonWeek:1, regularWeeks:12, postWeeksMax:3, inPost:false, postWeek:0 };
  st.record = { w:0, l:0 };
  st.money = 250;
  st.xp = 0;
  st.level = 1;
  st.skillPts = 0;
  st.energy = 100;
  st.energyMax = 100;
  st.hours = 25;
  st.hoursMax = 25;
  st.inventory = st.inventory || { owned:{}, equipped:{} };
  st.job = null;

  st.log = [];
  logEvent(st, "Career Started", `${name} begins at ${hs} as a ${pos} (${style}).`);
  saveState(st);
  closeModal();
  render();
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
    const style = s.player.style;
    let variance = 0.10;
    if(style === 'gunslinger') variance = 0.16;
    if(style === 'pocket') variance = 0.08;

    const winP = clamp(0.48 + base*0.22 + prepBonus*0.10, 0.12, 0.88);
    const didWin = Math.random() < winP;

    // produce a scoreline
    const offense = (ovr*energyFactor) + (prepBonus*12) + (Math.random()*12 - 6);
    const defense = (opp*0.95) + (Math.random()*10 - 5);
    let ptsFor = clamp(rint(offense - defense + 24), 7, 56);
    let ptsAg  = clamp(rint((opp - ovr)*0.5 + 21 + (Math.random()*10 - 5)), 3, 52);
    if(didWin && ptsFor <= ptsAg) ptsFor = ptsAg + rint(3 + Math.random()*10);
    if(!didWin && ptsFor >= ptsAg) ptsAg = ptsFor + rint(3 + Math.random()*10);

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
      b.onclick = () => doAction(s, b.dataset.act, b.dataset.h);
    });
    $('#btnAdvance').onclick = () => {
      if(!s.player) return openCreatePlayer(s);
      // advance without playing game: new week
      startNewWeek(s);
      // advance schedule but keep game for week
      if(!s.career.inPost){
        if(s.career.week < s.career.maxWeeks) s.career.week += 1;
        else {
          // season end check
          const qualifies = s.career.recordW >= 8;
          if(qualifies){
            s.career.inPost = true; s.career.postWeek = 1;
            logPush(s, 'Playoffs', 'You qualified for the postseason! Up to 3 games.');
          } else endOfSeason(s);
        }
      } else {
        if(s.career.postWeek < 3) s.career.postWeek += 1;
        else endOfSeason(s);
      }
      save(s);
      render(s);
    };

    $('#btnPlayGame').onclick = () => {
      if(!s.player) return openCreatePlayer(s);
      simulateGame(s);
      save(s);
      render(s);
    };

    $('#btnSkills').onclick = () => s.player ? openSkills(s) : openCreatePlayer(s);
    $('#btnJob').onclick = () => s.player ? openJobs(s) : openCreatePlayer(s);
    $('#btnStore').onclick = () => s.player ? openStore(s) : openCreatePlayer(s);
    $('#btnInv').onclick = () => s.player ? openInventory(s) : openCreatePlayer(s);
    $('#btnLog').onclick = () => openLogAll(s);

    $('#btnReset').onclick = () => {
      if(confirm('Reset your save?')){
        localStorage.removeItem(LS_KEY);
        const ns = defaultState();
        save(ns);
        location.reload();
      }
    };

    $('#btnExport').onclick = () => {
      const blob = new Blob([JSON.stringify(s, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gridiron-save-v112.json';
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
      setBars(0,0,0,0);
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
    $('#careerSub').textContent = `${s.player.school} • ${s.player.position} (${STYLES.find(x=>x.id===s.player.style)?.name||s.player.style})`;
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

    setBars(s.energy/MAX_ENERGY, s.hours/WEEK_HOURS, s.xp/xpNeeded(s.level), s.energy, s.hours, s.xp);

    // enable/disable play button: if already committed end-of-demo, still allow?
    $('#btnPlayGame').disabled = false;

    renderLog(s);
  }

  function setBars(energyP, hoursP, xpP){
    $('#energyFill').style.width = `${clamp(energyP*100, 0, 100)}%`;
    $('#hoursFill').style.width = `${clamp(hoursP*100, 0, 100)}%`;
    $('#xpFill').style.width = `${clamp(xpP*100, 0, 100)}%`;
    $('#energyTxt').textContent = `${Math.round(energyP*MAX_ENERGY)}/${MAX_ENERGY}`;
    $('#hoursTxt').textContent = `${Math.round(hoursP*WEEK_HOURS)}/${WEEK_HOURS}`;
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
    .field > span{font-size:12px; color: rgba(232,236,255,.70)}
    input, select{
      width:100%;
      padding:10px 12px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.14);
      background: rgba(0,0,0,.18);
      color: rgba(232,236,255,.95);
      outline:none;
    }
    input:focus, select:focus{border-color: rgba(124,92,255,.55)}
    .row{display:grid; grid-template-columns: 1fr 1fr; gap:12px}
    @media (max-width: 520px){ .row{grid-template-columns:1fr} }
    .radios{display:grid; gap:10px; margin-top:8px}
    .radio{
      display:flex; gap:10px; align-items:flex-start;
      padding:10px 10px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.04);
      cursor:pointer;
    }
    .radio input{margin-top:4px}
    .r-title{font-weight:900}
  `;
  document.head.appendChild(extra);

  // boot
  const state = load();
  $('#ver').textContent = VERSION.replace('v','v');
  wireUI(state);
  render(state);

})();
