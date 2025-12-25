const $ = (id) => document.getElementById(id);

let state = {
  player: null,
  week: 1,
  season: 1,
  xp: 0,
  fatigue: 0,
  stats: { games:0, yards:0, tds:0, ints:0, tackles:0, sacks:0 }
};

function rng(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function positionProfile(pos){
  // Base attributes 40-60 depending on archetype
  const base = () => rng(45, 55);
  const p = { speed: base(), strength: base(), iq: base(), stamina: base() };

  if(pos === "QB"){ p.iq += 8; p.stamina += 4; }
  if(pos === "RB"){ p.speed += 8; p.strength += 3; }
  if(pos === "WR"){ p.speed += 10; p.iq += 2; }
  if(pos === "TE"){ p.strength += 8; p.stamina += 3; }
  if(pos === "LB"){ p.strength += 8; p.iq += 4; }
  if(pos === "CB"){ p.speed += 10; p.iq += 3; }
  if(pos === "DL"){ p.strength += 12; p.stamina += 2; }

  // Clamp 0-99
  for(const k of Object.keys(p)) p[k] = clamp(p[k], 1, 99);
  return p;
}

function overall(player){
  const { speed, strength, iq, stamina } = player.attr;
  return Math.round((speed + strength + iq + stamina) / 4);
}

function logLine(msg){
  const el = $("log");
  el.textContent = `[S${state.season} W${state.week}] ${msg}\n` + el.textContent;
}

function render(){
  const p = state.player;
  if(!p) return;
  $("playerCard").innerHTML = `
    <div><b>${p.name}</b> — ${p.pos} • OVR <b>${overall(p)}</b></div>
    <div class="muted">Season ${state.season} • Week ${state.week} • XP: ${state.xp} • Fatigue: ${state.fatigue}</div>
    <hr style="border:0;border-top:1px solid rgba(255,255,255,.12);margin:10px 0;">
    <div>Speed: ${p.attr.speed}</div>
    <div>Strength: ${p.attr.strength}</div>
    <div>Football IQ: ${p.attr.iq}</div>
    <div>Stamina: ${p.attr.stamina}</div>
    <hr style="border:0;border-top:1px solid rgba(255,255,255,.12);margin:10px 0;">
    <div class="muted">
      Games: ${state.stats.games} • Yards: ${state.stats.yards} • TDs: ${state.stats.tds}
      ${p.pos==="QB" ? ` • INTs: ${state.stats.ints}` : ""}
      ${(p.pos==="LB"||p.pos==="CB"||p.pos==="DL") ? ` • Tackles: ${state.stats.tackles} • Sacks: ${state.stats.sacks}` : ""}
    </div>
  `;
}

function applyAction(kind){
  const p = state.player;
  if(!p) return;

  if(kind === "train"){
    state.fatigue = clamp(state.fatigue + 8, 0, 100);
    const gain = rng(6, 10);
    state.xp += gain;
    logLine(`Trained hard (+${gain} XP, fatigue +8).`);
  }

  if(kind === "film"){
    state.fatigue = clamp(state.fatigue + 3, 0, 100);
    p.attr.iq = clamp(p.attr.iq + 1, 1, 99);
    state.xp += 4;
    logLine(`Studied film (+4 XP, IQ +1, fatigue +3).`);
  }

  if(kind === "rest"){
    state.fatigue = clamp(state.fatigue - 12, 0, 100);
    state.xp += 2;
    logLine(`Recovered (+2 XP, fatigue -12).`);
  }

  render();
}

function simulateGame(){
  const p = state.player;
  if(!p) return;

  const ovr = overall(p);
  const fatiguePenalty = Math.round(state.fatigue * 0.25); // up to -25
  const effective = clamp(ovr - fatiguePenalty, 1, 99);

  // Simple matchup swing
  const opponent = rng(45, 75);
  const diff = effective - opponent;

  let xpGain = rng(6, 14) + Math.max(0, Math.floor(diff/6));
  xpGain = clamp(xpGain, 3, 30);

  let resultText = diff >= 0 ? "Win" : "Loss";

  // Position-based stats
  if(p.pos === "QB"){
    const yards = clamp(rng(120, 420) + diff * 6, 40, 520);
    const tds = clamp(rng(0, 5) + Math.floor(diff/18), 0, 6);
    const ints = clamp(rng(0, 3) - Math.floor(diff/25), 0, 4);
    state.stats.yards += yards;
    state.stats.tds += tds;
    state.stats.ints += ints;
    logLine(`Game: ${resultText} vs OVR ${opponent}. QB line: ${yards} pass yds, ${tds} TD, ${ints} INT. (+${xpGain} XP)`);
  } else if(p.pos === "RB" || p.pos === "WR" || p.pos === "TE"){
    const yards = clamp(rng(30, 210) + diff * 3, 5, 280);
    const tds = clamp(rng(0, 3) + Math.floor(diff/22), 0, 4);
    state.stats.yards += yards;
    state.stats.tds += tds;
    logLine(`Game: ${resultText} vs OVR ${opponent}. Skill line: ${yards} yds, ${tds} TD. (+${xpGain} XP)`);
  } else {
    const tackles = clamp(rng(2, 14) + Math.floor(diff/10), 0, 20);
    const sacks = clamp(rng(0, 3) + Math.floor(diff/28), 0, 5);
    state.stats.tackles += tackles;
    state.stats.sacks += sacks;
    logLine(`Game: ${resultText} vs OVR ${opponent}. Defense: ${tackles} tackles, ${sacks} sacks. (+${xpGain} XP)`);
  }

  state.stats.games += 1;
  state.xp += xpGain;

  // Weekly progression
  state.week += 1;
  state.fatigue = clamp(state.fatigue + 6, 0, 100); // games add fatigue

  // Season rollover at Week 18
  if(state.week > 18){
    state.week = 1;
    state.season += 1;
    state.fatigue = clamp(state.fatigue - 20, 0, 100);
    logLine(`--- New Season: Season ${state.season} begins! ---`);
  }

  render();
}

function upgrade(stat){
  if(state.xp < 10){
    logLine("Not enough XP to upgrade (need 10).");
    return;
  }
  state.xp -= 10;
  state.player.attr[stat] = clamp(state.player.attr[stat] + 1, 1, 99);
  logLine(`Upgraded ${stat} (+1). (-10 XP)`);
  render();
}

// UI wiring
$("btnCreate").addEventListener("click", () => {
  const name = $("name").value.trim() || "Rookie";
  const pos = $("pos").value;

  state.player = { name, pos, attr: positionProfile(pos) };
  state.week = 1; state.season = 1; state.xp = 0; state.fatigue = 0;
  state.stats = { games:0, yards:0, tds:0, ints:0, tackles:0, sacks:0 };
  $("log").textContent = "";
  logLine(`Career started for ${name} (${pos}).`);
  $("create").classList.add("hidden");
  $("game").classList.remove("hidden");
  render();
});

$("train").addEventListener("click", () => applyAction("train"));
$("film").addEventListener("click", () => applyAction("film"));
$("rest").addEventListener("click", () => applyAction("rest"));
$("play").addEventListener("click", simulateGame);

document.querySelectorAll("button[data-up]").forEach(btn => {
  btn.addEventListener("click", () => upgrade(btn.dataset.up));
});
