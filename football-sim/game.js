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
    { id:"Power", name:"Power Back", boosts:{ strength:+8 }, caps:{ speed:90, strength
