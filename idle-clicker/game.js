let coins = 0;
let perClick = 1;
let perSecond = 0;

let clickCost = 10;
let idleCost = 25;

// Load saved data
function loadGame() {
  const saved = JSON.parse(localStorage.getItem("idleClickerSave"));
  if (!saved) return;

  coins = saved.coins;
  perClick = saved.perClick;
  perSecond = saved.perSecond;
  clickCost = saved.clickCost;
  idleCost = saved.idleCost;
}

// Save game
function saveGame() {
  localStorage.setItem(
    "idleClickerSave",
    JSON.stringify({
      coins,
      perClick,
      perSecond,
      clickCost,
      idleCost,
    })
  );
}

function updateUI() {
  document.getElementById("coins").textContent = Math.floor(coins);
  document.getElementById("perClick").textContent = perClick;
  document.getElementById("perSecond").textContent = perSecond;
  document.getElementById("clickCost").textContent = clickCost;
  document.getElementById("idleCost").textContent = idleCost;

  document.getElementById("upgradeClick").disabled = coins < clickCost;
  document.getElementById("upgradeIdle").disabled = coins < idleCost;
}

// Click action
document.getElementById("clickBtn").onclick = () => {
  coins += perClick;
  updateUI();
  saveGame();
};

// Upgrade click power
document.getElementById("upgradeClick").onclick = () => {
  if (coins < clickCost) return;
  coins -= clickCost;
  perClick += 1;
  clickCost = Math.floor(clickCost * 1.6);
  updateUI();
  saveGame();
};

// Upgrade idle income
document.getElementById("upgradeIdle").onclick = () => {
  if (coins < idleCost) return;
  coins -= idleCost;
  perSecond += 1;
  idleCost = Math.floor(idleCost * 1.7);
  updateUI();
  saveGame();
};

// Idle loop
setInterval(() => {
  coins += perSecond;
  updateUI();
  saveGame();
}, 1000);

// Init
loadGame();
updateUI();

