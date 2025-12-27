/* Gridiron Career Sim — v1.0.0 (High School only) */
(() => {
  'use strict';

  const VERSION = '1.0.1';
  

// Store + Inventory
const STORE_ITEMS = [
  { id:'protein_shake', name:'Protein Shake', type:'consumable', price:25, desc:'+20 Energy', effects:{ energy:+20 } },
  { id:'energy_bar', name:'Energy Bar', type:'consumable', price:15, desc:'+10 Energy', effects:{ energy:+10 } },
  { id:'study_planner', name:'Study Planner', type:'consumable', price:20, desc:'+5 Hours (this week)', effects:{ hours:+5 } },
  { id:'cleats', name:'Speed Cleats', type:'gear', slot:'feet', price:120, desc:'+2 Speed', effects:{ stats:{ speed:+2 } } },
  { id:'qb_gloves', name:'QB Gloves', type:'gear', slot:'hands', price:120, desc:'+2 Accuracy', effects:{ stats:{ accuracy:+2 } } },
  { id:'weighted_vest', name:'Weighted Vest', type:'gear', slot:'body', price:160, desc:'+2 Throw Power', effects:{ stats:{ throwPower:+2 } } },
  { id:'film_tablet', name:'Film Tablet', type:'gear', slot:'accessory', price:180, desc:'+1 Accuracy, +1 Throw Power', effects:{ stats:{ accuracy:+1, throwPower:+1 } } },
];

function makeInvItem(def){
  return {
    uid: 'inv_' + Math.random().toString(16).slice(2) + Date.now().toString(16),
    id: def.id,
    name: def.name,
    type: def.type,
    slot: def.slot || null,
    price: def.price,
    desc: def.desc,
    effects: def.effects || {},
    equipped: false,
    boughtAt: Date.now(),
  };
}

const SAVE_KEY = 'gcs_save_v101';
  const $ = (sel, root=document) => root.querySelector(sel);

  const app = $('#app');
  const verPill = $('#verPill');
  verPill.textContent = 'v' + VERSION;
  document.title = 'Gridiron Career Sim v' + VERSION;

  // ---------- Data ----------
  const POSITIONS = [
    { id:'QB', name:'Quarterback' },
    { id:'RB', name:'Running Back' },
    { id:'WR', name:'Wide Receiver' },
    { id:'CB', name:'Cornerback' },
    { id:'LB', name:'Linebacker' },
  ];

  const STYLES = {
    QB: [
      { id:'Pocket', name:'Pocket Passer', desc:'High throw power & accuracy focus.' },
      { id:'Dual', name:'Dual Threat', desc:'Balanced passing + speed.' },
      { id:'Gunslinger', name:'Gunslinger', desc:'Max throw power, more volatility.' },
    ],
    RB: [
      { id:'Power', name:'Power Back', desc:'Break tackles, grind yards.' },
      { id:'Speed', name:'Speed Back', desc:'Hit the edge, big plays.' },
      { id:'All', name:'All-Purpose', desc:'Balanced runner + hands.' },
    ],
    WR: [
      { id:'Route', name:'Route Technician', desc:'Separation & hands.' },
      { id:'Deep', name:'Deep Threat', desc:'Speed, explosive plays.' },
      { id:'Poss', name:'Possession', desc:'Reliable catches, chains.' },
    ],
    CB: [
      { id:'Lock', name:'Lockdown', desc:'Coverage & instincts.' },
      { id:'Ball', name:'Ball Hawk', desc:'Plays on the ball, picks.' },
      { id:'Speed', name:'Speed Corner', desc:'Recovery speed & agility.' },
    ],
    LB: [
      { id:'Field', name:'Field General', desc:'Instincts, tackling, leadership.' },
      { id:'Blitz', name:'Blitzer', desc:'Pass rush impact.' },
      { id:'Coverage', name:'Coverage', desc:'Athletic in space.' },
    ],
  };

  const JOBS = [
    { id:'grocery', name:'Grocery Bagger', weeklyPay:110, weeklyHours:6, note:'Easy money. Steady schedule.' },
    { id:'barista', name:'Coffee Shop Barista', weeklyPay:150, weeklyHours:8, note:'Slightly better pay. Busy shifts.' },
    { id:'lifeguard', name:'Community Pool Lifeguard', weeklyPay:175, weeklyHours:9, note:'Seasonal vibes. Requires energy.' },
    { id:'tutor', name:'Math Tutor', weeklyPay:200, weeklyHours:7, note:'Best pay. More mental strain.' },
    { id:'none', name:'No Job', weeklyPay:0, weeklyHours:0, note:'More time for training & rest.' },
  ];

  const ACTIONS = [
    {
      id:'train',
      name:'Train',
      desc:'Earn XP from drills and film work.',
      energyPerHour: 12,
      hoursPerHour: 1,
      xpPerHour: 28,
      moneyPerHour: 0,
      prepPerHour: 2,
    },
    {
      id:'rest',
      name:'Rest',
      desc:'Restore energy. A good week starts with recovery.',
      energyPerHour: -18, // negative cost = restore
      hoursPerHour: 1,
      xpPerHour: 6,
      moneyPerHour: 0,
      prepPerHour: 1,
    },
    {
      id:'study',
      name:'Study Playbook',
      desc:'Earn XP and improve game readiness.',
      energyPerHour: 8,
      hoursPerHour: 1,
      xpPerHour: 18,
      moneyPerHour: 0,
      prepPerHour: 6,
    },
  ];

  // ---------- State ----------
  function defaultState(){
    return {
      meta: { version: VERSION, createdAt: Date.now() },
      character: null, // filled after creation
      career: {
        stage: 'HS',
        year: 1,
        week: 1, // 1..15 (12 reg + up to 3 post)
        regSeasonWeeks: 12,
        postSeasonMax: 3,
        postseason: { active:false, round:0, eliminated:false },
        record: { w:0, l:0 },
        money: 250,
        energy: 100,
        energyMax: 100,
        hours: 25,
        hoursMax: 25,
        xp: 0,
        level: 1,
        xpToNext: 300,
        skillPoints: 0,
        stats: {
          throwPower: 70,
          accuracy: 70,
          speed: 70,
          tackling: 70,
          hands: 70,
        },
        prep: 0, // 0..100 used as small bonus in games
        jobId: 'none',
        inventory: [],
        equipment: { head:null, body:null, hands:null, feet:null, accessory:null },
        log: [],
        games: [], // per year history summary
      }
    };
  }

  function statCaps(){ return { min: 40, max: 99 }; }

  // ---------- Save / Load ----------
  function save(state){
    try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch(e){ /* ignore */ }
  }
  function load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return null;
      const s = JSON.parse(raw);
      return s;
    }catch(e){ return null; }
  }

  function pushLog(s, type, strong, text){
    s.career.log.unshift({
      t: Date.now(),
      type, strong, text
    });
    s.career.log = s.career.log.slice(0, 60);
  }

  // ---------- Helpers ----------
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function fmt(n){ return n.toLocaleString(); }
  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  function choice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function positionKeyStat(pos){
    switch(pos){
      case 'QB': return ['throwPower','accuracy','speed'];
      case 'RB': return ['speed','hands','tackling']; // tackling as toughness surrogate
      case 'WR': return ['hands','speed','accuracy']; // accuracy as route/tech proxy
      case 'CB': return ['speed','hands','tackling'];
      case 'LB': return ['tackling','speed','hands'];
      default: return ['speed','hands','tackling'];
    }
  }

  function overall(s){
    const keys = positionKeyStat(s.character.position);
    const st = effectiveStats(s);
    const base = (st[keys[0]] + st[keys[1]] + st[keys[2]]) / 3;
    // small level effect
    const lvl = s.career.level;
    return clamp(Math.round(base + Math.min(8, (lvl-1)*0.6)), 40, 99);
  }


  function getEquippedItems(s){
    const inv = s?.career?.inventory || [];
    const eq = s?.career?.equipment || {};
    const out = [];
    for(const slot of Object.keys(eq)){
      const uid = eq[slot];
      if(!uid) continue;
      const it = inv.find(x => x.uid === uid);
      if(it) out.push(it);
    }
    return out;
  }

  function applyEquipmentToStats(s, baseStats){
    const stats = { ...baseStats };
    for(const it of getEquippedItems(s)){
      const bonus = (it.effects && it.effects.stats) ? it.effects.stats : {};
      for(const [k,v] of Object.entries(bonus)){
        if(typeof stats[k] === 'number') stats[k] += v;
      }
    }
    // clamp to caps
    const caps = statCaps();
    for(const k of Object.keys(stats)){
      if(typeof stats[k] === 'number') stats[k] = clamp(stats[k], caps.min, caps.max);
    }
    return stats;
  }

  function effectiveStats(s){
    return applyEquipmentToStats(s, s.career.stats);
  }

  function updateXp(s, add){
    if(add <= 0) return;
    s.career.xp += add;
    let leveled = false;
    while(s.career.xp >= s.career.xpToNext){
      s.career.xp -= s.career.xpToNext;
      s.career.level += 1;
      s.career.skillPoints += 3;
      s.career.xpToNext = Math.round(s.career.xpToNext * 1.18 + 40);
      leveled = true;
    }
    if(leveled){
      pushLog(s, 'good', 'Level Up!', `You reached Level ${s.career.level}. (+3 Skill Points)`);
    }
  }

  function applyAction(s, actionId, hoursCount){
    const action = ACTIONS.find(a => a.id === actionId);
    if(!action) return;

    // Check resources
    const needHours = action.hoursPerHour * hoursCount;
    if(s.career.hours < needHours){
      pushLog(s, 'bad', 'Not enough hours', 'You are out of weekly hours. Rest or advance the week.');
      return;
    }

    const energyDelta = -action.energyPerHour * hoursCount; // convert "energyPerHour cost" into delta
    // action.energyPerHour positive means cost; negative means restore
    const newEnergy = clamp(s.career.energy - (action.energyPerHour * hoursCount), 0, s.career.energyMax);
    // BUT: if restoring (energyPerHour negative), this subtract makes +. Works.

    s.career.hours = clamp(s.career.hours - needHours, 0, s.career.hoursMax);
    s.career.energy = newEnergy;

    const xpGain = Math.max(0, Math.round(action.xpPerHour * hoursCount * (0.92 + Math.random()*0.18)));
    updateXp(s, xpGain);

    s.career.prep = clamp(s.career.prep + action.prepPerHour * hoursCount, 0, 100);

    let energyWord = action.energyPerHour >= 0 ? `-${action.energyPerHour*hoursCount} energy` : `+${Math.abs(action.energyPerHour)*hoursCount} energy`;
    pushLog(s, action.id === 'rest' ? 'good' : 'warn', action.name, `Spent ${needHours}h, ${energyWord}, earned ${xpGain} XP.`);
  }

  function setJob(s, jobId){
    const job = JOBS.find(j => j.id === jobId);
    if(!job) return;
    s.career.jobId = jobId;
    pushLog(s, 'warn', 'Job Updated', `You are now working as: ${job.name} (${job.weeklyHours}h/week, $${job.weeklyPay}/week).`);
  }

  function weeklyReset(s){
    // Auto job deduction + pay
    const job = JOBS.find(j => j.id === s.career.jobId) || JOBS.find(j => j.id === 'none');
    const beforeHours = s.career.hoursMax;
    s.career.hours = s.career.hoursMax;

    // Deduct job hours immediately for the week (recurring)
    s.career.hours = clamp(s.career.hours - job.weeklyHours, 0, s.career.hoursMax);
    s.career.money += job.weeklyPay;

    // Partial energy recharge each week (+35% of missing)
    const missing = s.career.energyMax - s.career.energy;
    const recharge = Math.round(missing * 0.35);
    s.career.energy = clamp(s.career.energy + recharge, 0, s.career.energyMax);

    // Prep decays slightly each week
    s.career.prep = clamp(Math.round(s.career.prep * 0.72), 0, 100);

    if(job.weeklyPay > 0){
      pushLog(s, 'good', 'Payday', `Job: ${job.name}. Earned $${job.weeklyPay}. Job hours auto-used: ${job.weeklyHours}h.`);
    }
    pushLog(s, 'warn', 'New Week', `Energy partially recharged (+${recharge}). Weekly hours reset (${beforeHours}h).`);
  }

  function isGameWeek(s){
    // Games every regular season week 1..12
    // Postseason games if active and not eliminated, up to 3 rounds.
    const c = s.career;
    if(c.week <= c.regSeasonWeeks) return true;
    if(c.postseason.active && !c.postseason.eliminated && c.postseason.round < c.postSeasonMax) return true;
    return false;
  }

  function weekLabel(s){
    const c = s.career;
    if(c.week <= c.regSeasonWeeks) return `Week ${c.week}/${c.regSeasonWeeks}`;
    if(c.postseason.active){
      const r = c.postseason.round + 1;
      return `Postseason — Game ${r}/${c.postSeasonMax}`;
    }
    return `Offseason`;
  }

  function simulateGame(s){
    const c = s.career;
    const ovr = overall(s);
    const opp = clamp(62 + (c.year-1)*3 + randInt(-6, 9), 55, 95);

    // Prep, energy affect performance
    const prepBonus = (c.prep/100) * 6; // up to +6
    const energyPenalty = (1 - (c.energy / c.energyMax)) * 10; // up to -10
    const variance = randInt(-8, 8);

    const playerPower = ovr + prepBonus - energyPenalty + variance;
    const oppPower = opp + randInt(-6, 6);

    const win = playerPower >= oppPower;

    // Scorelines
    const base = 14 + Math.round((playerPower + oppPower)/10);
    const spread = Math.round((playerPower - oppPower)/2);
    const myScore = clamp(base + spread + randInt(-7, 7), 7, 63);
    const theirScore = clamp(base - spread + randInt(-7, 7), 7, 63);

    // Ensure no ties
    let ms = myScore, ts = theirScore;
    if(ms === ts){
      if(win) ms += 3; else ts += 3;
    }

    // XP based on performance and opponent
    const perf = win ? 1.1 : 0.9;
    const difficulty = 0.85 + (opp/100)*0.5; // ~1.1-1.35
    const xp = Math.round((55 + randInt(0, 35)) * perf * difficulty);

    updateXp(s, xp);

    // Energy cost for game
    const gameEnergyCost = 22 + randInt(0, 12);
    c.energy = clamp(c.energy - gameEnergyCost, 0, c.energyMax);

    // Record
    if(win) c.record.w += 1; else c.record.l += 1;

    // Log
    const label = (c.week <= c.regSeasonWeeks) ? `Game — ${weekLabel(s)}` : `Game — ${weekLabel(s)}`;
    pushLog(s, win ? 'good' : 'bad', label, `vs Opponent (OVR ${opp}) — ${win?'W':'L'} ${ms}-${ts}. (+${xp} XP, -${gameEnergyCost} energy)`);

    // Store history
    c.games.unshift({
      year: c.year,
      week: c.week,
      postseason: c.week > c.regSeasonWeeks,
      oppOvr: opp,
      win,
      scoreFor: ms,
      scoreAgainst: ts,
      xp
    });
    c.games = c.games.slice(0, 60);

    return { win, oppOvr: opp, scoreFor: ms, scoreAgainst: ts, xp };
  }

  function startPostseasonIfEligible(s){
    const c = s.career;
    if(c.postseason.active || c.postseason.eliminated) return;
    const wins = c.record.w;
    // Simple rule: 8+ wins makes playoffs.
    if(wins >= 8){
      c.postseason.active = true;
      c.postseason.round = 0;
      c.postseason.eliminated = false;
      pushLog(s, 'good', 'Playoffs!', `You made the postseason. Up to ${c.postSeasonMax} playoff games.`);
    }else{
      pushLog(s, 'warn', 'Season Over', 'No playoffs this year. Train harder and come back next season.');
    }
  }

  function finishYearAndAdvance(s){
    const c = s.career;
    // Summary
    pushLog(s, 'warn', `Year ${c.year} Complete`, `Final record: ${c.record.w}-${c.record.l}.`);
    c.year += 1;
    c.week = 1;
    c.record = { w:0, l:0 };
    c.postseason = { active:false, round:0, eliminated:false };
    // Small offseason boost
    c.energy = clamp(c.energy + 25, 0, c.energyMax);
    c.prep = 0;

    weeklyReset(s);

    if(c.year > 4){
      // College commitment prompt
      showCollegeCommit(s);
    }else{
      pushLog(s, 'good', 'New Season', `Welcome to High School Year ${c.year}.`);
      render(s);
    }
  }

  function advanceWeek(s){
    const c = s.career;

    // If it's a game week and user hasn't played, require play? We'll allow advance but it counts as sim game.
    if(isGameWeek(s)){
      simulateGame(s);

      // Advance timeline
      if(c.week <= c.regSeasonWeeks){
        c.week += 1;
        if(c.week === c.regSeasonWeeks + 1){
          // End of regular season reached
          startPostseasonIfEligible(s);
        }
      }else if(c.postseason.active){
        c.postseason.round += 1;
        // Each postseason game happens on the same "week slot" after reg season
        // If lost, eliminated
        const last = c.games[0];
        if(last && last.postseason && !last.win){
          c.postseason.eliminated = true;
          c.postseason.active = false;
          pushLog(s, 'bad', 'Eliminated', 'Your season ends in the playoffs.');
        }else if(c.postseason.round >= c.postSeasonMax){
          c.postseason.active = false;
          pushLog(s, 'good', 'Championship!', 'You survived the postseason run. Massive momentum next year.');
        }
      }

      // If regular season over and postseason not active, year ends now.
      if(c.week === c.regSeasonWeeks + 1 && !c.postseason.active){
        finishYearAndAdvance(s);
        save(s);
        return;
      }

      // If postseason ended (either eliminated or completed), year ends.
      if(c.week > c.regSeasonWeeks && !c.postseason.active){
        finishYearAndAdvance(s);
        save(s);
        return;
      }
    }else{
      // Offseason week (not really used in v1, but safe)
      c.week += 1;
    }

    // Weekly reset resources
    weeklyReset(s);
    save(s);
    render(s);
  }

  function spendSkill(s, statKey){
    const caps = statCaps();
    const st = s.career.stats;
    if(s.career.skillPoints <= 0) return;
    if(!(statKey in st)) return;
    if(st[statKey] >= caps.max) return;
    s.career.skillPoints -= 1;
    st[statKey] = clamp(st[statKey] + 1, caps.min, caps.max);
    pushLog(s, 'good', 'Skill Improved', `${prettyStat(statKey)} increased to ${st[statKey]}.`);
    save(s);
    render(s);
  }

  function prettyStat(k){
    return k.replace(/([A-Z])/g,' $1').replace(/^./, m => m.toUpperCase());
  }

  // ---------- Modal ----------
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const modalFoot = $('#modalFoot');

  function openModal({ title, bodyHTML, footHTML }){
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modalFoot.innerHTML = footHTML || '<button class="btn" value="ok">OK</button>';
    modal.showModal();
  }

  function showCollegeCommit(s){
    const ovr = overall(s);
    const tier = (ovr >= 92) ? 'Elite' : (ovr >= 84) ? 'Great' : (ovr >= 76) ? 'Solid' : 'Project';
    const schools = buildSchoolOptions(ovr);

    const rows = schools.map(sc => `
      <tr>
        <td><strong>${sc.name}</strong><div class="muted">${sc.type}</div></td>
        <td>⭐ ${sc.stars}</td>
        <td>${sc.pitch}</td>
        <td style="text-align:right"><button class="btn small" data-commit="${sc.name}">Commit</button></td>
      </tr>
    `).join('');

    openModal({
      title: 'College Commitment',
      bodyHTML: `
        <div class="muted">High school is complete. Your overall is <strong>${ovr}</strong> (${tier}). Choose a college to commit to.</div>
        <table class="table">
          <thead><tr><th>School</th><th>Offer</th><th>Pitch</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="help">This is the end of v1 (college+pro coming later). Your choice is saved.</div>
      `,
      footHTML: `<button class="btn ghost" value="cancel">Close</button>`
    });

    // Wire commit buttons
    modalBody.querySelectorAll('[data-commit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.getAttribute('data-commit');
        s.career.collegeCommit = name;
        pushLog(s, 'good', 'Committed!', `You committed to ${name}. (End of demo)`);
        s.career.stage = 'END';
        save(s);
        modal.close();
        render(s);
      });
    });
  }

  function buildSchoolOptions(ovr){
    const pool = [
      { name:'North Valley State', type:'Power Conference', pitch:'Immediate playing time and big-stage games.' },
      { name:'Coastal Tech', type:'Power Conference', pitch:'High-octane offense and national spotlight.' },
      { name:'Midland University', type:'Power Conference', pitch:'Pro-style development and strong boosters.' },
      { name:'Pine Ridge College', type:'Group of 5', pitch:'Be the face of the program and break records.' },
      { name:'River City U', type:'Group of 5', pitch:'Fast tempo and a coach who believes in you.' },
      { name:'Ironwood College', type:'FCS', pitch:'Build a legacy and lead the turnaround.' },
      { name:'Lakeshore Institute', type:'FCS', pitch:'Scholarship offer and a great support system.' },
    ];

    // Stars based on ovr
    function starsFor(o){
      if(o >= 93) return 5;
      if(o >= 86) return 4;
      if(o >= 78) return 3;
      if(o >= 70) return 2;
      return 1;
    }
    const stars = starsFor(ovr);

    // pick 5 relevant
    const sorted = pool.slice().sort((a,b) => (b.type.localeCompare(a.type)));
    let picks;
    if(stars >= 5) picks = [pool[1], pool[0], pool[2], pool[3], pool[4]];
    else if(stars === 4) picks = [pool[0], pool[2], pool[1], pool[3], pool[4]];
    else if(stars === 3) picks = [pool[3], pool[4], pool[0], pool[5], pool[6]];
    else picks = [pool[4], pool[5], pool[6], pool[3], pool[0]];

    return picks.map(p => ({...p, stars}));
  }

  // ---------- UI ----------
  function render(s){
    if(!s || !s.character){
      renderCreate();
      return;
    }
    if(s.career.stage === 'END'){
      renderEnd(s);
      return;
    }
    renderDashboard(s);
  }

  function renderCreate(){
    const posOptions = POSITIONS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    app.innerHTML = `
      <div class="grid2">
        <section class="card">
          <h2>Create Your Player</h2>
          <div class="muted">Choose a name, position, style, and your high school. Then start your 4-year journey.</div>
          <hr class="sep" />
          <div class="form" id="createForm">
            <div class="field">
              <label>Player Name</label>
              <input id="cName" placeholder="e.g., Kenny McEachin" maxlength="26" />
              <div class="help">This will show in your career header and logs.</div>
            </div>
            <div class="twoCol">
              <div class="field">
                <label>Position</label>
                <select id="cPos">${posOptions}</select>
              </div>
              <div class="field">
                <label>Style</label>
                <select id="cStyle"></select>
              </div>
            </div>
            <div class="field">
              <label>High School Name</label>
              <input id="cSchool" placeholder="e.g., Lake Wales High" maxlength="32" />
            </div>
            <div class="row">
              <button class="btn" id="btnStart">Start Career</button>
              <span class="muted">High school: 4 years • 12 regular season games • up to 3 postseason games/year</span>
            </div>
          </div>
        </section>

        <section class="card">
          <h2>How it Works</h2>
          <div class="list">
            <div class="logline"><span class="dot good"></span><div class="txt"><strong>Each week</strong> you have Hours and Energy. Training/Study costs energy & hours. Rest restores energy.</div></div>
            <div class="logline"><span class="dot warn"></span><div class="txt"><strong>Part-time job</strong> pays weekly and auto-uses hours every week (set it and forget it).</div></div>
            <div class="logline"><span class="dot good"></span><div class="txt"><strong>Games</strong> happen weekly during the season. Performance is influenced by overall, prep, and energy.</div></div>
            <div class="logline"><span class="dot warn"></span><div class="txt"><strong>XP & Level</strong> — earn XP from games and training. Level ups grant skill points to spend.</div></div>
            <div class="logline"><span class="dot good"></span><div class="txt"><strong>After Year 4</strong> you will commit to a college (end of v1).</div></div>
          </div>
        </section>
      </div>
    `;

    const posSel = $('#cPos');
    const styleSel = $('#cStyle');
    const syncStyles = () => {
      const pos = posSel.value;
      const styles = (STYLES[pos] || []).map(st => `<option value="${st.id}">${st.name}</option>`).join('');
      styleSel.innerHTML = styles;
    };
    posSel.addEventListener('change', syncStyles);
    syncStyles();

    $('#btnStart').addEventListener('click', (e) => {
      e.preventDefault();
      const name = ($('#cName').value || '').trim();
      const hs = ($('#cSchool').value || '').trim();
      const pos = posSel.value;
      const style = styleSel.value;

      if(name.length < 2 || hs.length < 2){
        openModal({
          title:'Missing info',
          bodyHTML:`<div class="muted">Please enter a <strong>Player Name</strong> and <strong>High School Name</strong>.</div>`,
          footHTML:`<button class="btn" value="ok">Got it</button>`
        });
        return;
      }

      const s = defaultState();
      s.character = { name, position: pos, style, highschool: hs };

      // Style-based starting stats tweaks
      applyStyleBonus(s);

      pushLog(s, 'good', 'Career Started', `${name} begins at ${hs} as a ${pos} (${style}).`);
      weeklyReset(s);
      save(s);
      render(s);
    });
  }

  function applyStyleBonus(s){
    const pos = s.character.position;
    const style = s.character.style;
    const st = s.career.stats;

    function bump(key, val){ st[key] = clamp(st[key] + val, 40, 99); }

    if(pos === 'QB'){
      if(style === 'Pocket'){ bump('accuracy', 4); bump('throwPower', 2); bump('speed', -2); }
      if(style === 'Dual'){ bump('speed', 4); bump('accuracy', 1); }
      if(style === 'Gunslinger'){ bump('throwPower', 6); bump('accuracy', -2); }
    }else if(pos === 'RB'){
      if(style === 'Power'){ bump('tackling', 4); bump('speed', -1); }
      if(style === 'Speed'){ bump('speed', 6); bump('hands', -1); }
      if(style === 'All'){ bump('hands', 3); bump('speed', 2); }
    }else if(pos === 'WR'){
      if(style === 'Route'){ bump('accuracy', 4); bump('hands', 2); }
      if(style === 'Deep'){ bump('speed', 6); bump('hands', -1); }
      if(style === 'Poss'){ bump('hands', 5); bump('speed', -1); }
    }else if(pos === 'CB'){
      if(style === 'Lock'){ bump('accuracy', 2); bump('tackling', 2); }
      if(style === 'Ball'){ bump('hands', 4); bump('accuracy', 1); }
      if(style === 'Speed'){ bump('speed', 6); bump('tackling', -1); }
    }else if(pos === 'LB'){
      if(style === 'Field'){ bump('tackling', 3); bump('accuracy', 2); }
      if(style === 'Blitz'){ bump('tackling', 2); bump('throwPower', 1); bump('speed', 2); }
      if(style === 'Coverage'){ bump('speed', 4); bump('hands', 2); }
    }
  }

  function renderEnd(s){
    const c = s.career;
    app.innerHTML = `
      <section class="card">
        <h2>End of v1 (High School Complete)</h2>
        <div class="muted">
          <strong>${s.character.name}</strong> finished high school at <strong>${s.character.highschool}</strong> and committed to
          <strong>${c.collegeCommit || 'a college'}</strong>.
        </div>
        <hr class="sep" />
        <div class="kpi">
          <div class="chip"><div class="label">Final Overall</div><div class="value">${overall(s)}</div></div>
          <div class="chip"><div class="label">Level</div><div class="value">${c.level}</div></div>
          <div class="chip"><div class="label">Money</div><div class="value">$${fmt(c.money)}</div></div>
        </div>
        <div class="section">
          <button class="btn" id="btnSeeLog">View Career Log</button>
        </div>
      </section>
    `;
    $('#btnSeeLog').addEventListener('click', () => openLogModal(s));
  }

  function renderDashboard(s){
    const c = s.career;
    const ovr = overall(s);
    const job = JOBS.find(j => j.id === c.jobId) || JOBS.find(j => j.id === 'none');

    const energyPct = Math.round((c.energy / c.energyMax) * 100);
    const hoursPct = Math.round((c.hours / c.hoursMax) * 100);
    const xpPct = Math.round((c.xp / c.xpToNext) * 100);

    const gameStatus = isGameWeek(s)
      ? `<span class="badge">🏟️ Game Week</span> <span class="muted">Opponent OVR is revealed when you play.</span>`
      : `<span class="badge">🧊 Offseason</span> <span class="muted">No game this week.</span>`;

    const actionCards = ACTIONS.map(a => {
      const costE = a.energyPerHour >= 0 ? `-${a.energyPerHour}/h` : `+${Math.abs(a.energyPerHour)}/h`;
      const costH = `${a.hoursPerHour}/h`;
      const per = a.id === 'rest' ? 'good' : 'warn';
      return `
        <div class="action">
          <div class="name">${a.name}</div>
          <div class="desc">${a.desc}</div>
          <div class="costs">
            <span class="badge">⚡ ${costE} energy</span>
            <span class="badge">⏱️ ${costH} hours</span>
            <span class="badge">✨ ~${a.xpPerHour}/h XP</span>
          </div>
          <div class="btnrow">
            <button class="btn small" data-act="${a.id}" data-h="1">1 hour</button>
            <button class="btn small" data-act="${a.id}" data-h="2">2 hours</button>
            <button class="btn small" data-act="${a.id}" data-h="3">3 hours</button>
          </div>
        </div>
      `;
    }).join('');

    const jobRows = JOBS.filter(j => j.id !== 'none').map(j => `
      <tr>
        <td><strong>${j.name}</strong><div class="muted">${j.note}</div></td>
        <td>${j.weeklyHours}h/week</td>
        <td>$${j.weeklyPay}/week</td>
        <td style="text-align:right">
          <button class="btn small" data-job="${j.id}">Choose</button>
        </td>
      </tr>
    `).join('');

    const logHTML = c.log.slice(0, 18).map(x => `
      <div class="logline">
        <span class="dot ${x.type}"></span>
        <div class="txt"><strong>${x.strong}</strong><div>${x.text}</div></div>
      </div>
    `).join('') || `<div class="muted">No events yet.</div>`;

    const stats = c.stats;
    const statKeys = Object.keys(stats);
    const skillRows = statKeys.map(k => {
      const val = stats[k];
      const cap = 99;
      const can = c.skillPoints > 0 && val < cap;
      return `
        <tr>
          <td><strong>${prettyStat(k)}</strong></td>
          <td>${val}</td>
          <td style="text-align:right">
            <button class="btn small" ${can ? '' : 'disabled'} data-skill="${k}">+1</button>
          </td>
        </tr>
      `;
    }).join('');

    app.innerHTML = `
      <div class="grid2">
        <section class="card">
          <div class="row space">
            <div>
              <h2>${s.character.highschool} — High School Year ${c.year}</h2>
              <div class="muted">${weekLabel(s)} • Record ${c.record.w}-${c.record.l} • ${gameStatus}</div>
            </div>
            <div class="kpi">
              <div class="chip"><div class="label">Money</div><div class="value">$${fmt(c.money)}</div></div>
              <div class="chip"><div class="label">OVR</div><div class="value">${ovr}</div></div>
              <div class="chip"><div class="label">Level</div><div class="value">${c.level}</div></div>
              <div class="chip"><div class="label">XP</div><div class="value">${c.xp}/${c.xpToNext}</div></div>
              <div class="chip"><div class="label">Skill Pts</div><div class="value">${c.skillPoints}</div></div>
            </div>
          </div>

          <div class="bars">
            <div class="bar">
              <div class="name">Energy</div>
              <div class="track"><div class="fill" style="width:${energyPct}%"></div></div>
              <div class="num">${c.energy}/${c.energyMax}</div>
            </div>
            <div class="bar">
              <div class="name">Hours Left</div>
              <div class="track"><div class="fill" style="width:${hoursPct}%"></div></div>
              <div class="num">${c.hours}/${c.hoursMax}</div>
            </div>
            <div class="bar">
              <div class="name">XP to Level</div>
              <div class="track"><div class="fill" style="width:${xpPct}%"></div></div>
              <div class="num">${xpPct}%</div>
            </div>
          </div>

          <div class="section">
            <div class="row space">
              <h2 style="margin:0">Weekly Actions</h2>
              <div class="row">
                <button class="btn" id="btnPlayGame">${isGameWeek(s) ? 'Play This Week’s Game' : 'No Game This Week'}</button>
                <button class="btn ghost" id="btnAdvance">Advance Week</button>
              </div>
            </div>
            <div class="muted">Training earns XP (no more “overall points”). Rest restores energy. Study builds prep for games.</div>
            <div class="actions">${actionCards}</div>
          </div>
        </section>

        <aside class="card">
          <h2>Skills & Job</h2>
          <div class="muted">Spend skill points from leveling up. Choose a job to earn weekly pay (auto-deducts hours each week).</div>
          <hr class="sep" />
          <div class="row space">
            <div>
              <div class="muted">Current Job</div>
              <div style="font-weight:900">${job.name}</div>
              <div class="muted">Auto: ${job.weeklyHours}h/week • +$${job.weeklyPay}/week</div>
            </div>
            <button class="btn ghost" id="btnJobs">Change Job</button>
          </div>

          <hr class="sep" />
          <div class="row space">
            <div>
              <div class="muted">Skill Points</div>
              <div style="font-weight:900; font-size:20px">${c.skillPoints}</div>
            </div>
            <div class="row" style="gap:8px">
              <button class="btn ghost" id="btnSkills">Open Skills</button>
              <button class="btn ghost" id="btnStore">Store</button>
              <button class="btn ghost" id="btnInv">Inventory</button>
            </div>
          </div>

          <div class="section">
            <h2>Game Log</h2>
            <div class="list" id="logList">${logHTML}</div>
            <div class="row">
              <button class="btn ghost" id="btnLogAll">View All</button>
            </div>
          </div>
        </aside>
      </div>
    `;

    // Wire actions
    app.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.getAttribute('data-act');
        const h = parseInt(btn.getAttribute('data-h'), 10);
        applyAction(s, act, h);
        save(s);
        render(s);
      });
    });

    $('#btnAdvance').addEventListener('click', () => advanceWeek(s));

    $('#btnPlayGame').addEventListener('click', () => {
      if(!isGameWeek(s)){
        pushLog(s, 'warn', 'No Game', 'There is no scheduled game this week.');
        save(s);
        render(s);
        return;
      }
      // Playing game consumes the week immediately (and then resets week resources)
      // We'll simulate and then call advanceWeek but without simulating twice:
      // We'll temporarily simulate here and then do the rest of advance.
      // For simplicity: just call advanceWeek(s) which simulates.
      advanceWeek(s);
    });

    $('#btnJobs').addEventListener('click', () => openJobsModal(s, jobRows));
    $('#btnSkills').addEventListener('click', () => openSkillsModal(s, statKeys, skillRows));
    $('#btnStore').addEventListener('click', () => openStoreModal(s));
    $('#btnInv').addEventListener('click', () => openInventoryModal(s));
    $('#btnLogAll').addEventListener('click', () => openLogModal(s));
  }

  function openJobsModal(s, jobRows){
    const current = JOBS.find(j => j.id === s.career.jobId) || JOBS.find(j => j.id === 'none');
    openModal({
      title: 'Choose a Part-time Job',
      bodyHTML: `
        <div class="muted">Your current job is <strong>${current.name}</strong>. Jobs pay weekly and automatically use hours each week.</div>
        <table class="table">
          <thead><tr><th>Job</th><th>Hours</th><th>Pay</th><th></th></tr></thead>
          <tbody>
            ${jobRows}
            <tr>
              <td><strong>No Job</strong><div class="muted">Keep all your hours for football.</div></td>
              <td>0h/week</td><td>$0/week</td>
              <td style="text-align:right"><button class="btn small" data-job="none">Choose</button></td>
            </tr>
          </tbody>
        </table>
      `,
      footHTML: `<button class="btn ghost" value="cancel">Close</button>`
    });

    modalBody.querySelectorAll('[data-job]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-job');
        setJob(s, id);
        save(s);
        modal.close();
        render(s);
      });
    });
  }

  function openSkillsModal(s, statKeys, skillRows){
    openModal({
      title: 'Skills',
      bodyHTML: `
        <div class="muted">Spend skill points to improve your attributes (cap 99). Overall (OVR) is derived from key stats for your position.</div>
        <hr class="sep" />
        <div class="row space">
          <div><div class="muted">Available Skill Points</div><div style="font-weight:900; font-size:20px">${s.career.skillPoints}</div></div>
          <div class="muted">Position: <strong>${s.character.position}</strong></div>
        </div>
        <table class="table">
          <thead><tr><th>Attribute</th><th>Value</th><th></th></tr></thead>
          <tbody>${skillRows}</tbody>
        </table>
      `,
      footHTML:`<button class="btn ghost" value="cancel">Close</button>`
    });

    modalBody.querySelectorAll('[data-skill]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const k = btn.getAttribute('data-skill');
        spendSkill(s, k);
        // re-open updated modal
        modal.close();
        openSkillsModal(s, statKeys, statKeys.map(sk => {
          const val = s.career.stats[sk];
          const can = s.career.skillPoints > 0 && val < 99;
          return `
            <tr>
              <td><strong>${prettyStat(sk)}</strong></td>
              <td>${val}</td>
              <td style="text-align:right"><button class="btn small" ${can ? '' : 'disabled'} data-skill="${sk}">+1</button></td>
            </tr>`;
        }).join(''));
      });
    });
  }

  

function buyStoreItem(itemId){
  const def = STORE_ITEMS.find(x=>x.id===itemId);
  if(!def) return;
  if(state.career.money < def.price){
    toast('Not enough money.');
    return;
  }
  state.career.money -= def.price;
  state.career.inventory.push(makeInvItem(def));
  log(`Purchased ${def.name} for $${def.price}.`);
  save();
  render();
  openStoreModal(state);
}

function equippedUidInSlot(slot){
  return (state.career.equipment && state.career.equipment[slot]) || null;
}

function setEquip(slot, uid){
  if(!state.career.equipment) state.career.equipment = { head:null, body:null, hands:null, feet:null, accessory:null };
  // un-equip current
  const cur = state.career.equipment[slot];
  if(cur){
    const curItem = state.career.inventory.find(it=>it.uid===cur);
    if(curItem) curItem.equipped = false;
  }
  state.career.equipment[slot] = uid;
  const it = state.career.inventory.find(it=>it.uid===uid);
  if(it) it.equipped = true;
}

function useInventory(uid){
  const inv = state.career.inventory || [];
  const idx = inv.findIndex(it=>it.uid===uid);
  if(idx<0) return;
  const it = inv[idx];
  if(it.type==='consumable'){
    applyItemEffects(it.effects);
    inv.splice(idx,1);
    log(`Used ${it.name}.`);
    save();
    render();
    openInventoryModal(state);
    return;
  }
  toast('That item cannot be used. Try equipping it.');
}

function toggleEquip(uid){
  const inv = state.career.inventory || [];
  const it = inv.find(x=>x.uid===uid);
  if(!it) return;
  if(it.type!=='gear') return;
  const slot = it.slot || 'accessory';
  const cur = equippedUidInSlot(slot);
  if(cur===uid){
    // unequip
    state.career.equipment[slot]=null;
    it.equipped=false;
  } else {
    setEquip(slot, uid);
  }
  log(`${it.equipped ? 'Equipped' : 'Unequipped'} ${it.name}.`);
  save();
  render();
  openInventoryModal(state);
}

function applyItemEffects(effects){
  if(!effects) return;
  if(typeof effects.energy==='number') state.career.energy = clamp(state.career.energy + effects.energy, 0, state.career.maxEnergy);
  if(typeof effects.hours==='number') state.career.hoursLeft = clamp(state.career.hoursLeft + effects.hours, 0, state.career.maxHours);
  if(effects.stats){
    const st = state.career.stats;
    for(const [k,v] of Object.entries(effects.stats)){
      if(typeof st[k]==='number') st[k] = clamp(st[k] + v, 40, 99);
    }
  }
}

function openStoreModal(s){
  const rows = STORE_ITEMS.map(def => {
    const affordable = s.career.money >= def.price;
    return `
      <tr>
        <td>
          <div style="display:flex;flex-direction:column;gap:2px">
            <strong>${def.name}</strong>
            <span class="muted" style="font-size:12px">${def.desc}</span>
          </div>
        </td>
        <td style="text-align:right;white-space:nowrap">$${def.price}</td>
        <td style="text-align:right">
          <button class="btn ${affordable ? '' : 'disabled'}" data-buy="${def.id}" ${affordable ? '' : 'disabled'}>Buy</button>
        </td>
      </tr>`;
  }).join('');

  const body = `
    <div class="stack" style="gap:10px">
      <div class="row" style="justify-content:space-between;align-items:center">
        <div>
          <div class="h">Store</div>
          <div class="muted">Spend money on items that boost stats, energy, or hours.</div>
        </div>
        <div class="pill">Money: <strong>$${fmtInt(s.career.money)}</strong></div>
      </div>
      <div class="tableWrap">
        <table class="table">
          <thead><tr><th>Item</th><th style="text-align:right">Price</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3" class="muted">No items.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="row" style="justify-content:flex-end;gap:8px">
        <button class="btn ghost" id="storeGoInv">Open Inventory</button>
      </div>
    </div>`;

  openModal('store', body);
  qsa('[data-buy]').forEach(btn => btn.addEventListener('click', () => buyStoreItem(btn.getAttribute('data-buy'))));
  const goInv = qs('#storeGoInv');
  if(goInv) goInv.addEventListener('click', () => openInventoryModal(state));
}

function openInventoryModal(s){
  const inv = s.career.inventory || [];
  const eq = s.career.equipment || { head:null, body:null, hands:null, feet:null, accessory:null };
  const eqSet = new Set(Object.values(eq).filter(Boolean));

  const rows = inv.map(it => {
    const isEquipped = eqSet.has(it.uid);
    const kind = it.type==='consumable' ? 'Consumable' : `Gear${it.slot ? ' · ' + it.slot : ''}`;
    const actions = it.type==='consumable'
      ? `<button class="btn" data-use="${it.uid}">Use</button>`
      : `<button class="btn" data-equip="${it.uid}">${isEquipped ? 'Unequip' : 'Equip'}</button>`;
    return `
      <tr>
        <td>
          <div style="display:flex;flex-direction:column;gap:2px">
            <strong>${it.name}${isEquipped ? ' <span class="tag">Equipped</span>' : ''}</strong>
            <span class="muted" style="font-size:12px">${kind} · ${it.desc}</span>
          </div>
        </td>
        <td style="text-align:right">${actions}</td>
      </tr>`;
  }).join('');

  const equipSummary = ['head','body','hands','feet','accessory'].map(slot => {
    const uid = eq[slot];
    const it = inv.find(x=>x.uid===uid);
    return `<div class="chip"><span class="muted" style="text-transform:capitalize">${slot}</span> <strong>${it ? it.name : '—'}</strong></div>`;
  }).join('');

  const body = `
    <div class="stack" style="gap:10px">
      <div class="row" style="justify-content:space-between;align-items:center">
        <div>
          <div class="h">Inventory</div>
          <div class="muted">Use consumables or equip gear for permanent boosts.</div>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn ghost" id="invGoStore">Open Store</button>
        </div>
      </div>
      <div class="row" style="flex-wrap:wrap;gap:8px">${equipSummary}</div>
      <div class="tableWrap">
        <table class="table">
          <thead><tr><th>Item</th><th style="text-align:right">Action</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="2" class="muted">Inventory is empty.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;

  openModal('inventory', body);
  qsa('[data-use]').forEach(btn => btn.addEventListener('click', () => useInventory(btn.getAttribute('data-use'))));
  qsa('[data-equip]').forEach(btn => btn.addEventListener('click', () => toggleEquip(btn.getAttribute('data-equip'))));
  const goStore = qs('#invGoStore');
  if(goStore) goStore.addEventListener('click', () => openStoreModal(state));
}

function openLogModal(s){
    const items = s.career.log.slice(0, 60).map(x => {
      const d = new Date(x.t);
      const ts = d.toLocaleString();
      return `<div class="logline">
        <span class="dot ${x.type}"></span>
        <div class="txt"><strong>${x.strong}</strong><div>${x.text}</div><div class="muted" style="margin-top:4px">${ts}</div></div>
      </div>`;
    }).join('') || '<div class="muted">No log entries.</div>';

    openModal({
      title:'Career Log',
      bodyHTML:`<div class="list" style="max-height: 420px">${items}</div>`,
      footHTML:`<button class="btn ghost" value="cancel">Close</button>`
    });
  }

  // ---------- Export / Import / Reset ----------
  $('#btnReset').addEventListener('click', () => {
    openModal({
      title:'Reset Save?',
      bodyHTML:`<div class="muted">This will clear your current career. This cannot be undone.</div>`,
      footHTML:`<button class="btn danger" id="confirmReset" value="ok">Reset</button><button class="btn ghost" value="cancel">Cancel</button>`
    });
    $('#confirmReset').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(SAVE_KEY);
      modal.close();
      state = defaultState();
      render(state);
    }, { once:true });
  });

  $('#btnExport').addEventListener('click', () => {
    const s = state || defaultState();
    const data = JSON.stringify(s, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gridiron-save-v${VERSION}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 600);
  });

  $('#btnImport').addEventListener('click', async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if(!file) return;
      try{
        const text = await file.text();
        const s = JSON.parse(text);
        // Minimal validation
        if(!s || !s.career) throw new Error('Invalid save');
        localStorage.setItem(SAVE_KEY, JSON.stringify(s));
        state = s;
        pushLog(state, 'good', 'Save Imported', 'Save loaded successfully.');
        save(state);
        render(state);
      }catch(err){
        openModal({
          title:'Import failed',
          bodyHTML:`<div class="muted">That file doesn't look like a valid save.</div>`,
          footHTML:`<button class="btn" value="ok">OK</button>`
        });
      }
    });
    input.click();
  });

  // ---------- Boot ----------
  let state = load() || defaultState();

  // If save version mismatch, keep but update meta
  if(state?.meta){ state.meta.version = VERSION; }
  save(state);
  render(state);

})();
