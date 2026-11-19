/* =========================================================
   English P.6 Hub — Main Application Logic
   Pure Vanilla JS (works seamlessly via file:// and HTTP)
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "english_p6_hub_v1";
  const DB_NAME = "EnglishP6HubFiles";
  const DB_STORE = "files";

  const TYPE_META = {
    worksheet: { label: "ใบงาน / แบบฝึกหัด", emoji: "📝", badgeClass: "type-worksheet", btnClass: "btn-mint",  accent: "#34D399", bg: "#DCFCE7", cta: "📝 เปิดดู / พิมพ์ใบงาน" },
    media:     { label: "วิดีโอ / สไลด์",     emoji: "🎬", badgeClass: "type-media",     btnClass: "btn-coral", accent: "#FF8A3D", bg: "#FFEDD5", cta: "🎬 เปิดสไลด์ / วิดีโอ" },
    flashcard: { label: "บัตรคำศัพท์ & เกม", emoji: "🃏", badgeClass: "type-flashcard", btnClass: "btn-sunny", accent: "#FFD43B", bg: "#FFF8D6", cta: "🃏 ฝึกคำศัพท์ / เล่นเกม" },
    quiz:      { label: "แบบทดสอบออนไลน์",  emoji: "🎯", badgeClass: "type-quiz",      btnClass: "btn-pink",  accent: "#A855F7", bg: "#F3E8FF", cta: "🎯 เริ่มทำแบบทดสอบ" }
  };

  const UNIT_PALETTE = [
    { accent: "#38BDF8", bg: "#E0F4FF" },
    { accent: "#34D399", bg: "#DCFCE7" },
    { accent: "#FFAD33", bg: "#FEF3C7" },
    { accent: "#FF785A", bg: "#FFE8E0" },
    { accent: "#A855F7", bg: "#F3E8FF" },
    { accent: "#06B6D4", bg: "#CFFAFE" },
    { accent: "#FF6B9D", bg: "#FFE4EE" }
  ];

  // ================= STATE =================
  let state = {
    units: [],
    materials: [],
    bookmarks: [],
    teacherPin: "",
    teacherMode: false,
    activeUnit: "all",
    activeType: "all",
    onlyBookmarks: false,
    searchQuery: "",
    sortBy: "unit"
  };

  // Viewer session state
  let activeViewerMaterial = null;
  let activeObjectUrls = [];
  let activeMatchTimer = null;
  let editorPendingFile = null; // { file: File } or { keepKey, fileName, mimeType } or null

  // ================= HELPERS =================
  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function generateId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function showToast(msg, variant) {
    const container = $("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast" + (variant ? " " + variant : "");
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s";
      setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  function speakEnglish(text, rate) {
    if (!("speechSynthesis" in window)) {
      showToast("เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียงอัตโนมัติ", "warning");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Strip arrow notation like "go ➔ went" so it reads naturally
      const clean = String(text || "").replace(/➔/g, ", ");
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = "en-US";
      utter.rate = rate || 0.92;
      utter.pitch = 1.02;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang === "en-US") || voices.find(v => v.lang.startsWith("en"));
      if (enVoice) utter.voice = enVoice;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      showToast("ไม่สามารถเล่นเสียงอ่านได้ในขณะนี้", "warning");
    }
  }

  // ================= INDEXEDDB (Local File Storage) =================
  function openFilesDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB not supported"));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveFileToDb(key, file) {
    const db = await openFilesDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({
        key: key,
        name: file.name,
        type: file.type,
        blob: file
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getFileFromDb(key) {
    const db = await openFilesDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteFileFromDb(key) {
    try {
      const db = await openFilesDb();
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (_) {
      return;
    }
  }

  // ================= LOCALSTORAGE PERSISTENCE =================
  const DATA_SCHEMA_VERSION = 2;

  function loadState() {
    const defaults = window.DEFAULT_ENGLISH_P6_DATA || { units: [], materials: [] };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state.units = Array.isArray(parsed.units) && parsed.units.length ? parsed.units : clone(defaults.units);
        // Backfill new cartoon artwork & bright palette onto existing saved default units
        const defaultUnitMap = new Map((defaults.units || []).map(u => [u.id, u]));
        state.units.forEach(u => {
          const def = defaultUnitMap.get(u.id);
          if (def) {
            if (!u.image && def.image) u.image = def.image;
            u.accent = def.accent;
            u.bg = def.bg;
          }
        });
        state.materials = Array.isArray(parsed.materials) ? parsed.materials : clone(defaults.materials);
        // One-time upgrade: merge newly added default materials so all 6 units have all 4 types
        if ((parsed.schemaVersion || 1) < DATA_SCHEMA_VERSION) {
          const existingIds = new Set(state.materials.map(m => m.id));
          (defaults.materials || []).forEach(defMat => {
            if (!existingIds.has(defMat.id)) {
              state.materials.push(clone(defMat));
            }
          });
        }
        state.bookmarks = Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [];
        state.teacherPin = typeof parsed.teacherPin === "string" ? parsed.teacherPin : "";
        if ((parsed.schemaVersion || 1) < DATA_SCHEMA_VERSION) {
          saveState();
        }
        return;
      }
    } catch (e) {
      console.warn("Could not read localStorage, using defaults.", e);
    }
    state.units = clone(defaults.units);
    state.materials = clone(defaults.materials);
    state.bookmarks = [];
    state.teacherPin = "";
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        schemaVersion: DATA_SCHEMA_VERSION,
        units: state.units,
        materials: state.materials,
        bookmarks: state.bookmarks,
        teacherPin: state.teacherPin
      }));
    } catch (e) {
      showToast("ไม่สามารถบันทึกข้อมูลลงเบราว์เซอร์ได้ (พื้นที่อาจเต็ม)", "warning");
    }
  }

  // ================= SCROLL & BANNER HELPERS =================
  function scrollToMaterials() {
    const el = $("materialsAnchor");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.remove("highlight");
    void el.offsetWidth;
    el.classList.add("highlight");
  }

  function renderMaterialsBanner() {
    const imgEl = $("bannerUnitImg");
    const kickerEl = $("bannerKicker");
    const titleEl = $("bannerTitle");
    const showAllBtn = $("bannerShowAllBtn");
    if (!imgEl || !kickerEl || !titleEl) return;

    const shownCount = getFilteredMaterials(false).length;
    const activeUnitObj = state.activeUnit !== "all" ? state.units.find(u => u.id === state.activeUnit) : null;
    const isFiltered = state.activeUnit !== "all" || state.activeType !== "all" || state.onlyBookmarks || state.searchQuery.trim() !== "";

    if (showAllBtn) {
      showAllBtn.classList.toggle("hidden", !isFiltered);
    }

    if (state.onlyBookmarks) {
      imgEl.src = "assets/hero-mascot.jpg";
      kickerEl.textContent = "⭐ รายการสื่อที่บันทึกไว้ (Bookmarks)";
      titleEl.textContent = `สื่อโปรดของคุณ (${shownCount} สื่อ)`;
      return;
    }

    if (activeUnitObj) {
      imgEl.src = activeUnitObj.image || "assets/hero-mascot.jpg";
      kickerEl.textContent = `${activeUnitObj.emoji || "📘"} ${activeUnitObj.code} • ${activeUnitObj.titleEn}`;
      titleEl.textContent = `${activeUnitObj.titleTh} (${shownCount} สื่อ)`;
    } else {
      imgEl.src = "assets/hero-mascot.jpg";
      const typeLabel = state.activeType !== "all" && TYPE_META[state.activeType]
        ? `${TYPE_META[state.activeType].emoji} เฉพาะ${TYPE_META[state.activeType].label}`
        : "📚 คลังสื่อการสอนทั้งหมด";
      kickerEl.textContent = typeLabel;
      titleEl.textContent = `สื่อการสอนภาษาอังกฤษ ป.6 (${shownCount} สื่อ)`;
    }
  }

  // ================= RENDERING: MAIN DASHBOARD =================
  function renderAll() {
    renderStats();
    renderUnits();
    renderTypeCounts();
    renderMaterials();
    renderMaterialsBanner();
    updateBookmarkBadge();
    updateTeacherModeUI();
  }

  function renderStats() {
    const mats = state.materials;
    const wsCount = mats.filter(m => m.type === "worksheet").length;
    const vocabCount = mats
      .filter(m => m.type === "flashcard")
      .reduce((sum, m) => sum + (Array.isArray(m.cards) ? m.cards.length : 0), 0);
    const quizQCount = mats
      .filter(m => m.type === "quiz")
      .reduce((sum, m) => sum + (Array.isArray(m.questions) ? m.questions.length : 0), 0);

    $("statTotal").textContent = mats.length;
    $("statWorksheets").textContent = wsCount;
    $("statVocab").textContent = vocabCount;
    $("statQuizzes").textContent = quizQCount;
  }

  function renderUnits() {
    const container = $("unitsContainer");
    const totalCount = state.materials.length;

    let html = `
      <button type="button" class="unit-card ${state.activeUnit === "all" ? "active" : ""}" data-unit="all"
              style="--unit-accent:#FF6B9D; --unit-bg:#FFE4EE;">
        <div class="unit-thumb-wrap">
          <img src="assets/hero-mascot.jpg" alt="All Units" class="unit-thumb-img">
          <span class="unit-code-sticker">All Units</span>
          <span class="unit-count-sticker">${totalCount} สื่อ</span>
        </div>
        <div class="unit-card-info">
          <div class="unit-en">All Topics</div>
          <div class="unit-th">รวมทุกหน่วยการเรียนรู้</div>
        </div>
      </button>
    `;

    state.units.forEach((u, idx) => {
      const palette = UNIT_PALETTE[idx % UNIT_PALETTE.length];
      const accent = u.accent || palette.accent;
      const bg = u.bg || palette.bg;
      const count = state.materials.filter(m => m.unitId === u.id).length;
      const active = state.activeUnit === u.id ? "active" : "";

      const thumbInner = u.image
        ? `<img src="${escapeHtml(u.image)}" alt="${escapeHtml(u.titleEn)}" class="unit-thumb-img">`
        : `<div class="unit-thumb-emoji-fallback">${escapeHtml(u.emoji || "📘")}</div>`;

      html += `
        <button type="button" class="unit-card ${active}" data-unit="${escapeHtml(u.id)}"
                style="--unit-accent:${escapeHtml(accent)}; --unit-bg:${escapeHtml(bg)};">
          <div class="unit-thumb-wrap">
            ${thumbInner}
            <span class="unit-code-sticker">${escapeHtml(u.code)}</span>
            <span class="unit-count-sticker">${count} สื่อ</span>
          </div>
          <div class="unit-card-info">
            <div class="unit-en">${escapeHtml(u.titleEn)}</div>
            <div class="unit-th">${escapeHtml(u.titleTh)}</div>
          </div>
        </button>
      `;
    });

    container.innerHTML = html;

    // Active unit indicator text
    if (state.activeUnit === "all") {
      $("activeUnitInfo").textContent = "แสดงทุกหน่วยการเรียนรู้ (" + state.units.length + " หน่วย) ⬇️";
    } else {
      const found = state.units.find(u => u.id === state.activeUnit);
      $("activeUnitInfo").textContent = found ? `${found.code}: ${found.titleTh} ⬇️` : "";
    }
  }

  function getFilteredMaterials(ignoreType) {
    const q = state.searchQuery.trim().toLowerCase();
    return state.materials.filter(m => {
      if (state.activeUnit !== "all" && m.unitId !== state.activeUnit) return false;
      if (!ignoreType && state.activeType !== "all" && m.type !== state.activeType) return false;
      if (state.onlyBookmarks && !state.bookmarks.includes(m.id)) return false;
      if (q) {
        const unit = state.units.find(u => u.id === m.unitId);
        const hay = [
          m.title,
          m.description,
          (m.tags || []).join(" "),
          unit ? unit.code + " " + unit.titleEn + " " + unit.titleTh : ""
        ].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderTypeCounts() {
    const base = getFilteredMaterials(true);
    $("countAll").textContent = base.length;
    $("countWorksheet").textContent = base.filter(m => m.type === "worksheet").length;
    $("countMedia").textContent = base.filter(m => m.type === "media").length;
    $("countFlashcard").textContent = base.filter(m => m.type === "flashcard").length;
    $("countQuiz").textContent = base.filter(m => m.type === "quiz").length;

    document.querySelectorAll("#typeChips .chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.type === state.activeType);
    });
  }

  function renderMaterials() {
    const grid = $("materialsGrid");
    const empty = $("emptyState");
    let items = getFilteredMaterials(false);

    // Sort
    const unitOrder = new Map(state.units.map((u, i) => [u.id, i]));
    if (state.sortBy === "unit") {
      items.sort((a, b) => {
        const ua = unitOrder.has(a.unitId) ? unitOrder.get(a.unitId) : 999;
        const ub = unitOrder.has(b.unitId) ? unitOrder.get(b.unitId) : 999;
        return ua - ub;
      });
    } else if (state.sortBy === "newest") {
      items.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    } else if (state.sortBy === "title") {
      items.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "th"));
    }

    if (!items.length) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    grid.innerHTML = items.map(m => {
      const meta = TYPE_META[m.type] || TYPE_META.worksheet;
      const unit = state.units.find(u => u.id === m.unitId);
      const isBookmarked = state.bookmarks.includes(m.id);
      const tagsHtml = (m.tags || []).slice(0, 4).map(t => `<button type="button" class="tag-item" data-tag="${escapeHtml(t)}" title="ค้นหาสื่อที่มีแท็ก #${escapeHtml(t)}">#${escapeHtml(t)}</button>`).join("");

      const teacherBtns = state.teacherMode ? `
        <div class="card-teacher-actions">
          <button type="button" class="icon-btn edit-mat-btn" data-id="${escapeHtml(m.id)}" title="แก้ไขสื่อนี้">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button type="button" class="icon-btn danger delete-mat-btn" data-id="${escapeHtml(m.id)}" title="ลบสื่อนี้">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
            </svg>
          </button>
        </div>
      ` : "";

      const fileTag = m.fileName ? `<span>📎 ${escapeHtml(m.fileName)}</span>` : "";
      const coverSrc = (unit && unit.image) ? unit.image : "assets/hero-mascot.jpg";

      return `
        <article class="material-card" style="--card-accent:${meta.accent}; --card-bg:${meta.bg};">
          <div class="card-cover card-open-trigger" data-id="${escapeHtml(m.id)}">
            <img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(m.title)}" class="card-cover-img">
            <div class="card-cover-overlay"></div>
            <div class="card-cover-top">
              <div class="card-cover-badges">
                ${unit ? `<span class="unit-pill-sm">${escapeHtml(unit.code)}</span>` : ""}
              </div>
              <button type="button" class="bookmark-btn ${isBookmarked ? "bookmarked" : ""}" data-id="${escapeHtml(m.id)}" title="${isBookmarked ? "นำออกจากที่บันทึกไว้" : "บันทึกสื่อนี้"}">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="${isBookmarked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2.4">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </button>
            </div>
            <span class="type-badge ${meta.badgeClass} card-type-sticker">${meta.emoji} ${meta.label}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(m.title)}</h3>
            <p class="card-desc">${escapeHtml(m.description)}</p>
            <div class="card-meta">
              ${m.duration ? `<span>⏱️ ${escapeHtml(m.duration)}</span>` : ""}
              ${fileTag}
            </div>
            ${tagsHtml ? `<div class="tag-list">${tagsHtml}</div>` : ""}
          </div>
          <div class="card-footer">
            <button type="button" class="btn ${meta.btnClass || "btn-primary"} btn-sm card-open-btn" data-id="${escapeHtml(m.id)}">
              ${meta.cta}
            </button>
            ${teacherBtns}
          </div>
        </article>
      `;
    }).join("");
  }

  function updateBookmarkBadge() {
    $("bookmarkCount").textContent = state.bookmarks.length;
    $("bookmarkFilterBtn").classList.toggle("active", state.onlyBookmarks);
  }

  function updateTeacherModeUI() {
    const btn = $("teacherModeBtn");
    const bar = $("teacherBar");
    btn.classList.toggle("active", state.teacherMode);
    btn.setAttribute("aria-pressed", String(state.teacherMode));
    $("teacherModeLabel").textContent = state.teacherMode ? "ปิดโหมดครู" : "โหมดครู";
    bar.classList.toggle("hidden", !state.teacherMode);
  }

  // ================= MODAL UTILITIES =================
  function openModal(id) {
    $(id).classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeModal(id) {
    $(id).classList.add("hidden");
    if (id === "viewerModal") {
      cleanupViewer();
    }
    if (id === "readerModal") {
      stopSentenceReader();
      if ($("readerDialog")) $("readerDialog").classList.remove("fullscreen");
    }
    if (id === "readingModal") {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if ($("readingDialog")) $("readingDialog").classList.remove("fullscreen");
    }
    // Restore body scroll if no modals open
    const anyOpen = Array.from(document.querySelectorAll(".modal-overlay")).some(el => !el.classList.contains("hidden"));
    if (!anyOpen) {
      document.body.style.overflow = "";
    }
  }

  function cleanupViewer() {
    activeViewerMaterial = null;
    $("viewerDialog").classList.remove("fullscreen");
    $("viewerBody")._keyHandler = null;
    if (activeMatchTimer) {
      clearInterval(activeMatchTimer);
      activeMatchTimer = null;
    }
    activeObjectUrls.forEach(url => URL.revokeObjectURL(url));
    activeObjectUrls = [];
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ================= MATERIAL VIEWER =================
  async function openMaterialViewer(materialId) {
    const mat = state.materials.find(m => m.id === materialId);
    if (!mat) return;

    cleanupViewer();
    activeViewerMaterial = mat;

    const meta = TYPE_META[mat.type] || TYPE_META.worksheet;
    const unit = state.units.find(u => u.id === mat.unitId);

    const badge = $("viewerTypeBadge");
    badge.className = "type-badge " + meta.badgeClass;
    badge.textContent = meta.emoji + " " + meta.label;

    $("viewerUnitBadge").textContent = unit ? `${unit.code}: ${unit.titleTh}` : "";
    $("viewerTitle").textContent = mat.title;

    openModal("viewerModal");

    if (mat.type === "worksheet") {
      await renderWorksheetViewer(mat, unit);
    } else if (mat.type === "media") {
      renderMediaViewer(mat, unit);
    } else if (mat.type === "flashcard") {
      renderFlashcardViewer(mat, unit);
    } else if (mat.type === "quiz") {
      renderQuizViewer(mat, unit);
    }
  }

  // ---------- 1. WORKSHEET VIEWER ----------
  async function renderWorksheetViewer(mat, unit) {
    const body = $("viewerBody");
    let showAnswers = false;
    let fileUrl = null;
    let fileMime = mat.fileMime || "";

    if (mat.fileKey) {
      try {
        const record = await getFileFromDb(mat.fileKey);
        if (record && record.blob) {
          fileUrl = URL.createObjectURL(record.blob);
          activeObjectUrls.push(fileUrl);
          fileMime = record.type || fileMime;
        }
      } catch (e) {
        console.warn("File load error:", e);
      }
    }

    function buildPaperHtml(includeAnswers) {
      const itemsHtml = (mat.items || []).map(item => `
        <li class="ws-item">
          <div class="ws-item-q">${escapeHtml(item.q)}</div>
          ${includeAnswers && item.a ? `<div class="ws-answer">✅ เฉลย: ${escapeHtml(item.a)}</div>` : ""}
        </li>
      `).join("");

      const unitImg = (unit && unit.image) ? unit.image : "assets/hero-mascot.jpg";

      return `
        <div class="worksheet-paper">
          <div class="ws-header">
            <div class="ws-header-left">
              <img src="${escapeHtml(unitImg)}" alt="Worksheet Illustration" class="ws-unit-art">
              <div>
                <div class="ws-subject">Krusah (ครูสา) • English Worksheet • Prathom 6 ${unit ? "(" + escapeHtml(unit.code) + ")" : ""}</div>
                <h3 class="ws-title">${escapeHtml(mat.title)}</h3>
              </div>
            </div>
            <div class="ws-student-fields">
              <div>Name: ______________________</div>
              <div>Class: P.6/___ &nbsp; No.: ___ &nbsp; Score: ___/${(mat.items || []).length || 10}</div>
            </div>
          </div>
          ${mat.instructions ? `<div class="ws-instruction"><strong>Directions:</strong> ${escapeHtml(mat.instructions)}</div>` : ""}
          ${mat.passage ? `<div class="ws-passage">${escapeHtml(mat.passage)}</div>` : ""}
          ${itemsHtml ? `<ol class="ws-item-list">${itemsHtml}</ol>` : `<p style="color:#64748b;">ใบงานนี้เน้นใช้งานจากไฟล์แนบหรือลิงก์ด้านบนครับ</p>`}
        </div>
      `;
    }

    function paint() {
      const hasBuiltInItems = (mat.items && mat.items.length > 0) || mat.passage || mat.instructions;

      let attachmentHtml = "";
      if (fileUrl) {
        if (fileMime.startsWith("image/")) {
          attachmentHtml = `<div class="attachment-preview-box"><img src="${fileUrl}" alt="${escapeHtml(mat.fileName || mat.title)}"></div>`;
        } else if (fileMime === "application/pdf") {
          attachmentHtml = `<div class="attachment-preview-box"><iframe src="${fileUrl}" title="PDF Preview"></iframe></div>`;
        } else {
          attachmentHtml = `<div class="viewer-toolbar"><span>📎 ไฟล์แนบ: <strong>${escapeHtml(mat.fileName || "worksheet-file")}</strong></span><a href="${fileUrl}" download="${escapeHtml(mat.fileName || "worksheet")}" class="btn btn-primary btn-sm">ดาวน์โหลดไฟล์</a></div>`;
        }
      }

      body.innerHTML = `
        <div class="viewer-toolbar">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${hasBuiltInItems ? `
              <button type="button" id="wsToggleAnsBtn" class="btn btn-soft btn-sm">
                ${showAnswers ? "🙈 ซ่อนเฉลย" : "💡 แสดงเฉลย (สำหรับครู)"}
              </button>
              <button type="button" id="wsPrintBtn" class="btn btn-primary btn-sm">
                🖨️ พิมพ์ใบงาน (A4)
              </button>
            ` : ""}
            ${fileUrl ? `
              <a href="${fileUrl}" download="${escapeHtml(mat.fileName || "worksheet")}" class="btn btn-emerald btn-sm">
                ⬇️ ดาวน์โหลดไฟล์แนบ
              </a>
            ` : ""}
            ${mat.externalUrl ? `
              <a href="${escapeHtml(mat.externalUrl)}" target="_blank" rel="noopener" class="btn btn-coral btn-sm">
                🔗 เปิดลิงก์ใบงานภายนอก
              </a>
            ` : ""}
          </div>
          <span style="font-size:0.82rem; font-weight:600; color:var(--ink-soft);">${showAnswers ? "💡 โหมดเฉลย (จัดพอดี 1 หน้า A4)" : "📄 โหมดใบงานนักเรียน (จัดพอดี 1 หน้า A4)"}</span>
        </div>
        ${attachmentHtml}
        ${hasBuiltInItems ? buildPaperHtml(showAnswers) : ""}
      `;

      const toggleBtn = $("wsToggleAnsBtn");
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          showAnswers = !showAnswers;
          paint();
        };
      }
      const printBtn = $("wsPrintBtn");
      if (printBtn) {
        printBtn.onclick = () => {
          $("printArea").innerHTML = buildPaperHtml(showAnswers);
          window.print();
        };
      }
    }

    paint();
  }

  // ---------- 2. MEDIA / SLIDE VIEWER ----------
  function getEmbedUrl(rawUrl) {
    if (!rawUrl) return null;
    const url = rawUrl.trim();
    // YouTube watch / share / shorts
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      return "https://www.youtube.com/embed/" + ytMatch[1];
    }
    // Google Slides
    if (url.includes("docs.google.com/presentation/d/")) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        return `https://docs.google.com/presentation/d/${idMatch[1]}/embed?start=false&loop=false`;
      }
    }
    // Canva embed
    if (url.includes("canva.com/design/") && url.includes("embed")) {
      return url;
    }
    return null;
  }

  function renderMediaViewer(mat, unit) {
    const body = $("viewerBody");
    const slides = Array.isArray(mat.slides) ? mat.slides : [];
    const embedUrl = getEmbedUrl(mat.mediaUrl);
    const unitImg = (unit && unit.image) ? unit.image : "assets/hero-mascot.jpg";
    let slideIdx = 0;

    function paint() {
      let mediaHtml = "";
      if (embedUrl) {
        mediaHtml = `
          <div class="video-embed-wrap">
            <iframe src="${escapeHtml(embedUrl)}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        `;
      }
      if (mat.mediaUrl) {
        mediaHtml += `
          <div class="viewer-toolbar">
            <span style="font-size:0.88rem; word-break:break-all;">🔗 ลิงก์สื่อ: <strong>${escapeHtml(mat.mediaUrl)}</strong></span>
            <a href="${escapeHtml(mat.mediaUrl)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">เปิดในแท็บใหม่</a>
          </div>
        `;
      }

      let slideHtml = "";
      if (slides.length > 0) {
        const s = slides[slideIdx];
        const dots = slides.map((_, i) => `<button type="button" class="slide-dot ${i === slideIdx ? "active" : ""}" data-slide="${i}" aria-label="สไลด์ ${i + 1}"></button>`).join("");

        slideHtml = `
          <div class="slide-stage">
            <div>
              <div class="slide-top-flex">
                <div style="flex:1;">
                  <div class="slide-counter">Slide ${slideIdx + 1} / ${slides.length}</div>
                  <h3 class="slide-heading">${escapeHtml(s.heading || "สไลด์ที่ " + (slideIdx + 1))}</h3>
                </div>
                <img src="${escapeHtml(unitImg)}" alt="Slide Illustration" class="slide-unit-art">
              </div>
              <div class="slide-content">${escapeHtml(s.content || "")}</div>
              ${s.exampleEn ? `
                <div class="slide-example-box">
                  <div>
                    <div style="font-size:0.76rem; color:var(--amber); font-weight:700;">🔊 EXAMPLE SENTENCE</div>
                    <div class="slide-example-en">${escapeHtml(s.exampleEn)}</div>
                  </div>
                  <div style="display:flex; gap:6px;">
                    <button type="button" class="btn btn-sunny btn-sm" id="slideSpeakBtn">🔊 ฟังเสียง</button>
                    <button type="button" class="btn btn-soft btn-sm" id="slideSpeakSlowBtn">🐢 ช้าๆ</button>
                  </div>
                </div>
              ` : ""}
            </div>

            <div class="slide-controls">
              <button type="button" class="btn btn-soft btn-sm" id="slidePrevBtn" ${slideIdx === 0 ? "disabled" : ""}>⬅️ สไลด์ก่อนหน้า</button>
              <div class="slide-dots">${dots}</div>
              <button type="button" class="btn btn-primary btn-sm" id="slideNextBtn" ${slideIdx === slides.length - 1 ? "disabled" : ""}>สไลด์ถัดไป ➡️</button>
            </div>
          </div>
          <p style="text-align:center; font-size:0.8rem; color:var(--text-light); margin-top:10px;">
            เคล็ดลับ: กดปุ่มลูกศร ⬅️ / ➡️ บนคีย์บอร์ดเพื่อเปลี่ยนสไลด์ และกดปุ่มขยายเต็มจอมุมขวาบนเมื่อขึ้นจอห้องเรียน
          </p>
        `;
      } else if (!mat.mediaUrl) {
        slideHtml = `<div class="empty-state"><p>ยังไม่มีเนื้อหาสไลด์หรือลิงก์วิดีโอในสื่อนี้</p></div>`;
      }

      body.innerHTML = mediaHtml + slideHtml;

      const prevBtn = $("slidePrevBtn");
      const nextBtn = $("slideNextBtn");
      if (prevBtn) prevBtn.onclick = () => { if (slideIdx > 0) { slideIdx--; paint(); } };
      if (nextBtn) nextBtn.onclick = () => { if (slideIdx < slides.length - 1) { slideIdx++; paint(); } };

      body.querySelectorAll(".slide-dot").forEach(dot => {
        dot.onclick = () => {
          slideIdx = Number(dot.dataset.slide);
          paint();
        };
      });

      const speakBtn = $("slideSpeakBtn");
      const slowBtn = $("slideSpeakSlowBtn");
      if (speakBtn && slides[slideIdx] && slides[slideIdx].exampleEn) {
        speakBtn.onclick = () => speakEnglish(slides[slideIdx].exampleEn, 0.92);
      }
      if (slowBtn && slides[slideIdx] && slides[slideIdx].exampleEn) {
        slowBtn.onclick = () => speakEnglish(slides[slideIdx].exampleEn, 0.68);
      }
    }

    // Store keyboard handler on modal for arrow keys
    body._keyHandler = (e) => {
      if (!slides.length) return;
      if (e.key === "ArrowRight" && slideIdx < slides.length - 1) { slideIdx++; paint(); }
      if (e.key === "ArrowLeft" && slideIdx > 0) { slideIdx--; paint(); }
    };

    paint();
  }

  // ---------- 3. FLASHCARD & MATCH GAME VIEWER ----------
  function renderFlashcardViewer(mat, unit) {
    const body = $("viewerBody");
    const unitImg = (unit && unit.image) ? unit.image : "assets/hero-mascot.jpg";
    const originalCards = Array.isArray(mat.cards) ? mat.cards : [];
    if (!originalCards.length) {
      body.innerHTML = `<div class="empty-state"><p>ยังไม่มีคำศัพท์ในชุดนี้</p></div>`;
      return;
    }

    let mode = "cards"; // "cards" | "match"
    let deck = clone(originalCards);
    let idx = 0;
    let flipped = false;
    let mastered = new Set();

    // Match game state
    let matchTiles = [];
    let selectedTile = null;
    let matchedPairs = 0;
    let totalPairs = 0;
    let attempts = 0;
    let elapsedSec = 0;
    let matchLocked = false;

    function startMatchGame() {
      if (activeMatchTimer) clearInterval(activeMatchTimer);
      const shuffled = clone(originalCards).sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, Math.min(6, shuffled.length));
      totalPairs = chosen.length;
      matchedPairs = 0;
      attempts = 0;
      elapsedSec = 0;
      selectedTile = null;
      matchLocked = false;

      matchTiles = [];
      chosen.forEach((c, pairId) => {
        matchTiles.push({ id: "en-" + pairId, pairId, lang: "en", text: (c.emoji ? c.emoji + " " : "") + c.word, rawWord: c.word, matched: false });
        matchTiles.push({ id: "th-" + pairId, pairId, lang: "th", text: c.meaning, matched: false });
      });
      matchTiles.sort(() => Math.random() - 0.5);

      activeMatchTimer = setInterval(() => {
        elapsedSec++;
        const timerEl = $("matchTimerVal");
        if (timerEl) timerEl.textContent = elapsedSec + " วินาที";
      }, 1000);
    }

    function paint() {
      const tabsHtml = `
        <div class="fc-top-bar">
          <div class="fc-mode-tabs">
            <button type="button" class="fc-tab-btn ${mode === "cards" ? "active" : ""}" id="tabFcCards">🃏 บัตรคำศัพท์ (${originalCards.length} คำ)</button>
            <button type="button" class="fc-tab-btn ${mode === "match" ? "active" : ""}" id="tabFcMatch">🎮 เกมจับคู่คำศัพท์</button>
          </div>
          <img src="${escapeHtml(unitImg)}" alt="Unit Illustration" class="fc-unit-peek">
        </div>
      `;

      if (mode === "cards") {
        if (activeMatchTimer) { clearInterval(activeMatchTimer); activeMatchTimer = null; }
        const card = deck[idx];
        const pct = Math.round((mastered.size / deck.length) * 100);
        const isMastered = mastered.has(card.word);

        body.innerHTML = `
          ${tabsHtml}
          <div class="fc-progress-row">
            <span>คำที่ <strong>${idx + 1}</strong> จาก <strong>${deck.length}</strong></span>
            <span>จำได้แล้ว: <strong style="color:var(--mint-deep);">${mastered.size} / ${deck.length}</strong> (${pct}%)</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>

          <div class="fc-scene">
            <div class="fc-card ${flipped ? "flipped" : ""}" id="fcFlipCard" role="button" tabindex="0" aria-label="คลิกเพื่อพลิกบัตรคำศัพท์">
              <div class="fc-face fc-front">
                <div class="fc-emoji-badge">${escapeHtml(card.emoji || "📘")}</div>
                <div class="fc-word">${escapeHtml(card.word)}</div>
                ${card.phonetic ? `<div class="fc-phonetic">${escapeHtml(card.phonetic)}</div>` : ""}
                <div class="fc-flip-hint">👆 คลิกที่บัตร หรือกด Spacebar เพื่อดูความหมาย</div>
              </div>
              <div class="fc-face fc-back">
                <div class="fc-emoji-badge">${escapeHtml(card.emoji || "✨")}</div>
                <div class="fc-meaning">${escapeHtml(card.meaning)}</div>
                ${card.example ? `<div class="fc-example">“${escapeHtml(card.example)}”</div>` : ""}
                <div class="fc-flip-hint">👆 คลิกเพื่อพลิกกลับด้านหน้า</div>
              </div>
            </div>
          </div>

          <div class="fc-audio-row">
            <button type="button" class="btn btn-sunny btn-sm" id="fcSpeakBtn">🔊 ฟังเสียงคำศัพท์</button>
            <button type="button" class="btn btn-soft btn-sm" id="fcSpeakSlowBtn">🐢 ฟังช้าๆ (0.7x)</button>
            ${card.example ? `<button type="button" class="btn btn-soft btn-sm" id="fcSpeakExBtn">💬 ฟังประโยคตัวอย่าง</button>` : ""}
          </div>

          <div class="fc-controls">
            <button type="button" class="btn btn-soft btn-sm" id="fcPrevBtn">⬅️ ก่อนหน้า</button>
            <button type="button" class="btn ${isMastered ? "btn-emerald" : "btn-ghost"} btn-sm" id="fcMasterBtn">
              ${isMastered ? "✅ จำได้แล้ว!" : "☆ ทำเครื่องหมายว่าจำได้"}
            </button>
            <button type="button" class="btn btn-soft btn-sm" id="fcShuffleBtn">🔀 สลับลำดับ</button>
            <button type="button" class="btn btn-primary btn-sm" id="fcNextBtn">คำถัดไป ➡️</button>
          </div>
        `;

        $("fcFlipCard").onclick = () => { flipped = !flipped; $("fcFlipCard").classList.toggle("flipped", flipped); };
        $("fcSpeakBtn").onclick = () => speakEnglish(card.word, 0.92);
        $("fcSpeakSlowBtn").onclick = () => speakEnglish(card.word, 0.65);
        if ($("fcSpeakExBtn")) $("fcSpeakExBtn").onclick = () => speakEnglish(card.example, 0.88);

        $("fcPrevBtn").onclick = () => { idx = (idx - 1 + deck.length) % deck.length; flipped = false; paint(); };
        $("fcNextBtn").onclick = () => { idx = (idx + 1) % deck.length; flipped = false; paint(); };
        $("fcShuffleBtn").onclick = () => {
          deck = deck.sort(() => Math.random() - 0.5);
          idx = 0;
          flipped = false;
          showToast("สลับลำดับบัตรคำศัพท์แล้ว!", "success");
          paint();
        };
        $("fcMasterBtn").onclick = () => {
          if (mastered.has(card.word)) mastered.delete(card.word);
          else mastered.add(card.word);
          if (mastered.size === deck.length) {
            showToast("🎉 เก่งมาก! จำคำศัพท์ครบทุกคำในชุดนี้แล้ว!", "success");
          }
          paint();
        };
      } else {
        // MATCH GAME VIEW
        const finished = matchedPairs === totalPairs && totalPairs > 0;
        if (finished && activeMatchTimer) {
          clearInterval(activeMatchTimer);
          activeMatchTimer = null;
        }

        body.innerHTML = `
          ${tabsHtml}
          <div class="match-header">
            <div>จับคู่คำศัพท์ภาษาอังกฤษกับความหมายภาษาไทยให้ครบ! (<strong>${matchedPairs}/${totalPairs} คู่</strong>)</div>
            <div style="display:flex; gap:12px; align-items:center;">
              <span>⏱️ <strong id="matchTimerVal">${elapsedSec} วินาที</strong></span>
              <span>🎯 ลองจับคู่: <strong>${attempts}</strong> ครั้ง</span>
              <button type="button" class="btn btn-soft btn-sm" id="matchRestartBtn">🔄 เริ่มเกมใหม่</button>
            </div>
          </div>

          ${finished ? `
            <div class="quiz-result-card">
              <div class="result-stars">⭐⭐⭐</div>
              <h3 style="margin:0 0 6px; color:#1E3A8A;">ยอดเยี่ยมมาก! จับคู่ครบทุกคำแล้ว!</h3>
              <p style="margin:0 0 18px; color:var(--text-muted);">
                ใช้เวลา <strong>${elapsedSec} วินาที</strong> &bull; จับคู่ทั้งหมด <strong>${attempts} ครั้ง</strong>
              </p>
              <button type="button" class="btn btn-primary" id="matchPlayAgainBtn">🎮 เล่นรอบใหม่ (สุ่มคำ)</button>
            </div>
          ` : `
            <div class="match-grid">
              ${matchTiles.map((t, i) => `
                <button type="button" class="match-tile ${t.lang === "en" ? "lang-en" : ""} ${t.matched ? "matched" : ""} ${selectedTile === i ? "selected" : ""}"
                        data-idx="${i}" ${t.matched ? "disabled" : ""}>
                  ${escapeHtml(t.text)}
                </button>
              `).join("")}
            </div>
          `}
        `;

        if ($("matchRestartBtn")) $("matchRestartBtn").onclick = () => { startMatchGame(); paint(); };
        if ($("matchPlayAgainBtn")) $("matchPlayAgainBtn").onclick = () => { startMatchGame(); paint(); };

        body.querySelectorAll(".match-tile").forEach(btn => {
          btn.onclick = () => {
            if (matchLocked) return;
            const tileIdx = Number(btn.dataset.idx);
            const tile = matchTiles[tileIdx];
            if (tile.matched) return;

            if (tile.lang === "en" && tile.rawWord) {
              speakEnglish(tile.rawWord, 0.95);
            }

            if (selectedTile === null) {
              selectedTile = tileIdx;
              paint();
              return;
            }
            if (selectedTile === tileIdx) {
              selectedTile = null;
              paint();
              return;
            }

            const first = matchTiles[selectedTile];
            attempts++;
            if (first.pairId === tile.pairId && first.lang !== tile.lang) {
              first.matched = true;
              tile.matched = true;
              matchedPairs++;
              selectedTile = null;
              paint();
            } else {
              matchLocked = true;
              btn.classList.add("wrong");
              const firstBtn = body.querySelector(`.match-tile[data-idx="${selectedTile}"]`);
              if (firstBtn) firstBtn.classList.add("wrong");
              setTimeout(() => {
                selectedTile = null;
                matchLocked = false;
                paint();
              }, 480);
            }
          };
        });
      }

      $("tabFcCards").onclick = () => { mode = "cards"; paint(); };
      $("tabFcMatch").onclick = () => { mode = "match"; startMatchGame(); paint(); };
    }

    body._keyHandler = (e) => {
      if (mode !== "cards") return;
      if (e.code === "Space") {
        e.preventDefault();
        flipped = !flipped;
        const el = $("fcFlipCard");
        if (el) el.classList.toggle("flipped", flipped);
      } else if (e.key === "ArrowRight") {
        idx = (idx + 1) % deck.length; flipped = false; paint();
      } else if (e.key === "ArrowLeft") {
        idx = (idx - 1 + deck.length) % deck.length; flipped = false; paint();
      }
    };

    paint();
  }

  // ---------- 4. QUIZ VIEWER ----------
  function renderQuizViewer(mat, unit) {
    const body = $("viewerBody");
    const unitImg = (unit && unit.image) ? unit.image : "assets/hero-mascot.jpg";
    const questions = Array.isArray(mat.questions) ? mat.questions : [];
    if (!questions.length) {
      body.innerHTML = `<div class="empty-state"><p>ยังไม่มีข้อสอบในชุดนี้</p></div>`;
      return;
    }

    let qIdx = 0;
    let score = 0;
    let answered = null; // selected option index
    let finished = false;
    const letters = ["A", "B", "C", "D"];

    function paint() {
      if (finished) {
        const pct = Math.round((score / questions.length) * 100);
        const stars = pct >= 80 ? "⭐⭐⭐" : pct >= 50 ? "⭐⭐☆" : "⭐☆☆";
        const msg = pct >= 80
          ? "สุดยอดไปเลย! เก่งภาษาอังกฤษมากครับ 🎉"
          : pct >= 50
            ? "ทำได้ดีเลย! ทบทวนอีกนิดเต็มแน่นอน 💪"
            : "สู้ๆ นะครับ ลองทบทวนเฉลยแล้วทำใหม่อีกครั้ง 📘";

        body.innerHTML = `
          <div class="quiz-box">
            <div class="quiz-result-card">
              <img src="assets/hero-mascot.jpg" alt="เก่งมาก!" class="result-mascot-img">
              <div class="result-stars">${stars}</div>
              <div class="result-score">${score} / ${questions.length} คะแนน (${pct}%)</div>
              <p style="font-size:1.05rem; margin:10px 0 22px; color:var(--ink-soft);">${msg}</p>
              <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary" id="quizRetryBtn">🔄 ทำแบบทดสอบอีกครั้ง</button>
                <button type="button" class="btn btn-soft close-modal-btn" data-close="viewerModal">กลับหน้าคลังสื่อ</button>
              </div>
            </div>
          </div>
        `;
        $("quizRetryBtn").onclick = () => {
          qIdx = 0; score = 0; answered = null; finished = false; paint();
        };
        return;
      }

      const q = questions[qIdx];
      const pct = Math.round((qIdx / questions.length) * 100);

      const optionsHtml = (q.options || []).map((opt, i) => {
        let cls = "";
        if (answered !== null) {
          if (i === q.answer) cls = "correct";
          else if (i === answered && answered !== q.answer) cls = "incorrect";
        }
        return `
          <button type="button" class="quiz-option ${cls}" data-opt="${i}" ${answered !== null ? "disabled" : ""}>
            <span class="quiz-option-letter">${letters[i] || i + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      }).join("");

      const feedbackHtml = answered !== null ? `
        <div class="quiz-feedback ${answered === q.answer ? "ok" : "bad"}">
          <strong>${answered === q.answer ? "✅ ถูกต้อง เก่งมาก!" : "❌ ยังไม่ถูกนะ คำตอบที่ถูกคือข้อ " + (letters[q.answer] || "")}</strong>
          ${q.explanation ? `<div style="margin-top:4px;">💡 คำอธิบาย: ${escapeHtml(q.explanation)}</div>` : ""}
        </div>
      ` : "";

      body.innerHTML = `
        <div class="quiz-box">
          <img src="${escapeHtml(unitImg)}" alt="Quiz Illustration" class="quiz-banner-img">
          <div class="fc-progress-row">
            <span>ข้อที่ <strong>${qIdx + 1}</strong> จาก <strong>${questions.length}</strong></span>
            <span>คะแนนสะสม: <strong style="color:var(--lavender-deep);">${score}</strong></span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>

          <div class="quiz-question-card">
            <div class="quiz-q-num">Question ${qIdx + 1}</div>
            <div class="quiz-q-text">${escapeHtml(q.question)}</div>
          </div>

          <div class="quiz-options">${optionsHtml}</div>
          ${feedbackHtml}

          ${answered !== null ? `
            <div style="text-align:right;">
              <button type="button" class="btn btn-primary" id="quizNextBtn">
                ${qIdx === questions.length - 1 ? "ดูผลคะแนน 🏆" : "ข้อถัดไป ➡️"}
              </button>
            </div>
          ` : ""}
        </div>
      `;

      body.querySelectorAll(".quiz-option").forEach(btn => {
        btn.onclick = () => {
          if (answered !== null) return;
          answered = Number(btn.dataset.opt);
          if (answered === q.answer) score++;
          paint();
        };
      });

      const nextBtn = $("quizNextBtn");
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (qIdx === questions.length - 1) {
            finished = true;
          } else {
            qIdx++;
            answered = null;
          }
          paint();
        };
      }
    }

    body._keyHandler = null;
    paint();
  }

  // ================= TEACHER EDITOR MODAL =================
  function populateUnitSelect() {
    const sel = $("matUnit");
    sel.innerHTML = state.units.map(u => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.code)}: ${escapeHtml(u.titleTh)}</option>`).join("");
  }

  function syncEditorDynamicSections() {
    const type = $("matType").value;
    $("fieldsWorksheet").classList.toggle("hidden", type !== "worksheet");
    $("fieldsMedia").classList.toggle("hidden", type !== "media");
    $("fieldsFlashcard").classList.toggle("hidden", type !== "flashcard");
    $("fieldsQuiz").classList.toggle("hidden", type !== "quiz");
    if (type === "quiz" && $("quizBuilderList").children.length === 0) {
      addQuizBuilderRow();
    }
  }

  function addQuizBuilderRow(qData) {
    const list = $("quizBuilderList");
    const index = list.children.length + 1;
    const item = document.createElement("div");
    item.className = "qb-item";
    const opts = (qData && qData.options) || ["", "", "", ""];
    const ans = qData && typeof qData.answer === "number" ? qData.answer : 0;

    item.innerHTML = `
      <div class="qb-header">
        <span>ข้อที่ ${index}</span>
        <button type="button" class="btn-link-danger qb-remove-btn">ลบข้อนี้</button>
      </div>
      <div class="form-group">
        <input type="text" class="qb-question" placeholder="พิมพ์โจทย์คำถาม..." value="${escapeHtml(qData ? qData.question : "")}">
      </div>
      <div class="qb-choices-grid">
        <input type="text" class="qb-opt" placeholder="ตัวเลือก A" value="${escapeHtml(opts[0] || "")}">
        <input type="text" class="qb-opt" placeholder="ตัวเลือก B" value="${escapeHtml(opts[1] || "")}">
        <input type="text" class="qb-opt" placeholder="ตัวเลือก C" value="${escapeHtml(opts[2] || "")}">
        <input type="text" class="qb-opt" placeholder="ตัวเลือก D" value="${escapeHtml(opts[3] || "")}">
      </div>
      <div class="form-row two-col">
        <select class="qb-answer">
          <option value="0" ${ans === 0 ? "selected" : ""}>เฉลย: ข้อ A</option>
          <option value="1" ${ans === 1 ? "selected" : ""}>เฉลย: ข้อ B</option>
          <option value="2" ${ans === 2 ? "selected" : ""}>เฉลย: ข้อ C</option>
          <option value="3" ${ans === 3 ? "selected" : ""}>เฉลย: ข้อ D</option>
        </select>
        <input type="text" class="qb-exp" placeholder="คำอธิบายเฉลย (ไม่บังคับ)" value="${escapeHtml(qData ? qData.explanation || "" : "")}">
      </div>
    `;

    item.querySelector(".qb-remove-btn").onclick = () => {
      item.remove();
      renumberQuizBuilder();
    };
    list.appendChild(item);
  }

  function renumberQuizBuilder() {
    Array.from($("quizBuilderList").children).forEach((el, i) => {
      const span = el.querySelector(".qb-header span");
      if (span) span.textContent = "ข้อที่ " + (i + 1);
    });
  }

  function openMaterialEditor(materialId) {
    populateUnitSelect();
    $("materialForm").reset();
    $("quizBuilderList").innerHTML = "";
    editorPendingFile = null;
    $("wsFileStatus").textContent = "คลิกเพื่อเลือกไฟล์ หรือวางไฟล์ที่นี่ (รองรับ PDF, รูปภาพ)";
    $("wsRemoveFileBtn").classList.add("hidden");

    if (materialId) {
      const mat = state.materials.find(m => m.id === materialId);
      if (!mat) return;
      $("editorModalTitle").textContent = "แก้ไขสื่อการสอน";
      $("editMaterialId").value = mat.id;
      $("matType").value = mat.type;
      $("matUnit").value = mat.unitId;
      $("matTitle").value = mat.title || "";
      $("matDesc").value = mat.description || "";
      $("matDuration").value = mat.duration || "";
      $("matTags").value = (mat.tags || []).join(", ");

      if (mat.type === "worksheet") {
        $("wsExternalUrl").value = mat.externalUrl || "";
        $("wsInstructions").value = mat.instructions || "";
        $("wsItemsText").value = (mat.items || []).map(it => it.a ? `${it.q} | ${it.a}` : it.q).join("\n");
        if (mat.fileKey) {
          editorPendingFile = { keepKey: mat.fileKey, fileName: mat.fileName, mimeType: mat.fileMime };
          $("wsFileStatus").textContent = "📎 ไฟล์ที่แนบอยู่: " + (mat.fileName || "แนบไฟล์แล้ว");
          $("wsRemoveFileBtn").classList.remove("hidden");
        }
      } else if (mat.type === "media") {
        $("mediaUrl").value = mat.mediaUrl || "";
        $("mediaSlidesText").value = (mat.slides || []).map(s => {
          let block = (s.heading || "") + "\n" + (s.content || "");
          if (s.exampleEn) block += "\nExample: " + s.exampleEn;
          return block;
        }).join("\n---\n");
      } else if (mat.type === "flashcard") {
        $("fcCardsText").value = (mat.cards || []).map(c =>
          [c.word || "", c.phonetic || "", c.meaning || "", c.example || "", c.emoji || ""].join(" | ")
        ).join("\n");
      } else if (mat.type === "quiz") {
        (mat.questions || []).forEach(q => addQuizBuilderRow(q));
      }
    } else {
      $("editorModalTitle").textContent = "เพิ่มสื่อการสอนใหม่";
      $("editMaterialId").value = "";
      if (state.activeUnit !== "all") {
        $("matUnit").value = state.activeUnit;
      }
      addQuizBuilderRow();
    }

    syncEditorDynamicSections();
    openModal("editorModal");
  }

  async function handleSaveMaterial(e) {
    e.preventDefault();
    const editId = $("editMaterialId").value;
    const type = $("matType").value;
    const unitId = $("matUnit").value;
    const title = $("matTitle").value.trim();
    const description = $("matDesc").value.trim();
    const duration = $("matDuration").value.trim();
    const tags = $("matTags").value
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    if (!title || !description) {
      showToast("กรุณากรอกชื่อสื่อและคำอธิบายให้ครบถ้วน", "warning");
      return;
    }

    const existing = editId ? state.materials.find(m => m.id === editId) : null;
    const matObj = {
      id: editId || generateId("m"),
      unitId,
      type,
      title,
      description,
      duration,
      tags,
      createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10)
    };

    if (type === "worksheet") {
      matObj.externalUrl = $("wsExternalUrl").value.trim();
      matObj.instructions = $("wsInstructions").value.trim();
      if (existing && existing.passage) matObj.passage = existing.passage;
      matObj.items = $("wsItemsText").value
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const parts = line.split("|");
          return { q: parts[0].trim(), a: parts[1] ? parts[1].trim() : "" };
        });

      // Handle file attachment via IndexedDB
      if (editorPendingFile && editorPendingFile.file) {
        const key = "file-" + matObj.id;
        try {
          await saveFileToDb(key, editorPendingFile.file);
          matObj.fileKey = key;
          matObj.fileName = editorPendingFile.file.name;
          matObj.fileMime = editorPendingFile.file.type;
        } catch (err) {
          showToast("ไม่สามารถบันทึกไฟล์แนบได้ แต่บันทึกข้อมูลสื่อเรียบร้อยแล้ว", "warning");
        }
      } else if (editorPendingFile && editorPendingFile.keepKey) {
        matObj.fileKey = editorPendingFile.keepKey;
        matObj.fileName = editorPendingFile.fileName;
        matObj.fileMime = editorPendingFile.mimeType;
      } else if (existing && existing.fileKey) {
        await deleteFileFromDb(existing.fileKey);
      }
    } else if (type === "media") {
      matObj.mediaUrl = $("mediaUrl").value.trim();
      const rawSlides = $("mediaSlidesText").value.trim();
      matObj.slides = rawSlides
        ? rawSlides.split(/\n\s*---\s*\n/).map(block => {
            const lines = block.trim().split("\n");
            const heading = lines.shift() || "สไลด์";
            let exampleEn = "";
            const contentLines = [];
            lines.forEach(l => {
              if (/^example\s*:/i.test(l.trim())) {
                exampleEn = l.trim().replace(/^example\s*:/i, "").trim();
              } else {
                contentLines.push(l);
              }
            });
            return { heading: heading.trim(), content: contentLines.join("\n").trim(), exampleEn };
          })
        : [];
    } else if (type === "flashcard") {
      const cards = $("fcCardsText").value
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const p = line.split("|").map(s => s.trim());
          return {
            word: p[0] || "",
            phonetic: p[1] || "",
            meaning: p[2] || "",
            example: p[3] || "",
            emoji: p[4] || "📘"
          };
        })
        .filter(c => c.word);

      if (!cards.length) {
        showToast("กรุณาเพิ่มคำศัพท์อย่างน้อย 1 คำ", "warning");
        return;
      }
      matObj.cards = cards;
      if (!matObj.duration) matObj.duration = cards.length + " คำศัพท์ + เกมจับคู่";
    } else if (type === "quiz") {
      const questions = Array.from($("quizBuilderList").children).map(row => {
        const question = row.querySelector(".qb-question").value.trim();
        const options = Array.from(row.querySelectorAll(".qb-opt")).map(i => i.value.trim());
        const answer = Number(row.querySelector(".qb-answer").value);
        const explanation = row.querySelector(".qb-exp").value.trim();
        return { question, options, answer, explanation };
      }).filter(q => q.question && q.options.some(Boolean));

      if (!questions.length) {
        showToast("กรุณาเพิ่มข้อคำถามอย่างน้อย 1 ข้อ", "warning");
        return;
      }
      matObj.questions = questions;
      if (!matObj.duration) matObj.duration = questions.length + " ข้อ";
    }

    if (editId) {
      const idx = state.materials.findIndex(m => m.id === editId);
      if (idx !== -1) state.materials[idx] = matObj;
      showToast("อัปเดตสื่อการสอนเรียบร้อยแล้ว!", "success");
    } else {
      state.materials.unshift(matObj);
      showToast("เพิ่มสื่อการสอนใหม่เรียบร้อยแล้ว!", "success");
    }

    saveState();
    closeModal("editorModal");
    renderAll();
  }

  async function deleteMaterial(materialId) {
    const mat = state.materials.find(m => m.id === materialId);
    if (!mat) return;
    if (!confirm(`ต้องการลบสื่อ "${mat.title}" ใช่หรือไม่?`)) return;

    if (mat.fileKey) {
      await deleteFileFromDb(mat.fileKey);
    }
    state.materials = state.materials.filter(m => m.id !== materialId);
    state.bookmarks = state.bookmarks.filter(id => id !== materialId);
    saveState();
    renderAll();
    showToast("ลบสื่อการสอนแล้ว");
  }

  // ================= MANAGE UNITS MODAL =================
  function renderUnitsManager() {
    const list = $("unitsManageList");
    list.innerHTML = state.units.map(u => {
      const count = state.materials.filter(m => m.unitId === u.id).length;
      return `
        <div class="unit-manage-row">
          <div>
            <strong>${escapeHtml(u.emoji || "📘")} ${escapeHtml(u.code)}: ${escapeHtml(u.titleEn)}</strong>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(u.titleTh)} • (${count} สื่อ)</div>
          </div>
          <button type="button" class="btn btn-danger btn-sm delete-unit-btn" data-id="${escapeHtml(u.id)}">ลบ</button>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".delete-unit-btn").forEach(btn => {
      btn.onclick = () => {
        const uid = btn.dataset.id;
        if (state.units.length <= 1) {
          showToast("ต้องมีหน่วยการเรียนรู้อย่างน้อย 1 หน่วย", "warning");
          return;
        }
        const count = state.materials.filter(m => m.unitId === uid).length;
        if (count > 0 && !confirm(`หน่วยนี้มีสื่ออยู่ ${count} รายการ หากลบหน่วยนี้ สื่อเหล่านั้นจะยังคงอยู่แต่ไม่มีหน่วยกำกับ ต้องการลบใช่หรือไม่?`)) {
          return;
        }
        state.units = state.units.filter(u => u.id !== uid);
        if (state.activeUnit === uid) state.activeUnit = "all";
        saveState();
        renderUnitsManager();
        renderAll();
        showToast("ลบหน่วยการเรียนรู้แล้ว");
      };
    });
  }

  // ================= EXPORT / IMPORT =================
  function downloadTextFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJsonBackup() {
    const payload = {
      app: "Krusah English P.6 Hub (ครูสา)",
      exportedAt: new Date().toISOString(),
      units: state.units,
      materials: state.materials
    };
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(`english-p6-backup-${dateStr}.json`, JSON.stringify(payload, null, 2), "application/json");
    showToast("ดาวน์โหลดไฟล์สำรองข้อมูล (.json) เรียบร้อย!", "success");
  }

  function exportDataJs() {
    const payload = {
      units: state.units,
      materials: state.materials
    };
    const jsContent =
      "/* Exported from English P.6 Hub on " + new Date().toISOString() + " */\n" +
      "window.DEFAULT_ENGLISH_P6_DATA = " + JSON.stringify(payload, null, 2) + ";\n";
    downloadTextFile("data.js", jsContent, "application/javascript");
    showToast("ดาวน์โหลด data.js แล้ว! นำไปวางทับไฟล์เดิมก่อนอัปขึ้นเว็บได้เลย", "success");
  }

  function handleImportJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed.units) || !Array.isArray(parsed.materials)) {
          throw new Error("Invalid format");
        }
        if (!confirm(`พบข้อมูล ${parsed.units.length} หน่วยการเรียนรู้ และ ${parsed.materials.length} สื่อการสอน ต้องการนำเข้าแทนที่ข้อมูลปัจจุบันหรือไม่?`)) {
          return;
        }
        state.units = parsed.units;
        state.materials = parsed.materials;
        state.activeUnit = "all";
        saveState();
        renderAll();
        showToast("นำเข้าข้อมูลเรียบร้อยแล้ว!", "success");
      } catch (err) {
        showToast("ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ .json ที่สำรองจากแอปนี้", "warning");
      }
    };
    reader.readAsText(file);
  }

  // ================= EVENT BINDINGS =================
  function bindEvents() {
    // Brand reset home (click + Enter/Space)
    function goHomeReset() {
      state.activeUnit = "all";
      state.activeType = "all";
      state.onlyBookmarks = false;
      state.searchQuery = "";
      $("searchInput").value = "";
      $("clearSearchBtn").classList.add("hidden");
      renderAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    $("brandHome").onclick = goHomeReset;
    $("brandHome").onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goHomeReset();
      }
    };

    // Search
    $("searchInput").addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      $("clearSearchBtn").classList.toggle("hidden", !state.searchQuery);
      renderTypeCounts();
      renderMaterials();
      renderMaterialsBanner();
    });
    $("clearSearchBtn").onclick = () => {
      state.searchQuery = "";
      $("searchInput").value = "";
      $("clearSearchBtn").classList.add("hidden");
      renderTypeCounts();
      renderMaterials();
      renderMaterialsBanner();
    };

    // Bookmark filter
    $("bookmarkFilterBtn").onclick = () => {
      state.onlyBookmarks = !state.onlyBookmarks;
      updateBookmarkBadge();
      renderTypeCounts();
      renderMaterials();
      renderMaterialsBanner();
      if (state.onlyBookmarks) {
        if (state.bookmarks.length === 0) {
          showToast("⭐ ยังไม่มีสื่อที่บันทึกไว้ ลองกดปุ่มดาวบนการ์ดสื่อที่ชอบก่อนนะครับ");
        }
        scrollToMaterials();
      }
    };

    // Teacher Mode toggle
    $("teacherModeBtn").onclick = () => {
      if (state.teacherMode) {
        state.teacherMode = false;
        renderAll();
        showToast("กลับสู่โหมดนักเรียนแล้ว");
        return;
      }
      if (state.teacherPin) {
        $("pinUnlockInput").value = "";
        $("pinErrorMsg").classList.add("hidden");
        openModal("pinPromptModal");
        setTimeout(() => $("pinUnlockInput").focus(), 60);
      } else {
        state.teacherMode = true;
        renderAll();
        showToast("เปิดโหมดครูแล้ว สามารถเพิ่ม/แก้ไขสื่อได้เลย", "success");
      }
    };

    $("pinPromptForm").onsubmit = (e) => {
      e.preventDefault();
      if ($("pinUnlockInput").value === state.teacherPin) {
        closeModal("pinPromptModal");
        state.teacherMode = true;
        renderAll();
        showToast("เข้าสู่โหมดครูเรียบร้อยแล้ว!", "success");
      } else {
        $("pinErrorMsg").classList.remove("hidden");
      }
    };

    // Teacher Toolbar actions
    $("addMaterialBtn").onclick = () => openMaterialEditor(null);
    $("manageUnitsBtn").onclick = () => { renderUnitsManager(); openModal("unitsModal"); };
    $("exportDataBtn").onclick = exportJsonBackup;
    $("importDataBtn").onclick = () => $("importFileInput").click();
    $("importFileInput").onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportJson(e.target.files[0]);
        e.target.value = "";
      }
    };
    $("teacherSettingsBtn").onclick = () => {
      $("teacherPinInput").value = state.teacherPin;
      openModal("settingsModal");
    };

    // Settings actions
    $("savePinBtn").onclick = () => {
      state.teacherPin = $("teacherPinInput").value.trim();
      saveState();
      showToast(state.teacherPin ? "บันทึกรหัสผ่านโหมดครูแล้ว 🔒" : "ยกเลิกการล็อกรหัสผ่านแล้ว", "success");
    };
    $("exportJsBtn").onclick = exportDataJs;
    $("resetDefaultDataBtn").onclick = () => {
      if (!confirm("ต้องการล้างสื่อที่แก้ไขทั้งหมดแล้วกลับไปใช้สื่อเริ่มต้นของระบบใช่หรือไม่?")) return;
      const defaults = window.DEFAULT_ENGLISH_P6_DATA;
      state.units = clone(defaults.units);
      state.materials = clone(defaults.materials);
      state.bookmarks = [];
      state.activeUnit = "all";
      state.activeType = "all";
      saveState();
      closeModal("settingsModal");
      renderAll();
      showToast("รีเซ็ตเป็นข้อมูลเริ่มต้นเรียบร้อยแล้ว");
    };

    // Add Unit form
    $("addUnitForm").onsubmit = (e) => {
      e.preventDefault();
      const idx = state.units.length;
      const palette = UNIT_PALETTE[idx % UNIT_PALETTE.length];
      state.units.push({
        id: generateId("unit"),
        code: $("newUnitCode").value.trim(),
        titleEn: $("newUnitTitle").value.trim(),
        titleTh: $("newUnitThai").value.trim(),
        emoji: $("newUnitEmoji").value.trim() || "📘",
        accent: palette.accent,
        bg: palette.bg
      });
      saveState();
      $("addUnitForm").reset();
      $("newUnitEmoji").value = "🌟";
      renderUnitsManager();
      renderAll();
      showToast("เพิ่มหน่วยการเรียนรู้ใหม่แล้ว!", "success");
    };

    // Hero Quick Launchers & Interactive Mascot / Stickers
    const mascotCheers = [
      { display: "🔊 Hello P.6! Let's learn! ✨", speech: "Hello Prathom 6! Let's learn English together!" },
      { display: "🔊 You are a superstar! 🌟", speech: "You are a superstar! Keep up the great work!" },
      { display: "🔊 English is fun & easy! 🎉", speech: "English is fun and easy! Let's practice today!" },
      { display: "🔊 Good luck on O-NET! 🏆", speech: "Good luck on your English O-NET exam! You can do it!" }
    ];
    let mascotCheerIdx = 0;

    function triggerMascotGreeting() {
      const cheer = mascotCheers[mascotCheerIdx % mascotCheers.length];
      mascotCheerIdx++;
      if ($("heroSpeechBtn")) $("heroSpeechBtn").textContent = cheer.display;
      speakEnglish(cheer.speech, 0.92);
      showToast("🦉 " + cheer.display.replace("🔊 ", ""), "success");
    }

    if ($("heroSpeechBtn")) $("heroSpeechBtn").onclick = triggerMascotGreeting;
    if ($("heroMascotBtn")) $("heroMascotBtn").onclick = triggerMascotGreeting;

    if ($("stickerAbcBtn")) {
      $("stickerAbcBtn").onclick = () => {
        const decks = state.materials.filter(m => m.type === "flashcard");
        if (decks.length) {
          const picked = decks[Math.floor(Math.random() * decks.length)];
          openMaterialViewer(picked.id);
        } else {
          showToast("ยังไม่มีชุดบัตรคำศัพท์ในระบบ", "warning");
        }
      };
    }

    if ($("stickerStarBtn")) {
      $("stickerStarBtn").onclick = () => {
        if (state.bookmarks.length > 0) {
          state.onlyBookmarks = true;
          updateBookmarkBadge();
          renderTypeCounts();
          renderMaterials();
          renderMaterialsBanner();
          scrollToMaterials();
          showToast("⭐ แสดงสื่อโปรดที่คุณบันทึกไว้แล้ว!");
        } else {
          speakEnglish("You are a superstar!", 0.95);
          showToast("⭐ ยังไม่มีสื่อโปรด ลองกดรูปดาวบนการ์ดสื่อที่ชอบดูนะครับ!");
        }
      };
    }

    // 4 Colorful Stat Cards (All Clickable!)
    if ($("heroStats")) {
      $("heroStats").addEventListener("click", (e) => {
        const card = e.target.closest(".stat-card[data-stat-filter]");
        if (!card) return;
        const targetType = card.dataset.statFilter || "all";
        state.activeUnit = "all";
        state.activeType = targetType;
        state.onlyBookmarks = false;
        renderAll();
        scrollToMaterials();
        const label = targetType === "all"
          ? "แสดงสื่อการสอนทั้งหมด"
          : "แสดงเฉพาะ " + (TYPE_META[targetType] ? TYPE_META[targetType].label : targetType);
        showToast("✨ " + label);
      });
    }

    $("quickFlashcardBtn").onclick = () => {
      const fc = state.materials.find(m => m.type === "flashcard");
      if (fc) openMaterialViewer(fc.id);
      else showToast("ยังไม่มีชุดบัตรคำศัพท์ในระบบ", "warning");
    };
    $("quickQuizBtn").onclick = () => {
      const onet = state.materials.find(m => m.id === "m-u6-onet-quiz") || state.materials.find(m => m.type === "quiz");
      if (onet) openMaterialViewer(onet.id);
      else showToast("ยังไม่มีแบบทดสอบในระบบ", "warning");
    };

    // Active Unit Info Pill + Materials Banner Buttons
    if ($("activeUnitInfo")) {
      $("activeUnitInfo").onclick = () => scrollToMaterials();
    }
    if ($("bannerShowAllBtn")) {
      $("bannerShowAllBtn").onclick = () => {
        state.activeUnit = "all";
        state.activeType = "all";
        state.onlyBookmarks = false;
        state.searchQuery = "";
        $("searchInput").value = "";
        $("clearSearchBtn").classList.add("hidden");
        renderAll();
        showToast("แสดงสื่อการสอนครบทุกหน่วยแล้ว 📚");
      };
    }
    if ($("bannerBackUnitsBtn")) {
      $("bannerBackUnitsBtn").onclick = () => {
        const unitsSec = $("unitsSection");
        if (unitsSec) unitsSec.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    }

    // Units click delegation -> Filter AND smoothly scroll to that Unit's materials!
    $("unitsContainer").addEventListener("click", (e) => {
      const btn = e.target.closest(".unit-card");
      if (!btn) return;
      state.activeUnit = btn.dataset.unit;
      state.onlyBookmarks = false;
      state.activeType = "all";
      updateBookmarkBadge();
      renderUnits();
      renderTypeCounts();
      renderMaterials();
      renderMaterialsBanner();
      scrollToMaterials();

      const count = getFilteredMaterials(false).length;
      if (state.activeUnit === "all") {
        showToast(`📚 แสดงสื่อทั้งหมด (${count} สื่อ)`);
      } else {
        const u = state.units.find(item => item.id === state.activeUnit);
        if (u) showToast(`${u.emoji || "📘"} เปิดดู ${u.code}: ${u.titleTh} (${count} สื่อ)`, "success");
      }
    });

    // Type chips click delegation
    $("typeChips").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.activeType = chip.dataset.type;
      renderTypeCounts();
      renderMaterials();
      renderMaterialsBanner();
    });

    // Sort select
    $("sortSelect").onchange = (e) => {
      state.sortBy = e.target.value;
      renderMaterials();
    };

    // Reset filters button
    $("resetFiltersBtn").onclick = () => {
      state.activeUnit = "all";
      state.activeType = "all";
      state.onlyBookmarks = false;
      state.searchQuery = "";
      $("searchInput").value = "";
      $("clearSearchBtn").classList.add("hidden");
      renderAll();
    };

    // Materials Grid click delegation
    $("materialsGrid").addEventListener("click", (e) => {
      const bmBtn = e.target.closest(".bookmark-btn");
      if (bmBtn) {
        const id = bmBtn.dataset.id;
        if (state.bookmarks.includes(id)) {
          state.bookmarks = state.bookmarks.filter(b => b !== id);
        } else {
          state.bookmarks.push(id);
          showToast("บันทึกสื่อไว้ในรายการโปรดแล้ว ⭐");
        }
        saveState();
        updateBookmarkBadge();
        renderTypeCounts();
        renderMaterials();
        renderMaterialsBanner();
        return;
      }
      const tagBtn = e.target.closest(".tag-item");
      if (tagBtn && tagBtn.dataset.tag) {
        const tag = tagBtn.dataset.tag;
        state.searchQuery = tag;
        $("searchInput").value = tag;
        $("clearSearchBtn").classList.remove("hidden");
        renderTypeCounts();
        renderMaterials();
        renderMaterialsBanner();
        scrollToMaterials();
        showToast(`🔍 ค้นหาสื่อที่มีแท็ก #${tag}`);
        return;
      }
      const openBtn = e.target.closest(".card-open-btn, .card-open-trigger");
      if (openBtn) {
        openMaterialViewer(openBtn.dataset.id);
        return;
      }
      const editBtn = e.target.closest(".edit-mat-btn");
      if (editBtn) {
        openMaterialEditor(editBtn.dataset.id);
        return;
      }
      const delBtn = e.target.closest(".delete-mat-btn");
      if (delBtn) {
        deleteMaterial(delBtn.dataset.id);
      }
    });

    // Editor form controls
    $("matType").onchange = syncEditorDynamicSections;
    $("addQuizQuestionBtn").onclick = () => addQuizBuilderRow();
    $("materialForm").onsubmit = handleSaveMaterial;

    $("wsFileInput").onchange = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      editorPendingFile = { file: f };
      $("wsFileStatus").textContent = "📎 เลือกไฟล์แล้ว: " + f.name + " (" + Math.round(f.size / 1024) + " KB)";
      $("wsRemoveFileBtn").classList.remove("hidden");
    };
    $("wsRemoveFileBtn").onclick = () => {
      editorPendingFile = null;
      $("wsFileInput").value = "";
      $("wsFileStatus").textContent = "คลิกเพื่อเลือกไฟล์ หรือวางไฟล์ที่นี่ (รองรับ PDF, รูปภาพ)";
      $("wsRemoveFileBtn").classList.add("hidden");
    };

    // Viewer Fullscreen toggle
    $("viewerFullscreenBtn").onclick = () => {
      $("viewerDialog").classList.toggle("fullscreen");
    };

    // Interactive Sentence Reader & Reading Comprehension Launchers
    if ($("navReaderBtn")) $("navReaderBtn").onclick = () => openSentenceReader();
    if ($("quickReaderBtn")) $("quickReaderBtn").onclick = () => openSentenceReader();
    if ($("navReadingBtn")) $("navReadingBtn").onclick = () => openReadingModal();
    if ($("quickReadingBtn")) $("quickReadingBtn").onclick = () => openReadingModal();
    initSentenceReaderEvents();
    initReadingEvents();

    // Global modal close buttons & backdrop click
    document.addEventListener("click", (e) => {
      const closeBtn = e.target.closest(".close-modal-btn");
      if (closeBtn && closeBtn.dataset.close) {
        closeModal(closeBtn.dataset.close);
        return;
      }
      if (e.target.classList.contains("modal-overlay")) {
        closeModal(e.target.id);
      }
    });

    // Keyboard shortcuts (Escape to close modal, Left/Right/Space in Viewer & Reader)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModals = Array.from(document.querySelectorAll(".modal-overlay:not(.hidden)"));
        if (openModals.length) {
          closeModal(openModals[openModals.length - 1].id);
        }
        return;
      }
      if ($("readerModal") && !$("readerModal").classList.contains("hidden")) {
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.code === "Space") {
          e.preventDefault();
          if (readerState.isPlaying) stopSentenceReader();
          else playReaderWordByWord();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepReaderWord(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepReaderWord(-1);
        }
        return;
      }
      if (!$("viewerModal").classList.contains("hidden")) {
        const body = $("viewerBody");
        if (body && typeof body._keyHandler === "function") {
          body._keyHandler(e);
        }
      }
    });
  }

  // ================= INTERACTIVE SENTENCE READER STUDIO =================
  const CUSTOM_SENTENCES_KEY = "english_p6_custom_sentences_v1";

  const DEFAULT_READER_SENTENCES = [
    { id: "rs-1",  unit: "Unit 1", en: "I always brush my teeth every morning.", th: "ฉันแปรงฟันทุกเช้าเสมอ" },
    { id: "rs-2",  unit: "Unit 1", en: "She usually walks to school with her friends.", th: "เธอเดินไปโรงเรียนกับเพื่อนๆ เป็นประจำ" },
    { id: "rs-3",  unit: "Unit 1", en: "What time do you wake up on Sundays?", th: "เธอตื่นนอนกี่โมงในวันอาทิตย์?" },
    { id: "rs-4",  unit: "Unit 2", en: "I would like a carton of milk, please.", th: "ฉันขอนมหนึ่งกล่องครับ/ค่ะ" },
    { id: "rs-5",  unit: "Unit 2", en: "How much are these yellow bananas?", th: "กล้วยสีเหลืองพวกนี้ราคาเท่าไร?" },
    { id: "rs-6",  unit: "Unit 2", en: "Eating vegetables and fruits keeps us healthy.", th: "การกินผักและผลไม้ทำให้เราแข็งแรง" },
    { id: "rs-7",  unit: "Unit 3", en: "Excuse me, how can I get to the library?", th: "ขอโทษครับ ฉันจะไปห้องสมุดได้อย่างไร?" },
    { id: "rs-8",  unit: "Unit 3", en: "Go straight and turn left at the corner.", th: "เดินตรงไปแล้วเลี้ยวซ้ายตรงหัวมุม" },
    { id: "rs-9",  unit: "Unit 3", en: "The hospital is opposite the green park.", th: "โรงพยาบาลอยู่ตรงข้ามสวนสาธารณะสีเขียว" },
    { id: "rs-10", unit: "Unit 4", en: "Last summer, my family went to the beach.", th: "ฤดูร้อนที่แล้ว ครอบครัวของฉันไปเที่ยวทะเล" },
    { id: "rs-11", unit: "Unit 4", en: "We swam in the sea and took many photos.", th: "พวกเราว่ายน้ำในทะเลและถ่ายรูปเยอะเลย" },
    { id: "rs-12", unit: "Unit 4", en: "I bought a cute souvenir for my best friend.", th: "ฉันซื้อของที่ระลึกน่ารักๆ ให้เพื่อนสนิท" },
    { id: "rs-13", unit: "Unit 5", en: "I want to be a vet because I love animals.", th: "ฉันอยากเป็นสัตวแพทย์เพราะฉันรักสัตว์" },
    { id: "rs-14", unit: "Unit 5", en: "We are going to practice English every day.", th: "พวกเราตั้งใจจะฝึกภาษาอังกฤษทุกวัน" },
    { id: "rs-15", unit: "Unit 5", en: "An astronaut travels into space in a rocket.", th: "นักบินอวกาศเดินทางสู่อวกาศด้วยจรวด" },
    { id: "rs-16", unit: "Unit 6", en: "We should reduce, reuse, and recycle every day.", th: "เราควรลดใช้ ใช้ซ้ำ และรีไซเคิลทุกวัน" },
    { id: "rs-17", unit: "Unit 6", en: "Bring a cloth bag when you go shopping.", th: "พกถุงผ้าเมื่อคุณไปซื้อของ" },
    { id: "rs-18", unit: "Unit 6", en: "Good luck on your English O-NET exam!", th: "ขอให้โชคดีในการสอบ O-NET ภาษาอังกฤษนะ!" }
  ];

  const SPEED_CONFIG = {
    slow:   { rate: 0.62, wordGapMs: 440, smoothWpm: 72 },
    medium: { rate: 0.84, wordGapMs: 250, smoothWpm: 112 },
    normal: { rate: 1.0,  wordGapMs: 120, smoothWpm: 150 }
  };

  let readerState = {
    customSentences: [],
    current: DEFAULT_READER_SENTENCES[0],
    words: [],
    activeIdx: -1,
    isPlaying: false,
    playRunId: 0,
    speed: "medium",
    showThai: true,
    loop: false,
    timers: []
  };

  function loadCustomSentences() {
    try {
      const raw = localStorage.getItem(CUSTOM_SENTENCES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) readerState.customSentences = parsed;
      }
    } catch (_) {
      readerState.customSentences = [];
    }
  }

  function saveCustomSentences() {
    try {
      localStorage.setItem(CUSTOM_SENTENCES_KEY, JSON.stringify(readerState.customSentences));
    } catch (_) {}
  }

  function getAllReaderSentences() {
    return [...readerState.customSentences, ...DEFAULT_READER_SENTENCES];
  }

  function clearReaderTimers() {
    readerState.timers.forEach(t => clearTimeout(t));
    readerState.timers = [];
  }

  function stopSentenceReader() {
    readerState.playRunId++;
    readerState.isPlaying = false;
    clearReaderTimers();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    updateReaderPlayButtons();
  }

  function updateReaderPlayButtons() {
    const playBtn = $("readerPlayBtn");
    const smoothBtn = $("readerSmoothBtn");
    if (playBtn) {
      playBtn.textContent = readerState.isPlaying ? "⏸️ กำลังอ่าน..." : "▶️ เริ่มอ่านทีละคำ";
    }
    if (smoothBtn) {
      smoothBtn.disabled = false;
    }
  }

  function getEnglishVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang === "en-US") || voices.find(v => v.lang && v.lang.startsWith("en")) || null;
  }

  function setReaderSentence(item) {
    stopSentenceReader();
    readerState.current = item;
    readerState.words = String(item.en || "").trim().split(/\s+/).filter(Boolean);
    readerState.activeIdx = -1;

    if ($("readerUnitTag")) {
      $("readerUnitTag").textContent = "✨ " + (item.unit || "Custom") + " • Krusah Read-Along";
    }
    if ($("readerThaiBar")) {
      const hasTh = Boolean(item.th && item.th.trim());
      $("readerThaiBar").textContent = hasTh ? "🇹🇭 " + item.th : "";
      $("readerThaiBar").classList.toggle("hidden", !readerState.showThai || !hasTh);
    }

    renderReaderWords();
    renderReaderPresetList();
  }

  function renderReaderWords() {
    const wrap = $("readerWordsWrap");
    if (!wrap) return;
    const words = readerState.words;
    const activeIdx = readerState.activeIdx;
    const isPlayingOrStepped = activeIdx >= 0;

    wrap.innerHTML = words.map((w, i) => {
      const colorCls = "word-c" + (i % 6);
      let stateCls = "";
      if (isPlayingOrStepped) {
        if (i === activeIdx) stateCls = "active";
        else if (i < activeIdx) stateCls = "spoken";
        else stateCls = "upcoming";
      }
      return `<button type="button" class="reader-word ${colorCls} ${stateCls}" data-widx="${i}" title="คลิกเพื่อฟังเสียงคำนี้">${escapeHtml(w)}</button>`;
    }).join("");

    // Progress bar & counter
    const total = words.length || 1;
    let pct = 0;
    let statusText = "พร้อมอ่าน (กด ▶️ หรือคลิกคำใดก็ได้)";
    if (activeIdx >= words.length) {
      pct = 100;
      statusText = "🎉 อ่านจบประโยคแล้ว เก่งมาก!";
    } else if (activeIdx >= 0) {
      pct = Math.round(((activeIdx + 1) / total) * 100);
      statusText = `กำลังอ่านคำที่ ${activeIdx + 1} / ${total}: "${words[activeIdx]}"`;
    }
    if ($("readerProgressFill")) $("readerProgressFill").style.width = pct + "%";
    if ($("readerWordCounter")) $("readerWordCounter").textContent = statusText;
  }

  function speakSingleWord(wordText, rate, onDone) {
    const cleanWord = String(wordText || "").replace(/^[^\w']+|[^\w']+$/g, "") || wordText;
    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      if (typeof onDone === "function") onDone();
    };

    if (!("speechSynthesis" in window)) {
      const fallbackMs = Math.max(550, cleanWord.length * 95);
      const t = setTimeout(finishOnce, fallbackMs);
      readerState.timers.push(t);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanWord);
      utter.lang = "en-US";
      utter.rate = rate;
      utter.pitch = 1.04;
      const voice = getEnglishVoice();
      if (voice) utter.voice = voice;

      // Safety fallback in case browser speech engine drops onend
      const maxWait = Math.max(950, Math.round((cleanWord.length * 130 + 600) / Math.max(0.5, rate)));
      const safetyTimer = setTimeout(finishOnce, maxWait);
      readerState.timers.push(safetyTimer);

      utter.onend = () => {
        clearTimeout(safetyTimer);
        finishOnce();
      };
      utter.onerror = () => {
        clearTimeout(safetyTimer);
        finishOnce();
      };
      window.speechSynthesis.speak(utter);
    } catch (_) {
      const t = setTimeout(finishOnce, 650);
      readerState.timers.push(t);
    }
  }

  function playReaderWordByWord() {
    if (!readerState.words.length) return;
    stopSentenceReader();
    const runId = ++readerState.playRunId;
    readerState.isPlaying = true;
    updateReaderPlayButtons();

    const cfg = SPEED_CONFIG[readerState.speed] || SPEED_CONFIG.medium;

    function nextStep(i) {
      if (runId !== readerState.playRunId) return;
      if (i >= readerState.words.length) {
        readerState.activeIdx = readerState.words.length;
        renderReaderWords();
        if (readerState.loop) {
          const loopTimer = setTimeout(() => {
            if (runId !== readerState.playRunId) return;
            nextStep(0);
          }, 900);
          readerState.timers.push(loopTimer);
        } else {
          readerState.isPlaying = false;
          updateReaderPlayButtons();
        }
        return;
      }

      readerState.activeIdx = i;
      renderReaderWords();

      speakSingleWord(readerState.words[i], cfg.rate, () => {
        if (runId !== readerState.playRunId) return;
        const gapTimer = setTimeout(() => nextStep(i + 1), cfg.wordGapMs);
        readerState.timers.push(gapTimer);
      });
    }

    nextStep(0);
  }

  function playReaderSmoothSentence() {
    if (!readerState.words.length) return;
    stopSentenceReader();
    const runId = ++readerState.playRunId;
    readerState.isPlaying = true;
    updateReaderPlayButtons();

    const cfg = SPEED_CONFIG[readerState.speed] || SPEED_CONFIG.medium;
    const words = readerState.words;
    const sentence = words.join(" ");

    // Precompute start char index for each word
    const starts = [];
    let cursor = 0;
    words.forEach(w => {
      starts.push(cursor);
      cursor += w.length + 1;
    });

    readerState.activeIdx = 0;
    renderReaderWords();

    let boundarySeen = false;

    function finishSmooth() {
      if (runId !== readerState.playRunId) return;
      clearReaderTimers();
      readerState.activeIdx = words.length;
      renderReaderWords();
      if (readerState.loop) {
        const lt = setTimeout(() => {
          if (runId !== readerState.playRunId) return;
          playReaderSmoothSentence();
        }, 900);
        readerState.timers.push(lt);
      } else {
        readerState.isPlaying = false;
        updateReaderPlayButtons();
      }
    }

    // Fallback timed progression if voice does not emit onboundary events
    function scheduleFallbackSequence(startIdx) {
      let delay = 0;
      for (let i = startIdx; i < words.length; i++) {
        const wLen = Math.max(2, words[i].replace(/[^\w]/g, "").length);
        const dur = Math.round((wLen * 62 + 190) / cfg.rate);
        if (i > startIdx) {
          const t = setTimeout(() => {
            if (runId !== readerState.playRunId || boundarySeen) return;
            readerState.activeIdx = i;
            renderReaderWords();
          }, delay);
          readerState.timers.push(t);
        }
        delay += dur;
      }
      const endTimer = setTimeout(() => {
        if (runId !== readerState.playRunId || boundarySeen) return;
        finishSmooth();
      }, delay + 250);
      readerState.timers.push(endTimer);
    }

    if (!("speechSynthesis" in window)) {
      scheduleFallbackSequence(0);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(sentence);
      utter.lang = "en-US";
      utter.rate = cfg.rate;
      utter.pitch = 1.03;
      const voice = getEnglishVoice();
      if (voice) utter.voice = voice;

      utter.onboundary = (e) => {
        if (runId !== readerState.playRunId) return;
        if (typeof e.charIndex === "number") {
          boundarySeen = true;
          clearReaderTimers();
          let found = 0;
          for (let i = 0; i < starts.length; i++) {
            if (e.charIndex >= starts[i]) found = i;
          }
          if (readerState.activeIdx !== found) {
            readerState.activeIdx = found;
            renderReaderWords();
          }
        }
      };

      utter.onend = () => finishSmooth();
      utter.onerror = () => finishSmooth();

      // If no boundary fires within 320ms, smoothly advance words on fallback timer
      const probe = setTimeout(() => {
        if (runId === readerState.playRunId && !boundarySeen) {
          scheduleFallbackSequence(Math.max(0, readerState.activeIdx));
        }
      }, 320);
      readerState.timers.push(probe);

      window.speechSynthesis.speak(utter);
    } catch (_) {
      scheduleFallbackSequence(0);
    }
  }

  function stepReaderWord(delta) {
    if (!readerState.words.length) return;
    stopSentenceReader();
    let nextIdx = readerState.activeIdx + delta;
    if (readerState.activeIdx < 0) nextIdx = delta > 0 ? 0 : readerState.words.length - 1;
    else if (nextIdx < 0) nextIdx = 0;
    else if (nextIdx >= readerState.words.length) nextIdx = readerState.words.length - 1;

    readerState.activeIdx = nextIdx;
    renderReaderWords();
    const cfg = SPEED_CONFIG[readerState.speed] || SPEED_CONFIG.medium;
    speakSingleWord(readerState.words[nextIdx], cfg.rate);
  }

  function renderReaderPresetList() {
    const listEl = $("readerPresetList");
    const filterEl = $("readerUnitFilter");
    if (!listEl) return;
    const filterVal = filterEl ? filterEl.value : "all";
    const all = getAllReaderSentences();
    const filtered = filterVal === "all" ? all : all.filter(s => s.unit === filterVal);

    if (!filtered.length) {
      listEl.innerHTML = `<div style="font-size:0.86rem; color:var(--ink-muted); padding:10px; text-align:center;">ยังไม่มีประโยคในหมวดนี้ ลองพิมพ์เพิ่มเองทางซ้ายได้เลยครับ ✨</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(s => {
      const isActive = readerState.current && readerState.current.id === s.id;
      const isCustom = s.unit === "Custom";
      return `
        <div class="reader-preset-item ${isActive ? "active" : ""}" data-sid="${escapeHtml(s.id)}" role="button" tabindex="0">
          <div style="min-width:0; flex:1;">
            <span class="preset-en">${escapeHtml(s.en)}</span>
            <span class="preset-meta">${escapeHtml(s.unit)}${s.th ? " • " + escapeHtml(s.th) : ""}</span>
          </div>
          ${isCustom ? `<button type="button" class="preset-del-btn" data-del-sid="${escapeHtml(s.id)}" title="ลบประโยคนี้">ลบ</button>` : ""}
        </div>
      `;
    }).join("");
  }

  function openSentenceReader() {
    loadCustomSentences();
    // Pick a sentence matching currently selected unit if any
    const activeUnitObj = state.activeUnit !== "all" ? state.units.find(u => u.id === state.activeUnit) : null;
    if (activeUnitObj) {
      const match = getAllReaderSentences().find(s => s.unit === activeUnitObj.code);
      if (match) {
        if ($("readerUnitFilter")) $("readerUnitFilter").value = activeUnitObj.code;
        setReaderSentence(match);
      } else {
        setReaderSentence(readerState.current || DEFAULT_READER_SENTENCES[0]);
      }
    } else {
      setReaderSentence(readerState.current || DEFAULT_READER_SENTENCES[0]);
    }
    openModal("readerModal");
  }

  function initSentenceReaderEvents() {
    if (!$("readerModal")) return;

    $("readerFullscreenBtn").onclick = () => {
      $("readerDialog").classList.toggle("fullscreen");
    };

    $("readerPlayBtn").onclick = () => {
      if (readerState.isPlaying) stopSentenceReader();
      else playReaderWordByWord();
    };
    $("readerSmoothBtn").onclick = () => playReaderSmoothSentence();
    $("readerStopBtn").onclick = () => {
      stopSentenceReader();
      readerState.activeIdx = -1;
      renderReaderWords();
    };
    $("readerPrevWordBtn").onclick = () => stepReaderWord(-1);
    $("readerNextWordBtn").onclick = () => stepReaderWord(1);

    // Click any individual word to enlarge & pronounce it!
    $("readerWordsWrap").addEventListener("click", (e) => {
      const btn = e.target.closest(".reader-word");
      if (!btn) return;
      const wIdx = Number(btn.dataset.widx);
      stopSentenceReader();
      readerState.activeIdx = wIdx;
      renderReaderWords();
      const cfg = SPEED_CONFIG[readerState.speed] || SPEED_CONFIG.medium;
      speakSingleWord(readerState.words[wIdx], cfg.rate);
    });

    // Speed pills
    document.querySelectorAll(".speed-pill").forEach(pill => {
      pill.onclick = () => {
        readerState.speed = pill.dataset.speed || "medium";
        document.querySelectorAll(".speed-pill").forEach(p => p.classList.toggle("active", p === pill));
        showToast("ปรับความเร็วเป็น " + pill.textContent.trim());
      };
    });

    // Thai translation toggle
    $("readerToggleThaiBtn").onclick = () => {
      readerState.showThai = !readerState.showThai;
      $("readerToggleThaiBtn").textContent = readerState.showThai ? "🇹🇭 ซ่อนคำแปล" : "🇹🇭 แสดงคำแปล";
      const hasTh = Boolean(readerState.current && readerState.current.th && readerState.current.th.trim());
      $("readerThaiBar").classList.toggle("hidden", !readerState.showThai || !hasTh);
    };
    $("readerToggleThaiBtn").textContent = "🇹🇭 ซ่อนคำแปล";

    // Loop toggle
    $("readerLoopBtn").onclick = () => {
      readerState.loop = !readerState.loop;
      $("readerLoopBtn").setAttribute("aria-pressed", String(readerState.loop));
      $("readerLoopBtn").textContent = readerState.loop ? "🔁 อ่านวนซ้ำ: เปิด" : "🔁 อ่านวนซ้ำ: ปิด";
      $("readerLoopBtn").classList.toggle("btn-sunny", readerState.loop);
      $("readerLoopBtn").classList.toggle("btn-soft", !readerState.loop);
    };

    // Custom sentence: show immediately (and Enter key shortcut)
    const applyCustomSentence = () => {
      const en = $("readerCustomEn").value.trim();
      const th = $("readerCustomTh").value.trim();
      if (!en) {
        showToast("กรุณาพิมพ์ประโยคภาษาอังกฤษก่อนนะครับ ✍️", "warning");
        $("readerCustomEn").focus();
        return;
      }
      setReaderSentence({ id: "temp-" + Date.now(), unit: "Custom", en, th });
      showToast("✨ แสดงประโยคใหม่แล้ว กด ▶️ เพื่อเริ่มอ่านทีละคำได้เลย!", "success");
    };
    $("readerUseCustomBtn").onclick = applyCustomSentence;
    $("readerCustomEn").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); applyCustomSentence(); } };
    $("readerCustomTh").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); applyCustomSentence(); } };

    // Custom sentence: save to bank
    $("readerSaveCustomBtn").onclick = () => {
      const en = $("readerCustomEn").value.trim();
      const th = $("readerCustomTh").value.trim();
      if (!en) {
        showToast("กรุณาพิมพ์ประโยคภาษาอังกฤษก่อนบันทึกนะครับ ✍️", "warning");
        $("readerCustomEn").focus();
        return;
      }
      const item = { id: generateId("cs"), unit: "Custom", en, th };
      readerState.customSentences.unshift(item);
      saveCustomSentences();
      $("readerCustomEn").value = "";
      $("readerCustomTh").value = "";
      if ($("readerUnitFilter")) $("readerUnitFilter").value = "all";
      setReaderSentence(item);
      showToast("💾 บันทึกประโยคเข้าคลังเรียบร้อยแล้ว!", "success");
    };

    // Filter presets
    $("readerUnitFilter").onchange = () => renderReaderPresetList();

    // Preset click & delete delegation
    $("readerPresetList").addEventListener("click", (e) => {
      const delBtn = e.target.closest(".preset-del-btn");
      if (delBtn) {
        e.stopPropagation();
        const delId = delBtn.dataset.delSid;
        readerState.customSentences = readerState.customSentences.filter(s => s.id !== delId);
        saveCustomSentences();
        renderReaderPresetList();
        showToast("ลบประโยคที่บันทึกไว้แล้ว");
        return;
      }
      const row = e.target.closest(".reader-preset-item");
      if (!row) return;
      const found = getAllReaderSentences().find(s => s.id === row.dataset.sid);
      if (found) setReaderSentence(found);
    });
  }

  // ================= READING COMPREHENSION STUDIO (4 STORIES x 5 QUESTIONS) =================
  const READING_STORIES = [
    {
      id: "story-1",
      num: "Story 1",
      unitLabel: "Unit 1 • Daily Routines",
      titleEn: "Pim's Sunny Morning",
      titleTh: "เช้าอันแสนสดใสของพิมพ์",
      image: "assets/story-1.jpg",
      paragraphs: [
        "Pim is a Prathom 6 student. Every morning, she wakes up at six o'clock and makes her bed. After she brushes her teeth and takes a shower, she puts on her school uniform.",
        "At seven o'clock, Pim has warm rice soup and a glass of milk in the kitchen. Her cute orange cat, Milo, always sits beside her chair. Then Pim picks up her blue backpack and goes to school by bus at half past seven."
      ],
      thaiTranslation: "พิมพ์เป็นนักเรียนชั้น ป.6 ทุกเช้าเธอตื่นนอนตอน 6 โมงเช้าและเก็บที่นอน หลังจากแปรงฟันและอาบน้ำแล้ว เธอสวมชุดนักเรียน พอ 7 โมงเช้า พิมพ์กินข้าวต้มร้อนๆ และนมหนึ่งแก้วในห้องครัว เจ้าไมโลแมวส้มตัวโปรดของเธอมักจะนั่งอยู่ข้างเก้าอี้เสมอ จากนั้นพิมพ์หยิบกระเป๋าเป้สีฟ้าแล้วนั่งรถบัสไปโรงเรียนตอน 7 โมงครึ่ง",
      vocab: [
        { word: "wake up", th: "ตื่นนอน" },
        { word: "rice soup", th: "ข้าวต้ม" },
        { word: "beside", th: "ข้างๆ" },
        { word: "backpack", th: "กระเป๋าเป้" },
        { word: "half past seven", th: "เจ็ดโมงครึ่ง (7:30)" }
      ],
      questions: [
        {
          q: "1. What grade is Pim in?",
          options: ["Prathom 4", "Prathom 5", "Prathom 6", "Mattayom 1"],
          answer: 2,
          exp: "ประโยคแรกบอกชัดเจนว่า Pim is a Prathom 6 student."
        },
        {
          q: "2. What time does Pim wake up every morning?",
          options: ["At 5:30 a.m.", "At 6:00 a.m.", "At 7:00 a.m.", "At 7:30 a.m."],
          answer: 1,
          exp: "ในเนื้อเรื่องบอกว่า she wakes up at six o'clock (6:00 น.)"
        },
        {
          q: "3. What does Pim have for breakfast?",
          options: ["Bread and orange juice", "Noodles and water", "Fried rice and tea", "Warm rice soup and milk"],
          answer: 3,
          exp: "พิมพ์รับประทาน warm rice soup and a glass of milk (ข้าวต้มและนม)"
        },
        {
          q: "4. Who is Milo?",
          options: ["Pim's brother", "Pim's teacher", "Pim's orange cat", "Pim's classmate"],
          answer: 2,
          exp: "ในเรื่องระบุว่า Her cute orange cat, Milo (แมวสีส้มของพิมพ์)"
        },
        {
          q: "5. How does Pim go to school?",
          options: ["By bus", "By bicycle", "By car", "On foot"],
          answer: 0,
          exp: "ประโยคสุดท้ายบอกว่า goes to school by bus (ไปโรงเรียนโดยรถบัส)"
        }
      ]
    },
    {
      id: "story-2",
      num: "Story 2",
      unitLabel: "Unit 2 • Food & Weekend",
      titleEn: "A Picnic at Sunny Park",
      titleTh: "ปิกนิกแสนสุขที่สวนซันนี่",
      image: "assets/story-2.jpg",
      paragraphs: [
        "On Saturday morning, Mali, Ton, and Dao went for a picnic at Sunny Park. The weather was cool and sunny. They sat on a red-and-white blanket under a big green tree.",
        "They brought healthy food to share. There were some fresh sandwiches, sweet red watermelon slices, and three glasses of orange juice. While they ate, they smiled and watched two little yellow ducks swimming in the blue pond."
      ],
      thaiTranslation: "ในเช้าวันเสาร์ มะลิ ต้น และดาว ไปปิกนิกกันที่สวนซันนี่ อากาศเย็นสบายและแดดแจ่มใส พวกเขานั่งบนผ้าปูสีแดงสลับขาวใต้ต้นไม้ใหญ่สีเขียว พวกเขานำอาหารเพื่อสุขภาพมาแบ่งกันกิน มีแซนด์วิชสดใหม่ แตงโมสีแดงหวานฉ่ำ และน้ำส้มสามแก้ว ระหว่างที่กิน พวกเขายิ้มอย่างมีความสุขและดูลูกเป็ดสีเหลืองสองตัวว่ายน้ำในสระสีฟ้า",
      vocab: [
        { word: "picnic", th: "การปิกนิก" },
        { word: "blanket", th: "ผ้าปูนั่ง/ผ้าห่ม" },
        { word: "healthy food", th: "อาหารเพื่อสุขภาพ" },
        { word: "watermelon", th: "แตงโม" },
        { word: "pond", th: "สระน้ำ" }
      ],
      questions: [
        {
          q: "1. When did the three friends go for a picnic?",
          options: ["On Friday afternoon", "On Saturday morning", "On Sunday evening", "On Monday morning"],
          answer: 1,
          exp: "ในเนื้อเรื่องระบุว่า On Saturday morning (เช้าวันเสาร์)"
        },
        {
          q: "2. Where did they sit?",
          options: ["Inside a cafe", "On a wooden bridge", "Under a big green tree", "In a boat"],
          answer: 2,
          exp: "พวกเขานั่งบนผ้าปู under a big green tree (ใต้ต้นไม้ใหญ่สีเขียว)"
        },
        {
          q: "3. Which fruit did they bring to the picnic?",
          options: ["Bananas", "Apples", "Mangoes", "Watermelon"],
          answer: 3,
          exp: "ในเนื้อเรื่องกล่าวถึง sweet red watermelon slices (แตงโมหั่นชิ้น)"
        },
        {
          q: "4. How many glasses of orange juice were there?",
          options: ["Two glasses", "Three glasses", "Four glasses", "Five glasses"],
          answer: 1,
          exp: "ในเนื้อเรื่องระบุว่า three glasses of orange juice (น้ำส้ม 3 แก้ว)"
        },
        {
          q: "5. What were the two yellow ducks doing?",
          options: ["Flying in the sky", "Sleeping under the tree", "Swimming in the pond", "Eating sandwiches"],
          answer: 2,
          exp: "เป็ดสีเหลืองสองตัวกำลัง swimming in the blue pond (ว่ายน้ำอยู่ในสระ)"
        }
      ]
    },
    {
      id: "story-3",
      num: "Story 3",
      unitLabel: "Unit 4 • Past Holidays",
      titleEn: "Our Fun Trip to the Zoo",
      titleTh: "ทริปสุดสนุกที่สวนสัตว์",
      image: "assets/story-3.jpg",
      paragraphs: [
        "Last Sunday, Ploy and her younger brother, Bank, visited the city zoo. It was a bright and cheerful day with colorful flags everywhere. Bank brought his yellow camera to take lots of pictures.",
        "First, they saw a tall giraffe eating green leaves from a tree. Next to the giraffe, a playful baby blue elephant sprayed sparkling water drops into the air! Before going home, they waved goodbye to a cute panda munching fresh bamboo."
      ],
      thaiTranslation: "วันอาทิตย์ที่แล้ว พลอยกับแบงก์น้องชายไปเที่ยวสวนสัตว์ประจำเมือง วันนั้นอากาศสดใสร่าเริง มีธงหลากสีประดับอยู่ทั่วสวนสัตว์ แบงก์พกกล้องสีเหลืองมาถ่ายรูปมากมาย อย่างแรกพวกเขาเห็นยีราฟตัวสูงกำลังกินใบไม้สีเขียวจากต้นไม้ ถัดจากยีราฟมีลูกช้างแสนซนพ่นละอองน้ำระยิบระยับขึ้นฟ้า ก่อนกลับบ้านพวกเขาโบกมือลาหมีแพนด้าน่ารักที่กำลังเคี้ยวไผ่สด",
      vocab: [
        { word: "visited", th: "ไปเยี่ยมชม (อดีต)" },
        { word: "camera", th: "กล้องถ่ายรูป" },
        { word: "giraffe", th: "ยีราฟ" },
        { word: "sprayed", th: "พ่น (น้ำ)" },
        { word: "bamboo", th: "ต้นไผ่" }
      ],
      questions: [
        {
          q: "1. Who went to the zoo with Ploy?",
          options: ["Her teacher", "Her younger brother", "Her grandmother", "Her best friend"],
          answer: 1,
          exp: "พลอยไปกับ her younger brother, Bank (น้องชายชื่อแบงก์)"
        },
        {
          q: "2. Why did Bank bring his yellow camera?",
          options: ["To play games", "To call his mom", "To take lots of pictures", "To listen to music"],
          answer: 2,
          exp: "แบงก์นำกล้องมา to take lots of pictures (เพื่อถ่ายรูปเยอะๆ)"
        },
        {
          q: "3. What was the tall giraffe doing?",
          options: ["Running fast", "Eating green leaves", "Drinking milk", "Sleeping on the grass"],
          answer: 1,
          exp: "ยีราฟตัวสูงกำลัง eating green leaves from a tree (กินใบไม้สีเขียว)"
        },
        {
          q: "4. Which animal sprayed water drops into the air?",
          options: ["The giraffe", "The panda", "The lion", "The baby elephant"],
          answer: 3,
          exp: "ในเนื้อเรื่องบอกว่า a playful baby blue elephant sprayed sparkling water drops"
        },
        {
          q: "5. What was the panda eating before they went home?",
          options: ["Fresh bamboo", "Carrots", "Bananas", "Fish"],
          answer: 0,
          exp: "หมีแพนด้ากำลังเคี้ยว fresh bamboo (ต้นไผ่สด)"
        }
      ]
    },
    {
      id: "story-4",
      num: "Story 4",
      unitLabel: "Unit 6 • Save Our Earth",
      titleEn: "Green Heroes of Prathom 6",
      titleTh: "ฮีโร่รักษ์โลก ชั้น ป.6",
      image: "assets/unit-6.jpg",
      paragraphs: [
        "Every Friday afternoon, the Prathom 6 students have a special club called 'Green Heroes'. They want to keep their school clean and protect our planet Earth.",
        "The students always turn off the lights and fans before leaving the classroom. They bring reusable cloth bags instead of plastic bags and separate plastic bottles into the recycling bin. Last month, they planted twenty young trees around the playground and won a golden star award!"
      ],
      thaiTranslation: "ทุกบ่ายวันศุกร์ นักเรียนชั้น ป.6 มีชมรมพิเศษชื่อว่า 'ฮีโร่รักษ์โลก' พวกเขาอยากให้โรงเรียนสะอาดและช่วยปกป้องโลกของเรา นักเรียนจะปิดไฟและพัดลมก่อนออกจากห้องเรียนเสมอ พวกเขาใช้ถุงผ้าแทนถุงพลาสติก และแยกขวดพลาสติกลงถังรีไซเคิล เมื่อเดือนที่แล้วพวกเขาปลูกต้นไม้เล็กๆ 20 ต้นรอบสนามเด็กเล่นและได้รับรางวัลถ้วยดาวสีทองด้วย!",
      vocab: [
        { word: "protect", th: "ปกป้อง" },
        { word: "reusable", th: "นำกลับมาใช้ซ้ำได้" },
        { word: "separate", th: "แยก (ขยะ)" },
        { word: "recycling bin", th: "ถังรีไซเคิล" },
        { word: "award", th: "รางวัล" }
      ],
      questions: [
        {
          q: "1. When do the students have the 'Green Heroes' club?",
          options: ["Every Monday morning", "Every Wednesday noon", "Every Friday afternoon", "Every Sunday morning"],
          answer: 2,
          exp: "ประโยคแรกบอกว่า Every Friday afternoon (ทุกบ่ายวันศุกร์)"
        },
        {
          q: "2. What do the students do before leaving the classroom?",
          options: ["Open all windows", "Turn off the lights and fans", "Buy plastic bottles", "Water the playground"],
          answer: 1,
          exp: "พวกเขา always turn off the lights and fans (ปิดไฟและพัดลมเสมอ)"
        },
        {
          q: "3. What do they bring instead of plastic bags?",
          options: ["Paper boxes", "Glass jars", "Reusable cloth bags", "Metal cans"],
          answer: 2,
          exp: "ในเนื้อเรื่องบอกว่า bring reusable cloth bags instead of plastic bags (ใช้ถุงผ้าแทนถุงพลาสติก)"
        },
        {
          q: "4. How many young trees did they plant last month?",
          options: ["Ten trees", "Fifteen trees", "Twenty trees", "Thirty trees"],
          answer: 2,
          exp: "ในเรื่องระบุว่า they planted twenty young trees (ปลูกต้นไม้ 20 ต้น)"
        },
        {
          q: "5. What prize did the Prathom 6 students win?",
          options: ["A golden star award", "A new bicycle", "Free movie tickets", "A big pizza"],
          answer: 0,
          exp: "ประโยคสุดท้ายบอกว่า won a golden star award (ได้รับรางวัลถ้วยดาวสีทอง)"
        }
      ]
    }
  ];

  let readingState = {
    activeStoryId: READING_STORIES[0].id,
    showThai: false,
    answersByStory: {} // { [storyId]: { [qIdx]: selectedOptIdx } }
  };

  function getActiveReadingStory() {
    return READING_STORIES.find(s => s.id === readingState.activeStoryId) || READING_STORIES[0];
  }

  function getStoryScoreStats(story) {
    const ansMap = readingState.answersByStory[story.id] || {};
    let answered = 0;
    let correct = 0;
    story.questions.forEach((q, i) => {
      if (typeof ansMap[i] === "number") {
        answered++;
        if (ansMap[i] === q.answer) correct++;
      }
    });
    return { answered, correct, total: story.questions.length };
  }

  function renderReadingStudio() {
    const tabsEl = $("readingStoryTabs");
    const splitEl = $("readingSplitContent");
    if (!tabsEl || !splitEl) return;

    const story = getActiveReadingStory();
    const ansMap = readingState.answersByStory[story.id] || {};
    const stats = getStoryScoreStats(story);
    const letters = ["A", "B", "C", "D"];

    // 1. Render Story Selector Strip
    tabsEl.innerHTML = READING_STORIES.map(s => {
      const st = getStoryScoreStats(s);
      const activeCls = s.id === story.id ? "active" : "";
      const scoreBadge = st.answered === st.total
        ? `<span class="story-tab-score">⭐ ${st.correct}/${st.total}</span>`
        : "";
      return `
        <button type="button" class="story-tab-card ${activeCls}" data-story-id="${escapeHtml(s.id)}">
          ${scoreBadge}
          <img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.titleEn)}" class="story-tab-thumb">
          <div class="story-tab-info">
            <div class="story-tab-num">${escapeHtml(s.num)}</div>
            <div class="story-tab-en">${escapeHtml(s.titleEn)}</div>
            <div class="story-tab-th">${escapeHtml(s.titleTh)}</div>
          </div>
        </button>
      `;
    }).join("");

    // 2. Render Left Story Pane + Right 5 Questions Pane
    const paragraphsHtml = story.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("");
    const vocabHtml = story.vocab.map(v => `
      <button type="button" class="reading-vocab-chip" data-speak="${escapeHtml(v.word)}" title="คลิกเพื่อฟังเสียงคำว่า ${escapeHtml(v.word)}">
        🔊 <strong>${escapeHtml(v.word)}</strong> = ${escapeHtml(v.th)}
      </button>
    `).join("");

    const questionsHtml = story.questions.map((q, qIdx) => {
      const picked = typeof ansMap[qIdx] === "number" ? ansMap[qIdx] : null;
      const choicesHtml = q.options.map((opt, optIdx) => {
        let cls = "";
        if (picked !== null) {
          if (optIdx === q.answer) cls = "correct";
          else if (optIdx === picked && picked !== q.answer) cls = "incorrect";
        }
        return `
          <button type="button" class="reading-choice-btn ${cls}" data-qidx="${qIdx}" data-optidx="${optIdx}" ${picked !== null ? "disabled" : ""}>
            <span class="reading-choice-letter">${letters[optIdx]}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      }).join("");

      const expHtml = picked !== null ? `
        <div class="reading-q-exp ${picked === q.answer ? "ok" : "bad"}">
          ${picked === q.answer ? "✅ ถูกต้อง!" : "❌ คำตอบที่ถูกคือข้อ " + letters[q.answer]} — ${escapeHtml(q.exp)}
        </div>
      ` : "";

      return `
        <div class="reading-q-card">
          <div class="reading-q-title">${escapeHtml(q.q)}</div>
          <div class="reading-choices-grid">${choicesHtml}</div>
          ${expHtml}
        </div>
      `;
    }).join("");

    let summaryHtml = "";
    if (stats.answered === stats.total) {
      const stars = stats.correct >= 4 ? "⭐⭐⭐" : stats.correct >= 3 ? "⭐⭐☆" : "⭐☆☆";
      const msg = stats.correct === 5
        ? "สุดยอดมาก! ตอบถูกครบทั้ง 5 ข้อเลย! 🎉"
        : stats.correct >= 3
          ? "เก่งมากเลยครับ! เข้าใจเนื้อเรื่องได้ดีมาก 💪"
          : "สู้ๆ นะครับ ลองอ่านเนื้อเรื่องอีกครั้งแล้วทำใหม่ดูนะ 📘";
      const nextIdx = (READING_STORIES.findIndex(s => s.id === story.id) + 1) % READING_STORIES.length;
      const nextStory = READING_STORIES[nextIdx];

      summaryHtml = `
        <div class="reading-summary-box">
          <div style="font-size:2rem; letter-spacing:4px;">${stars}</div>
          <div style="font-family:var(--font-en); font-size:1.55rem; font-weight:700; color:var(--ink);">
            คะแนน ${stats.correct} / ${stats.total}
          </div>
          <div style="font-family:var(--font-cute); font-size:0.95rem; margin:4px 0 12px; color:var(--ink-soft);">${msg}</div>
          <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
            <button type="button" class="btn btn-soft btn-sm" id="readingRetryBottomBtn">🔄 ทำข้อสอบเรื่องนี้ใหม่</button>
            <button type="button" class="btn btn-mint btn-sm" id="readingNextStoryBtn" data-next-id="${escapeHtml(nextStory.id)}">
              ➡️ อ่านเรื่องถัดไป (${escapeHtml(nextStory.num)})
            </button>
          </div>
        </div>
      `;
    }

    splitEl.innerHTML = `
      <div class="reading-story-pane">
        <div class="reading-hero-img-wrap">
          <img src="${escapeHtml(story.image)}" alt="${escapeHtml(story.titleEn)}" class="reading-hero-img">
          <span class="reading-story-badge">${escapeHtml(story.unitLabel)}</span>
        </div>

        <div>
          <h3 class="reading-story-title">${escapeHtml(story.titleEn)}</h3>
          <p class="reading-story-sub">${escapeHtml(story.titleTh)}</p>
        </div>

        <div class="reading-audio-bar">
          <button type="button" class="btn btn-sunny btn-sm" id="readingSpeakNormalBtn">🔊 ฟังเสียงเนื้อเรื่อง</button>
          <button type="button" class="btn btn-soft btn-sm" id="readingSpeakSlowBtn">🐢 ฟังช้าๆ</button>
          <button type="button" class="btn btn-soft btn-sm" id="readingStopAudioBtn">⏹️ หยุด</button>
          <button type="button" class="btn btn-soft btn-sm" id="readingToggleThBtn">
            ${readingState.showThai ? "🙈 ซ่อนคำแปลไทย" : "🇹🇭 แปลไทย"}
          </button>
        </div>

        <div class="reading-passage-card">${paragraphsHtml}</div>

        ${readingState.showThai ? `<div class="reading-thai-box"><strong>🇹🇭 คำแปล:</strong> ${escapeHtml(story.thaiTranslation)}</div>` : ""}

        <div class="reading-vocab-box">
          <div class="reading-vocab-title">💡 คำศัพท์น่ารู้ในเรื่อง (คลิกเพื่อฟังเสียง)</div>
          <div class="reading-vocab-chips">${vocabHtml}</div>
        </div>
      </div>

      <div class="reading-quiz-pane">
        <div class="reading-quiz-head">
          <span class="reading-score-pill">📝 คำถามท้ายเรื่อง 5 ข้อ • ตอบแล้ว ${stats.answered}/${stats.total} • คะแนน ${stats.correct}/${stats.total}</span>
          <button type="button" class="btn btn-soft btn-sm" id="readingResetStoryBtn">🔄 เริ่มทำใหม่</button>
        </div>
        ${summaryHtml}
        <div class="reading-q-list">${questionsHtml}</div>
      </div>
    `;

    // Bind Pane Events
    const fullText = story.paragraphs.join(" ");
    $("readingSpeakNormalBtn").onclick = () => speakEnglish(fullText, 0.9);
    $("readingSpeakSlowBtn").onclick = () => speakEnglish(fullText, 0.68);
    $("readingStopAudioBtn").onclick = () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    $("readingToggleThBtn").onclick = () => {
      readingState.showThai = !readingState.showThai;
      renderReadingStudio();
    };

    const resetFn = () => {
      readingState.answersByStory[story.id] = {};
      renderReadingStudio();
      showToast("รีเซ็ตคำตอบเรื่องนี้แล้ว ลองทำใหม่อีกครั้งนะครับ ✨");
    };
    $("readingResetStoryBtn").onclick = resetFn;
    if ($("readingRetryBottomBtn")) $("readingRetryBottomBtn").onclick = resetFn;
    if ($("readingNextStoryBtn")) {
      $("readingNextStoryBtn").onclick = () => {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        readingState.activeStoryId = $("readingNextStoryBtn").dataset.nextId;
        renderReadingStudio();
      };
    }

    splitEl.querySelectorAll(".reading-vocab-chip").forEach(chip => {
      chip.onclick = () => speakEnglish(chip.dataset.speak, 0.85);
    });

    splitEl.querySelectorAll(".reading-choice-btn").forEach(btn => {
      btn.onclick = () => {
        const qIdx = Number(btn.dataset.qidx);
        const optIdx = Number(btn.dataset.optidx);
        if (!readingState.answersByStory[story.id]) readingState.answersByStory[story.id] = {};
        if (typeof readingState.answersByStory[story.id][qIdx] === "number") return;
        readingState.answersByStory[story.id][qIdx] = optIdx;
        renderReadingStudio();
      };
    });
  }

  function printReadingComprehensionSheet() {
    const story = getActiveReadingStory();
    const letters = ["A", "B", "C", "D"];
    const questionsHtml = story.questions.map(q => {
      const optsLine = q.options.map((o, i) => `<span style="display:inline-block; min-width:46%; margin-top:2px;">${letters[i]}. ${escapeHtml(o)}</span>`).join(" ");
      return `
        <li class="ws-item">
          <div class="ws-item-q"><strong>${escapeHtml(q.q)}</strong></div>
          <div style="font-size:9.2pt; margin-top:3px; line-height:1.45;">${optsLine}</div>
        </li>
      `;
    }).join("");

    $("printArea").innerHTML = `
      <div class="worksheet-paper">
        <div class="ws-header">
          <div class="ws-header-left">
            <img src="${escapeHtml(story.image)}" alt="${escapeHtml(story.titleEn)}" class="ws-unit-art">
            <div>
              <div class="ws-subject">Krusah (ครูสา) • Reading Comprehension • Prathom 6</div>
              <h3 class="ws-title">${escapeHtml(story.titleEn)} (${escapeHtml(story.titleTh)})</h3>
            </div>
          </div>
          <div class="ws-student-fields">
            <div>Name: ______________________</div>
            <div>Class: P.6/___ &nbsp; No.: ___ &nbsp; Score: ___/5</div>
          </div>
        </div>
        <div class="ws-instruction"><strong>Directions:</strong> Read the short story carefully and choose the best answer (A, B, C, or D).</div>
        <div class="ws-passage">${story.paragraphs.map(p => escapeHtml(p)).join("<br><br>")}</div>
        <ol class="ws-item-list">${questionsHtml}</ol>
      </div>
    `;
    window.print();
  }

  function openReadingModal() {
    renderReadingStudio();
    openModal("readingModal");
  }

  function initReadingEvents() {
    if (!$("readingModal")) return;

    $("readingFullscreenBtn").onclick = () => {
      $("readingDialog").classList.toggle("fullscreen");
    };
    $("readingPrintBtn").onclick = printReadingComprehensionSheet;

    $("readingStoryTabs").addEventListener("click", (e) => {
      const card = e.target.closest(".story-tab-card");
      if (!card) return;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      readingState.activeStoryId = card.dataset.storyId;
      renderReadingStudio();
    });
  }

  // ================= INIT =================
  loadState();
  bindEvents();
  renderAll();
})();
