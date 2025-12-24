(() => {
  const SAVE_KEY = "apex_play_idle_clicker_v1";

  const now = () => Date.now();
  const clampNum = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);

  const fmt = (n) => {
    const x = Math.floor(n);
    if (x >= 1e12) return (x / 1e12).toFixed(2) + "T";
    if (x >= 1e9)  return (x / 1e9).toFixed(2) + "B";
    if (x >= 1e6)  return (x / 1e6).toFixed(2) + "M";
    if (x >= 1e3)  return (x / 1e3).toFixed(2) + "K";
    return String(x);
  };

  // ===== Avatar system =====
  const AVATAR_NAMES = {
    robot: "Robot",
    human: "Human",
    alien: "Alien"
  };

  const COLOR_PRESETS = [
    "#7c5cff", // purple
    "#22d3ee", // cyan
    "#34d399", // green
    "#f97316", // orange
    "#ef4444", // red
    "#e879f9", // pink
    "#a3e635", // lime
    "#ffffff"  // white
  ];

  function svgAvatar(type, color) {
    const c = color || "#7c5cff";
    // Simple “flat” SVGs designed to look good at small sizes
    if (type === "human") {
      return `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Human avatar">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="${c}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#22d3ee" stop-opacity="0.55"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="rgba(0,0,0,.18)"/>
        <circle cx="32" cy="26" r="14" fill="url(#g)"/>
        <rect x="16" y="40" width="32" height="16" rx="10" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.14)"/>
        <circle cx="27" cy="25" r="2" fill="rgba(0,0,0,.55)"/>
        <circle cx="37" cy="25" r="2" fill="rgba(0,0,0,.55)"/>
        <path d="M27 31c3 3 7 3 10 0" stroke="rgba(0,0,0,.50)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>`;
    }

    if (type === "alien") {
      return `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alien avatar">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="${c}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#34d399" stop-opacity="0.55"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="rgba(0,0,0,.18)"/>
        <path d="M32 10c10 0 18 8 18 18 0 16-8 26-18 26S14 44 14 28c0-10 8-18 18-18z" fill="url(#g)"/>
        <ellipse cx="24" cy="30" rx="6" ry="9" fill="rgba(0,0,0,.50)"/>
        <ellipse cx="40" cy="30" rx="6" ry="9" fill="rgba(0,0,0,.50)"/>
        <path d="M28 44c3 2 5 2 8 0" stroke="rgba(0,0,0,.45)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="18" cy="18" r="2" fill="rgba(255,255,255,.30)"/>
        <circle cx="46" cy="16" r="2" fill="rgba(255,255,255,.22)"/>
      </svg>`;
    }

    // default robot
    return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Robot avatar">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${c}" stop-opacity="0.95"/>
          <stop offset="1" stop-color="#7c5cff" stop-opacity="0.55"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="rgba(0,0,0,.18)"/>
      <rect x="16" y="18" width="32" height="30" rx="12" fill="url(#g)"/>
      <rect x="22" y="24" width="20" height="10" rx="6" fill="rgba(0,0,0,.35)"/>
      <circle cx="28" cy="29" r="2" fill="rgba(255,255,255,.75)"/>
      <circle cx="36" cy="29" r="2" fill="rgba(255,255,255,.75)"/>
      <path d="M26 40h12" stroke="rgba(0,0,0,.45)" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 10v6" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="9" r="3" fill="rgba(34,211,238,.70)"/>
    </svg>`;
  }

  // ----- state -----
  let state = {
    coins: 0,
    perClick: 1,
    perSecond: 0,

    clickCost: 10,
    idleCost: 25,

    clickLevel: 0,
    idleLevel: 0,

    avatar: { type: "robot", color: "#7c5cff" },

    lastSeen: now()
  };

  function repairState(s) {
    s.coins = Math.max(0, clampNum(s.coins, 0));
    s.perClick = Math.max(1, clampNum(s.perClick, 1));
    s.perSecond = Math.max(0, clampNum(s.perSecond, 0));

    s.clickCost = Math.max(1, clampNum(s.clickCost, 10));
    s.idleCost = Math.max(1, clampNum(s.idleCost, 25));

    s.clickLevel = Math.max(0, Math.floor(clampNum(s.clickLevel, 0)));
    s.idleLevel = Math.max(0, Math.floor(clampNum(s.idleLevel, 0)));

    if (!s.avatar || typeof s.avatar !== "object") s.avatar = { type: "robot", color: "#7c5cff" };
    s.avatar.type = (s.avatar.type in AVATAR_NAMES) ? s.avatar.type : "robot";
    s.avatar.color = typeof s.avatar.color === "string" ? s.avatar.color : "#7c5cff";

    s.lastSeen = clampNum(s.lastSeen, now());
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;

      state = repairState({ ...state, ...saved });

      // offline earnings
      const elapsedSec = Math.floor(Math.max(0, now() - state.lastSeen) / 1000);
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

  document.addEventListener("DOMContentLoaded", () => {
    // Stats
    const elCoins = document.getElementById("coins");
    const elPerClick = document.getElementById("perClick");
    const elPerSecond = document.getElementById("perSecond");

    const elClickCost = document.getElementById("clickCost");
    const elIdleCost = document.getElementById("idleCost");

    const elClickLevel = document.getElementById("clickLevel");
    const elIdleLevel = document.getElementById("idleLevel");

    // Buttons
    const btnClick = document.getElementById("clickBtn");
    const btnUpClick = document.getElementById("upgradeClick");
    const btnUpIdle = document.getElementById("upgradeIdle");
    const btnReset = document.getElementById("resetBtn");

    const status = document.getElementById("status");

    // Avatar UI
    const avatarBadge = document.getElementById("avatarBadge");
    const avatarName = document.getElementById("avatarName");
    const avatarSub = document.getElementById("avatarSub");

    const openAvatar = document.getElementById("openAvatar");
    const modal = document.getElementById("avatarModal");
    const closeAvatar = document.getElementById("closeAvatar");
    const cancelAvatar = document.getElementById("cancelAvatar");
    const applyAvatar = document.getElementById("applyAvatar");

    const previewAvatar = document.getElementById("previewAvatar");
    const previewName = document.getElementById("previewName");
    const previewSub = document.getElementById("previewSub");

    const colorRow = document.getElementById("colorRow");

    const optRobot = document.getElementById("opt-robot");
    const optHuman = document.getElementById("opt-human");
    const optAlien = document.getElementById("opt-alien");

    const miniRobot = document.getElementById("mini-robot");
    const miniHuman = document.getElementById("mini-human");
    const miniAlien = document.getElementById("mini-alien");

    if (!btnClick || !btnUpClick || !btnUpIdle) return;

    const setStatus = (msg) => {
      if (!status) return;
      status.textContent = msg;
      status.style.opacity = "1";
      clearTimeout(setStatus._t);
      setStatus._t = setTimeout(() => (status.style.opacity = "0.85"), 900);
    };

    // Avatar modal temp selection
    let draft = { type: "robot", color: "#7c5cff" };

    const renderAvatarEverywhere = () => {
      const type = state.avatar?.type || "robot";
      const color = state.avatar?.color || "#7c5cff";

      if (avatarBadge) avatarBadge.innerHTML = svgAvatar(type, color);
      if (avatarName) avatarName.textContent = AVATAR_NAMES[type] || "Avatar";
      if (avatarSub) avatarSub.textContent = `Color: ${color.toUpperCase()}`;

      // minis
      if (miniRobot) miniRobot.innerHTML = svgAvatar("robot", draft.color);
      if (miniHuman) miniHuman.innerHTML = svgAvatar("human", draft.color);
      if (miniAlien) miniAlien.innerHTML = svgAvatar("alien", draft.color);
    };

    const setSelectedOption = () => {
      for (const el of [optRobot, optHuman, optAlien]) el?.classList.remove("selected");
      if (draft.type === "robot") optRobot?.classList.add("selected");
      if (draft.type === "human") optHuman?.classList.add("selected");
      if (draft.type === "alien") optAlien?.classList.add("selected");
    };

    const renderPreview = () => {
      if (previewName) previewName.textContent = AVATAR_NAMES[draft.type] || "Avatar";
      if (previewSub) previewSub.textContent = `Color: ${draft.color.toUpperCase()}`;
      if (previewAvatar) previewAvatar.innerHTML = svgAvatar(draft.type, draft.color);

      // update minis with current color
      if (miniRobot) miniRobot.innerHTML = svgAvatar("robot", draft.color);
      if (miniHuman) miniHuman.innerHTML = svgAvatar("human", draft.color);
      if (miniAlien) miniAlien.innerHTML = svgAvatar("alien", draft.color);

      // color selection UI
      if (colorRow) {
        [...colorRow.querySelectorAll(".color-btn")].forEach(btn => {
          btn.classList.toggle("selected", btn.dataset.color === draft.color);
        });
      }
      setSelectedOption();
    };

    const openModal = () => {
      draft = { ...state.avatar };
      renderPreview();
      if (modal) {
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
      }
    };

    const closeModal = () => {
      if (modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
      }
    };

    // Build color buttons
    if (colorRow) {
      colorRow.innerHTML = "";
      for (const c of COLOR_PRESETS) {
        const b = document.createElement("button");
        b.className = "color-btn";
        b.type = "button";
        b.style.background = c;
        b.dataset.color = c;
        b.addEventListener("click", () => {
          draft.color = c;
          renderPreview();
        });
        colorRow.appendChild(b);
      }
    }

    // Avatar option clicks
    optRobot?.addEventListener("click", () => { draft.type = "robot"; renderPreview(); });
    optHuman?.addEventListener("click", () => { draft.type = "human"; renderPreview(); });
    optAlien?.addEventListener("click", () => { draft.type = "alien"; renderPreview(); });

    openAvatar?.addEventListener("click", openModal);
    closeAvatar?.addEventListener("click", closeModal);
    cancelAvatar?.addEventListener("click", closeModal);

    // Close modal if clicking outside
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    applyAvatar?.addEventListener("click", () => {
      state.avatar = { ...draft };
      save();
      renderAvatarEverywhere();
      setStatus(`Avatar saved ✔ (${AVATAR_NAMES[state.avatar.type]})`);
      closeModal();
    });

    // ----- Game update -----
    const update = () => {
      elCoins.textContent = fmt(state.coins);
      elPerClick.textContent = fmt(state.perClick);
      elPerSecond.textContent = fmt(state.perSecond);

      elClickCost.textContent = fmt(state.clickCost);
      elIdleCost.textContent = fmt(state.idleCost);

      elClickLevel.textContent = String(state.clickLevel);
      elIdleLevel.textContent = String(state.idleLevel);

      btnUpClick.disabled = state.coins < state.clickCost;
      btnUpIdle.disabled = state.coins < state.idleCost;
    };

    // init
    load();
    state = repairState(state);
    save();

    // initial avatar render
    draft = { ...state.avatar };
    renderAvatarEverywhere();
    renderPreview();

    update();
    setStatus("Loaded ✔ (auto-saves)");

    // click
    btnClick.addEventListener("click", () => {
      state.coins += state.perClick;
      update();
      save();
    });

    // upgrades
    btnUpClick.addEventListener("click", () => {
      if (state.coins < state.clickCost) return;

      state.coins -= state.clickCost;
      state.clickLevel += 1;
      state.perClick += 1;
      state.clickCost = Math.floor(state.clickCost * 1.60 + 1);

      update();
      save();
      setStatus(`Click Power upgraded ✔ (Level ${state.clickLevel})`);
    });

    btnUpIdle.addEventListener("click", () => {
      if (state.coins < state.idleCost) return;

      state.coins -= state.idleCost;
      state.idleLevel += 1;
      state.perSecond += 1;
      state.idleCost = Math.floor(state.idleCost * 1.70 + 1);

      update();
      save();
      setStatus(`Idle Income upgraded ✔ (Level ${state.idleLevel})`);
    });

    // reset
    btnReset?.addEventListener("click", () => {
      const ok = confirm("Reset your save? This clears local progress on this device.");
      if (!ok) return;

      localStorage.removeItem(SAVE_KEY);
      state = repairState({
        coins: 0, perClick: 1, perSecond: 0,
        clickCost: 10, idleCost: 25,
        clickLevel: 0, idleLevel: 0,
        avatar: { type: "robot", color: "#7c5cff" },
        lastSeen: now()
      });

      save();
      draft = { ...state.avatar };
      renderAvatarEverywhere();
      renderPreview();
      update();
      setStatus("Save reset ✔");
    });

    // idle tick
    setInterval(() => {
      if (state.perSecond > 0) {
        state.coins += state.perSecond;
        update();
      }
      save();
    }, 1000);
  });
})();
