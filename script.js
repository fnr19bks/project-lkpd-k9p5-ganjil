/* =========================================================
   LKPD INTERAKTIF — CLOUD COLLABORATION
   Struktur Folder dan Hak Akses
   script.js  ·  Vanilla JavaScript (ES6+)
   ========================================================= */

/* =========================================================
   1. KONFIGURASI (⚙️ TUNABLE)
   ========================================================= */
const CONFIG = {
  GAME_TITLE: "LKPD Interaktif: Cloud Collaboration",
  SUBTITLE: "Struktur Folder dan Hak Akses (Folder Structure & Access Rights)",
  POINTS_PER_CORRECT: 10,
  PRIMARY_COLOR: "#0ea5e9",
  SECONDARY_COLOR: "#f59e0b",
  ENABLE_SOUND: true,
  FOOTER_TEXT: "LKPD Informatika Kelas 9 · Cloud Collaboration: Struktur Folder dan Hak Akses · © 2026 SMP Negeri 19 Kota Bekasi",
  STORAGE_KEY: "lkpd_k9p5_cloud_collab_v1"
};

/* =========================================================
   2. STATE & STORAGE
   ========================================================= */
const MAX_POINTS = { l1: 50, l2: 100, l3: 60, l4: 80 };

const defaultState = () => ({
  screen: "start",
  levelScore: { l1: 0, l2: 0, l3: 0, l4: 0 },
  completed: { l1: false, l2: false, l3: false, l4: false },
  l1: { values: {} },
  l2: { placement: {} },
  l3: { values: {} },
  l4: { values: {} }
});

let state = defaultState();

function saveState() {
  try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}
function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state = Object.assign(defaultState(), parsed);
    state.levelScore = Object.assign({ l1:0,l2:0,l3:0,l4:0 }, parsed.levelScore || {});
    state.completed  = Object.assign({ l1:false,l2:false,l3:false,l4:false }, parsed.completed || {});
    state.l1 = Object.assign({ values:{} }, parsed.l1 || {});
    state.l2 = Object.assign({ placement:{} }, parsed.l2 || {});
    state.l3 = Object.assign({ values:{} }, parsed.l3 || {});
    state.l4 = Object.assign({ values:{} }, parsed.l4 || {});
  } catch (e) { state = defaultState(); }
}
function clearState() {
  try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch (e) {}
  state = defaultState();
}

/* =========================================================
   3. UTILITAS
   ========================================================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function norm(s) {
  return String(s || "").trim().toLowerCase().replace(/[\s_\-]+/g, "");
}
function toast(msg, type) {
  const el = $("#toast");
  el.textContent = msg;
  el.className = "toast show" + (type ? " " + type : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.className = "toast"; }, 2200);
}

/* =========================================================
   4. AUDIO (Web Audio API — tanpa file eksternal)
   ========================================================= */
let audioCtx = null;
function playTone(freq, dur, type = "sine", vol = 0.07) {
  if (!CONFIG.ENABLE_SOUND) return;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* silent */ }
}
const sfx = {
  click:   () => playTone(640, 0.05, "sine", 0.05),
  correct: () => { playTone(880, 0.1); setTimeout(() => playTone(1320, 0.14), 85); },
  wrong:   () => playTone(180, 0.22, "square", 0.06),
  drop:    () => playTone(520, 0.07, "triangle", 0.05),
  win:     () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.22, "sine", 0.08), i * 130))
};

/* =========================================================
   5. DATA SOAL
   ========================================================= */

/* ---------- LEVEL 1: Perbaikan Nama Berkas ---------- */
const LEVEL1_DATA = [
  {
    id: "f1",
    oldName: "tugas final FIX revisi2 berenar.docx",
    hint: "Dibuat Rani, 5 Oktober 2026 · Tentang Proposal · Versi 2",
    answer: "2026-10-05_Proposal_Rani_v2.docx",
    explanation: "Tanggal 2026-10-05, topik Proposal, pembuat Rani, versi v2. Hindari kata 'final' dan 'revisi2' yang membingungkan."
  },
  {
    id: "f2",
    oldName: "IMG_2231.jpg",
    hint: "Foto latihan tari · 12 Oktober 2026 · Nomor urut 01",
    answer: "2026-10-12_Foto_Latihan-Tari_01.jpg",
    explanation: "Nama bawaan kamera (IMG_2231) tidak memberi informasi. Tambahkan tanggal, isi foto, dan nomor urut."
  },
  {
    id: "f3",
    oldName: "anggaran baru (2).xlsx",
    hint: "Dibuat Bendahara · 6 Oktober 2026 · Versi 1",
    answer: "2026-10-06_Anggaran_Bendahara_v1.xlsx",
    explanation: "Tanda kurung dan kata 'baru' tidak jelas. Sebutkan tanggal, topik, penanggung jawab, dan versi."
  },
  {
    id: "f4",
    oldName: "Untitled document",
    hint: "Rundown acara · 7 Oktober 2026 · Versi 3",
    answer: "2026-10-07_Rundown-Acara_v3.docx",
    explanation: "'Untitled document' adalah nama paling berbahaya — tidak ada yang tahu isinya. Selalu beri nama yang jelas."
  },
  {
    id: "f5",
    oldName: "video pensi.mp4",
    hint: "Buat sendiri: tentukan tanggal dan isi dengan logis. Contoh topik: Video Pensi, Dokumentasi",
    answer: "2026-10-12_Video-Pensi_Dokumentasi_v1.mp4",
    isOpen: true,
    explanation: "Nama yang baik menjawab: Kapan? Tentang apa? Versi ke berapa? Contoh: 2026-10-12_Video-Pensi_Dokumentasi_v1.mp4"
  }
];

/* ---------- LEVEL 2: Struktur Folder ---------- */
const L2_ITEMS = [
  { id: "proposal",    label: "01_Proposal",                 icon: "📁", zone: "root" },
  { id: "anggaran",    label: "02_Anggaran",                 icon: "📁", zone: "root" },
  { id: "rundown",     label: "03_Rundown_Acara",            icon: "📁", zone: "root" },
  { id: "dokumentasi", label: "04_Dokumentasi",              icon: "📁", zone: "root" },
  { id: "desain",      label: "05_Desain_Poster",            icon: "📁", zone: "root" },
  { id: "arsip",       label: "99_Arsip",                    icon: "📁", zone: "root" },
  { id: "foto",        label: "Foto",                        icon: "🖼️", zone: "dok"  },
  { id: "video",       label: "Video",                       icon: "🎬", zone: "dok"  },
  { id: "tugasmtk",    label: "Tugas_Matematika_Kel3.docx",  icon: "📄", zone: "other" },
  { id: "fotoliburan", label: "Foto_Liburan_Keluarga.jpg",   icon: "📄", zone: "other" }
];

/* ---------- LEVEL 3: Matriks Hak Akses ---------- */
const L3_PEOPLE = [
  { id: "rani",      name: "Rani (Ketua)" },
  { id: "acara",     name: "Seksi Acara" },
  { id: "bendahara", name: "Bendahara" },
  { id: "dok",       name: "Seksi Dokumentasi" },
  { id: "sari",      name: "Bu Sari (Pembina)" },
  { id: "peserta",   name: "Peserta pentas (umum)" }
];
const L3_FOLDERS = ["01_Proposal", "02_Anggaran", "03_Rundown", "04_Dokumentasi"];
const L3_ROLES = [
  { v: "",          label: "— (Tanpa akses / No access)" },
  { v: "viewer",    label: "Pelihat (Viewer)" },
  { v: "commenter", label: "Pemberi Komentar (Commenter)" },
  { v: "editor",    label: "Penyunting (Editor)" },
  { v: "owner",     label: "Pemilik (Owner)" }
];
const L3_KEY = {
  rani:      ["owner",     "owner",  "owner",  "owner"],
  acara:     ["editor",    "",       "viewer", ""],
  bendahara: ["viewer",    "editor", "",       ""],
  dok:       ["",          "",       "viewer", "editor"],
  sari:      ["commenter", "viewer", "",       ""],
  peserta:   ["",          "",       "viewer", ""]
};
const L3_REASON = {
  rani:      "Rani adalah ketua panitia — hanya satu orang yang sebaiknya menjadi Pemilik (Owner).",
  acara:     "Seksi Acara menyusun proposal dan rundown, jadi perlu mengedit proposal dan cukup melihat rundown.",
  bendahara: "Bendahara satu-satunya yang boleh mengubah anggaran. Untuk proposal, cukup melihat.",
  dok:       "Seksi Dokumentasi mengelola folder dokumentasi (Penyunting) dan cukup melihat rundown.",
  sari:      "Bu Sari hanya memberi saran (Pemberi Komentar) pada proposal dan cukup melihat anggaran.",
  peserta:   "Peserta umum hanya perlu melihat jadwal (rundown). Tidak perlu akses lain."
};

/* ---------- LEVEL 4: Detektif Akses ---------- */
const L4_CASES = [
  {
    id: "c1",
    folder: "Data_Anggota",
    icon: "📁",
    contents: "Nama, alamat, dan nomor HP 12 anggota",
    setting: '"Siapa saja yang memiliki link (Anyone with the link)" — Penyunting (Editor)',
    problemOptions: [
      { v: "a", t: "Tautan publik (Anyone with the link) + peran Penyunting (Editor) terlalu tinggi untuk data pribadi." },
      { v: "b", t: "Nama folder kurang menarik." },
      { v: "c", t: "Terlalu banyak berkas di dalam folder." }
    ],
    problemKey: "a",
    fixOptions: [
      { v: "a", t: 'Ubah ke "Dibatasi (Restricted)" dan beri peran "Pelihat (Viewer)" hanya untuk pengurus.' },
      { v: "b", t: "Biarkan saja, tidak masalah." },
      { v: "c", t: "Hapus semua data anggota." }
    ],
    fixKey: "a"
  },
  {
    id: "c2",
    folder: "Anggaran_Bazar",
    icon: "📁",
    contents: "Dana Rp 2.000.000 dan catatan kas",
    setting: "Semua 32 murid kelas — Penyunting (Editor)",
    problemOptions: [
      { v: "a", t: "Semua 32 murid bisa mengedit (Editor) data keuangan — risiko salah ubah sangat besar." },
      { v: "b", t: "Nominal dana terlalu kecil." },
      { v: "c", t: "Folder tidak diberi nomor urut." }
    ],
    problemKey: "a",
    fixOptions: [
      { v: "a", t: 'Hanya Bendahara sebagai "Penyunting (Editor)", yang lain "Pelihat (Viewer)".' },
      { v: "b", t: "Jadikan semua murid Pemilik (Owner) agar adil." },
      { v: "c", t: "Kirim saja lewat WhatsApp grup." }
    ],
    fixKey: "a"
  },
  {
    id: "c3",
    folder: "Foto_Kegiatan",
    icon: "📁",
    contents: "Foto penjualan, wajah teman terlihat jelas",
    setting: '"Siapa saja yang memiliki link (Anyone with the link)" — Pelihat (Viewer), tanpa meminta izin',
    problemOptions: [
      { v: "a", t: "Masalah privasi (privacy) — foto wajah teman dibagikan tanpa izin." },
      { v: "b", t: "Resolusi foto kurang tajam." },
      { v: "c", t: "Terlalu banyak foto dalam satu folder." }
    ],
    problemKey: "a",
    fixOptions: [
      { v: "a", t: 'Minta izin dulu kepada teman, lalu ubah ke "Dibatasi (Restricted)".' },
      { v: "b", t: "Bagikan ke semua orang agar ramai." },
      { v: "c", t: "Hapus semua foto tanpa bertanya." }
    ],
    fixKey: "a"
  },
  {
    id: "c4",
    folder: "Arsip_2024",
    icon: "📁",
    contents: "Berkas kegiatan tahun lalu",
    setting: "Masih dibagikan ke 5 alumni yang sudah lulus — Penyunting (Editor)",
    problemOptions: [
      { v: "a", t: "Alumni sudah tidak terlibat, tetapi masih memegang akses Penyunting (Editor)." },
      { v: "b", t: "Berkas tahun lalu sudah terlalu lama." },
      { v: "c", t: "Nama folder tidak mengikuti pola penamaan." }
    ],
    problemKey: "a",
    fixOptions: [
      { v: "a", t: "Cabut akses (Hapus akses) alumni yang sudah tidak terlibat." },
      { v: "b", t: "Beri semua alumni peran Pemilik (Owner) agar kenang-kenangan." },
      { v: "c", t: "Biarkan saja, tidak ada masalah." }
    ],
    fixKey: "a"
  }
];

/* =========================================================
   6. NAVIGASI & SKOR
   ========================================================= */
function recalcScore() {
  const total = (state.levelScore.l1 || 0) + (state.levelScore.l2 || 0)
              + (state.levelScore.l3 || 0) + (state.levelScore.l4 || 0);
  $("#scoreValue").textContent = total;
  return total;
}

function goTo(screenId) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const target = $("#screen-" + screenId);
  if (target) target.classList.add("active");
  state.screen = screenId;
  updateProgressBar();
  saveState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProgressBar() {
  const map = { start: 0, l1: 1, l2: 2, l3: 3, l4: 4, result: 5 };
  const current = map[state.screen] || 0;
  $$(".progress-step").forEach(btn => {
    const step = parseInt(btn.dataset.step, 10);
    btn.classList.toggle("active", step === current);
    btn.classList.toggle("done", !!state.completed["l" + step]);
    btn.disabled = step > 1 && !state.completed["l" + (step - 1)] && !state.completed["l" + step];
  });
  recalcScore();
}

/* =========================================================
   7. LEVEL 1 — Perbaikan Nama Berkas
   ========================================================= */
function renderLevel1() {
  const wrap = $("#l1List");
  wrap.innerHTML = "";
  LEVEL1_DATA.forEach((item, i) => {
    const saved = state.l1.values[item.id] || "";
    const row = document.createElement("div");
    row.className = "file-row";
    row.dataset.id = item.id;
    row.innerHTML = `
      <div class="file-row-head">
        <span class="badge-num">${i + 1}</span>
        <span class="old-name">${escapeHtml(item.oldName)}</span>
      </div>
      <div class="file-row-hint">💡 ${escapeHtml(item.hint)}</div>
      <div class="file-row-input">
        <input type="text" class="text-input" id="l1-input-${item.id}"
               placeholder="Tulis nama berkas baru (new file name)..."
               value="${escapeHtml(saved)}" autocomplete="off" spellcheck="false" />
        <span class="feedback-icon" id="l1-icon-${item.id}"></span>
      </div>
      <div class="file-row-feedback" id="l1-msg-${item.id}"></div>
    `;
    wrap.appendChild(row);
    const input = row.querySelector("input");
    input.addEventListener("input", () => {
      state.l1.values[item.id] = input.value;
      saveState();
      // reset visual saat mengetik ulang
      row.classList.remove("correct", "wrong");
      row.querySelector(".feedback-icon").textContent = "";
      const msg = row.querySelector(".file-row-feedback");
      msg.className = "file-row-feedback";
      msg.textContent = "";
    });
  });
  $("#l1Feedback").className = "level-feedback";
  $("#l1Feedback").innerHTML = "";
  $("#btnCheckL1").disabled = false;
}

function checkLevel1() {
  let correct = 0;
  let firstWrongHint = "";

  LEVEL1_DATA.forEach(item => {
    const input = $("#l1-input-" + item.id);
    const row = input.closest(".file-row");
    const icon = $("#l1-icon-" + item.id);
    const msg = $("#l1-msg-" + item.id);
    const val = input.value.trim();

    let ok;
    if (item.isOpen) {
      ok = /^\d{4}-\d{2}-\d{2}[_\s-]+.+[_\s-]+.+[_\s-]+v\d+\.[a-z0-9]+$/i.test(val)
           && /\.mp4$/i.test(val);
      if (!ok && val) {
        ok = /^\d{4}-\d{2}-\d{2}[_\s-]+.+[_\s-]+v\d+\.[a-z0-9]+$/i.test(val) && /\.mp4$/i.test(val);
      }
    } else {
      ok = norm(val) === norm(item.answer);
    }

    if (ok) {
      correct++;
      row.classList.remove("wrong"); row.classList.add("correct");
      icon.textContent = "✅";
      msg.className = "file-row-feedback show ok";
      msg.innerHTML = `Benar! <em>(Correct!)</em> ${escapeHtml(item.explanation)}`;
      sfx.correct();
    } else {
      row.classList.remove("correct"); row.classList.add("wrong");
      icon.textContent = "❌";
      msg.className = "file-row-feedback show no";
      const contoh = item.isOpen ? item.answer : item.answer;
      msg.innerHTML = `Belum tepat. <em>(Not quite.)</em> Contoh jawaban: <code>${escapeHtml(contoh)}</code>`;
      if (!firstWrongHint) firstWrongHint = item.explanation;
      sfx.wrong();
    }
  });

  const score = correct * CONFIG.POINTS_PER_CORRECT;
  state.levelScore.l1 = score;
  state.completed.l1 = true;
  saveState();
  recalcScore();

  const fb = $("#l1Feedback");
  if (correct === LEVEL1_DATA.length) {
    fb.className = "level-feedback show good";
    fb.innerHTML = `<strong>🎉 Luar biasa! (Excellent!)</strong> Semua nama berkas benar. Skor Misi 1: <b>${score}</b> poin.`;
  } else {
    fb.className = "level-feedback show info";
    fb.innerHTML = `<strong>📘 Hasil Misi 1: ${correct} / ${LEVEL1_DATA.length} benar.</strong> Skor: <b>${score}</b> poin. Perbaiki yang masih salah, lalu klik Periksa lagi. <br/><span style="font-size:0.8rem">${escapeHtml(firstWrongHint)}</span>`;
  }
  $("#btnCheckL1").disabled = true;
  setTimeout(() => { $("#btnCheckL1").disabled = false; }, 600);
  updateProgressBar();
}

/* =========================================================
   8. LEVEL 2 — Struktur Folder (Drag & Drop)
   ========================================================= */
let dragState = null;

function renderLevel2() {
  const lists = {
    root: $("#listRoot"),
    dok: $("#listDok"),
    other: $("#listOther"),
    pool: $("#listPool")
  };
  Object.values(lists).forEach(l => { if (l) l.innerHTML = ""; });

  // Acak urutan kartu awal
  const shuffled = L2_ITEMS.slice().sort(() => Math.random() - 0.5);

  shuffled.forEach(item => {
    const card = document.createElement("div");
    card.className = "folder-card" + (item.zone === "dok" ? " doc-card" : "");
    card.dataset.id = item.id;
    card.dataset.expected = item.zone;
    card.innerHTML = `<span>${item.icon}</span><span>${escapeHtml(item.label)}</span>`;
    card.addEventListener("pointerdown", onCardPointerDown);
    // tempatkan sesuai state tersimpan, jika ada
    const savedZone = state.l2.placement[item.id];
    const targetZone = (savedZone && lists[savedZone]) ? savedZone : "pool";
    lists[targetZone].appendChild(card);
  });

  $("#l2Feedback").className = "level-feedback";
  $("#l2Feedback").innerHTML = "";
  $("#btnCheckL2").disabled = false;
  setupDropZones();
}

function setupDropZones() {
  $$(".drop-zone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
  });
}

function getDropTarget(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  return el.closest(".drop-zone");
}

function onCardPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  const card = e.currentTarget;
  if (card.dataset.locked === "1") return;

  e.preventDefault();

  const rect = card.getBoundingClientRect();
  const ghost = card.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.style.width = rect.width + "px";
  ghost.style.height = rect.height + "px";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  document.body.appendChild(ghost);

  card.classList.add("dragging");

  dragState = {
    card,
    ghost,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    startX: e.clientX,
    startY: e.clientY,
    originZone: card.closest(".drop-zone"),
    moved: false
  };

  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);
}

function onPointerMove(e) {
  if (!dragState) return;
  e.preventDefault();

  const dx = Math.abs(e.clientX - dragState.startX);
  const dy = Math.abs(e.clientY - dragState.startY);
  if (!dragState.moved && (dx > 5 || dy > 5)) dragState.moved = true;

  const g = dragState.ghost;
  g.style.left = (e.clientX - dragState.offsetX) + "px";
  g.style.top  = (e.clientY - dragState.offsetY) + "px";

  const target = getDropTarget(e.clientX, e.clientY);
  $$(".drop-zone").forEach(z => z.classList.toggle("over", z === target));
}

function onPointerUp(e) {
  if (!dragState) return;
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
  document.removeEventListener("pointercancel", onPointerUp);

  const target = getDropTarget(e.clientX, e.clientY);
  const { card, ghost } = dragState;

  ghost.remove();
  card.classList.remove("dragging");
  $$(".drop-zone").forEach(z => z.classList.remove("over"));

  if (target) {
    const list = target.querySelector(".drop-list");
    if (list) {
      list.appendChild(card);
      const zoneName = target.dataset.zone;
      if (zoneName === "pool") delete state.l2.placement[card.dataset.id];
      else state.l2.placement[card.dataset.id] = zoneName;
      sfx.drop();
      saveState();
    }
  }
  // reset visual penilaian
  card.classList.remove("correct", "wrong");
  dragState = null;
}

function checkLevel2() {
  let correct = 0;
  L2_ITEMS.forEach(item => {
    const card = $(`.folder-card[data-id="${item.id}"]`);
    if (!card) return;
    const zone = card.closest(".drop-zone");
    const zoneName = zone ? zone.dataset.zone : "pool";
    const ok = zoneName === item.zone;
    card.classList.remove("correct", "wrong");
    card.classList.add(ok ? "correct" : "wrong");
    if (ok) correct++;
  });

  const score = correct * CONFIG.POINTS_PER_CORRECT;
  state.levelScore.l2 = score;
  state.completed.l2 = true;
  saveState();
  recalcScore();

  const fb = $("#l2Feedback");
  if (correct === L2_ITEMS.length) {
    fb.className = "level-feedback show good";
    fb.innerHTML = `<strong>🎉 Hebat! (Great job!)</strong> Semua kartu berada di tempat yang tepat. Skor Misi 2: <b>${score}</b> poin.`;
    sfx.correct();
  } else {
    fb.className = "level-feedback show info";
    fb.innerHTML = `<strong>📘 Hasil Misi 2: ${correct} / ${L2_ITEMS.length} kartu tepat.</strong> Skor: <b>${score}</b> poin.<br/>
      Ingat: folder proyek (01–05, 99) masuk ke folder induk; Foto &amp; Video masuk ke dalam <code>04_Dokumentasi</code>;
      berkas yang <b>bukan bagian proyek</b> dibuang ke kotak merah.`;
    sfx.wrong();
  }
  updateProgressBar();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function resetLevel2() {
  state.l2.placement = {};
  state.levelScore.l2 = 0;
  state.completed.l2 = false;
  saveState();
  renderLevel2();
  recalcScore();
  updateProgressBar();
  toast("Misi 2 diulang (Level 2 reset)", "good");
}

/* =========================================================
   9. LEVEL 3 — Matriks Hak Akses
   ========================================================= */
function renderLevel3() {
  const tbody = $("#matrixBody");
  tbody.innerHTML = "";
  L3_PEOPLE.forEach(person => {
    const tr = document.createElement("tr");
    tr.dataset.person = person.id;
    let html = `<td>${escapeHtml(person.name)}</td>`;
    L3_FOLDERS.forEach((folder, idx) => {
      const cellId = `${person.id}__${idx}`;
      const saved = state.l3.values[cellId] || "";
      html += `<td>
        <select class="role-select" data-person="${person.id}" data-idx="${idx}" id="sel-${cellId}">
          ${L3_ROLES.map(r =>
            `<option value="${r.v}" ${r.v === saved ? "selected" : ""}>${escapeHtml(r.label)}</option>`
          ).join("")}
        </select>
      </td>`;
    });
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });

  $$("#matrixBody .role-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const key = `${sel.dataset.person}__${sel.dataset.idx}`;
      state.l3.values[key] = sel.value;
      saveState();
      sel.classList.remove("ok", "no");
      sel.closest("tr").classList.remove("row-correct", "row-wrong");
    });
  });

  $("#l3Feedback").className = "level-feedback";
  $("#l3Feedback").innerHTML = "";
  $("#btnCheckL3").disabled = false;
}

function checkLevel3() {
  let rowsCorrect = 0;
  const feedbackRows = [];

  L3_PEOPLE.forEach(person => {
    const tr = $(`#matrixBody tr[data-person="${person.id}"]`);
    const key = L3_KEY[person.id];
    let rowOk = true;

    L3_FOLDERS.forEach((_, idx) => {
      const sel = tr.querySelector(`select[data-idx="${idx}"]`);
      const val = sel.value;
      const ok = val === key[idx];
      sel.classList.remove("ok", "no");
      sel.classList.add(ok ? "ok" : "no");
      if (!ok) rowOk = false;
    });

    tr.classList.remove("row-correct", "row-wrong");
    tr.classList.add(rowOk ? "row-correct" : "row-wrong");
    if (rowOk) rowsCorrect++;
    else feedbackRows.push(person.name);
  });

  const score = rowsCorrect * CONFIG.POINTS_PER_CORRECT;
  state.levelScore.l3 = score;
  state.completed.l3 = true;
  saveState();
  recalcScore();

  const fb = $("#l3Feedback");
  if (rowsCorrect === L3_PEOPLE.length) {
    fb.className = "level-feedback show good";
    fb.innerHTML = `<strong>🎉 Sempurna! (Perfect!)</strong> Seluruh matriks hak akses sudah tepat. Skor Misi 3: <b>${score}</b> poin.`;
    sfx.correct();
  } else {
    const hintText = feedbackRows
      .map(n => {
        const p = L3_PEOPLE.find(x => x.name === n);
        return `<li><b>${escapeHtml(n)}</b>: ${escapeHtml(L3_REASON[p.id])}</li>`;
      })
      .join("");
    fb.className = "level-feedback show info";
    fb.innerHTML = `<strong>📘 Hasil Misi 3: ${rowsCorrect} / ${L3_PEOPLE.length} baris tepat.</strong> Skor: <b>${score}</b> poin.<br/>
      Petunjuk baris yang belum tepat:<ul style="margin:8px 0 0 18px;padding:0">${hintText}</ul>`;
    sfx.wrong();
  }
  updateProgressBar();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function resetLevel3() {
  state.l3.values = {};
  state.levelScore.l3 = 0;
  state.completed.l3 = false;
  saveState();
  renderLevel3();
  recalcScore();
  updateProgressBar();
  toast("Misi 3 diulang (Level 3 reset)", "good");
}

/* =========================================================
   10. LEVEL 4 — Detektif Akses
   ========================================================= */
function renderLevel4() {
  const wrap = $("#l4List");
  wrap.innerHTML = "";
  L4_CASES.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "case-card";
    card.dataset.case = c.id;

    const pSaved = (state.l4.values[c.id + "_p"]) || "";
    const fSaved = (state.l4.values[c.id + "_f"]) || "";

    card.innerHTML = `
      <div class="case-head">
        <span class="badge-num">${i + 1}</span>
        <span class="case-folder">${c.icon} ${escapeHtml(c.folder)}</span>
      </div>
      <div class="case-meta">📦 Isi: ${escapeHtml(c.contents)}</div>
      <div class="case-setting">⚙️ Pengaturan saat ini (Current setting): ${escapeHtml(c.setting)}</div>

      <div class="case-question">🔍 A. Apa masalahnya? <em>(What is the problem?)</em></div>
      <div class="opt-list" data-group="p">
        ${c.problemOptions.map(o => `
          <label class="opt ${pSaved === o.v ? "selected" : ""}" data-val="${o.v}">
            <input type="radio" name="${c.id}_p" value="${o.v}" ${pSaved === o.v ? "checked" : ""} />
            <span>${escapeHtml(o.t)}</span>
          </label>`).join("")}
      </div>

      <div class="case-question">🛠️ B. Apa perbaikannya? <em>(What is the fix?)</em></div>
      <div class="opt-list" data-group="f">
        ${c.fixOptions.map(o => `
          <label class="opt ${fSaved === o.v ? "selected" : ""}" data-val="${o.v}">
            <input type="radio" name="${c.id}_f" value="${o.v}" ${fSaved === o.v ? "checked" : ""} />
            <span>${escapeHtml(o.t)}</span>
          </label>`).join("")}
      </div>
    `;
    wrap.appendChild(card);
  });

  $$("#l4List .opt input").forEach(inp => {
    inp.addEventListener("change", e => {
      const label = e.target.closest(".opt");
      const group = label.closest(".opt-list");
      group.querySelectorAll(".opt").forEach(o => o.classList.remove("selected"));
      label.classList.add("selected");

      const caseId = e.target.name.split("_")[0];
      const suffix = e.target.name.endsWith("_p") ? "_p" : "_f";
      state.l4.values[caseId + suffix] = e.target.value;
      saveState();

      const card = label.closest(".case-card");
      card.classList.remove("correct", "wrong");
      sfx.click();
    });
  });

  $("#l4Feedback").className = "level-feedback";
  $("#l4Feedback").innerHTML = "";
  $("#btnCheckL4").disabled = false;
}

function checkLevel4() {
  let correct = 0;
  let totalItems = 0;
  let allAnswered = true;

  L4_CASES.forEach(c => {
    totalItems += 2;
    const card = $(`.case-card[data-case="${c.id}"]`);
    const pVal = state.l4.values[c.id + "_p"] || "";
    const fVal = state.l4.values[c.id + "_f"] || "";
    if (!pVal || !fVal) allAnswered = false;

    card.querySelectorAll('.opt-list[data-group="p"] .opt').forEach(o => {
      o.classList.remove("correct", "wrong");
      if (o.dataset.val === c.problemKey) o.classList.add("correct");
      else if (o.dataset.val === pVal) o.classList.add("wrong");
    });
    card.querySelectorAll('.opt-list[data-group="f"] .opt').forEach(o => {
      o.classList.remove("correct", "wrong");
      if (o.dataset.val === c.fixKey) o.classList.add("correct");
      else if (o.dataset.val === fVal) o.classList.add("wrong");
    });

    if (pVal === c.problemKey) correct++;
    if (fVal === c.fixKey) correct++;

    const bothOk = (pVal === c.problemKey && fVal === c.fixKey);
    card.classList.remove("correct", "wrong");
    if (pVal && fVal) card.classList.add(bothOk ? "correct" : "wrong");
  });

  const score = correct * CONFIG.POINTS_PER_CORRECT;
  state.levelScore.l4 = score;
  state.completed.l4 = true;
  saveState();
  recalcScore();

  const fb = $("#l4Feedback");
  if (correct === totalItems) {
    fb.className = "level-feedback show good";
    fb.innerHTML = `<strong>🎉 Detektif Hebat! (Great Detective!)</strong> Semua masalah dan perbaikan tepat. Skor Misi 4: <b>${score}</b> poin.`;
    sfx.correct();
  } else {
    fb.className = "level-feedback show info";
    fb.innerHTML = `<strong>📘 Hasil Misi 4: ${correct} / ${totalItems} jawaban tepat.</strong> Skor: <b>${score}</b> poin.
      ${allAnswered ? "" : "<br/>⚠️ Masih ada pertanyaan yang belum dijawab."}
      <br/>Ingat prinsip <em>Beri Seperlunya (Least Privilege)</em>: beri akses paling kecil yang masih cukup.`;
    sfx.wrong();
  }
  updateProgressBar();

  const allDone = state.completed.l1 && state.completed.l2 && state.completed.l3 && state.completed.l4;
  if (allDone) {
    setTimeout(() => showResult(), 900);
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
}

function resetLevel4() {
  state.l4.values = {};
  state.levelScore.l4 = 0;
  state.completed.l4 = false;
  saveState();
  renderLevel4();
  recalcScore();
  updateProgressBar();
  toast("Misi 4 diulang (Level 4 reset)", "good");
}

/* =========================================================
   11. HASIL AKHIR
   ========================================================= */
function showResult() {
  const total = recalcScore();
  const max = MAX_POINTS.l1 + MAX_POINTS.l2 + MAX_POINTS.l3 + MAX_POINTS.l4;
  const percent = max > 0 ? Math.round((total / max) * 100) : 0;

  $("#finalScore").textContent = total;
  $("#finalMax").textContent = "/ " + max;
  $("#finalPercent").textContent = percent + "%";

  let emoji = "🎉", title = "Selamat! (Congratulations!)", msg = "";
  if (percent >= 90) {
    emoji = "🏆"; title = "Luar Biasa! (Outstanding!)";
    msg = "Kamu adalah Detektif Awan tingkat mahir. Kamu memahami struktur folder dan hak akses dengan sangat baik!";
  } else if (percent >= 75) {
    emoji = "🌟"; title = "Bagus Sekali! (Great Work!)";
    msg = "Kamu sudah mencapai kriteria ketercapaian. Pertahankan kebiasaan menjaga data bersama, ya!";
  } else if (percent >= 50) {
    emoji = "💪"; title = "Cukup Baik! (Good Effort!)";
    msg = "Kamu sudah memahami sebagian besar materi. Coba ulangi misi yang masih rendah untuk memperbaiki skor.";
  } else {
    emoji = "📚"; title = "Ayo Coba Lagi! (Let's Try Again!)";
    msg = "Jangan menyerah! Baca kembali Kartu Informasi pada modul, lalu ulangi misi satu per satu.";
  }
  $("#resultEmoji").textContent = emoji;
  $("#resultTitle").innerHTML = title;
  $("#resultMessage").textContent = msg;

  const bd = [
    { label: "Misi 1 · Nama Berkas", score: state.levelScore.l1, max: MAX_POINTS.l1 },
    { label: "Misi 2 · Struktur Folder", score: state.levelScore.l2, max: MAX_POINTS.l2 },
    { label: "Misi 3 · Hak Akses", score: state.levelScore.l3, max: MAX_POINTS.l3 },
    { label: "Misi 4 · Detektif Akses", score: state.levelScore.l4, max: MAX_POINTS.l4 }
  ];
  $("#breakdown").innerHTML = bd.map(b => `
    <div class="bd-item">
      <strong>${b.label}</strong>
      <span>${b.score} <small style="font-size:0.72rem;opacity:0.6">/ ${b.max}</small></span>
    </div>
  `).join("");

  goTo("result");
  sfx.win();
}

/* =========================================================
   12. RESET TOTAL
   ========================================================= */
function resetAll() {
  if (!confirm("Yakin ingin mengulang dari awal? Semua skor akan dihapus.\n(Are you sure? All scores will be erased.)")) return;
  clearState();
  location.reload();
}

/* =========================================================
   13. INISIALISASI
   ========================================================= */
function applyConfig() {
  document.documentElement.style.setProperty("--primary", CONFIG.PRIMARY_COLOR);
  document.documentElement.style.setProperty("--secondary", CONFIG.SECONDARY_COLOR);

  const t = $("#appTitle"); if (t) t.textContent = CONFIG.GAME_TITLE;
  const st = $("#appSubtitle"); if (st) st.textContent = CONFIG.SUBTITLE;
  const ft = $("#footerText"); if (ft) ft.textContent = CONFIG.FOOTER_TEXT;
  const ph = $("#pointsHint"); if (ph) ph.textContent = CONFIG.POINTS_PER_CORRECT;

  document.title = CONFIG.GAME_TITLE + " · Struktur Folder dan Hak Akses";
}

function bindEvents() {
  $("#btnStart").addEventListener("click", () => { sfx.click(); goTo("l1"); });

  // Progress bar: hanya boleh pindah ke level yang sudah selesai / sedang aktif
  $$(".progress-step").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const step = parseInt(btn.dataset.step, 10);
      sfx.click();
      goTo("l" + step);
    });
  });

  // Level 1
  $("#btnCheckL1").addEventListener("click", () => { sfx.click(); checkLevel1(); });
  $("#btnResetL1").addEventListener("click", () => {
    state.l1.values = {};
    state.levelScore.l1 = 0;
    state.completed.l1 = false;
    saveState();
    renderLevel1();
    recalcScore();
    updateProgressBar();
    toast("Misi 1 diulang (Level 1 reset)", "good");
  });

  // Level 2
  $("#btnCheckL2").addEventListener("click", () => { sfx.click(); checkLevel2(); });
  $("#btnResetL2").addEventListener("click", () => { sfx.click(); resetLevel2(); });

  // Level 3
  $("#btnCheckL3").addEventListener("click", () => { sfx.click(); checkLevel3(); });
  $("#btnResetL3").addEventListener("click", () => { sfx.click(); resetLevel3(); });

  // Level 4
  $("#btnCheckL4").addEventListener("click", () => { sfx.click(); checkLevel4(); });
  $("#btnResetL4").addEventListener("click", () => { sfx.click(); resetLevel4(); });

  // Result
  $("#btnPrint").addEventListener("click", () => { sfx.click(); window.print(); });
  $("#btnPlayAgain").addEventListener("click", () => { sfx.click(); resetAll(); });

  // Footer
  $("#btnResetAll").addEventListener("click", () => { sfx.click(); resetAll(); });
  $("#btnFinalScore").addEventListener("click", () => {
    sfx.click();
    const allDone = state.completed.l1 && state.completed.l2 && state.completed.l3 && state.completed.l4;
    if (allDone) showResult();
    else {
      const total = recalcScore();
      toast(`Skor sementara: ${total} poin. Selesaikan semua misi untuk melihat hasil akhir.`, "good");
    }
  });

  // Cegah scroll saat drag pada perangkat sentuh
  document.addEventListener("touchmove", e => {
    if (dragState && dragState.moved) e.preventDefault();
  }, { passive: false });
}

function boot() {
  applyConfig();
  loadState();
  renderLevel1();
  renderLevel2();
  renderLevel3();
  renderLevel4();
  bindEvents();
  recalcScore();
  updateProgressBar();

  // Kembalikan ke layar terakhir
  const validScreens = ["start", "l1", "l2", "l3", "l4", "result"];
  const target = validScreens.includes(state.screen) ? state.screen : "start";
  goTo(target);
}

document.addEventListener("DOMContentLoaded", boot);