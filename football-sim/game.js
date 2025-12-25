const $ = (id) => document.getElementById(id);

const SAVE_KEY = "gridiron_career_v02";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const avg = (...nums) => Math.round(nums.reduce((s,n)=>s+n,0) / nums.length);

function logLine(msg){
  const el = $("log");
  el.textContent = `${msg}\n` + (el.textContent || "");
}

function showScreen(name){
  ["home","builder","career"].forEach(s => {
    const el = $(`screen-${s}`);
    el.classList.toggle("hidden", s !== name);
  });
}

function calcOVR(p){
  // Madden-ish: overall is weighted by position (light version)
  const a = p.ratings;
  if(p.pos === "QB") return avg(a.awareness, a.speed, a.agility, a.stamina, a.strength);
  if(["RB","WR","CB"].includes(p.pos)) return avg(a.speed, a.agility, a.awareness, a.stamina, a.strength);
  if(["TE","LB","DL"].includes(p.pos)) return avg(a.strength, a.stamina, a.awareness, a.speed, a.agility);
  return avg(a.speed, a.strength, a.agility, a.awareness, a.stamina);
}

/**
 * Madden-style: Position + archetype caps
 * (You can expand these later into dozens of attributes like THP/THA/Catch/Tackle, etc.)
 */
const ARCHETYPES = {
  QB: [
    { id:"FieldGeneral", name:"Field General", boosts:{ awareness:+6 }, caps:{ speed:85, strength:78, agility:84, awareness:95, stamina:90 } },
    { id:"Scrambler", name:"Scrambler", boosts:{ speed:+6, agility:+4 }, caps:{ speed:92, strength:76, agility:92, awareness:90, stamina:90 } },
    { id:"StrongArm", name:"Strong Arm", boosts:{ strength:+6 }, caps:{ speed:86, strength:88, agility:84, awareness:92, stamina:90 } },
  ],
  RB: [
    { id:"Elusive", name:"Elusive Back", boosts:{ speed:+6, agility:+6 }, caps:{ speed:95, strength:82, agility:95, awareness:88, stamina:92 } },
    { id:"Power", name:"Power Back", boosts:{ strength:+8 }, caps:{ speed:90, strength:92, agility:86, awareness:86, stamina:95 } },
    { id:"Receiving", name:"Receiving Back", boosts:{ agility:+6, awareness:+4 }, caps:{ speed:93, strength:80, agility:92, awareness:92, stamina:90 } },
  ],
  WR: [
    { id:"DeepThreat", name:"Deep Threat", boosts:{ speed:+8 }, caps:{ speed:96, strength:78, agility:92, awareness:88, stamina:90 } },
    { id:"RouteRunner", name:"Route Runner", boosts:{ agility:+8, awareness:+4 }, caps:{ speed:93, strength:76, agility:96, awareness:92, stamina:90 } },
    { id:"Physical", name:"Physical", boosts:{ strength:+6 }, caps:{ speed:92, strength:88, agility:88, awareness:88, stamina:92 } },
  ],
  TE: [
    { id:"Vertical", name:"Vertical Threat", boosts:{ speed:+4, awareness:+2 }, caps:{ speed:88, strength:90, agility:86, awareness:90, stamina:92 } },
    { id:"Blocking", name:"Blocking TE", boosts:{ strength:+8, stamina:+4 }, caps:{ speed:84, strength:95, agility:82, awareness:88, stamina:96 } },
  ],
  CB: [
    { id:"Man", name:"Man-to-Man", boosts:{ speed:+6, agility:+6 }, caps:{ speed:96, strength:74, agility:96, awareness:90, stamina:90 } },
    { id:"Zone", name:"Zone", boosts:{ awareness:+8 }, caps:{ speed:92, strength:74, agility:92, awareness:95, stamina:90 } },
  ],
  LB: [
    { id:"RunStopper", name:"Run Stopper", boosts:{ strength:+8, stamina:+2 }, caps:{ speed:88, strength:95, agility:86, awareness:92, stamina:96 } },
    { id:"Coverage", name:"Coverage LB", boosts:{ speed:+4, awareness:+6 }, caps:{ speed:90, strength:90, agility:90, awareness:95, stamina:94 } },
  ],
  DL: [
    { id:"PowerRusher", name:"Power Rusher", boosts:{ strength:+10 }, caps:{ speed:84, strength:96, agility:84, awareness:90, stamina:94 } },
    { id:"SpeedRusher", name:"Speed Rusher", boosts:{ speed:+4, agility:+4 }, caps:{ speed:88, strength:92, agility:88, awareness:88, stamina:92 } },
  ]
};

function buildHeightOptions(){
  const sel = $("bHeight");
  const heights = [];
  for(let ft=5; ft<=7; ft++){
    for(let inch=0; inch<=11; inch++){
      if(ft===5 && inch<6) continue; // start 5'6"
      if(ft===7 && inch>2) continue; // end 7'2"
      heights.push(`${ft}'${inch}"`);
    }
  }
  sel.innerHTML = heights.map(h => `<option value="${h}">${h}</option>`).join("");
  sel.value = "6'0\"";
}

function baseRatingsFromPhysical(pos, heightStr, weight, age){
  // Simplified baseline similar to “rookie” values.
  // You can later expand to dozens of ratings.
  let speed = 68, strength = 68, agility = 68, awareness = 66, stamina = 70;

  // height & weight effect
  const [ftPart, inchPart] = heightStr.split("'");
  const ft = parseInt(ftPart,10);
  const inches = parseInt(inchPart.replace('"',''),10);
  const totalInches = ft*12 + inches;

  // heavier => more strength, slightly less speed/agility
  const w = clamp(weight, 150, 380);
  strength += Math.round((w - 210) / 12);
  speed -= Math.round((w - 210) / 18);
  agility -= Math.round((w - 210) / 20);

  // taller => slight strength bonus, tiny agility hit
  strength += Math.round((totalInches - 72) / 6);
  agility -= Math.round((totalInches - 72) / 8);

  // age: younger slightly more physical, older slightly more awareness
  const a = clamp(age, 18, 28);
  if(a <= 21){ speed += 2; agility += 2; }
  if(a >= 24){ awareness += 2; stamina += 1; }

  // position tweaks
  if(pos === "QB"){ awareness += 4; stamina += 2; }
  if(pos === "RB"){ speed += 4; agility += 3; }
  if(pos === "WR"){ speed += 5; agility += 4; }
  if(pos === "TE"){ strength += 6; stamina += 3; }
  if(pos === "CB"){ speed += 5; agility += 5; }
  if(pos === "LB"){ strength += 7; awareness += 2; }
  if(pos === "DL"){ strength += 9; stamina += 2; speed -= 2; }

  return {
    speed: clamp(speed, 55, 80),
    strength: clamp(strength, 55, 82),
    agility: clamp(agility, 55, 82),
    awareness: clamp(awareness, 55, 82),
    stamina: clamp(stamina, 60, 85),
  };
}

function makeNewCareer(){
  return {
    meta: { createdAt: Date.now(), version:"0.2" },
    phase: "BUILDER", // BUILDER -> COMBINE -> DRAFT -> SEASON -> OFFSEASON
    week: 1,
    season: 1,
    draftStock: 0,
    teamId: null,
    player: null
  };
}

let state = makeNewCareer();

// -------- Builder State
let builder = {
  step: 1,
  points: 22,
  min: 55,
  ratings: null,
  caps: null,
  archId: null
};

function setBuilderStep(n){
  builder.step = clamp(n, 1, 3);
  $("builderStep").textContent = builder.step;

  document.querySelectorAll(".builder-step").forEach(div=>{
    const step = parseInt(div.dataset.step,10);
    div.classList.toggle("hidden", step !== builder.step);
  });

  $("btnBack").textContent = builder.step === 1 ? "Cancel" : "Back";
  $("btnNext").textContent = builder.step === 3 ? "Create Career" : "Next";
}

function fillArchetypesForPos(pos){
  const list = ARCHETYPES[pos] || [];
  const sel = $("bArch");
  sel.innerHTML = list.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  sel.value = list[0]?.id || "";
  builder.archId = sel.value;
}

function getArchetype(pos, archId){
  return (ARCHETYPES[pos] || []).find(a => a.id === archId) || (ARCHETYPES[pos] || [])[0];
}

function applyArchetype(pos){
  const arch = getArchetype(pos, builder.archId);
  if(!arch) return;

  // caps
  builder.caps = arch.caps;

  // apply boosts (not exceeding caps)
  for(const [k, v] of Object.entries(arch.boosts || {})){
    builder.ratings[k] = clamp(builder.ratings[k] + v, builder.min, builder.caps[k]);
  }

  // update cap labels
  $("capSpeed").textContent = `(cap ${builder.caps.speed})`;
  $("capStrength").textContent = `(cap ${builder.caps.strength})`;
  $("capAgility").textContent = `(cap ${builder.caps.agility})`;
  $("capAwareness").textContent = `(cap ${builder.caps.awareness})`;
  $("capStamina").textContent = `(cap ${builder.caps.stamina})`;
}

function pointsSpent(){
  // points are how far above min you pushed ratings compared to baseline
  // baseline is builder.ratingsStart snapshot stored in builder.start
  const cur = builder.ratings;
  const start = builder.start;
  let spent = 0;
  for(const k of Object.keys(cur)){
    spent += Math.max(0, cur[k] - start[k]);
  }
  return spent;
}

function pointsLeft(){
  return clamp(builder.points - pointsSpent(), 0, builder.points);
}

function renderBuilderRatings(pos){
  const r = builder.ratings;
  $("valSpeed").textContent = r.speed;
  $("valStrength").textContent = r.strength;
  $("valAgility").textContent = r.agility;
  $("valAwareness").textContent = r.awareness;
  $("valStamina").textContent = r.stamina;

  $("pointsLeft").textContent = pointsLeft();

  const tempPlayer = { pos, ratings: r };
  $("ovrPreview").textContent = calcOVR(tempPlayer);
}

function tryAdjustRating(attr, dir){
  const r = builder.ratings;
  const start = builder.start;
  const cap = builder.caps?.[attr] ?? 99;

  // If decreasing: allow down to start baseline (so you don’t “refund” below baseline)
  if(dir < 0){
    r[attr] = clamp(r[attr] - 1, start[attr], cap);
    return;
  }

  // If increasing: must have points left
  if(pointsLeft() <= 0) return;
  r[attr] = clamp(r[attr] + 1, builder.min, cap);
}

function renderCareerHub(){
  const p = state.player;
  if(!p) return;

  $("careerSub").textContent = `Season ${state.season} • Week ${state.week} • Phase: ${state.phase}`;

  $("playerCard").innerHTML = `
    <div><b>${p.name}</b> — ${p.pos} (${p.archetypeName}) • OVR <b>${calcOVR(p)}</b></div>
    <div class="muted">${p.hand} • ${p.height}, ${p.weight} lbs • Age ${p.age}</div>
    <div class="muted">${p.hometown || ""}${p.college ? " • " + p.college : ""}</div>
    <hr style="border:0;border-top:1px solid rgba(255,255,255,.12);margin:10px 0;">
    <div>Speed: ${p.ratings.speed}</div>
    <div>Strength: ${p.ratings.strength}</div>
    <div>Agility: ${p.ratings.agility}</div>
    <div>Awareness: ${p.ratings.awareness}</div>
    <div>Stamina: ${p.ratings.stamina}</div>
  `;
}

function save(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  logLine("Saved career.");
}

function load(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return false;
  try{
    state = JSON.parse(raw);
    return true;
  }catch{
    return false;
  }
}

function wipeSave(){
  localStorage.removeItem(SAVE_KEY);
  state = makeNewCareer();
  $("log").textContent = "";
  showScreen("home");
}

function startBuilder(fromEdit=false){
  showScreen("builder");
  setBuilderStep(1);

  // fill heights once
  buildHeightOptions();

  // if editing existing player, prefill
  if(fromEdit && state.player){
    const p = state.player;
    $("bName").value = p.name;
    $("bPos").value = p.pos;
    $("bHand").value = p.hand;
    $("bTown").value = p.hometown || "";
    $("bCollege").value = p.college || "";
    $("bHeight").value = p.height;
    $("bWeight").value = p.weight;
    $("bAge").value = p.age;

    fillArchetypesForPos(p.pos);
    $("bArch").value = p.archetypeId;
    builder.archId = p.archetypeId;

    // rebuild baseline from physicals then reapply allocations is complex;
    // for now: use existing ratings as baseline and allow re-tuning within caps using points
    builder.ratings = { ...p.ratings };
    builder.start = { ...p.ratings };
    builder.points = 10; // small “respec” points on edit
    applyArchetype(p.pos);
    renderBuilderRatings(p.pos);
    return;
  }

  // new career default values
  $("bName").value = "";
  $("bPos").value = "QB";
  $("bHand").value = "Right";
  $("bTown").value = "";
  $("bCollege").value = "";
  $("bHeight").value = "6'0\"";
  $("bWeight").value = 210;
  $("bAge").value = 21;

  fillArchetypesForPos("QB");

  // baseline ratings
  const base = baseRatingsFromPhysical("QB", "6'0\"", 210, 21);
  builder.ratings = { ...base };
  builder.start = { ...base };
  builder.points = 22;
  builder.archId = $("bArch").value;
  applyArchetype("QB");
  renderBuilderRatings("QB");
}

function finalizeCareer(){
  const name = ($("bName").value || "").trim() || "Rookie";
  const pos = $("bPos").value;
  const hand = $("bHand").value;
  const hometown = ($("bTown").value || "").trim();
  const college = ($("bCollege").value || "").trim();
  const height = $("bHeight").value;
  const weight = parseInt($("bWeight").value || "210", 10);
  const age = parseInt($("bAge").value || "21", 10);

  const arch = getArchetype(pos, builder.archId);
  const player = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name, pos, hand, hometown, college, height, weight, age,
    archetypeId: arch.id,
    archetypeName: arch.name,
    ratings: { ...builder.ratings }
  };

  state.player = player;
  state.phase = "COMBINE";
  state.season = 1;
  state.week = 1;
  state.draftStock = 0;
  state.teamId = null;

  $("log").textContent = "";
  logLine(`Created ${player.name} (${player.pos} - ${player.archetypeName}) • OVR ${calcOVR(player)}`);
  logLine("Next: Combine system (drills + interviews + draft stock).");

  showScreen("career");
  renderCareerHub();
  save();
}

// ----------------- Events
$("btnNew").addEventListener("click", () => {
  state = makeNewCareer();
  $("log").textContent = "";
  startBuilder(false);
});

$("btnContinue").addEventListener("click", () => {
  if(load() && state.player){
    showScreen("career");
    renderCareerHub();
    logLine("Loaded career.");
  } else {
    showScreen("home");
    alert("No save found. Click New Career.");
  }
});

$("btnWipe").addEventListener("click", () => {
  wipeSave();
  alert("Save wiped.");
});

$("btnGoBuilder").addEventListener("click", () => startBuilder(true));
$("btnSave").addEventListener("click", save);

$("btnCombine").addEventListener("click", () => {
  logLine("Combine not built yet — next step is adding drills + draft stock.");
  logLine("Tell me what drills you want (40, shuttle, 3-cone, bench, throwing/catching), and I’ll add it.");
});

$("btnSeason").addEventListener("click", () => {
  logLine("Season sim not built in this file yet — we’ll add teams, schedule, and weekly games next.");
});

$("btnBack").addEventListener("click", () => {
  if(builder.step === 1){
    showScreen("home");
    return;
  }
  setBuilderStep(builder.step - 1);
});

$("btnNext").addEventListener("click", () => {
  if(builder.step < 3){
    setBuilderStep(builder.step + 1);

    // entering step 2 or 3 should refresh baselines when needed
    if(builder.step === 2){
      // nothing special
    }
    if(builder.step === 3){
      // recompute baseline from physicals and position when arriving at step 3 (new career)
      // if editing, we already set it up
      if(!state.player){
        const pos = $("bPos").value;
        const height = $("bHeight").value;
        const weight = parseInt($("bWeight").value || "210", 10);
        const age = parseInt($("bAge").value || "21", 10);

        fillArchetypesForPos(pos);
        builder.archId = $("bArch").value;

        const base = baseRatingsFromPhysical(pos, height, weight, age);
        builder.ratings = { ...base };
        builder.start = { ...base };
        builder.points = 22;
        applyArchetype(pos);
        renderBuilderRatings(pos);
      }
    }
    return;
  }

  // Step 3 -> finalize
  finalizeCareer();
});

// position change updates archetypes
$("bPos").addEventListener("change", () => {
  const pos = $("bPos").value;
  fillArchetypesForPos(pos);
  builder.archId = $("bArch").value;
});

$("bArch").addEventListener("change", () => {
  builder.archId = $("bArch").value;
  const pos = $("bPos").value;

  // reset baseline then apply archetype boosts (for new careers)
  if(!state.player){
    const base = baseRatingsFromPhysical(
      pos,
      $("bHeight").value,
      parseInt($("bWeight").value || "210", 10),
      parseInt($("bAge").value || "21", 10)
    );
    builder.ratings = { ...base };
    builder.start = { ...base };
    builder.points = 22;
  }
  applyArchetype(pos);
  renderBuilderRatings(pos);
});

// +/- rating buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-attr]");
  if(!btn) return;

  const attr = btn.dataset.attr;
  const dir = parseInt(btn.dataset.dir, 10);
  const pos = $("bPos").value;

  tryAdjustRating(attr, dir);
  renderBuilderRatings(pos);
});

// Init
buildHeightOptions();
showScreen("home");

// Auto-load if save exists
if(load() && state.player){
  $("btnContinue").classList.remove("ghost");
}
