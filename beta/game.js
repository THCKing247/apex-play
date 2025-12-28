/* Gridiron Career Sim — v1.4.2 */
(() => {
  'use strict';

  const VERSION = 'v1.4.2';
  const LS_KEY = 'gcs_save_v142';
  const MAX_ENERGY = 100;
  const MAX_HOURS = 25;

  const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'LB', 'CB', 'S', 'DL'];

  const STYLES_BY_POS = {
  QB: [
      { id:"Gunslinger", name:"Gunslinger", desc:"High risk, high reward passing.", mods:{ throwPower:+3, accuracy:-1, speed:+0, stamina:+0, strength:+0 } },
      { id:"Pocket", name:"Pocket Passer", desc:"Safe, accurate throws from the pocket.", mods:{ throwPower:+0, accuracy:+3, speed:-1, stamina:+0, strength:+0 } },
      { id:"Dual", name:"Dual Threat", desc:"Balanced passing and rushing ability.", mods:{ throwPower:+1, accuracy:+1, speed:+2, stamina:+1, strength:+0 } }
  ],
  RB: [
      { id:"Power", name:"Power Back", desc:"Bruising runner with strength.", mods:{ throwPower:+0, accuracy:+0, speed:+0, stamina:+2, strength:+3 } },
      { id:"Speed", name:"Speed Back", desc:"Elusive runner with breakaway speed.", mods:{ throwPower:+0, accuracy:+0, speed:+3, stamina:+1, strength:+0 } },
      { id:"Receiving", name:"Receiving Back", desc:"Versatile runner and receiver.", mods:{ throwPower:+0, accuracy:+2, speed:+1, stamina:+1, strength:+0 } }
  ],
  WR: [
      { id:"Deep", name:"Deep Threat", desc:"Speedster for long passes.", mods:{ throwPower:+0, accuracy:+2, speed:+3, stamina:+0, strength:+0 } },
      { id:"Possession", name:"Possession Receiver", desc:"Reliable hands and route running.", mods:{ throwPower:+0, accuracy:+3, speed:+0, stamina:+1, strength:+0 } },
      { id:"Slot", name:"Slot Receiver", desc:"Quick and agile in the middle.", mods:{ throwPower:+0, accuracy:+2, speed:+2, stamina:+0, strength:+0 } }
  ],
  TE: [
      { id:"Blocking", name:"Blocking Tight End", desc:"Strong blocker with receiving skills.", mods:{ throwPower:+0, accuracy:+1, speed:+0, stamina:+1, strength:+3 } },
      { id:"Receiving", name:"Receiving Tight End", desc:"Athletic pass catcher.", mods:{ throwPower:+0, accuracy:+2, speed:+1, stamina:+1, strength:+1 } }
  ],
  LB: [
      { id:"Coverage", name:"Coverage Linebacker", desc:"Strong in pass coverage.", mods:{ throwPower:+0, accuracy:+0, speed:+2, stamina:+2, strength:+1 } },
      { id:"Blitz", name:"Blitzing Linebacker", desc:"Aggressive pass rusher.", mods:{ throwPower:+0, accuracy:+0, speed:+1, stamina:+1, strength:+3 } },
      { id:"Versatile", name:"Versatile", desc:"Balanced pass rush and run defense.", mods:{ throwPower:+0, accuracy:+0, speed:+0, stamina:+2, strength:+3 } }
  ],
  CB: [
      { id:"Man", name:"Man Coverage", desc:"Lockdown one-on-one defender.", mods:{ throwPower:+0, accuracy:+0, speed:+3, stamina:+1, strength:+0 } },
      { id:"Zone", name:"Zone Coverage", desc:"Smart zone defender.", mods:{ throwPower:+0, accuracy:+0, speed:+1, stamina:+2, strength:+0 } }
    ],
    S: [
      { id:"Free", name:"Free Safety", desc:"Ball-hawking deep defender.", mods:{ throwPower:+0, accuracy:+0, speed:+2, stamina:+2, strength:+0 } },
      { id:"Strong", name:"Strong Safety", desc:"Hard-hitting run supporter.", mods:{ throwPower:+0, accuracy:+0, speed:+1, stamina:+1, strength:+2 } }
    ],
    DL: [
      { id:"Pass", name:"Pass Rusher", desc:"Elite pass rushing ability.", mods:{ throwPower:+0, accuracy:+0, speed:+1, stamina:+1, strength:+3 } },
      { id:"Run", name:"Run Stopper", desc:"Dominant against the run.", mods:{ throwPower:+0, accuracy:+0, speed:+0, stamina:+1, strength:+3 } }
    ]
  };

  const JOBS = [
    { id:'none', name:'No Job', hours:0, pay:0 },
    { id:'fastfood', name:'Fast Food', hours:8, pay:80 },
    { id:'retail', name:'Retail', hours:10, pay:120 },
    { id:'tutor', name:'Tutor', hours:6, pay:150 },
    { id:'lifeguard', name:'Lifeguard', hours:12, pay:180 }
  ];

  const STORE_ITEMS = [
    { id:'cleats', name:'Elite Cleats', price:150, desc:'+2 Speed', slot:'feet', mods:{ speed:+2 } },
    { id:'gloves', name:'Receiver Gloves', price:120, desc:'+2 Accuracy', slot:'hands', mods:{ accuracy:+2 } },
    { id:'weights', name:'Weight Set', price:200, desc:'+2 Strength', slot:'home', mods:{ strength:+2 } },
    { id:'protein', name:'Protein Shakes', price:80, desc:'+2 Stamina', slot:'home', mods:{ stamina:+2 } },
    { id:'film', name:'Game Film', price:100, desc:'+2 Throw Power', slot:'home', mods:{ throwPower:+2 } }
  ];

  // Helper functions
  function rint(n, max) {
    if(max !== undefined) return Math.floor(Math.random() * (max - n + 1)) + n;
    return Math.floor(Math.random() * n);
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function pick(arr) {
    return arr[rint(arr.length)];
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function $$(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  function fmtMoney(n) {
    return '$' + n.toLocaleString();
  }

  function openModal(title, bodyHTML, footHTML) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHTML || '';
    $('#modalFoot').innerHTML = footHTML || '';
    $('#modal').showModal();
  }

  function closeModal() {
    $('#modal').close();
  }

  function setModal(title, bodyHTML, footHTML) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHTML || '';
    $('#modalFoot').innerHTML = footHTML || '';
  }

  // State management
  function defaultState(){
    return {
      version: VERSION,
      player: null,
      money: 500,
      level: 1,
      xp: 0,
      skillPoints: 0,
      energy: MAX_ENERGY,
      hours: MAX_HOURS,
      prep: 0,
      career: {
        year: 1,
        week: 1,
        maxWeeks: 12,
        recordW: 0,
        recordL: 0,
        inPost: false,
        postWeek: 0,
        jobId: 'none'
      },
      inventory: {
        owned: [],
        equipped: {}
      },
      log: [],
      gameStats: {
        gamesPlayed: 0,
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        completions: 0,
        attempts: 0,
        rushingYards: 0,
        rushingTDs: 0,
        carries: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTDs: 0,
        tackles: 0,
        sacks: 0,
        defInterceptions: 0,
        forcedFumbles: 0,
        fumbleRecoveries: 0,
        defTDs: 0,
        fumbles: 0,
        gameLog: [],
        seasonStats: {}
      }
    };
  }

  function load(){
    try {
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return defaultState();
      const s = JSON.parse(raw);
      if(!s.version) s.version = VERSION;
      if(!s.inventory) s.inventory = defaultState().inventory;
      if(!s.career) s.career = defaultState().career;
      if(!s.gameStats) s.gameStats = defaultState().gameStats;
      if(!s.gameStats.fumbles) s.gameStats.fumbles = 0;
      if(!s.gameStats.gameLog) s.gameStats.gameLog = [];
      if(!s.gameStats.seasonStats) s.gameStats.seasonStats = {};
      return s;
    } catch(e) {
      return defaultState();
    }
  }

  function save(s){
    s.version = VERSION;
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }

  function logPush(s, type, msg){
    if(!s.log) s.log = [];
    s.log.push({ type, msg, week: s.career.week, year: s.career.year });
    if(s.log.length > 50) s.log.shift();
  }

  // Player creation
  function basePlayerFromArchetype(pos, styleId){
    const base = {
      QB: { throwPower: 60, accuracy: 60, speed: 50, stamina: 60, strength: 50 },
      RB: { throwPower: 30, accuracy: 50, speed: 65, stamina: 65, strength: 60 },
      WR: { throwPower: 30, accuracy: 65, speed: 70, stamina: 55, strength: 45 },
      TE: { throwPower: 35, accuracy: 60, speed: 55, stamina: 60, strength: 65 },
      LB: { throwPower: 30, accuracy: 40, speed: 60, stamina: 65, strength: 70 },
      CB: { throwPower: 30, accuracy: 45, speed: 75, stamina: 60, strength: 50 },
      S: { throwPower: 30, accuracy: 50, speed: 70, stamina: 65, strength: 55 },
      DL: { throwPower: 25, accuracy: 35, speed: 55, stamina: 60, strength: 75 }
    };
    const style = STYLES_BY_POS[pos].find(s => s.id === styleId);
    const stats = { ...base[pos] };
    if(style) {
      Object.keys(style.mods).forEach(k => {
        stats[k] = clamp(stats[k] + style.mods[k], 0, 99);
      });
    }
    return stats;
  }

  function openCreatePlayer(s){
    const firstNames = ["Alex", "Blake", "Cameron", "Drew", "Ethan", "Finn", "Grant", "Hayden", "Isaiah", "Jake", "Kai", "Logan", "Mason", "Noah", "Owen", "Parker", "Quinn", "Riley", "Sam", "Tyler"];
    const lastNames = ["Anderson", "Brooks", "Carter", "Davis", "Evans", "Foster", "Gray", "Harris", "Jackson", "Kelly", "Lewis", "Martinez", "Nelson", "Parker", "Reed", "Smith", "Taylor", "Walker", "White", "Young"];
    const schools = ["Lincoln High", "Roosevelt High", "Washington High", "Jefferson High", "Madison High", "Adams High", "Jackson High", "Monroe High", "Harrison High", "Van Buren High"];

    if(!window.__draftPlayer) {
      window.__draftPlayer = {
        name: `${pick(firstNames)} ${pick(lastNames)}`,
        position: 'QB',
        style: 'Gunslinger',
        highSchool: pick(schools),
        height: "6'0\"",
        weight: "200 lbs",
        hometown: "Unknown",
        jerseyNumber: "00",
        avatar: {
          skinTone: 3,
          hairStyle: 1,
          hairColor: 2,
          eyeColor: 1,
          facialHair: 0
        }
      };
    }

  const d = window.__draftPlayer;
  const styles = getStylesForPosition(d.position);
    if(!d.avatar) {
      d.avatar = { skinTone: 3, hairStyle: 1, hairColor: 2, eyeColor: 1, facialHair: 0 };
    }

    const bodyHTML = `
      <div style="display:grid; grid-template-columns: 1fr 280px; gap:24px;">
        <div>
          <div class="stats-tabs" style="margin-bottom:20px;">
            <button class="stats-tab active" data-tab="basic">Basic Info</button>
            <button class="stats-tab" data-tab="physical">Physical</button>
            <button class="stats-tab" data-tab="avatar">Avatar</button>
            <button class="stats-tab" data-tab="style">Play Style</button>
          </div>
          
          <div id="tab-basic" class="tab-content active">
            <div style="display:grid; gap:16px;">
              <div>
                <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">Player Name</label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="cp_name" value="${d.name}" placeholder="Enter name" style="flex:1; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);" />
                  <button class="btn small" onclick="randomizeName()">🎲 Random</button>
          </div>
        </div>
              <div>
                <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">High School</label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="cp_school" value="${d.highSchool}" placeholder="School name" style="flex:1; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);" />
                  <button class="btn small" onclick="randomizeSchool()">🎲 Random</button>
                </div>
              </div>
              <div>
                <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">Position</label>
                <div class="select-wrapper">
                  <select id="cp_pos" style="width:100%; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);">
                    ${POSITIONS.map(p => `<option value="${p}" ${p === d.position ? 'selected' : ''}>${p}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div id="tab-physical" class="tab-content" style="display:none;">
            <div style="display:grid; gap:16px;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div>
                  <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">Height</label>
                  <div style="display:flex; gap:8px;">
                    <input type="text" id="cp_height" value="${d.height}" placeholder="6'0\"" style="flex:1; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);" />
                    <button class="btn small" onclick="randomizeHeight()">🎲</button>
                  </div>
                </div>
                <div>
                  <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">Weight</label>
                  <div style="display:flex; gap:8px;">
                    <input type="text" id="cp_weight" value="${d.weight}" placeholder="200 lbs" style="flex:1; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);" />
                    <button class="btn small" onclick="randomizeWeight()">🎲</button>
                  </div>
                </div>
              </div>
              <div>
                <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">Hometown</label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="cp_hometown" value="${d.hometown}" placeholder="City, State" style="flex:1; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);" />
                  <button class="btn small" onclick="randomizeHometown()">🎲 Random</button>
                </div>
              </div>
              <div>
                <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-warm);">Jersey Number</label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="cp_jersey" value="${d.jerseyNumber}" placeholder="00" style="flex:1; padding:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:var(--text-warm);" />
                  <button class="btn small" onclick="randomizeJersey()">🎲 Random</button>
                </div>
              </div>
        </div>
      </div>

          <div id="tab-avatar" class="tab-content" style="display:none;">
            <div style="display:grid; gap:20px;">
        <div>
                <label style="display:block; margin-bottom:10px; font-weight:600; color:var(--text-warm);">Skin Tone</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${[1,2,3,4,5,6].map(i => `
                    <button class="avatar-option ${d.avatar.skinTone === i ? 'active' : ''}" data-avatar="skinTone" data-value="${i}" style="width:50px; height:50px; border-radius:50%; border:2px solid ${d.avatar.skinTone === i ? 'var(--accent)' : 'rgba(255,255,255,.2)'}; background:${getSkinColor(i)}; cursor:pointer;"></button>
                  `).join('')}
                </div>
        </div>
        <div>
                <label style="display:block; margin-bottom:10px; font-weight:600; color:var(--text-warm);">Hair Style</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${[0,1,2,3,4,5].map(i => `
                    <button class="avatar-option ${d.avatar.hairStyle === i ? 'active' : ''}" data-avatar="hairStyle" data-value="${i}" style="padding:8px 12px; border-radius:8px; border:2px solid ${d.avatar.hairStyle === i ? 'var(--accent)' : 'rgba(255,255,255,.2)'}; background:${d.avatar.hairStyle === i ? 'rgba(124,92,255,.15)' : 'rgba(255,255,255,.05)'}; cursor:pointer; font-size:12px;">${getHairStyleName(i)}</button>
                  `).join('')}
                </div>
              </div>
              <div>
                <label style="display:block; margin-bottom:10px; font-weight:600; color:var(--text-warm);">Hair Color</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${[1,2,3,4,5,6].map(i => `
                    <button class="avatar-option ${d.avatar.hairColor === i ? 'active' : ''}" data-avatar="hairColor" data-value="${i}" style="width:40px; height:40px; border-radius:8px; border:2px solid ${d.avatar.hairColor === i ? 'var(--accent)' : 'rgba(255,255,255,.2)'}; background:${getHairColor(i)}; cursor:pointer;"></button>
                  `).join('')}
                </div>
              </div>
              <div>
                <label style="display:block; margin-bottom:10px; font-weight:600; color:var(--text-warm);">Eye Color</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${[1,2,3,4,5].map(i => `
                    <button class="avatar-option ${d.avatar.eyeColor === i ? 'active' : ''}" data-avatar="eyeColor" data-value="${i}" style="width:40px; height:40px; border-radius:50%; border:2px solid ${d.avatar.eyeColor === i ? 'var(--accent)' : 'rgba(255,255,255,.2)'}; background:${getEyeColor(i)}; cursor:pointer;"></button>
                  `).join('')}
                </div>
              </div>
              <div>
                <label style="display:block; margin-bottom:10px; font-weight:600; color:var(--text-warm);">Facial Hair</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${[0,1,2,3,4].map(i => `
                    <button class="avatar-option ${d.avatar.facialHair === i ? 'active' : ''}" data-avatar="facialHair" data-value="${i}" style="padding:8px 12px; border-radius:8px; border:2px solid ${d.avatar.facialHair === i ? 'var(--accent)' : 'rgba(255,255,255,.2)'}; background:${d.avatar.facialHair === i ? 'rgba(124,92,255,.15)' : 'rgba(255,255,255,.05)'}; cursor:pointer; font-size:12px;">${getFacialHairName(i)}</button>
                  `).join('')}
                </div>
              </div>
              <div style="margin-top:8px;">
                <button class="btn small" onclick="randomizeAvatar()" style="width:100%;">🎲 Randomize Avatar</button>
          </div>
        </div>
      </div>

          <div id="tab-style" class="tab-content" style="display:none;">
            <div>
              <label style="display:block; margin-bottom:12px; font-weight:600; color:var(--text-warm);">Choose Your Play Style</label>
              <div class="radioCards">
                ${styles.map((st, idx) => `
                  <label class="radioCard ${st.id === d.style ? 'active' : ''}">
                    <input type="radio" name="pstyle" value="${st.id}" ${st.id === d.style ? 'checked' : ''} />
                    <div class="radioDesc">
                      <div class="r-title">${st.name}</div>
                      <div class="muted small">${st.desc}</div>
                      <div class="radioMods">
                        ${Object.keys(st.mods).map(k => {
                          const v = st.mods[k];
                          return `<span class="chip ${v > 0 ? 'good' : ''}">${k}: ${v > 0 ? '+' : ''}${v}</span>`;
                        }).join('')}
                      </div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
        </div>
      </div>

        <div style="background:rgba(255,255,255,.05); border-radius:12px; padding:20px; border:1px solid rgba(255,255,255,.1);">
          <div style="text-align:center; margin-bottom:16px; font-weight:600; color:var(--text-warm);">Player Preview</div>
          <div id="avatar-preview" style="width:200px; height:200px; margin:0 auto; background:rgba(255,255,255,.08); border-radius:12px; display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,.15);">
            ${renderAvatarPreview(d.avatar)}
          </div>
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,.1);">
            <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Name</div>
            <div style="font-weight:600; color:var(--text-warm);" id="preview-name">${d.name}</div>
          </div>
          <div style="margin-top:12px;">
            <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Position</div>
            <div style="font-weight:600; color:var(--text-warm);" id="preview-pos">${d.position}</div>
          </div>
          <div style="margin-top:12px;">
            <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Jersey #</div>
            <div style="font-weight:600; color:var(--text-warm);" id="preview-jersey">#${d.jerseyNumber}</div>
          </div>
        </div>
    </div>
  `;

    const footHTML = `
      <button class="btn primary" id="btnCreatePlayer">Start Career</button>
    `;

    openModal('Create Your Player', bodyHTML, footHTML);

    // Tab switching
    $$('.stats-tab[data-tab]').forEach(tab => {
      tab.onclick = () => {
        $$('.stats-tab').forEach(t => t.classList.remove('active'));
        $$('.tab-content').forEach(c => c.style.display = 'none');
        tab.classList.add('active');
        $(`#tab-${tab.getAttribute('data-tab')}`).style.display = 'block';
      };
    });

    // Input handlers
    $('#cp_name').oninput = (e) => { 
      if(window.__draftPlayer) {
        window.__draftPlayer.name = e.target.value;
        $('#preview-name').textContent = e.target.value || 'Player Name';
      }
    };
    $('#cp_school').oninput = (e) => { if(window.__draftPlayer) window.__draftPlayer.highSchool = e.target.value; };
    $('#cp_pos').onchange = (e) => { 
      handlePositionChange(e.target.value);
      $('#preview-pos').textContent = e.target.value;
    };
    $('#cp_height').oninput = (e) => { if(window.__draftPlayer) window.__draftPlayer.height = e.target.value; };
    $('#cp_weight').oninput = (e) => { if(window.__draftPlayer) window.__draftPlayer.weight = e.target.value; };
    $('#cp_hometown').oninput = (e) => { if(window.__draftPlayer) window.__draftPlayer.hometown = e.target.value; };
    $('#cp_jersey').oninput = (e) => { 
      if(window.__draftPlayer) {
        window.__draftPlayer.jerseyNumber = e.target.value;
        $('#preview-jersey').textContent = '#' + (e.target.value || '00');
      }
    };
    
    // Avatar option handlers - use event delegation on modal body
    $('#modalBody').addEventListener('click', (e) => {
      const btn = e.target.closest('.avatar-option[data-avatar]');
      if(!btn) return;
      const type = btn.getAttribute('data-avatar');
      const value = parseInt(btn.getAttribute('data-value'));
      if(window.__draftPlayer && window.__draftPlayer.avatar) {
        window.__draftPlayer.avatar[type] = value;
        updateAvatarPreview();
        // Update active states for all buttons of this type
        $$(`.avatar-option[data-avatar="${type}"]`).forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'rgba(255,255,255,.2)';
          if(b.getAttribute('data-avatar') === 'hairStyle' || b.getAttribute('data-avatar') === 'facialHair') {
            b.style.background = 'rgba(255,255,255,.05)';
          }
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--accent)';
        if(type === 'hairStyle' || type === 'facialHair') {
          btn.style.background = 'rgba(124,92,255,.15)';
        }
      }
    });
    
    $$('input[name="pstyle"]').forEach(r => {
      r.onchange = (e) => { handleStyleChange(e.target.value); };
    });

    $('#btnCreatePlayer').onclick = () => {
      const name = $('#cp_name').value.trim();
      const pos = $('#cp_pos').value;
      const style = $$('input[name="pstyle"]:checked')[0]?.value || styles[0].id;
      const hs = $('#cp_school').value.trim();
      const height = $('#cp_height').value.trim();
      const weight = $('#cp_weight').value.trim();
      const hometown = $('#cp_hometown').value.trim();
      const jerseyNumber = $('#cp_jersey').value.trim();
      const avatar = window.__draftPlayer?.avatar || { skinTone: 3, hairStyle: 1, hairColor: 2, eyeColor: 1, facialHair: 0 };

      if(!name || !hs) {
        alert('Please fill in name and high school.');
        return;
      }

      startCareerFromCreator({ name, pos, style, hs, height, weight, hometown, jerseyNumber, avatar });
    };
  }

  function getSkinColor(i) {
    const colors = ['#fdbcb4', '#f8d5c4', '#e0ac69', '#c68642', '#8d5524', '#654321'];
    return colors[i - 1] || colors[2];
  }

  function getHairColor(i) {
    const colors = ['#1a1a1a', '#4a3728', '#8b4513', '#d2691e', '#daa520', '#f5deb3'];
    return colors[i - 1] || colors[1];
  }

  function getEyeColor(i) {
    const colors = ['#1a1a1a', '#4a4a4a', '#8b4513', '#228b22', '#4169e1'];
    return colors[i - 1] || colors[0];
  }

  function getHairStyleName(i) {
    const names = ['Bald', 'Short', 'Medium', 'Long', 'Curly', 'Fade'];
    return names[i] || 'Short';
  }

  function getFacialHairName(i) {
    const names = ['None', 'Stubble', 'Goatee', 'Beard', 'Mustache'];
    return names[i] || 'None';
  }

  function renderAvatarPreview(avatar) {
    if(!avatar) avatar = { skinTone: 3, hairStyle: 1, hairColor: 2, eyeColor: 1, facialHair: 0 };
    const skin = getSkinColor(avatar.skinTone);
    const hairColor = getHairColor(avatar.hairColor);
    const eyeColor = getEyeColor(avatar.eyeColor);
    
    // Create darker shade for shading
    const darkenColor = (color, amount) => {
      const num = parseInt(color.replace("#", ""), 16);
      const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
      const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
      const b = Math.max(0, (num & 0xFF) - amount);
      return `rgb(${r},${g},${b})`;
    };
    const skinDark = darkenColor(skin, 25);
    const skinLight = skin;
    
    // Hair style paths
    const hairPaths = {
      0: '', // Bald
      1: `<path d="M 25 30 Q 25 20, 50 20 Q 75 20, 75 30 Q 75 25, 50 25 Q 25 25, 25 30" fill="${hairColor}"/>
          <ellipse cx="50" cy="22" rx="25" ry="8" fill="${hairColor}" opacity="0.9"/>`, // Short
      2: `<path d="M 20 28 Q 20 15, 50 15 Q 80 15, 80 28 Q 80 20, 50 20 Q 20 20, 20 28" fill="${hairColor}"/>
          <ellipse cx="50" cy="18" rx="30" ry="10" fill="${hairColor}" opacity="0.9"/>
          <path d="M 30 25 Q 50 22, 70 25" fill="${hairColor}" stroke="${hairColor}" stroke-width="1.5"/>`, // Medium
      3: `<path d="M 18 26 Q 18 12, 50 12 Q 82 12, 82 26 Q 82 18, 50 18 Q 18 18, 18 26" fill="${hairColor}"/>
          <ellipse cx="50" cy="16" rx="32" ry="12" fill="${hairColor}" opacity="0.9"/>
          <path d="M 25 22 Q 50 19, 75 22" fill="${hairColor}" stroke="${hairColor}" stroke-width="2"/>
          <path d="M 28 24 Q 50 21, 72 24" fill="${hairColor}" stroke="${hairColor}" stroke-width="1.5"/>`, // Long
      4: `<path d="M 20 28 Q 20 15, 50 15 Q 80 15, 80 28 Q 80 20, 50 20 Q 20 20, 20 28" fill="${hairColor}"/>
          <ellipse cx="50" cy="18" rx="30" ry="10" fill="${hairColor}" opacity="0.9"/>
          <path d="M 28 24 Q 50 20, 72 24 Q 70 28, 50 26 Q 30 28, 28 24" fill="${hairColor}" opacity="0.8"/>
          <path d="M 32 26 Q 50 22, 68 26" fill="${hairColor}" stroke="${hairColor}" stroke-width="1.5"/>`, // Curly
      5: `<path d="M 25 30 Q 25 20, 50 20 Q 75 20, 75 30 Q 75 25, 50 25 Q 25 25, 25 30" fill="${hairColor}"/>
          <ellipse cx="50" cy="22" rx="25" ry="8" fill="${hairColor}" opacity="0.9"/>
          <path d="M 30 28 Q 50 24, 70 28" fill="${hairColor}" stroke="${hairColor}" stroke-width="1.5"/>
          <rect x="22" y="30" width="56" height="8" fill="${hairColor}" opacity="0.7"/>` // Fade
    };
    
    // Facial hair paths
    const facialHairPaths = {
      0: '', // None
      1: `<path d="M 38 60 Q 50 62, 62 60 Q 60 68, 50 68 Q 40 68, 38 60" fill="${hairColor}" opacity="0.4"/>
          <ellipse cx="50" cy="64" rx="12" ry="4" fill="${hairColor}" opacity="0.3"/>`, // Stubble
      2: `<path d="M 42 58 Q 50 60, 58 58 Q 56 66, 50 66 Q 44 66, 42 58" fill="${hairColor}" opacity="0.6"/>
          <path d="M 42 58 Q 50 60, 58 58" fill="${hairColor}" stroke="${hairColor}" stroke-width="1" opacity="0.5"/>
          <ellipse cx="50" cy="62" rx="8" ry="3" fill="${hairColor}" opacity="0.4"/>`, // Goatee
      3: `<path d="M 35 58 Q 50 60, 65 58 Q 63 70, 50 70 Q 37 70, 35 58" fill="${hairColor}" opacity="0.7"/>
          <path d="M 35 58 Q 50 60, 65 58" fill="${hairColor}" stroke="${hairColor}" stroke-width="1.5" opacity="0.6"/>
          <ellipse cx="50" cy="64" rx="15" ry="5" fill="${hairColor}" opacity="0.5"/>
          <path d="M 38 60 Q 50 62, 62 60" fill="${hairColor}" stroke="${hairColor}" stroke-width="1" opacity="0.4"/>`, // Beard
      4: `<path d="M 42 58 Q 50 60, 58 58 Q 56 64, 50 64 Q 44 64, 42 58" fill="${hairColor}" opacity="0.6"/>
          <path d="M 42 58 Q 50 60, 58 58" fill="${hairColor}" stroke="${hairColor}" stroke-width="2" opacity="0.5"/>
          <ellipse cx="50" cy="61" rx="8" ry="2" fill="${hairColor}" opacity="0.4"/>` // Mustache
    };
    
    return `
      <svg width="200" height="200" viewBox="0 0 100 100" style="overflow:visible;">
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${skinLight};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${skinDark};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${hairColor};stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:${darkenColor(hairColor, 30)};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Head shape (more oval/realistic) -->
        <ellipse cx="50" cy="48" rx="18" ry="22" fill="url(#skinGrad)" stroke="${skinDark}" stroke-width="0.5" opacity="0.3"/>
        <ellipse cx="50" cy="48" rx="18" ry="22" fill="${skinLight}"/>
        
        <!-- Neck -->
        <ellipse cx="50" cy="72" rx="6" ry="8" fill="url(#skinGrad)"/>
        
        <!-- Hair (behind head) -->
        ${hairPaths[avatar.hairStyle] || ''}
        
        <!-- Forehead shading -->
        <ellipse cx="50" cy="38" rx="16" ry="8" fill="${skinDark}" opacity="0.15"/>
        
        <!-- Eyebrows -->
        <path d="M 38 40 Q 43 38, 48 40" fill="${hairColor}" stroke="${darkenColor(hairColor, 20)}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
        <path d="M 52 40 Q 57 38, 62 40" fill="${hairColor}" stroke="${darkenColor(hairColor, 20)}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
        
        <!-- Eyes (more realistic) -->
        <ellipse cx="43" cy="45" rx="4" ry="2.5" fill="white" opacity="0.9"/>
        <ellipse cx="57" cy="45" rx="4" ry="2.5" fill="white" opacity="0.9"/>
        <circle cx="43" cy="45" r="2.5" fill="${eyeColor}"/>
        <circle cx="57" cy="45" r="2.5" fill="${eyeColor}"/>
        <circle cx="43.5" cy="44.5" r="1" fill="rgba(0,0,0,0.6)"/>
        <circle cx="57.5" cy="44.5" r="1" fill="rgba(0,0,0,0.6)"/>
        <ellipse cx="43" cy="44" rx="1.5" ry="0.8" fill="white" opacity="0.8"/>
        <ellipse cx="57" cy="44" rx="1.5" ry="0.8" fill="white" opacity="0.8"/>
        
        <!-- Eye highlights -->
        <ellipse cx="42" cy="44" rx="0.8" ry="0.5" fill="white" opacity="0.9"/>
        <ellipse cx="56" cy="44" rx="0.8" ry="0.5" fill="white" opacity="0.9"/>
        
        <!-- Nose (more defined) -->
        <path d="M 50 48 L 48 54 L 50 55 L 52 54 Z" fill="${skinDark}" opacity="0.2"/>
        <path d="M 48 52 Q 50 53, 52 52" fill="none" stroke="${skinDark}" stroke-width="0.8" opacity="0.3"/>
        <ellipse cx="47" cy="52" rx="1" ry="1.5" fill="${skinDark}" opacity="0.15"/>
        <ellipse cx="53" cy="52" rx="1" ry="1.5" fill="${skinDark}" opacity="0.15"/>
        
        <!-- Cheeks (subtle shading) -->
        <ellipse cx="38" cy="52" rx="3" ry="4" fill="${skinDark}" opacity="0.1"/>
        <ellipse cx="62" cy="52" rx="3" ry="4" fill="${skinDark}" opacity="0.1"/>
        
        <!-- Mouth (more realistic) -->
        <ellipse cx="50" cy="58" rx="4" ry="1.5" fill="rgba(200,100,100,0.6)"/>
        <path d="M 46 58 Q 50 60, 54 58" fill="none" stroke="rgba(150,80,80,0.8)" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M 46 58 Q 50 59, 54 58" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.8" stroke-linecap="round"/>
        
        <!-- Chin shading -->
        <ellipse cx="50" cy="66" rx="10" ry="4" fill="${skinDark}" opacity="0.1"/>
        
        <!-- Facial Hair -->
        ${facialHairPaths[avatar.facialHair] || ''}
        
        <!-- Hair texture/details (if not bald) -->
        ${avatar.hairStyle > 0 && avatar.hairStyle < 4 ? `
          <path d="M 30 28 Q 50 25, 70 28" fill="none" stroke="${darkenColor(hairColor, 15)}" stroke-width="0.8" opacity="0.4"/>
          <path d="M 32 30 Q 50 27, 68 30" fill="none" stroke="${darkenColor(hairColor, 15)}" stroke-width="0.8" opacity="0.3"/>
        ` : ''}
      </svg>
    `;
  }

  function updateAvatarPreview() {
    if(window.__draftPlayer && window.__draftPlayer.avatar) {
      const preview = $('#avatar-preview');
      if(preview) {
        preview.innerHTML = renderAvatarPreview(window.__draftPlayer.avatar);
      }
    }
  }

  function randomizeAvatar() {
    if(!window.__draftPlayer) return;
    if(!window.__draftPlayer.avatar) window.__draftPlayer.avatar = {};
    window.__draftPlayer.avatar.skinTone = rint(1, 6);
    window.__draftPlayer.avatar.hairStyle = rint(0, 5);
    window.__draftPlayer.avatar.hairColor = rint(1, 6);
    window.__draftPlayer.avatar.eyeColor = rint(1, 5);
    window.__draftPlayer.avatar.facialHair = rint(0, 4);
    openCreatePlayer(load());
  }

  function getStylesForPosition(pos) {
    return STYLES_BY_POS[pos] || [];
  }

  function handlePositionChange(newPos) {
    if(!window.__draftPlayer) return;
    window.__draftPlayer.position = newPos;
    const styles = getStylesForPosition(newPos);
    window.__draftPlayer.style = styles[0].id;
    openCreatePlayer(load());
  }

  function handleStyleChange(newStyle) {
    if(!window.__draftPlayer) return;
    window.__draftPlayer.style = newStyle;
    $$('.radioCard').forEach(card => {
      card.classList.remove('active');
      if(card.querySelector('input').value === newStyle) {
        card.classList.add('active');
        card.querySelector('input').checked = true;
      }
    });
  }

  function randomizeName() {
    if(!window.__draftPlayer) return;
    const firstNames = ["Alex", "Blake", "Cameron", "Drew", "Ethan", "Finn", "Grant", "Hayden", "Isaiah", "Jake", "Kai", "Logan", "Mason", "Noah", "Owen", "Parker", "Quinn", "Riley", "Sam", "Tyler"];
    const lastNames = ["Anderson", "Brooks", "Carter", "Davis", "Evans", "Foster", "Gray", "Harris", "Jackson", "Kelly", "Lewis", "Martinez", "Nelson", "Parker", "Reed", "Smith", "Taylor", "Walker", "White", "Young"];
    window.__draftPlayer.name = `${pick(firstNames)} ${pick(lastNames)}`;
    const el = $('#cp_name');
    if(el) {
      el.value = window.__draftPlayer.name;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function randomizeSchool() {
    if(!window.__draftPlayer) return;
    const schools = ["Lincoln High", "Roosevelt High", "Washington High", "Jefferson High", "Madison High", "Adams High", "Jackson High", "Monroe High", "Harrison High", "Van Buren High"];
    window.__draftPlayer.highSchool = pick(schools);
    const el = $('#cp_school');
    if(el) {
      el.value = window.__draftPlayer.highSchool;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function randomizeHeight() {
    if(!window.__draftPlayer) return;
    const feet = rint(5, 7);
    const inches = rint(0, 11);
    window.__draftPlayer.height = `${feet}'${inches}"`;
    const el = $('#cp_height');
    if(el) {
      el.value = window.__draftPlayer.height;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function randomizeWeight() {
    if(!window.__draftPlayer) return;
    const weight = rint(170, 280);
    window.__draftPlayer.weight = `${weight} lbs`;
    const el = $('#cp_weight');
    if(el) {
      el.value = window.__draftPlayer.weight;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function randomizeHometown() {
    if(!window.__draftPlayer) return;
    const cities = ["Miami", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Boston"];
    const states = ["FL", "CA", "TX", "NY", "IL", "PA", "OH", "GA", "NC", "MI"];
    window.__draftPlayer.hometown = `${pick(cities)}, ${pick(states)}`;
    const el = $('#cp_hometown');
    if(el) {
      el.value = window.__draftPlayer.hometown;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function randomizeJersey() {
    if(!window.__draftPlayer) return;
    window.__draftPlayer.jerseyNumber = String(rint(1, 99)).padStart(2, '0');
    const el = $('#cp_jersey');
    if(el) {
      el.value = window.__draftPlayer.jerseyNumber;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function startCareerFromCreator(d){
    const st = load();
    const baseStats = basePlayerFromArchetype(d.pos, d.style);
    
    st.player = {
      name: d.name,
      position: d.pos,
      archetype: d.style,
      highSchool: d.hs,
      height: d.height || "6'0\"",
      weight: d.weight || "200 lbs",
      hometown: d.hometown || "Unknown",
      jerseyNumber: d.jerseyNumber || "00",
      avatar: d.avatar || { skinTone: 3, hairStyle: 1, hairColor: 2, eyeColor: 1, facialHair: 0 },
      ...baseStats
    };
    
    st.statsBase = {
      throwPower: st.player.throwPower,
      accuracy: st.player.accuracy,
      speed: st.player.speed,
      stamina: st.player.stamina,
      strength: st.player.strength
    };
    
    st.career = { year:1, week:1, maxWeeks:12, recordW:0, recordL:0, inPost:false, postWeek:0, jobId:'none' };
    st.gameStats = defaultState().gameStats;
    save(st);
    closeModal();
    render(st);
  }

  // Game logic
  function derivedStats(s){
    if (!s.statsBase) return {};
    const base = { ...s.statsBase };
    const inv = s.inventory.equipped || {};
    Object.keys(inv).forEach(slot => {
      const item = STORE_ITEMS.find(x => x.id === inv[slot]);
      if(item && item.mods) {
        Object.keys(item.mods).forEach(k => {
          base[k] = clamp((base[k] || 0) + item.mods[k], 0, 99);
        });
      }
    });
    return base;
  }

  function calcOVR(stats){
    if(!stats) return 0;
    const pos = load().player?.position || 'QB';
    const weights = {
      QB: { throwPower:0.3, accuracy:0.3, speed:0.15, stamina:0.15, strength:0.1 },
      RB: { throwPower:0.05, accuracy:0.1, speed:0.3, stamina:0.3, strength:0.25 },
      WR: { throwPower:0.05, accuracy:0.25, speed:0.35, stamina:0.2, strength:0.15 },
      TE: { throwPower:0.05, accuracy:0.2, speed:0.2, stamina:0.25, strength:0.3 },
      LB: { throwPower:0.05, accuracy:0.1, speed:0.25, stamina:0.25, strength:0.35 },
      CB: { throwPower:0.05, accuracy:0.15, speed:0.4, stamina:0.25, strength:0.15 },
      S: { throwPower:0.05, accuracy:0.15, speed:0.3, stamina:0.3, strength:0.2 },
      DL: { throwPower:0.05, accuracy:0.1, speed:0.2, stamina:0.25, strength:0.4 }
    };
    const w = weights[pos] || weights.QB;
    let sum = 0;
    let total = 0;
    Object.keys(w).forEach(k => {
      sum += (stats[k] || 0) * w[k];
      total += w[k];
    });
    return Math.round(sum / total);
  }

  function xpNeeded(level) {
    return 100 + (level - 1) * 50;
  }

  function startNewWeek(s){
    s.career.week += 1;
    s.energy = clamp(s.energy + 10, 0, MAX_ENERGY);
    s.hours = MAX_HOURS;
    if(s.career.week > s.career.maxWeeks) {
      s.career.week = 1;
      s.career.year += 1;
      if(s.career.year > 4) {
        logPush(s, 'Graduated', `${s.player.name} graduated from high school!`);
      }
    }
    weeklyJobApply(s);
  }

  function weeklyJobApply(s){
    const job = JOBS.find(j => j.id === s.career.jobId);
    if(job && job.hours > 0) {
      s.hours = clamp(s.hours - job.hours, 0, MAX_HOURS);
      s.money += job.pay;
      logPush(s, 'Job', `Earned ${fmtMoney(job.pay)} from ${job.name}.`);
    }
  }

  function simulateGame(s){
    const stats = derivedStats(s);
    const ovr = calcOVR(stats);
    const opp = clamp(rint(ovr + (Math.random()*18 - 9)), 55, 99);

    const prepBonus = clamp(s.prep, 0, 60) / 100;
    const energyFactor = (0.6 + (s.energy/MAX_ENERGY)*0.4);
    const base = (ovr - opp) / 28;
    const style = s.player.archetype;
    let variance = 0.10;
    if(style === 'Gunslinger') variance = 0.16;
    if(style === 'Pocket') variance = 0.08;

    const winP = clamp(0.48 + base*0.22 + prepBonus*0.10, 0.12, 0.88);
    const didWin = Math.random() < winP;

    const offense = (ovr*energyFactor) + (prepBonus*12) + (Math.random()*12 - 6);
    const defense = (opp*0.95) + (Math.random()*10 - 5);
    let ptsFor = clamp(rint(offense - defense + 24), 7, 56);
    let ptsAg  = clamp(rint((opp - ovr)*0.5 + 21 + (Math.random()*10 - 5)), 3, 52);
    if(didWin && ptsFor <= ptsAg) ptsFor = ptsAg + rint(3 + Math.random()*10);
    if(!didWin && ptsFor >= ptsAg) ptsAg = ptsFor + rint(3 + Math.random()*10);

    const pos = s.player.position;
    const perfFactor = energyFactor * (1 + prepBonus * 0.3);
    
    // Scale stats based on overall rating (better players get better stats)
    const ovrMultiplier = clamp((ovr - 50) / 50, 0.5, 1.5);
    
    const gs = s.gameStats || defaultState().gameStats;
    
    const gameStats = {
      week: s.career.week,
      year: s.career.year,
      opponent: opp,
      win: didWin,
      scoreFor: ptsFor,
      scoreAgainst: ptsAg,
      passingYards: 0, passingTDs: 0, interceptions: 0, completions: 0, attempts: 0,
      rushingYards: 0, rushingTDs: 0, carries: 0,
      receptions: 0, receivingYards: 0, receivingTDs: 0,
      tackles: 0, sacks: 0, defInterceptions: 0, forcedFumbles: 0, fumbleRecoveries: 0, defTDs: 0,
      fumbles: 0,
    };
    
    gs.gamesPlayed += 1;
    
    if(pos === 'QB'){
      const baseAtt = 15 + stats.throwPower * 0.2 + Math.random() * 10;
      const att = rint(baseAtt * ovrMultiplier);
      const compRate = clamp(stats.accuracy / 100 + (perfFactor - 1) * 0.1, 0.45, 0.85);
      const comp = rint(att * compRate);
      const baseYards = comp * (7 + stats.throwPower * 0.12 + Math.random() * 6);
      const yards = rint(baseYards * ovrMultiplier);
      const baseTDs = comp * 0.1 + Math.random() * 1.5;
      const tds = rint(baseTDs * ovrMultiplier);
      const ints = rint((att - comp) * 0.08 + Math.random() * 1.5);
      const rushYds = rint((stats.speed * 0.4 + Math.random() * 20) * ovrMultiplier);
      const rushTDs = Math.random() < (0.12 * ovrMultiplier) ? 1 : 0;
      
      gameStats.attempts = att;
      gameStats.completions = comp;
      gameStats.passingYards = yards;
      gameStats.passingTDs = tds;
      gameStats.interceptions = ints;
      gameStats.carries = rint((3 + Math.random() * 4) * ovrMultiplier);
      gameStats.rushingYards = rushYds;
      gameStats.rushingTDs = rushTDs;
      const fumbles = Math.random() < 0.12 ? rint(1 + Math.random() * 1.5) : 0;
      gameStats.fumbles = fumbles;
      
      gs.attempts += att;
      gs.completions += comp;
      gs.passingYards += yards;
      gs.passingTDs += tds;
      gs.interceptions += ints;
      gs.carries += gameStats.carries;
      gs.rushingYards += rushYds;
      gs.rushingTDs += rushTDs;
      gs.fumbles += fumbles;
    } else if(pos === 'RB'){
      const baseCarries = 12 + stats.stamina * 0.15 + Math.random() * 8;
      const carries = rint(baseCarries * ovrMultiplier);
      const ypc = 3 + stats.speed * 0.08 + stats.strength * 0.05 + (perfFactor - 1) * 2;
      const baseYards = carries * ypc + Math.random() * 40;
      const yards = rint(baseYards * ovrMultiplier);
      const baseTDs = carries * 0.08 + Math.random() * 1.2;
      const tds = rint(baseTDs * ovrMultiplier);
      const baseRec = 2 + stats.accuracy * 0.05 + Math.random() * 3;
      const rec = rint(baseRec * ovrMultiplier);
      const recYds = rint((rec * (5 + stats.speed * 0.1 + Math.random() * 5)) * ovrMultiplier);
      const recTDs = Math.random() < (0.1 * ovrMultiplier) ? 1 : 0;
      
      gameStats.carries = carries;
      gameStats.rushingYards = yards;
      gameStats.rushingTDs = tds;
      gameStats.receptions = rec;
      gameStats.receivingYards = recYds;
      gameStats.receivingTDs = recTDs;
      const fumbles = Math.random() < 0.15 ? rint(1 + Math.random() * 1.5) : 0;
      gameStats.fumbles = fumbles;
      
      gs.carries += carries;
      gs.rushingYards += yards;
      gs.rushingTDs += tds;
      gs.receptions += rec;
      gs.receivingYards += recYds;
      gs.receivingTDs += recTDs;
      gs.fumbles += fumbles;
    } else if(pos === 'WR' || pos === 'TE'){
      const baseTargets = 5 + stats.accuracy * 0.12 + Math.random() * 5;
      const targets = rint(baseTargets * ovrMultiplier);
      const catchRate = clamp(stats.accuracy / 100 + (perfFactor - 1) * 0.15, 0.5, 0.9);
      const rec = rint(targets * catchRate);
      const ypr = 8 + stats.speed * 0.2 + Math.random() * 8;
      const baseYards = rec * ypr;
      const yards = rint(baseYards * ovrMultiplier);
      const baseTDs = rec * 0.12 + Math.random() * 1.2;
      const tds = rint(baseTDs * ovrMultiplier);
      const rushYds = pos === 'WR' ? rint((Math.random() * 15) * ovrMultiplier) : 0;
      
      gameStats.receptions = rec;
      gameStats.receivingYards = yards;
      gameStats.receivingTDs = tds;
      if(rushYds > 0) {
        gameStats.carries = rint((1 + Math.random() * 2) * ovrMultiplier);
        gameStats.rushingYards = rushYds;
      }
      
      gs.receptions += rec;
      gs.receivingYards += yards;
      gs.receivingTDs += tds;
      if(rushYds > 0) {
        gs.carries += gameStats.carries;
        gs.rushingYards += rushYds;
      }
      const fumbles = Math.random() < 0.08 ? rint(1 + Math.random() * 1.5) : 0;
      gameStats.fumbles = fumbles;
      gs.fumbles += fumbles;
      } else {
      const baseTackles = pos === 'DL' ? 3 : pos === 'LB' ? 6 : 2;
      const tackles = rint((baseTackles + stats.strength * 0.08 + stats.stamina * 0.08 + Math.random() * 3) * ovrMultiplier);
      const sacks = pos === 'DL' || pos === 'LB' ? (Math.random() < (0.35 * ovrMultiplier) ? rint((1 + Math.random() * 1.2) * ovrMultiplier) : 0) : 0;
      const ints = (pos === 'CB' || pos === 'S') ? (Math.random() < (0.2 * ovrMultiplier) ? 1 : 0) : 0;
      const ff = Math.random() < (0.12 * ovrMultiplier) ? 1 : 0;
      const fr = Math.random() < (0.15 * ovrMultiplier) ? 1 : 0;
      const defTD = (ints > 0 || fr > 0) && Math.random() < (0.25 * ovrMultiplier) ? 1 : 0;
      
      gameStats.tackles = tackles;
      gameStats.sacks = sacks;
      gameStats.defInterceptions = ints;
      gameStats.forcedFumbles = ff;
      gameStats.fumbleRecoveries = fr;
      gameStats.defTDs = defTD;
      
      gs.tackles += tackles;
      gs.sacks += sacks;
      gs.defInterceptions += ints;
      gs.forcedFumbles += ff;
      gs.fumbleRecoveries += fr;
      gs.defTDs += defTD;
    }
    
    if(!gs.gameLog) gs.gameLog = [];
    gs.gameLog.push(gameStats);
    
    const seasonKey = `Y${s.career.year}`;
    if(!gs.seasonStats) gs.seasonStats = {};
    if(!gs.seasonStats[seasonKey]) {
      gs.seasonStats[seasonKey] = {
        gamesPlayed: 0,
        passingYards: 0, passingTDs: 0, interceptions: 0, completions: 0, attempts: 0,
        rushingYards: 0, rushingTDs: 0, carries: 0,
        receptions: 0, receivingYards: 0, receivingTDs: 0,
        tackles: 0, sacks: 0, defInterceptions: 0, forcedFumbles: 0, fumbleRecoveries: 0, defTDs: 0,
        fumbles: 0
      };
    }
    const season = gs.seasonStats[seasonKey];
    season.gamesPlayed += 1;
    Object.keys(gameStats).forEach(k => {
      if(typeof gameStats[k] === 'number' && k !== 'week' && k !== 'year' && k !== 'opponent' && k !== 'win' && k !== 'scoreFor' && k !== 'scoreAgainst') {
        season[k] = (season[k] || 0) + gameStats[k];
      }
    });
    
    s.gameStats = gs;

    const margin = Math.abs(ptsFor - ptsAg);
    const xpGain = clamp(rint(55 + (didWin?30:10) + prepBonus*35 + (energyFactor*20) - margin*0.8 + (Math.random()*10)), 25, 140);
    s.xp += xpGain;

    const eCost = clamp(rint(22 + (Math.random()*10) - s.level*0.3), 12, 35);
    s.energy = clamp(s.energy - eCost, 0, MAX_ENERGY);
    s.prep = clamp(s.prep - 15, 0, 60);

    if(didWin) {
      s.career.recordW += 1;
      logPush(s, 'Win', `Won ${ptsFor}-${ptsAg} vs OVR ${opp} opponent.`);
    } else {
      s.career.recordL += 1;
      logPush(s, 'Loss', `Lost ${ptsAg}-${ptsFor} vs OVR ${opp} opponent.`);
    }

    while(s.xp >= xpNeeded(s.level)) {
      s.xp -= xpNeeded(s.level);
      s.level += 1;
      s.skillPoints += 1;
      logPush(s, 'Level Up', `Reached level ${s.level}!`);
    }

    if(s.career.week === s.career.maxWeeks && !s.career.inPost) {
      const winPct = s.career.recordW / (s.career.recordW + s.career.recordL);
      if(winPct >= 0.6) {
          s.career.inPost = true;
          s.career.postWeek = 1;
        logPush(s, 'Playoffs', 'Made the playoffs!');
      }
    }

    if(s.career.inPost) {
      s.career.postWeek += 1;
      if(s.career.postWeek > 3) {
    s.career.inPost = false;
    s.career.postWeek = 0;
        startNewWeek(s);
      }
    } else {
    startNewWeek(s);
  }

      save(s);
      render(s);
  }

  // Stats and Records systems
  function generateNPCPlayers(position, count = 8){
    const firstNames = ["Alex", "Blake", "Cameron", "Drew", "Ethan", "Finn", "Grant", "Hayden", "Isaiah", "Jake", "Kai", "Logan", "Mason", "Noah", "Owen", "Parker", "Quinn", "Riley", "Sam", "Tyler"];
    const lastNames = ["Anderson", "Brooks", "Carter", "Davis", "Evans", "Foster", "Gray", "Harris", "Jackson", "Kelly", "Lewis", "Martinez", "Nelson", "Parker", "Reed", "Smith", "Taylor", "Walker", "White", "Young"];
    
    const baseStats = {
      QB: { passingYards: 180, passingTDs: 1.2, interceptions: 0.8, completions: 14, attempts: 24, rushingYards: 25, rushingTDs: 0.2, fumbles: 0.12 },
      RB: { rushingYards: 85, rushingTDs: 0.8, carries: 18, receptions: 2.5, receivingYards: 20, receivingTDs: 0.1, fumbles: 0.15 },
      WR: { receptions: 4.5, receivingYards: 65, receivingTDs: 0.5, rushingYards: 5, fumbles: 0.08 },
      TE: { receptions: 3.2, receivingYards: 45, receivingTDs: 0.4, fumbles: 0.08 },
      LB: { tackles: 7.5, sacks: 0.4, defInterceptions: 0.2, forcedFumbles: 0.15, fumbleRecoveries: 0.2, defTDs: 0.05 },
      CB: { tackles: 4.2, sacks: 0.1, defInterceptions: 0.3, forcedFumbles: 0.1, fumbleRecoveries: 0.15, defTDs: 0.08 },
      S: { tackles: 5.8, sacks: 0.15, defInterceptions: 0.35, forcedFumbles: 0.12, fumbleRecoveries: 0.18, defTDs: 0.1 },
      DL: { tackles: 5.5, sacks: 0.6, defInterceptions: 0.05, forcedFumbles: 0.2, fumbleRecoveries: 0.15, defTDs: 0.03 }
    };
    
    const base = baseStats[position] || {};
    const npcs = [];
    
    for(let i = 0; i < count; i++){
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      const stats = {};
      
      const year = rint(1, 4);
      const schoolYear = getSchoolYear(year);
      
      if(year === 1){
        Object.keys(base).forEach(key => {
          stats[key] = 0;
        });
      } else {
        const yearMultiplier = [0, 0.75, 0.9, 1.0][year - 1];
        Object.keys(base).forEach(key => {
          const baseVal = base[key];
          const variance = baseVal * 0.4;
          const scaledBase = baseVal * yearMultiplier;
          stats[key] = Math.max(0, scaledBase + (Math.random() * variance * 2 - variance) * yearMultiplier);
        });
      }
      
      npcs.push({ name, stats, year, schoolYear });
    }
    
    if(position === 'QB') npcs.sort((a, b) => b.stats.passingYards - a.stats.passingYards);
    else if(position === 'RB') npcs.sort((a, b) => b.stats.rushingYards - a.stats.rushingYards);
    else if(position === 'WR' || position === 'TE') npcs.sort((a, b) => b.stats.receivingYards - a.stats.receivingYards);
    else npcs.sort((a, b) => b.stats.tackles - a.stats.tackles);
    
    return npcs;
  }

  function getSchoolYear(year){
    const yearMap = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior' };
    return yearMap[year] || `Year ${year}`;
  }

  function openStats(s){
    const gs = s.gameStats || defaultState().gameStats;
    const pos = s.player.position;
    const playerSchoolYear = getSchoolYear(s.career.year);
    
    const latestGame = gs.gameLog && gs.gameLog.length > 0 ? gs.gameLog[gs.gameLog.length - 1] : null;
    const seasonKey = `Y${s.career.year}`;
    const seasonStats = gs.seasonStats && gs.seasonStats[seasonKey] ? gs.seasonStats[seasonKey] : null;
    const seasonGames = seasonStats ? seasonStats.gamesPlayed || 1 : 1;
    const careerGames = gs.gamesPlayed || 1;
    
    const npcPlayers = generateNPCPlayers(pos, 8);
    
    const buildPassingStats = (stats, games, npcs) => {
      if(pos !== 'QB') return '';
      const playerPerGame = games > 0 ? games : 1;
      const compPct = stats.attempts > 0 ? ((stats.completions / stats.attempts) * 100).toFixed(1) : '0.0';
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.passingYards / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.passingTDs / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${Math.round(stats.completions / playerPerGame)}</td>
          <td style="text-align:right; font-weight:700;">${Math.round(stats.attempts / playerPerGame)}</td>
          <td style="text-align:right; font-weight:700;">${compPct}%</td>
          <td style="text-align:right; font-weight:700;">${(stats.interceptions / playerPerGame).toFixed(1)}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const passingYards = npc.stats.passingYards || 0;
        const passingTDs = npc.stats.passingTDs || 0;
        const completions = npc.stats.completions || 0;
        const attempts = npc.stats.attempts || 0;
        const interceptions = npc.stats.interceptions || 0;
        const npcCompPct = attempts > 0 ? ((completions / attempts) * 100).toFixed(1) : '0.0';
      return `
        <tr>
            <td>${npc.name} <span class="muted" style="font-size:11px;">(${npc.schoolYear})</span></td>
            <td style="text-align:right;">${passingYards.toFixed(1)}</td>
            <td style="text-align:right;">${passingTDs.toFixed(1)}</td>
            <td style="text-align:right;">${Math.round(completions)}</td>
            <td style="text-align:right;">${Math.round(attempts)}</td>
            <td style="text-align:right;">${npcCompPct}%</td>
            <td style="text-align:right;">${interceptions.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

      return playerRow + npcRows;
    };
    
    const buildRushingStats = (stats, games, npcs) => {
      if(pos === 'CB' || pos === 'S' || pos === 'DL' || pos === 'LB') return '';
      const playerPerGame = games > 0 ? games : 1;
      const playerYPC = stats.carries > 0 ? (stats.rushingYards / stats.carries).toFixed(1) : '0.0';
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.rushingYards / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.rushingTDs / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.carries / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${playerYPC}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const rushingYards = npc.stats.rushingYards || 0;
        const rushingTDs = npc.stats.rushingTDs || 0;
        const carries = npc.stats.carries || 0;
        const npcYPC = carries > 0 ? (rushingYards / carries).toFixed(1) : '0.0';
        return `
          <tr>
            <td>${npc.name} <span class="muted" style="font-size:11px;">(${npc.schoolYear})</span></td>
            <td style="text-align:right;">${rushingYards.toFixed(1)}</td>
            <td style="text-align:right;">${rushingTDs.toFixed(1)}</td>
            <td style="text-align:right;">${carries.toFixed(1)}</td>
            <td style="text-align:right;">${npcYPC}</td>
      </tr>
        `;
      }).join('');
      
      return playerRow + npcRows;
    };
    
    const buildReceivingStats = (stats, games, npcs) => {
      if(pos === 'QB' || pos === 'DL') return '';
      const playerPerGame = games > 0 ? games : 1;
      const playerYPR = stats.receptions > 0 ? (stats.receivingYards / stats.receptions).toFixed(1) : '0.0';
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.receptions / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.receivingYards / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.receivingTDs / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${playerYPR}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const receptions = npc.stats.receptions || 0;
        const receivingYards = npc.stats.receivingYards || 0;
        const receivingTDs = npc.stats.receivingTDs || 0;
        const npcYPR = receptions > 0 ? (receivingYards / receptions).toFixed(1) : '0.0';
      return `
        <tr>
            <td>${npc.name} <span class="muted" style="font-size:11px;">(${npc.schoolYear})</span></td>
            <td style="text-align:right;">${receptions.toFixed(1)}</td>
            <td style="text-align:right;">${receivingYards.toFixed(1)}</td>
            <td style="text-align:right;">${receivingTDs.toFixed(1)}</td>
            <td style="text-align:right;">${npcYPR}</td>
        </tr>
      `;
    }).join('');

      return playerRow + npcRows;
    };
    
    const buildOffensiveDefenseStats = (stats, games, npcs) => {
      if(pos === 'LB' || pos === 'CB' || pos === 'S' || pos === 'DL') return '';
      const playerPerGame = games > 0 ? games : 1;
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
          ${pos === 'QB' ? `<td style="text-align:right; font-weight:700;">${(stats.interceptions / playerPerGame).toFixed(1)}</td>` : ''}
          <td style="text-align:right; font-weight:700;">${((stats.fumbles || 0) / playerPerGame).toFixed(1)}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const fumbles = npc.stats.fumbles || 0;
        const interceptions = npc.stats.interceptions || 0;
      return `
        <tr>
            <td>${npc.name} <span class="muted" style="font-size:11px;">(${npc.schoolYear})</span></td>
            ${pos === 'QB' ? `<td style="text-align:right;">${interceptions.toFixed(1)}</td>` : ''}
            <td style="text-align:right;">${fumbles.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

      return playerRow + npcRows;
    };
    
    const buildDefenseStats = (stats, games, npcs) => {
      if(pos !== 'LB' && pos !== 'CB' && pos !== 'S' && pos !== 'DL') return '';
      const playerPerGame = games > 0 ? games : 1;
      
      const playerRow = `
        <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
          <td><b>${s.player.name}</b> <span class="pill2" style="font-size:11px; margin-left:6px;">You</span> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
          <td style="text-align:right; font-weight:700;">${(stats.tackles / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.sacks / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.defInterceptions / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.forcedFumbles / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.fumbleRecoveries / playerPerGame).toFixed(1)}</td>
          <td style="text-align:right; font-weight:700;">${(stats.defTDs / playerPerGame).toFixed(1)}</td>
        </tr>
      `;
      
      const npcRows = npcs.map(npc => {
        const tackles = npc.stats.tackles || 0;
        const sacks = npc.stats.sacks || 0;
        const defInterceptions = npc.stats.defInterceptions || 0;
        const forcedFumbles = npc.stats.forcedFumbles || 0;
        const fumbleRecoveries = npc.stats.fumbleRecoveries || 0;
        const defTDs = npc.stats.defTDs || 0;
      return `
        <tr>
            <td>${npc.name} <span class="muted" style="font-size:11px;">(${npc.schoolYear})</span></td>
            <td style="text-align:right;">${tackles.toFixed(1)}</td>
            <td style="text-align:right;">${sacks.toFixed(1)}</td>
            <td style="text-align:right;">${defInterceptions.toFixed(1)}</td>
            <td style="text-align:right;">${forcedFumbles.toFixed(1)}</td>
            <td style="text-align:right;">${fumbleRecoveries.toFixed(1)}</td>
            <td style="text-align:right;">${defTDs.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

      return playerRow + npcRows;
    };
    
    const getStatsForPeriod = (period) => {
      if(period === 'game') return latestGame || {};
      if(period === 'season') return seasonStats || {};
      return gs;
    };
    
    const getGamesForPeriod = (period) => {
      if(period === 'game') return 1;
      if(period === 'season') return seasonGames;
      return careerGames;
    };
    
    const buildPeriodContent = (period) => {
      const stats = getStatsForPeriod(period);
      const games = getGamesForPeriod(period);
      const periodLabel = period === 'game' ? 'Last Game' : period === 'season' ? `Season ${s.career.year}` : 'Career';
      
      let categories = [];
      if(pos === 'QB') {
        categories = [
          { 
            id: 'passing', 
            name: 'Passing', 
            content: buildPassingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Pass Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Comp/G</th><th style="text-align:right;">Att/G</th><th style="text-align:right;">Comp %</th><th style="text-align:right;">INT/G</th>'
          },
          { 
            id: 'rushing', 
            name: 'Rushing', 
            content: buildRushingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rush Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Carries/G</th><th style="text-align:right;">YPC</th>'
          },
          { 
            id: 'defense', 
            name: 'Defense', 
            content: buildOffensiveDefenseStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">INT/G</th><th style="text-align:right;">Fumbles/G</th>'
          }
        ];
      } else if(pos === 'RB') {
        categories = [
          { 
            id: 'rushing', 
            name: 'Rushing', 
            content: buildRushingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rush Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Carries/G</th><th style="text-align:right;">YPC</th>'
          },
          { 
            id: 'receiving', 
            name: 'Receiving', 
            content: buildReceivingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rec/G</th><th style="text-align:right;">Rec Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">YPR</th>'
          },
          { 
            id: 'defense', 
            name: 'Defense', 
            content: buildOffensiveDefenseStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Fumbles/G</th>'
          }
        ];
      } else if(pos === 'WR' || pos === 'TE') {
        categories = [
          { 
            id: 'receiving', 
            name: 'Receiving', 
            content: buildReceivingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rec/G</th><th style="text-align:right;">Rec Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">YPR</th>'
          },
          { 
            id: 'rushing', 
            name: 'Rushing', 
            content: buildRushingStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Rush Yds/G</th><th style="text-align:right;">TDs/G</th><th style="text-align:right;">Carries/G</th><th style="text-align:right;">YPC</th>'
          },
          { 
            id: 'defense', 
            name: 'Defense', 
            content: buildOffensiveDefenseStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Fumbles/G</th>'
          }
        ];
      } else {
        categories = [
          { 
            id: 'defense', 
            name: 'Defense', 
            content: buildDefenseStats(stats, games, npcPlayers),
            headers: '<th>Player</th><th style="text-align:right;">Tackles/G</th><th style="text-align:right;">Sacks/G</th><th style="text-align:right;">INT/G</th><th style="text-align:right;">FF/G</th><th style="text-align:right;">FR/G</th><th style="text-align:right;">TDs/G</th>'
          }
        ];
      }
      
      const categoryTabs = categories.map((cat, idx) => 
        `<button class="stats-category-tab ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}" data-period="${period}">${cat.name}</button>`
      ).join('');
      
      const categoryContents = categories.map((cat, idx) => 
        `<div class="stats-content ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}" data-period="${period}">
        <table class="table">
            <thead><tr>${cat.headers}</tr></thead>
            <tbody>${cat.content || '<tr><td colspan="10" class="muted">No stats available</td></tr>'}</tbody>
        </table>
        </div>`
      ).join('');
      
      return `
        <div class="muted" style="margin-bottom:8px; font-size:13px;">${periodLabel} • ${games} game${games !== 1 ? 's' : ''}</div>
        <div class="stats-category-tabs">${categoryTabs}</div>
        ${categoryContents}
      `;
    };
    
    const bodyHTML = `
      <div class="stats-tabs">
        <button class="stats-tab ${latestGame ? 'active' : ''}" data-period="game" ${!latestGame ? 'disabled' : ''}>Last Game</button>
        <button class="stats-tab ${seasonStats ? '' : 'active'}" data-period="season" ${!seasonStats ? 'disabled' : ''}>Season ${s.career.year}</button>
        <button class="stats-tab ${!latestGame && !seasonStats ? '' : ''}" data-period="career">Career</button>
      </div>
      <div id="stats-period-content">${buildPeriodContent(latestGame ? 'game' : seasonStats ? 'season' : 'career')}</div>
    `;
    
    openModal('Player Statistics', bodyHTML, '<button class="btn" id="closeStats">Close</button>');
    
    $$('.stats-tab').forEach(tab => {
      tab.onclick = () => {
        if(tab.disabled) return;
        $$('.stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $('#stats-period-content').innerHTML = buildPeriodContent(tab.getAttribute('data-period'));
        $$('.stats-category-tab').forEach(catTab => {
          catTab.onclick = () => {
            const cat = catTab.getAttribute('data-cat');
            const p = catTab.getAttribute('data-period');
            $$(`.stats-category-tab[data-period="${p}"]`).forEach(t => t.classList.remove('active'));
            $$(`.stats-content[data-period="${p}"]`).forEach(c => c.classList.remove('active'));
            catTab.classList.add('active');
            $(`.stats-content[data-cat="${cat}"][data-period="${p}"]`).classList.add('active');
      };
    });
      };
    });
    
    $$('.stats-category-tab').forEach(catTab => {
      catTab.onclick = () => {
        const cat = catTab.getAttribute('data-cat');
        const p = catTab.getAttribute('data-period');
        $$(`.stats-category-tab[data-period="${p}"]`).forEach(t => t.classList.remove('active'));
        $$(`.stats-content[data-period="${p}"]`).forEach(c => c.classList.remove('active'));
        catTab.classList.add('active');
        $(`.stats-content[data-cat="${cat}"][data-period="${p}"]`).classList.add('active');
      };
    });
    
    $('#closeStats').onclick = () => closeModal();
  }

  // Records system - NEW
  function generateRecordPlayers(position, recordType, count = 5){
    const firstNames = ["Alex", "Blake", "Cameron", "Drew", "Ethan", "Finn", "Grant", "Hayden", "Isaiah", "Jake", "Kai", "Logan", "Mason", "Noah", "Owen", "Parker", "Quinn", "Riley", "Sam", "Tyler"];
    const lastNames = ["Anderson", "Brooks", "Carter", "Davis", "Evans", "Foster", "Gray", "Harris", "Jackson", "Kelly", "Lewis", "Martinez", "Nelson", "Parker", "Reed", "Smith", "Taylor", "Walker", "White", "Young"];
    
    const records = [];
    const baseStats = {
      QB: { 
        singleGame: { passingYards: 450, passingTDs: 6, completions: 35, attempts: 45 },
        season: { passingYards: 3500, passingTDs: 42, completions: 280, attempts: 400 },
        career: { passingYards: 12000, passingTDs: 140, completions: 950, attempts: 1400 }
      },
      RB: {
        singleGame: { rushingYards: 350, rushingTDs: 5, carries: 35 },
        season: { rushingYards: 2500, rushingTDs: 35, carries: 300 },
        career: { rushingYards: 8000, rushingTDs: 110, carries: 1000 }
      },
      WR: {
        singleGame: { receivingYards: 280, receivingTDs: 4, receptions: 15 },
        season: { receivingYards: 1800, receivingTDs: 22, receptions: 120 },
        career: { receivingYards: 5500, receivingTDs: 65, receptions: 380 }
      },
      TE: {
        singleGame: { receivingYards: 200, receivingTDs: 3, receptions: 12 },
        season: { receivingYards: 1300, receivingTDs: 16, receptions: 85 },
        career: { receivingYards: 4000, receivingTDs: 48, receptions: 280 }
      },
      LB: {
        singleGame: { tackles: 18, sacks: 4, defInterceptions: 2 },
        season: { tackles: 180, sacks: 25, defInterceptions: 8 },
        career: { tackles: 550, sacks: 75, defInterceptions: 22 }
      },
      CB: {
        singleGame: { tackles: 12, defInterceptions: 3, forcedFumbles: 2 },
        season: { tackles: 95, defInterceptions: 12, forcedFumbles: 6 },
        career: { tackles: 280, defInterceptions: 35, forcedFumbles: 18 }
      },
      S: {
        singleGame: { tackles: 15, defInterceptions: 3, forcedFumbles: 2 },
        season: { tackles: 120, defInterceptions: 15, forcedFumbles: 8 },
        career: { tackles: 350, defInterceptions: 42, forcedFumbles: 22 }
      },
      DL: {
        singleGame: { tackles: 14, sacks: 5, forcedFumbles: 3 },
        season: { tackles: 110, sacks: 30, forcedFumbles: 12 },
        career: { tackles: 320, sacks: 85, forcedFumbles: 35 }
      }
    };
    
    const base = baseStats[position]?.[recordType] || {};
    
    for(let i = 0; i < count; i++){
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      const stats = {};
      let year = 1;
      let schoolYear = 'Freshman';
      
      if(recordType === 'career') {
        year = rint(2, 4);
        schoolYear = getSchoolYear(year);
        const yearsPlayed = year - 1;
        const ovr = rint(75, 95);
        const ovrMultiplier = clamp((ovr - 50) / 50, 0.5, 1.5);
        Object.keys(base).forEach(key => {
          const baseVal = base[key];
          const variance = baseVal * 0.15;
          const scaled = (baseVal * ovrMultiplier * yearsPlayed) / 3;
          stats[key] = Math.round(scaled + (Math.random() * variance * 2 - variance));
        });
      } else if(recordType === 'season') {
        year = rint(1, 4);
        schoolYear = getSchoolYear(year);
        const ovr = rint(70, 95);
        const ovrMultiplier = clamp((ovr - 50) / 50, 0.5, 1.5);
        Object.keys(base).forEach(key => {
          const baseVal = base[key];
          const variance = baseVal * 0.2;
          stats[key] = Math.round((baseVal * ovrMultiplier) + (Math.random() * variance * 2 - variance));
        });
      } else {
        year = rint(1, 4);
        schoolYear = getSchoolYear(year);
        const ovr = rint(75, 99);
        const ovrMultiplier = clamp((ovr - 50) / 50, 0.5, 1.5);
        Object.keys(base).forEach(key => {
          const baseVal = base[key];
          const variance = baseVal * 0.25;
          stats[key] = Math.round((baseVal * ovrMultiplier) + (Math.random() * variance * 2 - variance));
        });
      }
      
      records.push({ name, stats, year, schoolYear });
    }
    
    if(position === 'QB') records.sort((a, b) => (b.stats.passingYards || 0) - (a.stats.passingYards || 0));
    else if(position === 'RB') records.sort((a, b) => (b.stats.rushingYards || 0) - (a.stats.rushingYards || 0));
    else if(position === 'WR' || position === 'TE') records.sort((a, b) => (b.stats.receivingYards || 0) - (a.stats.receivingYards || 0));
    else records.sort((a, b) => (b.stats.tackles || 0) - (a.stats.tackles || 0));
    
    return records;
  }

  function openRecords(s){
    const gs = s.gameStats || defaultState().gameStats;
    const pos = s.player.position;
    const playerSchoolYear = getSchoolYear(s.career.year);
    
    const latestGame = gs.gameLog && gs.gameLog.length > 0 ? gs.gameLog[gs.gameLog.length - 1] : null;
    const seasonKey = `Y${s.career.year}`;
    const seasonStats = gs.seasonStats && gs.seasonStats[seasonKey] ? gs.seasonStats[seasonKey] : null;
    
    const singleGameRecords = generateRecordPlayers(pos, 'singleGame', 5);
    const seasonRecords = generateRecordPlayers(pos, 'season', 5);
    const careerRecords = generateRecordPlayers(pos, 'career', 5);
    
    const buildRecordTable = (recordType, playerStats, records) => {
      if(pos === 'QB') {
        const headers = '<th>Rank</th><th>Player</th><th style="text-align:right;">Pass Yds</th><th style="text-align:right;">TDs</th><th style="text-align:right;">Comp</th><th style="text-align:right;">Att</th>';
        let rows = '';
        if(playerStats && (playerStats.passingYards || playerStats.passingTDs)) {
          rows += `
            <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
              <td><b>YOU</b></td>
              <td><b>${s.player.name}</b> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
              <td style="text-align:right; font-weight:700;">${playerStats.passingYards || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.passingTDs || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.completions || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.attempts || 0}</td>
            </tr>
          `;
        }
        records.forEach((rec, idx) => {
          rows += `
            <tr>
              <td>#${idx + 1}</td>
              <td>${rec.name} <span class="muted" style="font-size:11px;">(${rec.schoolYear})</span></td>
              <td style="text-align:right;">${rec.stats.passingYards || 0}</td>
              <td style="text-align:right;">${rec.stats.passingTDs || 0}</td>
              <td style="text-align:right;">${rec.stats.completions || 0}</td>
              <td style="text-align:right;">${rec.stats.attempts || 0}</td>
      </tr>
          `;
        });
        return `<table class="table"><thead><tr>${headers}</tr></thead><tbody>${rows || '<tr><td colspan="6" class="muted">No records available</td></tr>'}</tbody></table>`;
      } else if(pos === 'RB') {
        const headers = '<th>Rank</th><th>Player</th><th style="text-align:right;">Rush Yds</th><th style="text-align:right;">TDs</th><th style="text-align:right;">Carries</th>';
        let rows = '';
        if(playerStats && (playerStats.rushingYards || playerStats.rushingTDs)) {
          rows += `
            <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
              <td><b>YOU</b></td>
              <td><b>${s.player.name}</b> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
              <td style="text-align:right; font-weight:700;">${playerStats.rushingYards || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.rushingTDs || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.carries || 0}</td>
            </tr>
          `;
        }
        records.forEach((rec, idx) => {
          rows += `
            <tr>
              <td>#${idx + 1}</td>
              <td>${rec.name} <span class="muted" style="font-size:11px;">(${rec.schoolYear})</span></td>
              <td style="text-align:right;">${rec.stats.rushingYards || 0}</td>
              <td style="text-align:right;">${rec.stats.rushingTDs || 0}</td>
              <td style="text-align:right;">${rec.stats.carries || 0}</td>
            </tr>
          `;
        });
        return `<table class="table"><thead><tr>${headers}</tr></thead><tbody>${rows || '<tr><td colspan="5" class="muted">No records available</td></tr>'}</tbody></table>`;
      } else if(pos === 'WR' || pos === 'TE') {
        const headers = '<th>Rank</th><th>Player</th><th style="text-align:right;">Rec Yds</th><th style="text-align:right;">TDs</th><th style="text-align:right;">Rec</th>';
        let rows = '';
        if(playerStats && (playerStats.receivingYards || playerStats.receivingTDs)) {
          rows += `
            <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
              <td><b>YOU</b></td>
              <td><b>${s.player.name}</b> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
              <td style="text-align:right; font-weight:700;">${playerStats.receivingYards || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.receivingTDs || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.receptions || 0}</td>
            </tr>
          `;
        }
        records.forEach((rec, idx) => {
          rows += `
            <tr>
              <td>#${idx + 1}</td>
              <td>${rec.name} <span class="muted" style="font-size:11px;">(${rec.schoolYear})</span></td>
              <td style="text-align:right;">${rec.stats.receivingYards || 0}</td>
              <td style="text-align:right;">${rec.stats.receivingTDs || 0}</td>
              <td style="text-align:right;">${rec.stats.receptions || 0}</td>
            </tr>
          `;
        });
        return `<table class="table"><thead><tr>${headers}</tr></thead><tbody>${rows || '<tr><td colspan="5" class="muted">No records available</td></tr>'}</tbody></table>`;
      } else {
        const headers = '<th>Rank</th><th>Player</th><th style="text-align:right;">Tackles</th><th style="text-align:right;">Sacks</th><th style="text-align:right;">INT</th>';
        let rows = '';
        if(playerStats && (playerStats.tackles || playerStats.sacks)) {
          rows += `
            <tr style="background:rgba(124,92,255,.12); border:1px solid rgba(124,92,255,.30);">
              <td><b>YOU</b></td>
              <td><b>${s.player.name}</b> <span class="muted" style="font-size:11px;">(${playerSchoolYear})</span></td>
              <td style="text-align:right; font-weight:700;">${playerStats.tackles || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.sacks || 0}</td>
              <td style="text-align:right; font-weight:700;">${playerStats.defInterceptions || 0}</td>
            </tr>
          `;
        }
        records.forEach((rec, idx) => {
          rows += `
            <tr>
              <td>#${idx + 1}</td>
              <td>${rec.name} <span class="muted" style="font-size:11px;">(${rec.schoolYear})</span></td>
              <td style="text-align:right;">${rec.stats.tackles || 0}</td>
              <td style="text-align:right;">${rec.stats.sacks || 0}</td>
              <td style="text-align:right;">${rec.stats.defInterceptions || 0}</td>
            </tr>
          `;
        });
        return `<table class="table"><thead><tr>${headers}</tr></thead><tbody>${rows || '<tr><td colspan="5" class="muted">No records available</td></tr>'}</tbody></table>`;
      }
    };
    
    const bodyHTML = `
      <div class="stats-tabs">
        <button class="stats-tab active" data-record="game">Single Game</button>
        <button class="stats-tab" data-record="season">Season</button>
        <button class="stats-tab" data-record="career">Career</button>
      </div>
      <div id="records-content">
        ${buildRecordTable('singleGame', latestGame, singleGameRecords)}
      </div>
    `;
    
    openModal('Record Book', bodyHTML, '<button class="btn" id="closeRecords">Close</button>');
    
    $$('.stats-tab').forEach(tab => {
      tab.onclick = () => {
        $$('.stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const recordType = tab.getAttribute('data-record');
        let playerStats = null;
        if(recordType === 'game') playerStats = latestGame;
        else if(recordType === 'season') playerStats = seasonStats;
        else playerStats = gs;
        
        let records = [];
        if(recordType === 'game') records = singleGameRecords;
        else if(recordType === 'season') records = seasonRecords;
        else records = careerRecords;
        
        $('#records-content').innerHTML = buildRecordTable(recordType, playerStats, records);
      };
    });
    
    $('#closeRecords').onclick = () => closeModal();
  }

  // UI Functions
  function openSkills(s){
    const stats = derivedStats(s);
    const bodyHTML = `
      <div class="muted small">Spend skill points to improve your attributes. Each point increases a stat by 1.</div>
      <div style="margin-top:16px;">
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px;">
          ${['throwPower', 'accuracy', 'speed', 'stamina', 'strength'].map(k => {
            const val = stats[k] || 0;
            const base = s.statsBase?.[k] || 0;
            const bonus = val - base;
            return `
              <div style="padding:12px; background:rgba(255,255,255,.05); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <div>
                    <div style="font-weight:600; text-transform:capitalize;">${k.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div class="muted small">Base: ${base} ${bonus > 0 ? `+${bonus}` : ''}</div>
                  </div>
                  <div style="font-size:20px; font-weight:700;">${val}</div>
                </div>
                <button class="btn small" ${s.skillPoints < 1 ? 'disabled' : ''} data-skill="${k}">+1 (${s.skillPoints} pts)</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    openModal('Skills', bodyHTML, '<button class="btn" id="closeSkills">Close</button>');
    
    $$('button[data-skill]').forEach(btn => {
      btn.onclick = () => {
        if(s.skillPoints < 1) return;
        const skill = btn.getAttribute('data-skill');
        if(!s.statsBase[skill]) s.statsBase[skill] = 0;
        s.statsBase[skill] = clamp(s.statsBase[skill] + 1, 0, 99);
        s.skillPoints -= 1;
        save(s);
        openSkills(s);
      };
    });
    
    $('#closeSkills').onclick = () => { closeModal(); render(s); };
  }

  function openStore(s){
    const bodyHTML = `
      <div class="muted small">Purchase items to boost your stats. Items are automatically equipped.</div>
      <div style="margin-top:16px; display:grid; gap:12px;">
        ${STORE_ITEMS.map(it => {
          const owned = (s.inventory.owned || []).filter(id => id === it.id).length;
          const canAfford = s.money >= it.price;
      return `
            <div style="padding:12px; background:rgba(255,255,255,.05); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:600;">${it.name}</div>
                <div class="muted small">${it.desc}</div>
                <div class="muted small">Owned: ${owned}</div>
              </div>
              <button class="btn ${canAfford ? 'primary' : ''}" ${!canAfford ? 'disabled' : ''} data-buy="${it.id}">${fmtMoney(it.price)}</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    openModal('Store', bodyHTML, '<button class="btn" id="closeStore">Close</button>');

    $$('button[data-buy]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-buy');
        const it = STORE_ITEMS.find(x => x.id === id);
        if(!it) return;
        if(s.money < it.price) return;
        s.money -= it.price;
        if(!s.inventory.owned) s.inventory.owned = [];
        s.inventory.owned.push(id);
        logPush(s, 'Purchased', `Bought ${it.name} for ${fmtMoney(it.price)}.`);
        save(s);
        closeModal();
        render(s);
      };
    });
    
    $('#closeStore').onclick = () => closeModal();
  }

  function openInventory(s){
    const owned = s.inventory.owned.slice();
    const eq = s.inventory.equipped || {};

    const counts = owned.reduce((m,id)=>{ m[id]=(m[id]||0)+1; return m; }, {});
    const ownedItems = Object.keys(counts).map(id => {
      const it = STORE_ITEMS.find(x => x.id === id);
      if(!it) return null;
      return { ...it, count: counts[id] };
    }).filter(Boolean);

    const slots = Object.keys(eq).map(slot => {
      const id = eq[slot];
      const it = id ? STORE_ITEMS.find(x => x.id === id) : null;
      return `
        <tr>
          <td>${slot}</td>
          <td>${it ? it.name : 'Empty'}</td>
          <td><button class="btn small" ${!it ? 'disabled' : ''} data-unequip="${slot}">Unequip</button></td>
        </tr>
      `;
    }).join('');

    const bodyHTML = `
      <div class="muted small">Equip items to boost your stats. Each slot can hold one item.</div>
      <div style="margin-top:16px;">
        <div style="margin-bottom:16px;">
          <div style="font-weight:600; margin-bottom:8px;">Equipped Items</div>
          <table class="table">
            <thead><tr><th>Slot</th><th>Item</th><th>Action</th></tr></thead>
            <tbody>${slots || '<tr><td colspan="3" class="muted">No items equipped</td></tr>'}</tbody>
          </table>
        </div>
        <div>
          <div style="font-weight:600; margin-bottom:8px;">Owned Items</div>
          <div style="display:grid; gap:8px;">
            ${ownedItems.map(it => {
              const equipped = Object.values(eq).includes(it.id);
      return `
                <div style="padding:12px; background:rgba(255,255,255,.05); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-weight:600;">${it.name}</div>
                    <div class="muted small">${it.desc} • Count: ${it.count}</div>
                  </div>
                  <button class="btn small" ${equipped ? 'disabled' : ''} data-equip="${it.id}">Equip</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    openModal('Inventory', bodyHTML, '<button class="btn" id="closeInv">Close</button>');

    $$('button[data-equip]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-equip');
        const it = STORE_ITEMS.find(x => x.id === id);
        if(!it || !it.slot) return;
        if(!s.inventory.equipped) s.inventory.equipped = {};
        s.inventory.equipped[it.slot] = id;
        save(s);
        openInventory(s);
      };
    });

    $$('button[data-unequip]').forEach(btn => {
      btn.onclick = () => {
        const slot = btn.getAttribute('data-unequip');
        if(!s.inventory.equipped) s.inventory.equipped = {};
        delete s.inventory.equipped[slot];
        save(s);
        openInventory(s);
      };
    });

    $('#closeInv').onclick = () => { closeModal(); render(s); };
  }

  function openLogAll(s){
    const logs = (s.log || []).slice().reverse();
    const bodyHTML = `
      <div style="max-height:400px; overflow-y:auto;">
        ${logs.length === 0 ? '<div class="muted">No log entries yet.</div>' : logs.map(l => `
          <div style="padding:8px; margin-bottom:8px; background:rgba(255,255,255,.05); border-radius:6px;">
            <div style="font-size:12px; color:var(--muted);">Year ${l.year}, Week ${l.week} • ${l.type}</div>
            <div>${l.msg}</div>
          </div>
        `).join('')}
      </div>
    `;
    openModal('Game Log', bodyHTML, '<button class="btn" id="closeLog">Close</button>');
    $('#closeLog').onclick = () => closeModal();
  }

  function renderLog(s){
    const logs = (s.log || []).slice(-5).reverse();
    $('#log').innerHTML = logs.length === 0 ? '<div class="muted">No events yet.</div>' : logs.map(l => `
      <div style="padding:8px; margin-bottom:6px; background:rgba(255,255,255,.05); border-radius:6px; font-size:13px;">
        <span style="color:var(--muted);">[${l.type}]</span> ${l.msg}
      </div>
    `).join('');
  }

  function openCheatPanel(s){
    const stats = derivedStats(s);
    const bodyHTML = `
      <div class="muted small" style="margin-bottom:16px;">Cheat panel for testing. Changes are saved immediately.</div>
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:16px;">
        <div>
          <div style="font-weight:600; margin-bottom:8px;">Resources</div>
          <div style="display:grid; gap:8px;">
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">Money:</span>
              <input type="number" id="cheat_money" value="${s.money}" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="money">Set</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">XP:</span>
              <input type="number" id="cheat_xp" value="${s.xp}" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="xp">Set</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">Skill Pts:</span>
              <input type="number" id="cheat_sp" value="${s.skillPoints}" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="sp">Set</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">Level:</span>
              <input type="number" id="cheat_level" value="${s.level}" min="1" max="99" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="level">Set</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">Energy:</span>
              <input type="number" id="cheat_energy" value="${s.energy}" min="0" max="100" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="energy">Set</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">Hours:</span>
              <input type="number" id="cheat_hours" value="${s.hours}" min="0" max="25" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="hours">Set</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="min-width:80px;">Prep:</span>
              <input type="number" id="cheat_prep" value="${s.prep}" min="0" max="60" style="flex:1; padding:6px;" />
              <button class="btn small" data-cheat="prep">Set</button>
            </div>
          </div>
        </div>
        <div>
          <div style="font-weight:600; margin-bottom:8px;">Player Stats</div>
          <div style="display:grid; gap:8px;">
            ${['throwPower', 'accuracy', 'speed', 'stamina', 'strength'].map(k => {
              const base = s.statsBase?.[k] || 0;
              return `
                <div style="display:flex; gap:8px; align-items:center;">
                  <span style="min-width:100px; text-transform:capitalize;">${k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <input type="number" id="cheat_${k}" value="${base}" min="0" max="99" style="flex:1; padding:6px;" />
                  <button class="btn small" data-cheat="${k}">Set</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,.12);">
        <div style="font-weight:600; margin-bottom:8px;">Quick Actions</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn small" data-quick="money1000">+$1000</button>
          <button class="btn small" data-quick="money10000">+$10000</button>
          <button class="btn small" data-quick="xp1000">+1000 XP</button>
          <button class="btn small" data-quick="sp10">+10 Skill Pts</button>
          <button class="btn small" data-quick="maxenergy">Max Energy</button>
          <button class="btn small" data-quick="maxhours">Max Hours</button>
          <button class="btn small" data-quick="maxprep">Max Prep</button>
          <button class="btn small" data-quick="maxstats">Max All Stats</button>
          <button class="btn small" data-quick="advanceweek">Advance Week</button>
          <button class="btn small" data-quick="nextyear">Next Year</button>
        </div>
      </div>
    `;
    
    openModal('Cheat Panel', bodyHTML, '<button class="btn" id="closeCheat">Close</button>');
    
    $$('button[data-cheat]').forEach(btn => {
      btn.onclick = () => {
        const cheatType = btn.getAttribute('data-cheat');
        const input = $(`#cheat_${cheatType}`);
        if(!input) return;
        const value = parseInt(input.value) || 0;
        
        if(cheatType === 'money') {
          s.money = Math.max(0, value);
        } else if(cheatType === 'xp') {
          s.xp = Math.max(0, value);
        } else if(cheatType === 'sp') {
          s.skillPoints = Math.max(0, value);
        } else if(cheatType === 'level') {
          s.level = clamp(value, 1, 99);
        } else if(cheatType === 'energy') {
          s.energy = clamp(value, 0, MAX_ENERGY);
        } else if(cheatType === 'hours') {
          s.hours = clamp(value, 0, MAX_HOURS);
        } else if(cheatType === 'prep') {
          s.prep = clamp(value, 0, 60);
        } else if(['throwPower', 'accuracy', 'speed', 'stamina', 'strength'].includes(cheatType)) {
          if(!s.statsBase) s.statsBase = {};
          s.statsBase[cheatType] = clamp(value, 0, 99);
        }
        
      save(s);
        openCheatPanel(s);
      render(s);
    };
    });
    
    $$('button[data-quick]').forEach(btn => {
      btn.onclick = () => {
        const action = btn.getAttribute('data-quick');
        
        if(action === 'money1000') {
          s.money += 1000;
        } else if(action === 'money10000') {
          s.money += 10000;
        } else if(action === 'xp1000') {
          s.xp += 1000;
          while(s.xp >= xpNeeded(s.level)) {
            s.xp -= xpNeeded(s.level);
            s.level += 1;
            s.skillPoints += 1;
          }
        } else if(action === 'sp10') {
          s.skillPoints += 10;
        } else if(action === 'maxenergy') {
          s.energy = MAX_ENERGY;
        } else if(action === 'maxhours') {
          s.hours = MAX_HOURS;
        } else if(action === 'maxprep') {
          s.prep = 60;
        } else if(action === 'maxstats') {
          if(!s.statsBase) s.statsBase = {};
          ['throwPower', 'accuracy', 'speed', 'stamina', 'strength'].forEach(k => {
            s.statsBase[k] = 99;
          });
        } else if(action === 'advanceweek') {
          startNewWeek(s);
        } else if(action === 'nextyear') {
          s.career.year = clamp(s.career.year + 1, 1, 4);
          s.career.week = 1;
        }
        
        save(s);
        openCheatPanel(s);
        render(s);
      };
    });
    
    $('#closeCheat').onclick = () => { closeModal(); render(s); };
  }

  function render(s){
    document.title = `Gridiron Career Sim ${VERSION}`;

    if(!s.player){
      $('#careerTitle').textContent = 'New Career';
      $('#careerSub').textContent = 'Create your player to begin.';
      $('#money').textContent = '$0';
      $('#ovr').textContent = '—';
      $('#level').textContent = '—';
      $('#xp').textContent = '—';
      $('#sp').textContent = '—';
      $('#seasonTag').textContent = '—';
      $('#gameWeekTag').textContent = '—';
      setBars(0,0,0);
      $('#jobName').textContent = 'No Job';
      $('#jobMeta').textContent = 'Auto: 0h/week • $0/week';
      renderLog(s);
      openCreatePlayer(s);
      return;
    }

    const stats = derivedStats(s);
    const ovr = calcOVR(stats);
    const schoolYear = getSchoolYear(s.career.year);

    $('#careerTitle').textContent = `${s.player.name} — ${schoolYear}`;
    const styleList = getStylesForPosition(s.player.position);
    const styleName = styleList.find(x=>x.id===s.player.archetype)?.name || s.player.archetype;
    const playerInfo = [
      s.player.highSchool,
      schoolYear,
      s.player.position,
      styleName,
      s.player.jerseyNumber ? `#${s.player.jerseyNumber}` : '',
      s.player.height || '',
      s.player.weight || '',
      s.player.hometown || ''
    ].filter(Boolean).join(' • ');
    $('#careerSub').textContent = playerInfo;
    $('#seasonTag').textContent = `Week ${s.career.week}/${s.career.maxWeeks}`;
    $('#gameWeekTag').textContent = s.career.inPost ? `Postseason G${s.career.postWeek}/3` : 'Regular Season';

    $('#money').textContent = fmtMoney(s.money);
    $('#ovr').textContent = String(ovr);
    $('#level').textContent = String(s.level);
    $('#xp').textContent = `${s.xp}/${xpNeeded(s.level)}`;
    $('#sp').textContent = String(s.skillPoints);

    const job = JOBS.find(j=>j.id===s.career.jobId) || JOBS[0];
    $('#jobName').textContent = job.name;
    $('#jobMeta').textContent = `Auto: ${job.hours}h/week • ${fmtMoney(job.pay)}/week`;

    const energyP = (s.energy / MAX_ENERGY) * 100;
    const hoursP = (s.hours / MAX_HOURS) * 100;
    const xpP = (s.xp / xpNeeded(s.level)) * 100;
    setBars(energyP, hoursP, xpP);

    $('#trainCostE').textContent = `-${Math.round(12 * (1 + s.level * 0.1))}/h`;
    $('#trainGainX').textContent = `+${Math.round(28 * (1 + s.level * 0.15))}/h`;
    $('#restGainE').textContent = `+${Math.round(18 * (1 + s.level * 0.05))}/h`;
    $('#restGainX').textContent = `+${Math.round(6 * (1 + s.level * 0.1))}/h`;
    $('#studyCostE').textContent = `-${Math.round(8 * (1 + s.level * 0.1))}/h`;
    $('#studyGainX').textContent = `+${Math.round(18 * (1 + s.level * 0.1))}/h`;

    renderLog(s);
  }

  function setBars(energyP, hoursP, xpP){
    $('#energyFill').style.width = `${clamp(energyP, 0, 100)}%`;
    $('#energyTxt').textContent = `${Math.round(energyP)}/100`;
    $('#hoursFill').style.width = `${clamp(hoursP, 0, 100)}%`;
    $('#hoursTxt').textContent = `${Math.round(hoursP)}/25`;
    $('#xpFill').style.width = `${clamp(xpP, 0, 100)}%`;
    $('#xpTxt').textContent = `${Math.round(xpP)}%`;
  }

  function wireUI(s){
    $$('#careerCard button[data-act]').forEach(btn => {
      btn.onclick = () => {
        const currentState = load();
        const act = btn.getAttribute('data-act');
        const h = parseInt(btn.getAttribute('data-h'));
        if(currentState.hours < h) {
          alert('Not enough hours!');
          return;
        }
        if(act === 'train') {
          const costE = Math.round(12 * (1 + currentState.level * 0.1)) * h;
          if(currentState.energy < costE) {
            alert('Not enough energy!');
            return;
          }
          currentState.energy = clamp(currentState.energy - costE, 0, MAX_ENERGY);
          currentState.hours = clamp(currentState.hours - h, 0, MAX_HOURS);
          const gainX = Math.round(28 * (1 + currentState.level * 0.15)) * h;
          currentState.xp += gainX;
          logPush(currentState, 'Trained', `Trained for ${h} hour${h > 1 ? 's' : ''}, gained ${gainX} XP.`);
        } else if(act === 'rest') {
          currentState.hours = clamp(currentState.hours - h, 0, MAX_HOURS);
          const gainE = Math.round(18 * (1 + currentState.level * 0.05)) * h;
          currentState.energy = clamp(currentState.energy + gainE, 0, MAX_ENERGY);
          const gainX = Math.round(6 * (1 + currentState.level * 0.1)) * h;
          currentState.xp += gainX;
          logPush(currentState, 'Rested', `Rested for ${h} hour${h > 1 ? 's' : ''}, recovered energy.`);
        } else if(act === 'study') {
          const costE = Math.round(8 * (1 + currentState.level * 0.1)) * h;
          if(currentState.energy < costE) {
            alert('Not enough energy!');
            return;
          }
          currentState.energy = clamp(currentState.energy - costE, 0, MAX_ENERGY);
          currentState.hours = clamp(currentState.hours - h, 0, MAX_HOURS);
          const gainX = Math.round(18 * (1 + currentState.level * 0.1)) * h;
          currentState.xp += gainX;
          currentState.prep = clamp(currentState.prep + h * 5, 0, 60);
          logPush(currentState, 'Studied', `Studied playbook for ${h} hour${h > 1 ? 's' : ''}, gained ${gainX} XP and prep.`);
        }
        while(currentState.xp >= xpNeeded(currentState.level)) {
          currentState.xp -= xpNeeded(currentState.level);
          currentState.level += 1;
          currentState.skillPoints += 1;
          logPush(currentState, 'Level Up', `Reached level ${currentState.level}!`);
        }
        save(currentState);
        render(currentState);
      };
    });

    $('#btnAdvance').onclick = () => {
      const currentState = loadState();
      startNewWeek(currentState);
      save(currentState);
      render(currentState);
    };

    $('#btnPlayGame').onclick = () => {
      const currentState = loadState();
      simulateGame(currentState);
    };

    $('#btnSkills').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openSkills(currentState) : openCreatePlayer(currentState);
    };

    $('#btnJob').onclick = () => {
      const currentState = loadState();
      const bodyHTML = `
        <div class="muted small">Choose a job. Hours and pay are automatically applied each week.</div>
        <div style="margin-top:16px; display:grid; gap:8px;">
          ${JOBS.map(j => `
            <label style="padding:12px; background:rgba(255,255,255,.05); border-radius:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
              <div>
                <div style="font-weight:600;">${j.name}</div>
                <div class="muted small">${j.hours}h/week • ${fmtMoney(j.pay)}/week</div>
              </div>
              <input type="radio" name="job" value="${j.id}" ${currentState.career.jobId === j.id ? 'checked' : ''} />
            </label>
          `).join('')}
        </div>
      `;
      openModal('Change Job', bodyHTML, '<button class="btn primary" id="saveJob">Save</button>');
      $('#saveJob').onclick = () => {
        const selected = $$('input[name="job"]:checked')[0];
        if(selected) {
          currentState.career.jobId = selected.value;
          save(currentState);
          closeModal();
          render(currentState);
        }
      };
    };

    $('#btnStore').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openStore(currentState) : openCreatePlayer(currentState);
    };

    $('#btnInv').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openInventory(currentState) : openCreatePlayer(currentState);
    };

    $('#btnStats').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openStats(currentState) : openCreatePlayer(currentState);
    };

    $('#btnRecords').onclick = () => {
      const currentState = loadState();
      return currentState.player ? openRecords(currentState) : openCreatePlayer(currentState);
    };

    $('#btnLog').onclick = () => {
      const currentState = loadState();
      openLogAll(currentState);
    };

    $('#btnCheat').onclick = () => {
      const currentState = loadState();
      if(!currentState.player) {
        alert('Create a player first!');
        return;
      }
      openCheatPanel(currentState);
    };

    $('#btnReset').onclick = () => {
      if(confirm('Reset your save?')){
        localStorage.removeItem(LS_KEY);
        const ns = defaultState();
        save(ns);
        location.reload();
      }
    };

    $('#btnExport').onclick = () => {
      const currentState = loadState();
      const blob = new Blob([JSON.stringify(currentState, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gridiron-save-v142.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    $('#fileImport').onchange = async (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      try{
        const txt = await f.text();
        const obj = JSON.parse(txt);
        localStorage.setItem(LS_KEY, JSON.stringify(obj));
        location.reload();
      }catch(e){
        alert('Import failed: invalid JSON.');
      }finally{
        ev.target.value = '';
      }
    };

    $('#modalClose').onclick = () => closeModal();
  }

  // Expose functions to window
  Object.assign(window, {
    getStylesForPosition,
    handlePositionChange,
    handleStyleChange,
    randomizeName,
    randomizeSchool,
    randomizeHeight,
    randomizeWeight,
    randomizeHometown,
    randomizeJersey,
    randomizeAvatar,
    getSkinColor,
    getHairColor,
    getEyeColor,
    getHairStyleName,
    getFacialHairName,
    renderAvatarPreview,
    updateAvatarPreview,
    openStats,
    openRecords
  });

  // Initialize
  const state = load();
  wireUI(state);
  render(state);
})();
