
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

  function chanceFromDiff(my, opp){
    // Logistic-ish: ~50% at equal, steeper with 12pt scale
    const diff = my - opp;
    const p = 1 / (1 + Math.pow(10, (-diff) / 12));
    return clamp(p, 0.05, 0.95);
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
    ovr: 60,
    skill: 60,             // training impacts
    iq: 55,                // study impacts
    energy: 100,
    hoursLeft: 25,
    seasonWins: 0,
    seasonLosses: 0,
    schedule: [],          // generated per season
    gameResolvedThisWeek: false,
    pendingCollegeChoice: false,
    log: ["Welcome! Train + study each week, then play your game."],
    cheatsOpen: true,
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
    { id:"train",  label:"Train",  desc:"Improve skill / OVR", baseEnergy:10, baseHours:1, apply:(hrs)=>{
      const gain = 0.6*hrs + (Math.random()*0.3);
      state.skill = clamp(state.skill + gain, 0, 99);
      state.ovr = clamp(Math.round((state.skill*0.65 + state.iq*0.35)), 0, 99);
      log(`Training +${gain.toFixed(1)} skill.`);
    }},
    { id:"study",  label:"Study Playbook", desc:"Improve IQ / consistency", baseEnergy:8, baseHours:1, apply:(hrs)=>{
      const gain = 0.5*hrs + (Math.random()*0.25);
      state.iq = clamp(state.iq + gain, 0, 99);
      state.ovr = clamp(Math.round((state.skill*0.65 + state.iq*0.35)), 0, 99);
      log(`Studying +${gain.toFixed(1)} IQ.`);
    }},
    { id:"work",   label:"Part-Time Work", desc:"Earn money", baseEnergy:12, baseHours:2, apply:(hrs)=>{
      const pay = 10*hrs;
      state.money += pay;
      log(`Worked ${hrs}h and earned $${fmt(pay)}.`);
    }},
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

    const eff = clamp(state.ovr + perfMod, 0, 99);
    const pWin = chanceFromDiff(eff, oppOvr);
    const win = Math.random() < pWin;

    // Simple stat line + XP
    const xp = clamp(10 + points*3 + (win?10:0), 5, 80);
    state.skill = clamp(state.skill + xp/120, 0, 99);
    state.iq = clamp(state.iq + xp/180, 0, 99);
    state.ovr = clamp(Math.round((state.skill*0.65 + state.iq*0.35)), 0, 99);

    if(win) state.seasonWins++; else state.seasonLosses++;

    const scoreMy  = Math.round(14 + pWin*24 + rand(-3,3));
    const scoreOpp = Math.round(14 + (1-pWin)*24 + rand(-3,3));
    const myFinal = win ? Math.max(scoreMy, scoreOpp+1) : Math.min(scoreMy, scoreOpp-1);
    const oppFinal = win ? Math.min(scoreOpp, myFinal-1) : Math.max(scoreOpp, myFinal+1);

    log(`Game vs ${wk.opp} (OVR ${oppOvr}). Performance ${perfMod>=0?"+":""}${perfMod}. Result: ${win?"WIN":"LOSS"} ${myFinal}-${oppFinal}. (+${xp} XP)`);
    state.gameResolvedThisWeek = true;
  }

  // ---------- College commit ----------
  const COLLEGES = [
    { id:"metroU",  name:"Metro U", rating:78, bonusOvr:+1, stipend:40 },
    { id:"coastal", name:"Coastal Tech", rating:74, bonusOvr:+0, stipend:55 },
    { id:"redval",  name:"Red Valley", rating:82, bonusOvr:+2, stipend:25 },
    { id:"summit",  name:"Summit College", rating:76, bonusOvr:+1, stipend:45 },
    { id:"canyon",  name:"Canyon State", rating:80, bonusOvr:+2, stipend:30 },
  ];

  function openCollegeChoice(){
    state.pendingCollegeChoice = true;
    const wrap = $("#collegeChoices");
    wrap.innerHTML = "";
    COLLEGES.forEach(c=>{
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.innerHTML = `<div class="btnTitle">${c.name}</div>
                       <div class="btnSub">Team rating ${c.rating} • Weekly stipend $${c.stipend}${c.bonusOvr?` • +${c.bonusOvr} OVR boost`:``}</div>`;
      btn.onclick = ()=> commitCollege(c);
      wrap.appendChild(btn);
    });
    $("#collegeModal").classList.add("open");
  }

  function commitCollege(col){
    $("#collegeModal").classList.remove("open");
    state.pendingCollegeChoice = false;
    state.phase = "COLLEGE";
    state.year = 1;
    state.week = 1;
    state.money += col.stipend; // first stipend
    state.ovr = clamp(state.ovr + col.bonusOvr, 0, 99);
    state.schedule = []; // regen
    ensureSeason();
    log(`Committed to ${col.name}!`);
    save();
    render();
  }

  // ---------- Week advancement ----------
  function endOfSeason(){
    const len = seasonLength();
    return state.week > len;
  }

  function advanceWeek(){
    // Block advancement if we need a college choice
    if(state.pendingCollegeChoice){
      openCollegeChoice();
      return;
    }

    // If it's a game week and we haven't resolved it, nudge player
    if(isGameWeek() && !state.gameResolvedThisWeek){
      // Default per user's choice: mini-game is the main driver
      openMiniGame();
      return;
    }

    // advance
    state.week += 1;

    // weekly refresh
    weeklyRefresh();

    // season rollover
    if(endOfSeason()){
      // Completed season: move year/phase
      const len = seasonLength();
      // state.week is len+1 now — reset below
      log(`Season complete. Record: ${state.seasonWins}-${state.seasonLosses}.`);

      if(state.phase === "HS"){
        if(state.year >= 4){
          // force commit
          state.year = 4; // lock
          state.week = 1;
          state.schedule = [];
          state.pendingCollegeChoice = true;
          openCollegeChoice();
          save();
          render();
          return;
        }else{
          state.year += 1;
        }
      }else if(state.phase === "COLLEGE"){
        if(state.year >= 4){
          state.phase = "PRO";
          state.year = 1;
          log("Drafted to the Pros!");
        }else{
          state.year += 1;
        }
      }else{
        state.year += 1;
      }

      state.week = 1;
      state.schedule = [];
      ensureSeason();
    }

    // Pro bye week message
    if(isByeWeek()){
      log("This week is a BYE — use it to train/rest.");
      state.gameResolvedThisWeek = true; // no game required
    }

    save();
    render();
  }

  // ---------- Actions + store ----------
  function doAction(actionId, hrs){
    const action = ACTIONS.find(a=>a.id===actionId);
    if(!action) return;
    hrs = clamp(parseInt(hrs,10)||1, 1, 3);

    const energyCost = action.baseEnergy * hrs;
    const hoursCost = action.baseHours * hrs;

    if(state.hoursLeft < hoursCost){
      log(`Not enough hours left (${state.hoursLeft}) for that.`);
      render();
      return;
    }
    if(state.energy < energyCost && energyCost > 0){
      log(`Not enough energy (${state.energy}) for that.`);
      render();
      return;
    }

    state.hoursLeft -= hoursCost;
    state.energy = clamp(state.energy - energyCost, 0, 100);

    action.apply(hrs);
    save();
    render();
  }

  function buyItem(itemId){
    const it = STORE.find(x=>x.id===itemId);
    if(!it) return;
    if(state.money < it.cost){
      log(`Not enough money for ${it.name}.`);
      render(); return;
    }
    state.money -= it.cost;
    state.energy = clamp(state.energy + it.energy, 0, 100);
    log(`Used ${it.name}. Energy ${it.energy>0?"+":""}${it.energy}.`);
    save();
    render();
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
        state.ovr = clamp(state.ovr + 5, 0, 99);
        state.skill = clamp(state.skill + 3, 0, 99);
        log("Cheat: +OVR."); break;
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
    $("#ovr").textContent = `${Math.round(state.ovr)}`;
    $("#skill").textContent = `${state.skill.toFixed(1)}`;
    $("#iq").textContent = `${state.iq.toFixed(1)}`;

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
