(() => {
  const SAVE_KEY = "apex_play_idle_clicker_v1";

  // ----- helpers -----
  const now = () => Date.now();

  const fmt = (n) => {
    const x = Math.floor(n);
    if (x >= 1e12) return (x / 1e12).toFixed(2) + "T";
    if (x >= 1e9)  return (x / 1e9).toFixed(2) + "B";
    if (x >= 1e6)  return (x / 1e6).toFixed(2) + "M";
    if (x >= 1e3)  return (x / 1e3).toFixed(2) + "K";
    return String(x);
  };

  const clampNum = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);

  // ----- state -----
  let state = {
    coins: 0,
    perClick: 1,
    perSecond: 0,

    clickCost: 10,
    idleCost: 25,

    clickLevel: 0,
    idleLevel: 0,

    lastSeen: now()
  };

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;

      // merge / sanitize
      state = { ...state, ...saved };
      state.coins = clampNum(state.coins, 0);
      state.perClick = Math.max(1, clampNum(state.perClick, 1));
      state.perSecond = Math.max(0, clampNum(state.perSecond, 0));

      state.clickCost = Math.max(1, clampNum(state.clickCost, 10));
      state.idleCost = Math.max(1, clampNum(state.idleCost, 25));

      state.clickLevel = Math.max(0, clampNum(state.clickLevel, 0));
      state.idleLevel = Math.max(0, clampNum(state.idleLevel, 0));

      const last = clampNum(state.lastSeen, now());
      const elapsedSec = Math.floor(Math.max(0, now() - last) / 1000);

      // offline earnings
      if (elapsedSec > 0 && state.perSecond > 0) {
        state.coins += elapsedSec * state.perSecond;
      }

      state.lastSeen = now();
    } catch {
      // ignore corrupted saves
    }
  }

  function save() {
    state.lastSeen = now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  // ----- DOM -----
  document.addEventListener("DOMContentLoaded", () => {
    const elCoins = document.getElementById("coins");
    const elPerClick = document.getElementById("perClick");
    const elPerSecond = document.getElementById("perSecond");

    const elClickCost = document.getElementById("clickCost");
    const elIdleCost = document.getElementById("idleCost");

    const elClickLevel = document.getElementById("clickLevel");
    const elIdleLevel = document.getElementById("idleLevel");

    const btnClick = document.getElementById("clickBtn");
    const btnUpClick = document.getElementById("upgradeClick");
    const btnUpIdle = document.getElementById("upgradeIdle");
    const btnReset = document.getElementById("resetBtn");

    const status = document.getElementById("status");

    if (!btnClick || !btnUpClick || !btnUpIdle) {
      console.error("Idle Clicker: Missing elements. Check ids & file paths.");
      return;
    }

    const setStatus = (msg) => {
      if (!status) return;
      status.textContent = msg;
      status.style.opacity = "1";
      clearTimeout(setStatus._t);
      setStatus._t = setTimeout(() => (status.style.opacity = "0.85"), 700);
    };

    const update = () => {
      elCoins.textContent = fmt(state.coins);
      elPerClick.textContent = fmt(state.perClick);
      elPerSecond.textContent = fmt(state.perSecond);

      elClickCost.textContent = fmt(state.clickCost);
      elIdleCost.textContent = fmt(state.idleCost);

      elClickLevel.textContent = fmt(state.clickLevel);
      elIdleLevel.textContent = fmt(state.idleLevel);

      btnUpClick.disabled = state.coins < state.clickCost;
      btnUpIdle.disabled = state.coins < state.idleCost;
    };

    // init
    load();
    update();
    setStatus("Loaded ✔ (auto-saves)");

    // click
    btnClick.addEventListener("click", () => {
      state.coins += state.perClick;
      update();
      save();
      setStatus("Saved locally");
    });

    // upgrades
    btnUpClick.addEventListener("click", () => {
      if (state.coins < state.clickCost) return;
      state.coins -= state.clickCost;

      state.clickLevel += 1;
      state.perClick += 1;

      // scaling
      state.clickCost = Math.floor(state.clickCost * 1.60 + 1);

      update();
      save();
      setStatus("Click Power upgraded ✔");
    });

    btnUpIdle.addEventListener("click", () => {
      if (state.coins < state.idleCost) return;
      state.coins -= state.idleCost;

      state.idleLevel += 1;
      state.perSecond += 1;

      // scaling
      state.idleCost = Math.floor(state.idleCost * 1.70 + 1);

      update();
      save();
      setStatus("Idle Income upgraded ✔");
    });

    // reset
    btnReset?.addEventListener("click", () => {
      const ok = confirm("Reset your save? This clears local progress on this device.");
      if (!ok) return;
      localStorage.removeItem(SAVE_KEY);
      state = {
        coins: 0, perClick: 1, perSecond: 0,
        clickCost: 10, idleCost: 25,
        clickLevel: 0, idleLevel: 0,
        lastSeen: now()
      };
      update();
      save();
      setStatus("Save reset ✔");
    });

    // idle tick
    setInterval(() => {
      if (state.perSecond > 0) {
        state.coins += state.perSecond;
        update();
        save();
      } else {
        // keep lastSeen fresh even with 0 idle
        save();
      }
    }, 1000);
  });
})();


// Init
loadGame();
updateUI();

