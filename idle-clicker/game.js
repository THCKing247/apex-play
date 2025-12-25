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

  // ========= Avatar Builder Options =========
  const OPTIONS = {
    base: [
      { id: "human", label: "Human" },
      { id: "robot", label: "Robot" }
    ],
    hair: [
      { id: "none", label: "None" },
      { id: "short", label: "Short" },
      { id: "spike", label: "Spiky" },
      { id: "bun", label: "Bun" }
    ],
    eyes: [
      { id: "normal", label: "Normal" },
      { id: "happy", label: "Happy" },
      { id: "sleepy", label: "Sleepy" },
      { id: "cyber", label: "Cyber" }
    ],
    mouth: [
      { id: "smile", label: "Smile" },
      { id: "flat", label: "Flat" },
      { id: "open", label: "Open" }
    ],
    ears: [
      { id: "round", label: "Round" },
      { id: "small", label: "Small" },
      { id: "pointy", label: "Pointy" }
    ],
    shirt: [
      { id: "tee", label: "T-Shirt" },
      { id: "hoodie", label: "Hoodie" },
      { id: "jacket", label: "Jacket" }
    ],
    pants: [
      { id: "jeans", label: "Jeans" },
      { id: "shorts", label: "Shorts" },
      { id: "tech", label: "Tech Pants" }
    ],
    glasses: [
      { id: "none", label: "None" },
      { id: "round", label: "Round" },
      { id: "square", label: "Square" },
      { id: "visor", label: "Visor" }
    ]
  };

  const DEFAULT_AVATAR = {
    base: "human",
    skinColor: "#ffd6b0",
    hairStyle: "short",
    hairColor: "#111827",
    eyesStyle: "normal",
    mouthStyle: "smile",
    earsStyle: "round",
    shirtStyle: "hoodie",
    shirtColor: "#7c5cff",
    pantsStyle: "jeans",
    pantsColor: "#111827",
    glassesStyle: "none",
    glassesColor: "#22d3ee"
  };

  function safePick(value, list, fallback) {
    return list.some(x => x.id === value) ? value : fallback;
  }

  // ========= SVG Renderer =========
 function svgAvatar(a) {
  const av = { ...DEFAULT_AVATAR, ...(a || {}) };

  const skin = av.base === "robot" ? "#cbd5e1" : av.skinColor;
  const outline = "rgba(0,0,0,.25)";
  const hair = av.hairColor;
  const shirt = av.shirtColor;
  const pants = av.pantsColor;
  const glasses = av.glassesColor;

  /* proportions: medium head, medium legs */
  return `
  <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" role="img">
    <!-- background -->
    <rect width="120" height="180" rx="28" fill="rgba(0,0,0,.10)" />

    <!-- head -->
    <ellipse cx="60" cy="46" rx="30" ry="34" fill="${skin}" stroke="${outline}" stroke-width="1.5"/>

    <!-- ears (human only) -->
    ${av.base === "human" ? `
      <circle cx="28" cy="48" r="6" fill="${skin}" stroke="${outline}" stroke-width="1"/>
      <circle cx="92" cy="48" r="6" fill="${skin}" stroke="${outline}" stroke-width="1"/>
    ` : ``}

    <!-- hair -->
${av.base === "human" && av.hairStyle !== "none" ? `
  <path d="
    M26 40
    C28 18, 92 18, 94 40
    C88 32, 78 30, 60 30
    C42 30, 32 32, 26 40
    Z
  " fill="${hair}" />
  
  ${av.hairStyle === "short" ? `
    <path d="
      M30 42
      C36 34, 84 34, 90 42
      Z
    " fill="${hair}" />
  ` : ``}

  ${av.hairStyle === "bun" ? `
    <circle cx="60" cy="14" r="9" fill="${hair}" />
  ` : ``}
` : ``}


    <!-- eyes -->
    ${av.eyesStyle === "happy" ? `
      <path d="M42 46c4 4 8 4 12 0" stroke="${outline}" stroke-width="2" fill="none"/>
      <path d="M66 46c4 4 8 4 12 0" stroke="${outline}" stroke-width="2" fill="none"/>
    ` : av.eyesStyle === "sad" ? `
      <path d="M42 50c4-4 8-4 12 0" stroke="${outline}" stroke-width="2" fill="none"/>
      <path d="M66 50c4-4 8-4 12 0" stroke="${outline}" stroke-width="2" fill="none"/>
    ` : `
      <circle cx="48" cy="48" r="4" fill="rgba(0,0,0,.6)"/>
      <circle cx="72" cy="48" r="4" fill="rgba(0,0,0,.6)"/>
    `}

    <!-- mouth -->
    ${av.mouthStyle === "smile" ? `
      <path d="M48 64c6 6 18 6 24 0" stroke="${outline}" stroke-width="2" fill="none"/>
    ` : av.mouthStyle === "frown" ? `
      <path d="M48 70c6-6 18-6 24 0" stroke="${outline}" stroke-width="2" fill="none"/>
    ` : `
      <line x1="48" y1="66" x2="72" y2="66" stroke="${outline}" stroke-width="2"/>
    `}

    <!-- glasses -->
    ${av.glassesStyle !== "none" ? `
      <rect x="38" y="42" width="18" height="14" rx="5" fill="rgba(0,0,0,.15)" stroke="${glasses}" stroke-width="2"/>
      <rect x="64" y="42" width="18" height="14" rx="5" fill="rgba(0,0,0,.15)" stroke="${glasses}" stroke-width="2"/>
      <line x1="56" y1="49" x2="64" y2="49" stroke="${glasses}" stroke-width="2"/>
    ` : ``}

    <!-- torso -->
    <path d="
      M32 82
      Q60 92 88 82
      L94 118
      Q60 132 26 118
      Z
    " fill="${shirt}" stroke="${outline}" stroke-width="1.5"/>

    <!-- arms -->
    <rect x="18" y="86" width="14" height="40" rx="7" fill="${skin}" opacity="0.9"/>
    <rect x="88" y="86" width="14" height="40" rx="7" fill="${skin}" opacity="0.9"/>

    <!-- legs -->
    <rect x="42" y="124" width="14" height="40" rx="7" fill="${pants}"/>
    <rect x="64" y="124" width="14" height="40" rx="7" fill="${pants}"/>

    <!-- robot antenna -->
    ${av.base === "robot" ? `
      <line x1="60" y1="6" x2="60" y2="0" stroke="rgba(0,0,0,.4)" stroke-width="2"/>
      <circle cx="60" cy="0" r="4" fill="#22d3ee"/>
    ` : ``}
  </svg>
  `;
}


    // sanitize options
    av.base = safePick(av.base, OPTIONS.base, DEFAULT_AVATAR.base);
    av.hairStyle = safePick(av.hairStyle, OPTIONS.hair, DEFAULT_AVATAR.hairStyle);
    av.eyesStyle = safePick(av.eyesStyle, OPTIONS.eyes, DEFAULT_AVATAR.eyesStyle);
    av.mouthStyle = safePick(av.mouthStyle, OPTIONS.mouth, DEFAULT_AVATAR.mouthStyle);
    av.earsStyle = safePick(av.earsStyle, OPTIONS.ears, DEFAULT_AVATAR.earsStyle);
    av.shirtStyle = safePick(av.shirtStyle, OPTIONS.shirt, DEFAULT_AVATAR.shirtStyle);
    av.pantsStyle = safePick(av.pantsStyle, OPTIONS.pants, DEFAULT_AVATAR.pantsStyle);
    av.glassesStyle = safePick(av.glassesStyle, OPTIONS.glasses, DEFAULT_AVATAR.glassesStyle);

    const skin = av.base === "robot" ? "#9CA3AF" : av.skinColor;
    const hair = av.hairColor;
    const shirt = av.shirtColor;
    const pants = av.pantsColor;
    const glasses = av.glassesColor;

    // Base shapes
    const head = av.base === "robot"
      ? `<rect x="18" y="12" width="28" height="26" rx="10" fill="${skin}" stroke="rgba(255,255,255,.18)"/>`
      : `<circle cx="32" cy="24" r="14" fill="${skin}" stroke="rgba(255,255,255,.12)"/>`;

    // Ears (human only)
    let ears = "";
    if (av.base === "human") {
      if (av.earsStyle === "round") {
        ears = `
          <circle cx="18" cy="24" r="4" fill="${skin}" opacity="0.95"/>
          <circle cx="46" cy="24" r="4" fill="${skin}" opacity="0.95"/>`;
      } else if (av.earsStyle === "small") {
        ears = `
          <circle cx="19" cy="24" r="3" fill="${skin}" opacity="0.95"/>
          <circle cx="45" cy="24" r="3" fill="${skin}" opacity="0.95"/>`;
      } else {
        // pointy
        ears = `
          <path d="M18 24 L12 20 L14 30 Z" fill="${skin}" opacity="0.95"/>
          <path d="M46 24 L52 20 L50 30 Z" fill="${skin}" opacity="0.95"/>`;
      }
    }

    // Hair (human only)
    let hairLayer = "";
    if (av.base === "human") {
      if (av.hairStyle === "short") {
        hairLayer = `<path d="M18 22c2-10 24-10 28 0v2H18z" fill="${hair}" opacity="0.95"/>`;
      } else if (av.hairStyle === "spike") {
        hairLayer = `
          <path d="M18 22c2-10 24-10 28 0v2H18z" fill="${hair}" opacity="0.92"/>
          <path d="M22 12l3 8h-6zM32 10l3 10h-6zM42 12l3 8h-6z" fill="${hair}" opacity="0.92"/>`;
      } else if (av.hairStyle === "bun") {
        hairLayer = `
          <path d="M18 22c2-10 24-10 28 0v2H18z" fill="${hair}" opacity="0.92"/>
          <circle cx="32" cy="10" r="5" fill="${hair}" opacity="0.92"/>`;
      } else {
        hairLayer = "";
      }
    }

    // Eyes
    let eyes = "";
    if (av.base === "robot") {
      if (av.eyesStyle === "cyber") {
        eyes = `<rect x="22" y="20" width="20" height="8" rx="4" fill="rgba(0,0,0,.35)"/>
                <circle cx="28" cy="24" r="2" fill="${glasses}"/>
                <circle cx="36" cy="24" r="2" fill="${glasses}"/>`;
      } else {
        eyes = `<circle cx="28" cy="24" r="2" fill="rgba(0,0,0,.55)"/>
                <circle cx="36" cy="24" r="2" fill="rgba(0,0,0,.55)"/>`;
      }
    } else {
      if (av.eyesStyle === "happy") {
        eyes = `<path d="M24 24c2 2 4 2 6 0" stroke="rgba(0,0,0,.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
                <path d="M34 24c2 2 4 2 6 0" stroke="rgba(0,0,0,.55)" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      } else if (av.eyesStyle === "sleepy") {
        eyes = `<path d="M24 24h6" stroke="rgba(0,0,0,.55)" stroke-width="2" stroke-linecap="round"/>
                <path d="M34 24h6" stroke="rgba(0,0,0,.55)" stroke-width="2" stroke-linecap="round"/>`;
      } else if (av.eyesStyle === "cyber") {
        eyes = `<circle cx="28" cy="24" r="2" fill="${glasses}"/>
                <circle cx="36" cy="24" r="2" fill="${glasses}"/>`;
      } else {
        eyes = `<circle cx="28" cy="24" r="2" fill="rgba(0,0,0,.55)"/>
                <circle cx="36" cy="24" r="2" fill="rgba(0,0,0,.55)"/>`;
      }
    }

    // Mouth
    let mouth = "";
    if (av.mouthStyle === "smile") {
      mouth = `<path d="M27 32c3 3 7 3 10 0" stroke="rgba(0,0,0,.50)" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else if (av.mouthStyle === "flat") {
      mouth = `<path d="M27 33h10" stroke="rgba(0,0,0,.50)" stroke-width="2" stroke-linecap="round"/>`;
    } else {
      mouth = `<ellipse cx="32" cy="34" rx="4" ry="3" fill="rgba(0,0,0,.45)"/>`;
    }

    // Clothing (body)
    const body = `
      <rect x="16" y="38" width="32" height="18" rx="10" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.14)"/>
    `;

    // Shirt styles
    let shirtLayer = "";
    if (av.shirtStyle === "tee") {
      shirtLayer = `<rect x="18" y="40" width="28" height="12" rx="7" fill="${shirt}" opacity="0.92"/>`;
    } else if (av.shirtStyle === "hoodie") {
      shirtLayer = `
        <rect x="18" y="40" width="28" height="14" rx="8" fill="${shirt}" opacity="0.92"/>
        <path d="M26 40c2 4 10 4 12 0" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else {
      // jacket
      shirtLayer = `
        <rect x="18" y="40" width="28" height="14" rx="8" fill="${shirt}" opacity="0.78"/>
        <path d="M32 40v14" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-linecap="round"/>`;
    }

    // Pants styles (small visible)
    let pantsLayer = "";
    if (av.pantsStyle === "jeans") {
      pantsLayer = `<rect x="20" y="52" width="24" height="8" rx="4" fill="${pants}" opacity="0.92"/>`;
    } else if (av.pantsStyle === "shorts") {
      pantsLayer = `<rect x="20" y="52" width="24" height="6" rx="4" fill="${pants}" opacity="0.92"/>`;
    } else {
      pantsLayer = `<rect x="20" y="52" width="24" height="8" rx="2" fill="${pants}" opacity="0.92"/>`;
    }

    // Glasses
    let glassesLayer = "";
    if (av.glassesStyle === "round") {
      glassesLayer = `
        <circle cx="27" cy="24" r="5" fill="rgba(0,0,0,.18)" stroke="${glasses}" stroke-width="2"/>
        <circle cx="37" cy="24" r="5" fill="rgba(0,0,0,.18)" stroke="${glasses}" stroke-width="2"/>
        <path d="M32 24h0" stroke="${glasses}" stroke-width="2" stroke-linecap="round"/>`;
    } else if (av.glassesStyle === "square") {
      glassesLayer = `
        <rect x="22" y="19" width="10" height="10" rx="3" fill="rgba(0,0,0,.18)" stroke="${glasses}" stroke-width="2"/>
        <rect x="32" y="19" width="10" height="10" rx="3" fill="rgba(0,0,0,.18)" stroke="${glasses}" stroke-width="2"/>
        <path d="M32 24h0" stroke="${glasses}" stroke-width="2" stroke-linecap="round"/>`;
    } else if (av.glassesStyle === "visor") {
      glassesLayer = `
        <rect x="21" y="18" width="22" height="12" rx="6" fill="rgba(0,0,0,.25)" stroke="${glasses}" stroke-width="2"/>
        <path d="M23 24h18" stroke="${glasses}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
    }

    const baseLabel = av.base === "robot" ? "Robot" : "Human";

    return `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${baseLabel} avatar">
        <rect width="64" height="64" rx="18" fill="rgba(0,0,0,.18)"/>
        ${ears}
        ${head}
        ${hairLayer}
        ${glassesLayer}
        ${eyes}
        ${mouth}
        ${body}
        ${shirtLayer}
        ${pantsLayer}
        ${av.base === "robot" ? `<circle cx="32" cy="10" r="3" fill="rgba(34,211,238,.70)"/>` : ``}
      </svg>
    `;
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
    avatar: { ...DEFAULT_AVATAR },
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

    if (!s.avatar || typeof s.avatar !== "object") s.avatar = { ...DEFAULT_AVATAR };
    s.avatar = { ...DEFAULT_AVATAR, ...s.avatar };

    // normalize options
    s.avatar.base = safePick(s.avatar.base, OPTIONS.base, DEFAULT_AVATAR.base);
    s.avatar.hairStyle = safePick(s.avatar.hairStyle, OPTIONS.hair, DEFAULT_AVATAR.hairStyle);
    s.avatar.eyesStyle = safePick(s.avatar.eyesStyle, OPTIONS.eyes, DEFAULT_AVATAR.eyesStyle);
    s.avatar.mouthStyle = safePick(s.avatar.mouthStyle, OPTIONS.mouth, DEFAULT_AVATAR.mouthStyle);
    s.avatar.earsStyle = safePick(s.avatar.earsStyle, OPTIONS.ears, DEFAULT_AVATAR.earsStyle);
    s.avatar.shirtStyle = safePick(s.avatar.shirtStyle, OPTIONS.shirt, DEFAULT_AVATAR.shirtStyle);
    s.avatar.pantsStyle = safePick(s.avatar.pantsStyle, OPTIONS.pants, DEFAULT_AVATAR.pantsStyle);
    s.avatar.glassesStyle = safePick(s.avatar.glassesStyle, OPTIONS.glasses, DEFAULT_AVATAR.glassesStyle);

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

      const elapsedSec = Math.floor(Math.max(0, now() - state.lastSeen) / 1000);
      if (elapsedSec > 0 && state.perSecond > 0) {
        state.coins += elapsedSec * state.perSecond;
      }
      state.lastSeen = now();
    } catch { /* ignore */ }
  }

  function save() {
    state.lastSeen = now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function fillSelect(selectEl, list) {
    selectEl.innerHTML = "";
    for (const opt of list) {
      const o = document.createElement("option");
      o.value = opt.id;
      o.textContent = opt.label;
      selectEl.appendChild(o);
    }
  }

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

    // base buttons
    const baseHuman = document.getElementById("baseHuman");
    const baseRobot = document.getElementById("baseRobot");

    // selects/inputs
    const hairStyle = document.getElementById("hairStyle");
    const hairColor = document.getElementById("hairColor");
    const eyesStyle = document.getElementById("eyesStyle");
    const mouthStyle = document.getElementById("mouthStyle");
    const earsStyle = document.getElementById("earsStyle");
    const skinColor = document.getElementById("skinColor");
    const shirtStyle = document.getElementById("shirtStyle");
    const shirtColor = document.getElementById("shirtColor");
    const pantsStyle = document.getElementById("pantsStyle");
    const pantsColor = document.getElementById("pantsColor");
    const glassesStyle = document.getElementById("glassesStyle");
    const glassesColor = document.getElementById("glassesColor");

    const setStatus = (msg) => {
      if (!status) return;
      status.textContent = msg;
      status.style.opacity = "1";
      clearTimeout(setStatus._t);
      setStatus._t = setTimeout(() => (status.style.opacity = "0.85"), 900);
    };

    const updateGameUI = () => {
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

    const renderAvatarCard = () => {
      if (avatarBadge) avatarBadge.innerHTML = svgAvatar(state.avatar);
      if (avatarName) avatarName.textContent = (state.avatar.base === "robot") ? "Robot" : "Human";
      if (avatarSub) avatarSub.textContent =
        `${state.avatar.hairStyle} hair • ${state.avatar.shirtStyle} • ${state.avatar.pantsStyle} • ${state.avatar.glassesStyle} glasses`;
    };

    // Draft while modal open
    let draft = { ...DEFAULT_AVATAR };

    const syncControlsFromDraft = () => {
      baseHuman.classList.toggle("active", draft.base === "human");
      baseRobot.classList.toggle("active", draft.base === "robot");

      hairStyle.value = draft.hairStyle;
      hairColor.value = draft.hairColor;
      eyesStyle.value = draft.eyesStyle;
      mouthStyle.value = draft.mouthStyle;
      earsStyle.value = draft.earsStyle;
      skinColor.value = draft.skinColor;
      shirtStyle.value = draft.shirtStyle;
      shirtColor.value = draft.shirtColor;
      pantsStyle.value = draft.pantsStyle;
      pantsColor.value = draft.pantsColor;
      glassesStyle.value = draft.glassesStyle;
      glassesColor.value = draft.glassesColor;

      // Disable human-only controls when robot
      const humanOnly = [hairStyle, hairColor, earsStyle, skinColor];
      for (const el of humanOnly) el.disabled = (draft.base === "robot");

      // If robot, still allow glasses/shirt/pants/eyes/mouth
    };

    const renderPreview = () => {
      if (previewAvatar) previewAvatar.innerHTML = svgAvatar(draft);
      if (previewName) previewName.textContent = (draft.base === "robot") ? "Robot" : "Human";
      if (previewSub) previewSub.textContent = `Hair: ${draft.hairStyle} • Eyes: ${draft.eyesStyle} • Outfit: ${draft.shirtStyle}/${draft.pantsStyle}`;
      syncControlsFromDraft();
    };

    const openModal = () => {
      draft = { ...state.avatar }; // opens with current build (not “auto selecting”, just loading your saved build)
      renderPreview();
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    };

    // Populate selects
    fillSelect(hairStyle, OPTIONS.hair);
    fillSelect(eyesStyle, OPTIONS.eyes);
    fillSelect(mouthStyle, OPTIONS.mouth);
    fillSelect(earsStyle, OPTIONS.ears);
    fillSelect(shirtStyle, OPTIONS.shirt);
    fillSelect(pantsStyle, OPTIONS.pants);
    fillSelect(glassesStyle, OPTIONS.glasses);

    // Base toggle
    baseHuman.addEventListener("click", () => { draft.base = "human"; renderPreview(); });
    baseRobot.addEventListener("click", () => { draft.base = "robot"; renderPreview(); });

    // Change handlers
    const bind = (el, key, isColor = false) => {
      el.addEventListener("change", () => {
        draft[key] = isColor ? el.value : el.value;
        renderPreview();
      });
      el.addEventListener("input", () => {
        // for color inputs live update
        if (el.type === "color") {
          draft[key] = el.value;
          renderPreview();
        }
      });
    };

    bind(hairStyle, "hairStyle");
    bind(hairColor, "hairColor", true);
    bind(eyesStyle, "eyesStyle");
    bind(mouthStyle, "mouthStyle");
    bind(earsStyle, "earsStyle");
    bind(skinColor, "skinColor", true);
    bind(shirtStyle, "shirtStyle");
    bind(shirtColor, "shirtColor", true);
    bind(pantsStyle, "pantsStyle");
    bind(pantsColor, "pantsColor", true);
    bind(glassesStyle, "glassesStyle");
    bind(glassesColor, "glassesColor", true);

    // Modal controls
    openAvatar.addEventListener("click", openModal);
    closeAvatar.addEventListener("click", closeModal);
    cancelAvatar.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    applyAvatar.addEventListener("click", () => {
      // if robot, ensure human-only still safe
      if (draft.base === "robot") {
        draft.hairStyle = "none";
        draft.earsStyle = "round";
      }
      state.avatar = { ...draft };
      save();
      renderAvatarCard();
      setStatus("Avatar saved ✔");
      closeModal();
    });

    // Game init
    load();
    state = repairState(state);
    save();

    // initial UI
    renderAvatarCard();
    draft = { ...state.avatar };
    syncControlsFromDraft();
    renderPreview();

    updateGameUI();
    setStatus("Loaded ✔ (auto-saves)");

    // Gameplay
    btnClick.addEventListener("click", () => {
      state.coins += state.perClick;
      updateGameUI();
      save();
    });

    btnUpClick.addEventListener("click", () => {
      if (state.coins < state.clickCost) return;
      state.coins -= state.clickCost;
      state.clickLevel += 1;
      state.perClick += 1;
      state.clickCost = Math.floor(state.clickCost * 1.60 + 1);
      updateGameUI();
      save();
      setStatus(`Click Power upgraded ✔ (Level ${state.clickLevel})`);
    });

    btnUpIdle.addEventListener("click", () => {
      if (state.coins < state.idleCost) return;
      state.coins -= state.idleCost;
      state.idleLevel += 1;
      state.perSecond += 1;
      state.idleCost = Math.floor(state.idleCost * 1.70 + 1);
      updateGameUI();
      save();
      setStatus(`Idle Income upgraded ✔ (Level ${state.idleLevel})`);
    });

    btnReset?.addEventListener("click", () => {
      const ok = confirm("Reset your save? This clears local progress on this device.");
      if (!ok) return;

      localStorage.removeItem(SAVE_KEY);
      state = repairState({
        coins: 0, perClick: 1, perSecond: 0,
        clickCost: 10, idleCost: 25,
        clickLevel: 0, idleLevel: 0,
        avatar: { ...DEFAULT_AVATAR },
        lastSeen: now()
      });

      save();
      renderAvatarCard();
      updateGameUI();
      setStatus("Save reset ✔");
    });

    // idle tick
    setInterval(() => {
      if (state.perSecond > 0) {
        state.coins += state.perSecond;
        updateGameUI();
      }
      save();
    }, 1000);
  });
})();
