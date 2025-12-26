
/* Football Sim v0.64 — Mini-game + seasons + forced college commit
   - Energy + Hours system (from v0.62)
   - Cheats bar (from v0.63)
   - Timed choice mini-game on game weeks
*/
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------- Utilities ----------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt = (n) => Intl.NumberFormat().format(n);

  // ---------- Progression ----------
  const xpToNext = (lvl) => 100 + (lvl - 1) * 35;

  function calcOVR(s){
    const a = s.attrs || {};
    const core = (a.speed + a.strength + a.agility + a.stamina + a.awareness) / 5;
    if (s.position === "QB"){
      return Math.round((core * 0.55) + (a.throwPower * 0.20) + (a.accuracy * 0.25));
    }
    if (s.position === "RB"){
      return Math.round((core * 0.70) + (a.catching * 0.15) + (a.awareness * 0.15));
    }
    // WR default
    return Math.round((core * 0.65) + (a.catching * 0.25) + (a.awareness * 0.10));
  }

  function gainXp(amount){
    amount = Math.max(0, Math.floor(amount));
    if (!amount) return;
    state.xp += amount;
    let leveled = 0;
    while (state.xp >= xpToNext(state.level)){
      state.xp -= xpToNext(state.level);
      state.level += 1;
      state.skillPoints += 3;
      leveled += 1;
    }
    if (leveled){
      log(`✨ Level up! You reached Level ${state.level} (+${leveled*3} skill points).`);
    }
  }

  function skillList(){
    // Show only relevant + core
    const base = ["speed","strength","agility","stamina","awareness"];
    if (state.position === "QB") return [...base, "throwPower", "accuracy"];
    if (state.position === "RB") return [...base, "catching"];
    return [...base, "catching"];
  }

  const SKILL_LABELS = {
    speed:"Speed",
    strength:"Strength",
    agility:"Agility",
    stamina:"Stamina",
    awareness:"Awareness",
    throwPower:"Throw Power",
    accuracy:"Accuracy",
    catching:"Catching",
    tackling:"Tackling",
  };

  function chanceFromDiff(my, opp){
    // Logistic-ish: ~50% at equal, steeper with 12pt scale
    const diff = my - opp;
    const p = 1 / (1 + Math.pow(10, (-diff) / 12));
    return clamp(p, 0.05, 0.95);
  }

  
  // ---------- Skills UI ----------
  function renderSkills(){
    const wrap = $("#skillsList");
    if (!wrap) return;
    wrap.innerHTML = "";
    const keys = skillList();
    keys.forEach(k=>{
      const val = state.attrs[k] ?? 0;
      const row = document.createElement("div");
      row.className = "skillRow";
      row.innerHTML = `
        <div class="skillLeft">
          <div class="skillName">${SKILL_LABELS[k] || k}</div>
          <div class="skillMeta">${k === "awareness" ? "Improves decision-making in games." : "Max 99"}</div>
        </div>
        <div class="skillRight">
          <div class="skillVal">${val}</div>
          <button class="btnTiny" data-up="${k}" ${state.skillPoints>0 && val<99 ? "" : "disabled"}>+1</button>
        </div>
      `;
      wrap.appendChild(row);
    });

    $$("#skillsList button[data-up]").forEach(b=>{
      b.onclick = ()=> {
        const k = b.dataset.up;
        if (state.skillPoints <= 0) return;
        if ((state.attrs[k]||0) >= 99) return;
        state.attrs[k] = clamp((state.attrs[k]||0) + 1, 1, 99);
        state.skillPoints -= 1;
        log(`🧠 +1 ${SKILL_LABELS[k] || k}.`);
        save();
        render();
      };
    });
  }
// ---------- Mini-game question bank ----------
  const MINI_BANK = {
    QB: [
      { q:"3rd & 6. Defense shows Cover 2. Best quick throw?", a:["Stick route to TE", "Go ball outside", "QB draw"], correct:0 },
      { q:"Blitz is coming off the edge. Your first read?", a:["Hot slant", "Deep post", "Double-move"], correct:0 },
      { q:"Goal line at the 2. Safest call?", a:["Play-action boot", "Fade to corner", "Inside zone"], correct:2 },
      { q:"You see single-high safety. Great shot play?", a:["Four verts", "HB dive", "Screen"], correct:0 },
      { q:"Your WR is jammed at the line. What helps?", a:["Back-shoulder throw", "Max protect + quick out", "Throw it away"], correct:1 },
      { q:"You’re up 3 with 1:20 left. Priority?", a:["Aggressive deep shots", "Clock + ball security", "No-huddle every play"], correct:1 },
    ],
    RB: [
      { q:"Outside zone: you see edge sealed. You…", a:["Bounce outside", "Cut back immediately", "Stop + reverse"], correct:0 },
      { q:"Inside run: linebacker shoots gap. You…", a:["Lower shoulder into pile", "Cut to daylight", "Run backward"], correct:1 },
      { q:"3rd & 3: best mindset?", a:["Hit hole fast", "Dance to find lane", "Always bounce"], correct:0 },
      { q:"Screen pass: first job?", a:["Catch + sprint", "Set up blocks patiently", "Run sideways"], correct:1 },
      { q:"Short yardage: aiming point?", a:["Outside hip of tackle", "Middle of center", "Sideline"], correct:1 },
      { q:"Two-minute drill: key?", a:["Stay in bounds", "Get out of bounds", "Run clock"], correct:1 },
    ],
    WR: [
      { q:"Cover 3 with soft corners. Great route?", a:["Hitch", "Fade", "Double post"], correct:0 },
      { q:"Man coverage with a safety over top. Better choice?", a:["Curl", "Slant with leverage", "Straight go"], correct:1 },
      { q:"You beat press at the line. Next step?", a:["Stack the DB", "Slow down", "Drift to sideline"], correct:0 },
      { q:"3rd & 2. Reliable conversion route?", a:["Quick out", "Deep corner", "Post"], correct:0 },
      { q:"Red zone tight. Best separation tool?", a:["Sharp break + body control", "Run to pylon only", "Stop running"], correct:0 },
      { q:"Blitz look pre-snap. Your adjustment?", a:["Turn it into a hot route", "Ignore it", "Change shoes"], correct:0 },
    ],
  };

  // ---------- State ----------
  const DEFAULTS = () => ({
    name: "Rookie",
    position: "QB",        // QB/RB/WR (for now)
    phase: "HS",           // HS -> COLLEGE -> PRO
    year: 1,
    week: 1,
    money: 50,

    // Progression
    level: 1,
    xp: 0,
    skillPoints: 0,

    // Core attributes (1-99)
    attrs: {
      speed: 60,
      strength: 58,
      agility: 60,
      stamina: 60,
      awareness: 55,
      throwPower: 62,      // QB-focused
      accuracy: 58,        // QB-focused
      catching: 55,        // RB/WR-focused
      tackling: 45         // placeholder (future)
    },

    energy: 100,
    hoursLeft: 25,
    seasonWins: 0,
    seasonLosses: 0,
    schedule: [],          // gen
    gameResult: null,
    log: [],
    store: { snacks: 2, energyDrink: 1 },
    cheats: { enabled: true },
    minigame: null,
  });

  let state = load() ?? DEFAULTS();
  ensureSeason();

  // ---------- Persistence ----------
  function save(){
    localStorage.setItem("footballSimState", JSON.stringify(state));
  }
  function load(){
    try{
      const raw = localStorage.getItem("footballSimState");
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }
  function reset(){
    state = DEFAULTS();
    ensureSeason();
    save();
    render();
  }

  // ---------- Season / schedule ----------
  function seasonLength(){
    if(state.phase === "PRO") return 18;  // includes bye; 17 games, 1 bye
    return 12;                            // HS/College
  }
  function weeksPerYear(){
    return seasonLength();
  }
  function opponentRange(){
    if(state.phase === "HS") return [45, 75];
    if(state.phase === "COLLEGE") return [55, 85];
    return [65, 92];
  }

  
  function ensureState(){
    const d = DEFAULTS();
    state = state || {};
    // shallow defaults
    for (const k of Object.keys(d)){
      if (state[k] === undefined) state[k] = d[k];
    }
    // attrs defaults + migration
    state.attrs = state.attrs || {};
    for (const k of Object.keys(d.attrs)){
      if (state.attrs[k] === undefined) state.attrs[k] = d.attrs[k];
    }
    // migrate legacy fields if present
    if (state.skill !== undefined){
      // map legacy "skill" into position-relevant attributes
      const s = clamp(state.skill, 1, 99);
      state.attrs.speed = clamp(state.attrs.speed + Math.round((s-60)*0.15), 1, 99);
      state.attrs.agility = clamp(state.attrs.agility + Math.round((s-60)*0.15), 1, 99);
      state.attrs.accuracy = clamp(state.attrs.accuracy + Math.round((s-60)*0.25), 1, 99);
      state.attrs.catching = clamp(state.attrs.catching + Math.round((s-60)*0.20), 1, 99);
      delete state.skill;
    }
    if (state.iq !== undefined){
      state.attrs.awareness = clamp(state.iq, 1, 99);
      delete state.iq;
    }
    // clamp attrs
    for (const k of Object.keys(state.attrs)){
      state.attrs[k] = clamp(state.attrs[k], 1, 99);
    }
    // progression sanity
    state.level = Math.max(1, Math.floor(state.level||1));
    state.xp = Math.max(0, Math.floor(state.xp||0));
    state.skillPoints = Math.max(0, Math.floor(state.skillPoints||0));
  }
function ensureSeason(){
    const len = seasonLength();
    if(!Array.isArray(state.schedule) || state.schedule.length !== len){
      const [lo, hi] = opponentRange();
      const sched = [];
      for(let w=1; w<=len; w++){
        if(state.phase==="PRO" && w===rand(6,12)){ // bye week
          sched.push({ week:w, bye:true, oppOvr:null, opp:"BYE" });
        }else{
          const oppOvr = rand(lo, hi);
          const opp = state.phase==="HS" ? pick(["Riverview HS","Pinecrest HS","Eastbrook HS","Westfield HS","Lakeside HS","Oak Ridge HS"])
                    : state.phase==="COLLEGE" ? pick(["North State","Coastal Tech","Red Valley","Metro U","Summit College","Canyon State"])
                    : pick(["Sharks","Bulls","Wolves","Knights","Tigers","Hawks","Kings"]);
          sched.push({ week:w, bye:false, oppOvr, opp });
        }
      }
      state.schedule = sched;
      state.seasonWins = 0;
      state.seasonLosses = 0;
      state.gameResolvedThisWeek = false;
      log(`New ${labelPhase()} season schedule created.`);
    }
  }

  function labelPhase(){
    if(state.phase==="HS") return `High School (Year ${state.year})`;
    if(state.phase==="COLLEGE") return `College (Year ${state.year})`;
    return `Pro (Year ${state.year})`;
  }

  // ---------- Economy / energy / hours ----------
  function weeklyRefresh(){
    // partial recharge + reset hours
    state.energy = clamp(state.energy + 35, 0, 100);
    state.hoursLeft = 25;
    state.gameResolvedThisWeek = false;
  }

  const ACTIONS = [
    { id:"train",  label:"Train",  desc:"Earn XP (then spend points on skills)", baseEnergy:12, baseHours:1,
    options:[1,2,3],
    apply:(hrs)=>{
      const xp = 20*hrs + randInt(0, 10*hrs);
      gainXp(xp);
      log(`🏋️ Trained for ${hrs}h (+${xp} XP).`);
    } },
    { id:"study",  label:"Study Playbook", desc:"Earn XP and boost your preparation", baseEnergy:8, baseHours:1,
    options:[1,2,3],
    apply:(hrs)=>{
      const xp = 15*hrs + randInt(0, 8*hrs);
      gainXp(xp);
      log(`📚 Studied for ${hrs}h (+${xp} XP).`);
    } },
    { id:"work",   label:"Part-Time Work", desc:"Earn money (and a little XP)", baseEnergy:6, baseHours:1,
    options:[1,2,3],
    apply:(hrs)=>{
      const pay = 12*hrs;
      state.money += pay;
      const xp = 5*hrs;
      gainXp(xp);
      log(`💼 Worked ${hrs}h (+$${pay}, +${xp} XP).`);
    } },
    { id:"rest",   label:"Rest", desc:"Restore energy", baseEnergy:-18, baseHours:2, apply:(hrs)=>{
      const restore = 18*hrs;
      state.energy = clamp(state.energy + restore, 0, 100);
      log(`Rested and restored +${Math.round(restore)} energy.`);
    }},
  ];

  // Store consumables (energy restore)
  const STORE = [
    { id:"snack", name:"Protein Snack", cost:15, energy:+15, desc:"+15 energy" },
    { id:"drink", name:"Energy Drink", cost:30, energy:+30, desc:"+30 energy" },
    { id:"meal",  name:"Full Meal", cost:55, energy:+55, desc:"+55 energy" },
  ];

  // ---------- Logging ----------
  function log(msg){
    state.log.unshift(`[Y${state.year} W${state.week}] ${msg}`);
    state.log = state.log.slice(0, 120);
  }

  // ---------- Game resolution ----------
  function isByeWeek(){
    if(state.phase!=="PRO") return false;
    const wk = state.schedule[state.week-1];
    return !!wk?.bye;
  }
  function isGameWeek(){
    return !isByeWeek(); // HS/College always game; PRO game unless bye
  }

  function openMiniGame(){
    const modal = $("#minigameModal");
    const timerBar = $("#mgTimerBar");
    const qEl = $("#mgQuestion");
    const aBtns = $$("#mgAnswers button");
    const status = $("#mgStatus");

    // Prepare 5 questions, shuffle
    const bank = MINI_BANK[state.position] || MINI_BANK.QB;
    const qs = [...bank].sort(()=>Math.random()-0.5).slice(0,5);

    let idx = 0;
    let points = 0;
    let tLeft = 5.0;
    let timer = null;

    function renderQ(){
      const item = qs[idx];
      qEl.textContent = `Q${idx+1}/5 — ${item.q}`;
      aBtns.forEach((b,i)=>{ b.textContent = item.a[i] ?? ""; b.dataset.choice = String(i); b.disabled = false; });
      status.textContent = `Points: ${points}`;
      tLeft = 5.0;
      timerBar.style.width = "100%";
      clearInterval(timer);
      timer = setInterval(()=>{
        tLeft -= 0.05;
        timerBar.style.width = `${clamp((tLeft/5)*100,0,100)}%`;
        if(tLeft <= 0){
          clearInterval(timer);
          // timeout: small penalty and move on
          points -= 1;
          next();
        }
      }, 50);
    }

    function next(){
      idx++;
      if(idx >= qs.length){
        clearInterval(timer);
        closeMiniGame(points);
      }else{
        renderQ();
      }
    }

    function answer(choiceIdx){
      const item = qs[idx];
      // correct = +2, wrong = 0 (no harsh punishment), but reward speed a bit
      const speedBonus = tLeft > 3.5 ? 1 : tLeft > 2.0 ? 0 : -0.5;
      if(choiceIdx === item.correct){
        points += 2;
        points += speedBonus > 0 ? 1 : 0;
      }else{
        points += speedBonus < 0 ? -1 : 0;
      }
      next();
    }

    aBtns.forEach((b, i)=>{
      b.onclick = () => {
        aBtns.forEach(x=>x.disabled=true);
        clearInterval(timer);
        answer(i);
      };
    });

    $("#mgQuit").onclick = () => {
      clearInterval(timer);
      closeMiniGame(points - 2); // quitting hurts a bit
    };

    modal.classList.add("open");
    renderQ();
  }

  function closeMiniGame(points){
    $("#minigameModal").classList.remove("open");

    // Map points (roughly -5..+15) to performance modifier [-15..+15]
    const mod = clamp(Math.round((points - 3) * 2.2), -15, 15);
    resolveGame(mod, points);
    save();
    render();
  }

  function resolveGame(perfMod, points){
    if(state.gameResolvedThisWeek) return;
    if(isByeWeek()){
      log("Bye week — no game played.");
      state.gameResolvedThisWeek = true;
      return;
    }
    const wk = state.schedule[state.week-1];
    const oppOvr = wk?.oppOvr ?? rand(55,85);

    const baseOvr = calcOVR(state);
    const eff = clamp(baseOvr + perfMod, 0, 99);
    const pWin = chanceFromDiff(eff, oppOvr);
    const win = Math.random() < pWin;

    // XP + small cash on win
    const xp = clamp(18 + points*4 + (win?18:8), 10, 140);
    gainXp(xp);
    if (win) state.money += 25;

    if(win) state.seasonWins++; else state.seasonLosses++;

    const scoreMy  = Math.round(14 + pWin*21 + rand(-6,6));
    const scoreOpp = Math.round(14 + (1-pWin)*21 + rand(-6,6));
    const res = { win, pWin, scoreMy, scoreOpp, oppOvr, eff, xp, points };

    state.gameResult = res;
    state.gameResolvedThisWeek = true;

    log(`🏟️ Game vs ${wk?.opp || "Opponent"}: ${scoreMy}-${scoreOpp} (${win?"W":"L"}) | +${xp} XP${win?" +$25":""}`);
  }

// ---------- Cheats ----------
  function applyCheat(kind){
    switch(kind){
      case "energy":
        state.energy = 100; log("Cheat: Energy refilled."); break;
      case "hours":
        state.hoursLeft = 25; log("Cheat: Hours refilled."); break;
      case "money":
        state.money += 500; log("Cheat: +$500."); break;
      case "ovr":
        // boost a few core skills for testing
        ["speed","agility","awareness","throwPower","accuracy","catching"].forEach(k=>{
          if (state.attrs && state.attrs[k] !== undefined) state.attrs[k] = clamp(state.attrs[k] + 3, 1, 99);
        });
        state.skillPoints += 5;
        log("Cheat: Boosted skills (+5 skill points)."); break;
      case "week":
        // skip game requirement and advance
        state.gameResolvedThisWeek = true;
        log("Cheat: Marked game as resolved for this week.");
        break;
      case "reset":
        reset(); return;
    }
    save(); render();
  }

  // ---------- Render ----------
  function render(){
    $("#phase").textContent = labelPhase();
    $("#week").textContent = `Week ${state.week}/${seasonLength()}`;
    $("#record").textContent = `${state.seasonWins}-${state.seasonLosses}`;
    $("#money").textContent = `$${fmt(state.money)}`;
    const ovr = calcOVR(state);
    $("#ovr").textContent = `${ovr}`;
    $("#level").textContent = `${state.level}`;
    $("#xp").textContent = `${state.xp} / ${xpToNext(state.level)}`;
    $("#sp").textContent = `${state.skillPoints}`;
    $("#spPill").textContent = `${state.skillPoints}`;

    // bars
    $("#energyVal").textContent = `${Math.round(state.energy)}`;
    $("#energyBar").style.width = `${clamp(state.energy,0,100)}%`;
    $("#hoursVal").textContent = `${state.hoursLeft}`;
    $("#hoursBar").style.width = `${clamp((state.hoursLeft/25)*100,0,100)}%`;

    // schedule for current week
    const wk = state.schedule[state.week-1];
    const oppLine = wk?.bye ? "BYE WEEK" : `vs ${wk?.opp ?? "Opponent"} (OVR ${wk?.oppOvr ?? "?"})`;
    $("#matchup").textContent = oppLine;

    // action cards
    const actWrap = $("#actions");
    actWrap.innerHTML = "";
    ACTIONS.forEach(a=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="cardTop">
          <div class="cardTitle">${a.label}</div>
          <div class="cardDesc">${a.desc}</div>
        </div>
        <div class="cardRow">
          <div class="pill">Energy: ${a.baseEnergy>0?"+":""}${a.baseEnergy}/h</div>
          <div class="pill">Hours: ${a.baseHours}/h</div>
        </div>
        <div class="cardRow">
          <button class="btn small" data-act="${a.id}" data-hrs="1">1 hour</button>
          <button class="btn small" data-act="${a.id}" data-hrs="2">2 hours</button>
          <button class="btn small" data-act="${a.id}" data-hrs="3">3 hours</button>
        </div>
      `;
      actWrap.appendChild(card);
    });

    $$("#actions button[data-act]").forEach(btn=>{
      btn.onclick = ()=> doAction(btn.dataset.act, btn.dataset.hrs);
    });

    // store
    const storeWrap = $("#store");
    storeWrap.innerHTML = "";
    STORE.forEach(it=>{
      const row = document.createElement("div");
      row.className = "storeRow";
      row.innerHTML = `
        <div class="storeLeft">
          <div class="storeName">${it.name}</div>
          <div class="storeDesc">${it.desc}</div>
        </div>
        <button class="btn small" data-buy="${it.id}">$${fmt(it.cost)}</button>
      `;
      storeWrap.appendChild(row);
    });
    $$("#store button[data-buy]").forEach(btn=>{
      btn.onclick = ()=> buyItem(btn.dataset.buy);
    });

    // buttons
    const btnAdvance = $("#advanceWeek");
    btnAdvance.disabled = state.pendingCollegeChoice;
    btnAdvance.textContent = state.pendingCollegeChoice ? "Choose a College to Continue" : "Advance Week";

    $("#playMiniGame").style.display = (isGameWeek() && !state.gameResolvedThisWeek && !state.pendingCollegeChoice) ? "inline-flex" : "none";
    $("#simGame").style.display = (isGameWeek() && !state.gameResolvedThisWeek && !state.pendingCollegeChoice) ? "inline-flex" : "none";

    // log
    $("#log").innerHTML = state.log.map(x=>`<div class="logLine">${escapeHtml(x)}</div>`).join("");

    // cheats
    const ch = $("#cheats");
    ch.classList.toggle("open", !!state.cheatsOpen);
    $("#toggleCheats").textContent = state.cheatsOpen ? "Hide Cheats" : "Show Cheats";
    $("#posSel").value = state.position;

    // if college pending, show modal
    if(state.pendingCollegeChoice){
      openCollegeChoice();
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  // ---------- Wire up ----------
  $("#advanceWeek").addEventListener("click", advanceWeek);
  $("#playMiniGame").addEventListener("click", openMiniGame);
  $("#simGame").addEventListener("click", ()=>{
    // resolve without mini-game: performance modifier around 0 with some variance
    const perf = rand(-6, 6);
    resolveGame(perf, 2); // neutral points
    save(); render();
  });

  $("#toggleCheats").addEventListener("click", ()=>{
    state.cheatsOpen = !state.cheatsOpen;
    save(); render();
  });

  $$("#cheats [data-cheat]").forEach(btn=>{
    btn.addEventListener("click", ()=> applyCheat(btn.dataset.cheat));
  });

  $("#posSel").addEventListener("change", (e)=>{
    state.position = e.target.value;
    log(`Position set to ${state.position}.`);
    save(); render();
  });

  // Close modals by background click
  $$("#collegeModal, #minigameModal").forEach(m=>{
    m.addEventListener("click", (e)=>{
      if(e.target.classList.contains("modal")) e.currentTarget.classList.remove("open");
    });
  });

  // First render
  save();
  render();
})();
