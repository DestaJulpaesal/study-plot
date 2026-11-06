/**
 * script.js — StudyPilot AI Agent
 * Rule-based mock engine with 5 intent handlers,
 * study plan generator, sidebar state, and UI interactions.
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   SECTION 1: DUMMY DATA — 8 tugas mahasiswa realistis
═══════════════════════════════════════════════════════════════ */

const DUMMY_TASKS = [
  {
    id: 'task-1',
    name: 'Laporan Praktikum Kimia Dasar',
    course: 'Kimia Dasar',
    deadline: offsetDate(2),   // 2 hari lagi
    priority: 'tinggi',
    done: false
  },
  {
    id: 'task-2',
    name: 'Makalah Pancasila & Kewarganegaraan',
    course: 'PPKN',
    deadline: offsetDate(5),
    priority: 'sedang',
    done: false
  },
  {
    id: 'task-3',
    name: 'Tugas Besar Kalkulus — Integral Tertentu',
    course: 'Kalkulus',
    deadline: offsetDate(7),
    priority: 'tinggi',
    done: false
  },
  {
    id: 'task-4',
    name: 'Quiz Online Pemrograman Dasar',
    course: 'Pemrograman Dasar',
    deadline: offsetDate(1),
    priority: 'tinggi',
    done: false
  },
  {
    id: 'task-5',
    name: 'Resume Bab 3 Pengantar Ekonomi',
    course: 'Pengantar Ekonomi',
    deadline: offsetDate(4),
    priority: 'sedang',
    done: true
  },
  {
    id: 'task-6',
    name: 'Presentasi Kelompok Bahasa Inggris',
    course: 'Bahasa Inggris',
    deadline: offsetDate(10),
    priority: 'sedang',
    done: false
  },
  {
    id: 'task-7',
    name: 'Jawab Soal Latihan Fisika Bab 4',
    course: 'Fisika Dasar',
    deadline: offsetDate(3),
    priority: 'tinggi',
    done: false
  },
  {
    id: 'task-8',
    name: 'Ringkasan Sejarah Kebudayaan Islam',
    course: 'Agama Islam',
    deadline: offsetDate(6),
    priority: 'rendah',
    done: false
  }
];

/** Buat Date offset N hari dari hari ini */
function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2: STATE — satu sumber kebenaran aplikasi
═══════════════════════════════════════════════════════════════ */

let state = {
  tasks: deepClone(DUMMY_TASKS),
  messages: [],
  isTyping: false,
  theme: 'light'
};

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

/* ═══════════════════════════════════════════════════════════════
   SECTION 3: DOM ELEMENTS — cache semua referensi
═══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const UI = {
  // Header
  btnPromptPanel:    $('btnPromptPanel'),
  btnThemeToggle:    $('btnThemeToggle'),
  btnReset:          $('btnReset'),
  // Prompt Panel
  promptPanelOverlay:$('promptPanelOverlay'),
  btnClosePrompt:    $('btnClosePrompt'),
  promptLayersContainer: $('promptLayersContainer'),
  // KPI
  kpiTotal:          $('kpiTotal'),
  kpiDeadline:       $('kpiDeadline'),
  kpiProgress:       $('kpiProgress'),
  // Task list
  taskList:          $('taskList'),
  taskCountBadge:    $('taskCountBadge'),
  emptyTaskState:    $('emptyTaskState'),
  // Study plan
  studyPlanGrid:     $('studyPlanGrid'),
  btnGeneratePlan:   $('btnGeneratePlan'),
  emptyPlanState:    $('emptyPlanState'),
  // Chat
  messageFeed:       $('messageFeed'),
  welcomeState:      $('welcomeState'),
  typingIndicator:   $('typingIndicator'),
  chatForm:          $('chatForm'),
  chatInput:         $('chatInput'),
  btnSend:           $('btnSend'),
  agentStatus:       $('agentStatus'),
  // Toast
  errorToast:        $('errorToast'),
  errorToastMsg:     $('errorToastMsg'),
  btnToastClose:     $('btnToastClose')
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 4: HELPERS
═══════════════════════════════════════════════════════════════ */

/** Format tanggal ke "Senin, 11 Nov 2026" */
function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Hitung hari tersisa */
function daysUntil(date) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d   = new Date(date); d.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}

/** Waktu sekarang format HH:MM */
function nowTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/** Escape HTML untuk keamanan */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Generate ID unik */
function genId() { return 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2,7); }

/* ═══════════════════════════════════════════════════════════════
   SECTION 5: INTENT ENGINE — rule-based NLP
═══════════════════════════════════════════════════════════════ */

/** Deteksi intent dari teks input user */
function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const [intentKey, intent] of Object.entries(INTENT_PATTERNS)) {
    if (intent.keywords.some(kw => lower.includes(kw))) {
      return intentKey;
    }
  }
  return 'unknown';
}

/** Ekstrak nama tugas sederhana dari teks */
function extractTaskName(text) {
  // Coba ekstrak frasa setelah kata kunci
  const cleaned = text
    .replace(/tambah(kan)?\s*(tugas)?\s*/i, '')
    .replace(/deadline.*$/i, '')
    .replace(/prioritas\s*(tinggi|sedang|rendah)?/i, '')
    .trim();
  return cleaned || null;
}

/** Ekstrak deadline dari teks */
function extractDeadline(text) {
  const lower = text.toLowerCase();
  const today = new Date();

  if (/besok/.test(lower)) return offsetDate(1);
  if (/lusa/.test(lower)) return offsetDate(2);
  if (/minggu\s*depan|seminggu\s*lagi/.test(lower)) return offsetDate(7);
  if (/2\s*hari/.test(lower)) return offsetDate(2);
  if (/3\s*hari/.test(lower)) return offsetDate(3);
  if (/jumat|jum.at/.test(lower)) {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() + ((5 - day + 7) % 7 || 7));
    return d;
  }
  if (/senin/.test(lower)) {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() + ((1 - day + 7) % 7 || 7));
    return d;
  }
  if (/sabtu/.test(lower)) {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() + ((6 - day + 7) % 7 || 7));
    return d;
  }
  return null;
}

/** Ekstrak prioritas dari teks */
function extractPriority(text) {
  const lower = text.toLowerCase();
  if (/tinggi|urgent|penting|segera/.test(lower)) return 'tinggi';
  if (/rendah|santai|nanti/.test(lower)) return 'rendah';
  return 'sedang';
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 6: AGENT RESPONSE GENERATORS
   Setiap fungsi mengikuti Layer D Output Format:
   1) Ringkasan, 2) Langkah bernomor, 3) Next Action
═══════════════════════════════════════════════════════════════ */

/** Intent: tambah tugas */
function handleTambahTugas(text) {
  const taskName = extractTaskName(text);
  const deadline  = extractDeadline(text);
  const priority  = extractPriority(text);

  // Guardrail Layer C: jika tidak ada deadline, tanya dulu
  if (!deadline && !text.toLowerCase().includes('besok') && taskName && taskName.length > 3) {
    return {
      text: `Oke, aku catat tugas "<strong>${escapeHtml(taskName)}</strong>"!\n\n` +
            `Tapi deadline-nya kapan ya? Biar aku bisa bantu jadwalkan waktu belajarnya dengan tepat.`,
      addTask: null,
      nextAction: '➡️ Langkah berikutnya: Balas dengan deadline-nya, contoh: "besok", "Jumat", atau "3 hari lagi".'
    };
  }

  // Buat tugas baru
  const finalName = (taskName && taskName.length > 3) ? taskName : 'Tugas baru';
  const newTask = {
    id: genId(),
    name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
    course: 'Umum',
    deadline: deadline || offsetDate(7),
    priority,
    done: false
  };

  return {
    text: `Siap! Tugas baru sudah aku tambahkan ke daftar. 📋`,
    addTask: newTask,
    steps: [
      `Nama: <strong>${escapeHtml(newTask.name)}</strong>`,
      `Deadline: <strong>${formatDate(newTask.deadline)}</strong>`,
      `Prioritas: <strong>${newTask.priority.toUpperCase()}</strong>`
    ],
    nextAction: '➡️ Langkah berikutnya: Klik "Generate" di panel Jadwal Belajar agar aku distribusikan waktu belajarnya!'
  };
}

/** Intent: buat jadwal belajar */
function handleBuatJadwal() {
  const activeTasks = state.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) {
    return {
      text: 'Kamu belum punya tugas aktif nih. Tambahkan tugas dulu biar aku bisa buatkan jadwal yang pas!',
      nextAction: '➡️ Langkah berikutnya: Gunakan tombol "Tambah Tugas Baru" untuk mulai mencatat tugasmu.'
    };
  }

  // Generate jadwal
  generateStudyPlan();

  const sorted = [...activeTasks].sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  const steps = sorted.slice(0, 5).map((t, i) =>
    `${t.name} — ${formatDate(t.deadline)} (${t.priority})`
  );

  return {
    text: `Jadwal belajar mingguan sudah aku buat berdasarkan <strong>${activeTasks.length} tugas aktif</strong>-mu! Aku prioritaskan yang deadline-nya paling dekat dan tingkat kesulitannya lebih tinggi.`,
    steps,
    nextAction: '➡️ Langkah berikutnya: Cek panel "Jadwal Belajar" di sidebar untuk melihat rencana per harinya.'
  };
}

/** Intent: prioritas tugas */
function handlePrioritas() {
  const activeTasks = state.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) {
    return {
      text: 'Daftar tugasmu kosong! Belum ada yang perlu diprioritaskan.',
      nextAction: '➡️ Langkah berikutnya: Tambahkan tugas-tugasmu agar aku bisa bantu mengurutkan prioritasnya.'
    };
  }

  // Urutkan: prioritas tinggi + deadline terdekat dulu
  const priorityScore = { tinggi: 3, sedang: 2, rendah: 1 };
  const sorted = [...activeTasks].sort((a, b) => {
    const pDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const steps = sorted.map((t, i) => {
    const days = daysUntil(t.deadline);
    const urgency = days <= 1 ? '🔴' : days <= 3 ? '🟠' : '🟡';
    return `${urgency} ${t.name} <span style="color:var(--text-muted)">(${days} hari lagi · ${t.priority})</span>`;
  });

  return {
    text: `Ini urutan prioritas tugas-tugasmu berdasarkan deadline + kepentingan. Fokus dulu ke yang 🔴 dan 🟠!`,
    steps,
    nextAction: `➡️ Langkah berikutnya: Mulai dari "<strong>${escapeHtml(sorted[0].name)}</strong>" — paling mendesak sekarang!`
  };
}

/** Intent: ringkas materi */
function handleRingkas(text) {
  // Cek apakah user menyebut topik
  const topicMatch = text
    .toLowerCase()
    .replace(/ringkas(kan)?|rangkum(kan)?|summarize|poin penting|intinya|simpulkan/gi, '')
    .replace(/materi|bab|tentang/gi, '')
    .trim();

  const topic = topicMatch.length > 2 ? topicMatch : null;

  if (!topic) {
    return {
      text: 'Tentu! Aku siap meringkas materi. Topik atau teks mana yang ingin kamu ringkas?',
      nextAction: '➡️ Langkah berikutnya: Ketik atau tempel teks/topik yang ingin diringkas, misalnya "ringkas materi Hukum Newton".'
    };
  }

  // Mock ringkasan berdasarkan topik
  const summaries = {
    default: [
      `Definisi dan konsep dasar ${topic}`,
      `Prinsip-prinsip utama yang berlaku`,
      `Contoh penerapan dalam kehidupan nyata`,
      `Hubungan dengan konsep lain yang terkait`,
      `Rumus atau formula kunci (jika ada)`
    ]
  };

  const steps = summaries.default.map(s => s.replace(topic, `<strong>${escapeHtml(topic)}</strong>`));

  return {
    text: `Ini poin-poin inti yang perlu kamu kuasai dari topik <strong>"${escapeHtml(topic)}"</strong>:`,
    steps,
    nextAction: `➡️ Langkah berikutnya: Buat catatan ringkas dari 5 poin ini, lalu coba jelaskan ulang dengan kata-katamu sendiri.`
  };
}

/** Intent: pengingat deadline */
function handlePengingat() {
  const activeTasks = state.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) {
    return {
      text: 'Tidak ada tugas aktif yang perlu diingatkan! Semuanya sudah selesai? Hebat! 🎉',
      nextAction: '➡️ Langkah berikutnya: Tambahkan tugas baru jika ada yang belum tercatat.'
    };
  }

  const sorted = [...activeTasks].sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  const urgent = sorted.filter(t => daysUntil(t.deadline) <= 3);
  const steps = sorted.slice(0, 6).map(t => {
    const days = daysUntil(t.deadline);
    const emoji = days <= 1 ? '🚨' : days <= 3 ? '⚠️' : '📌';
    const label = days === 0 ? 'HARI INI!' : days === 1 ? 'besok' : `${days} hari lagi`;
    return `${emoji} <strong>${escapeHtml(t.name)}</strong> — <span style="color:var(--text-muted)">${label} (${formatDate(t.deadline)})</span>`;
  });

  const intro = urgent.length > 0
    ? `⚠️ Ada <strong>${urgent.length} tugas mendesak</strong> yang deadline-nya dalam 3 hari ke depan. Segera dikerjakan ya!`
    : `Semua deadline masih aman. Tapi jangan santai dulu, tetap cicil tugasmu!`;

  return {
    text: intro,
    steps,
    nextAction: `➡️ Langkah berikutnya: Buka jadwal belajar dan alokasikan minimal 1 jam hari ini untuk "${escapeHtml(sorted[0].name)}".`
  };
}

/** Intent tidak dikenali */
function handleUnknown(text) {
  const greetings = /halo|hai|hei|hello|hi|selamat/i;
  if (greetings.test(text)) {
    return {
      text: `Hei! Aku StudyPilot, asisten belajar AI-mu. 👋 Senang bisa membantu!`,
      nextAction: '➡️ Langkah berikutnya: Coba salah satu tombol cepat di bawah, atau ceritakan tugas apa yang ingin kamu kelola.'
    };
  }

  // Guardrail Layer C: tolak off-topic dengan sopan
  return {
    text: `Maaf, sepertinya pertanyaan itu di luar bidangku. Aku hanya bisa membantu urusan belajar dan tugas kuliahmu. 😊`,
    nextAction: '➡️ Langkah berikutnya: Coba tanya sesuatu seperti "tugas apa yang paling mendesak?" atau "buatkan jadwal belajarku".'
  };
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 7: STUDY PLAN GENERATOR
═══════════════════════════════════════════════════════════════ */

const DAYS_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function generateStudyPlan() {
  const activeTasks = state.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) {
    UI.studyPlanGrid.innerHTML = '';
    UI.emptyPlanState.classList.remove('hidden');
    return;
  }

  // Urutkan tugas berdasarkan deadline dan prioritas
  const priorityScore = { tinggi: 3, sedang: 2, rendah: 1 };
  const sorted = [...activeTasks].sort((a, b) => {
    const dDiff = new Date(a.deadline) - new Date(b.deadline);
    if (dDiff !== 0) return dDiff;
    return priorityScore[b.priority] - priorityScore[a.priority];
  });

  // Distribusikan ke 7 hari ke depan
  const today = new Date(); today.setHours(0,0,0,0);
  const plan = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toDateString();
    plan[key] = { label: DAYS_ID[d.getDay()], date: d, items: [] };
  }

  // Assign tugas — setiap tugas dapat slot sesuai deadline proximity
  sorted.forEach((task, idx) => {
    const daysLeft = Math.max(0, daysUntil(task.deadline));
    const slotDay  = Math.min(daysLeft, 6); // Mulai belajar hari sebelum deadline
    const startDay = Math.max(0, slotDay - 1);

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + startDay);
    const key = targetDate.toDateString();

    if (plan[key]) {
      plan[key].items.push(`${task.name} (${task.priority})`);
    }
  });

  // Render
  UI.emptyPlanState.classList.add('hidden');
  UI.studyPlanGrid.innerHTML = '';

  Object.values(plan).forEach(day => {
    if (day.items.length === 0) return;
    const card = document.createElement('div');
    card.className = 'plan-day-card';
    const isToday = day.date.toDateString() === today.toDateString();
    card.innerHTML = `
      <div class="plan-day-label">${isToday ? '📍 ' : ''}${day.label}, ${day.date.getDate()} ${day.date.toLocaleDateString('id-ID', {month:'short'})}</div>
      <div class="plan-items">
        ${day.items.map(item => `<div class="plan-item">${escapeHtml(item)}</div>`).join('')}
      </div>
    `;
    UI.studyPlanGrid.appendChild(card);
  });

  if (UI.studyPlanGrid.children.length === 0) {
    UI.emptyPlanState.classList.remove('hidden');
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 8: RENDER — UI rendering functions
═══════════════════════════════════════════════════════════════ */

/** Render daftar tugas di sidebar */
function renderTaskList() {
  const tasks = state.tasks;
  UI.taskList.innerHTML = '';

  if (tasks.length === 0) {
    UI.emptyTaskState.classList.remove('hidden');
    UI.taskCountBadge.textContent = '0';
    return;
  }

  UI.emptyTaskState.classList.add('hidden');
  const active = tasks.filter(t => !t.done).length;
  UI.taskCountBadge.textContent = active;

  // Urutkan: belum selesai + deadline terdekat dulu
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.setAttribute('role', 'listitem');
    li.dataset.id = task.id;

    const days = daysUntil(task.deadline);
    const deadlineText = task.done ? formatDate(task.deadline) :
      days === 0 ? '🔴 Hari ini!' :
      days === 1 ? '🟠 Besok' :
      days <= 3  ? `🟠 ${days} hari lagi` :
                   `${formatDate(task.deadline)}`;

    li.innerHTML = `
      <div class="task-checkbox" aria-hidden="true">
        <span class="task-check-icon">✓</span>
      </div>
      <div class="task-body">
        <div class="task-name">${escapeHtml(task.name)}</div>
        <div class="task-meta">
          <span class="task-course">${escapeHtml(task.course)}</span>
          <span class="task-deadline">${deadlineText}</span>
          <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        </div>
      </div>
    `;

    li.addEventListener('click', () => toggleTaskDone(task.id));
    li.setAttribute('aria-label', `${task.name}, deadline ${formatDate(task.deadline)}, ${task.done ? 'selesai' : 'belum selesai'}`);
    UI.taskList.appendChild(li);
  });
}

/** Update KPI cards */
function renderKPIs() {
  const tasks = state.tasks;
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const active = tasks.filter(t => !t.done);
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  UI.kpiTotal.textContent    = total;
  UI.kpiProgress.textContent = pct + '%';

  if (active.length === 0) {
    UI.kpiDeadline.textContent = '—';
    return;
  }

  const nearest = active.sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];
  const days = daysUntil(nearest.deadline);
  UI.kpiDeadline.textContent = days === 0 ? 'Hari ini' : days === 1 ? 'Besok' : `${days} hr`;
}

/** Render seluruh sidebar */
function renderSidebar() {
  renderKPIs();
  renderTaskList();
}

/** Render panel prompt dari agent-prompts.js */
function renderPromptPanel() {
  const layers = [
    AGENT_PROMPTS.layerA_identity,
    AGENT_PROMPTS.layerB_capabilities,
    AGENT_PROMPTS.layerC_rules,
    AGENT_PROMPTS.layerD_outputFormat
  ];

  const colors = ['#0A7C6E', '#F59E0B', '#EF4444', '#7C3AED'];

  UI.promptLayersContainer.innerHTML = layers.map((layer, i) => `
    <div class="prompt-layer-card" id="promptLayer${i}">
      <div class="prompt-layer-header" role="button" aria-expanded="false" tabindex="0"
           onclick="togglePromptLayer(${i})"
           onkeydown="if(event.key==='Enter'||event.key===' ')togglePromptLayer(${i})">
        <div>
          <div class="prompt-layer-title" style="color:${colors[i]}">${escapeHtml(layer.label)}</div>
          <div class="prompt-layer-desc">${escapeHtml(layer.description)}</div>
        </div>
        <span class="prompt-layer-toggle">▾</span>
      </div>
      <div class="prompt-layer-body">
        <pre class="prompt-code">${escapeHtml(layer.prompt)}</pre>
      </div>
    </div>
  `).join('');

  // Buka layer pertama secara default
  const first = document.getElementById('promptLayer0');
  if (first) {
    first.classList.add('open');
    first.querySelector('.prompt-layer-header').setAttribute('aria-expanded', 'true');
  }
}

function togglePromptLayer(idx) {
  const card = document.getElementById(`promptLayer${idx}`);
  if (!card) return;
  const isOpen = card.classList.contains('open');
  card.classList.toggle('open', !isOpen);
  card.querySelector('.prompt-layer-header').setAttribute('aria-expanded', String(!isOpen));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 9: CHAT ENGINE
═══════════════════════════════════════════════════════════════ */

/** Tampilkan pesan di feed */
function appendMessage(role, content, timestamp) {
  // Sembunyikan welcome state saat pesan pertama
  if (UI.welcomeState && !UI.welcomeState.classList.contains('hidden')) {
    UI.welcomeState.classList.add('hidden');
  }

  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const time = timestamp || nowTime();

  if (role === 'agent') {
    row.innerHTML = `
      <div class="agent-bubble-avatar" aria-hidden="true">🎓</div>
      <div>
        <div class="bubble">${content}</div>
        <div class="bubble-time">${time}</div>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div>
        <div class="bubble">${escapeHtml(content)}</div>
        <div class="bubble-time">${time}</div>
      </div>
    `;
  }

  // Sisipkan sebelum typing indicator agar urut
  UI.messageFeed.insertBefore(row, UI.typingIndicator);
  scrollToBottom();
}

/** Format respons agent menjadi HTML bubble */
function formatAgentResponse(response) {
  let html = `<p>${response.text}</p>`;

  if (response.steps && response.steps.length > 0) {
    html += `<ol>${response.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
  }

  if (response.nextAction) {
    html += `<div class="next-action">${response.nextAction}</div>`;
  }

  return html;
}

/** Proses input user → tentukan intent → hasilkan respons */
function processUserMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Tampilkan pesan user
  appendMessage('user', trimmed);
  state.messages.push({ role: 'user', text: trimmed, time: nowTime() });

  // Set typing state
  showTyping(true);

  // Simulate agent "thinking" delay
  const delay = 800 + Math.random() * 600;
  setTimeout(() => {
    showTyping(false);

    const intent = detectIntent(trimmed);
    let response;

    switch (intent) {
      case 'tambahTugas':
        response = handleTambahTugas(trimmed);
        if (response.addTask) {
          state.tasks.push(response.addTask);
          renderSidebar();
          generateStudyPlan();
        }
        break;
      case 'buatJadwal':
        response = handleBuatJadwal();
        break;
      case 'prioritasTugas':
        response = handlePrioritas();
        break;
      case 'ringkasMateri':
        response = handleRingkas(trimmed);
        break;
      case 'pengingatDeadline':
        response = handlePengingat();
        break;
      default:
        response = handleUnknown(trimmed);
    }

    const html = formatAgentResponse(response);
    appendMessage('agent', html);
    state.messages.push({ role: 'agent', text: response.text, time: nowTime() });

  }, delay);
}

/** Tampilkan/sembunyi typing indicator */
function showTyping(show) {
  state.isTyping = show;
  UI.typingIndicator.classList.toggle('hidden', !show);
  if (show) scrollToBottom();
}

/** Scroll chat ke bawah */
function scrollToBottom() {
  UI.messageFeed.scrollTop = UI.messageFeed.scrollHeight;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 10: TASK ACTIONS
═══════════════════════════════════════════════════════════════ */

function toggleTaskDone(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  renderSidebar();
  generateStudyPlan();
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 11: ERROR HANDLING
═══════════════════════════════════════════════════════════════ */

function showError(msg) {
  UI.errorToastMsg.textContent = msg;
  UI.errorToast.classList.remove('hidden');
  setTimeout(() => hideError(), 5000);
}

function hideError() {
  UI.errorToast.classList.add('hidden');
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 12: THEME TOGGLE
═══════════════════════════════════════════════════════════════ */

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('studypilot-theme', theme); } catch(e) {}
}

function toggleTheme() {
  setTheme(state.theme === 'light' ? 'dark' : 'light');
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 13: RESET DEMO
═══════════════════════════════════════════════════════════════ */

function resetDemo() {
  // Reset state
  state.tasks = deepClone(DUMMY_TASKS);
  state.messages = [];

  // Clear chat
  const rows = UI.messageFeed.querySelectorAll('.message-row');
  rows.forEach(r => r.remove());

  // Tampilkan welcome kembali
  UI.welcomeState.classList.remove('hidden');
  UI.typingIndicator.classList.add('hidden');

  // Re-render
  renderSidebar();
  generateStudyPlan();
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 14: AUTO-RESIZE TEXTAREA
═══════════════════════════════════════════════════════════════ */

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 15: EVENT LISTENERS
═══════════════════════════════════════════════════════════════ */

function bindEvents() {
  // ── Chat Form Submit ──
  UI.chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = UI.chatInput.value.trim();
    if (!text || state.isTyping) return;
    processUserMessage(text);
    UI.chatInput.value = '';
    UI.chatInput.style.height = 'auto';
  });

  // ── Enter to send, Shift+Enter for newline ──
  UI.chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      UI.chatForm.dispatchEvent(new Event('submit'));
    }
  });
  UI.chatInput.addEventListener('input', () => autoResize(UI.chatInput));

  // ── Quick action buttons ──
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const intentKey = btn.dataset.intent;
      const intent = INTENT_PATTERNS[intentKey];
      if (!intent) return;
      processUserMessage(intent.quickAction);
    });
  });

  // ── Welcome chips ──
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.quick;
      if (text) processUserMessage(text);
    });
  });

  // ── Theme toggle ──
  UI.btnThemeToggle.addEventListener('click', toggleTheme);

  // ── Reset demo ──
  UI.btnReset.addEventListener('click', () => {
    if (confirm('Reset semua data ke demo awal?')) resetDemo();
  });

  // ── Prompt panel open ──
  UI.btnPromptPanel.addEventListener('click', () => {
    renderPromptPanel();
    UI.promptPanelOverlay.classList.remove('hidden');
    // Focus trap: fokus ke tombol tutup agar keyboard navigasi berfungsi
    setTimeout(() => UI.btnClosePrompt.focus(), 50);
  });

  // ── Prompt panel close ──
  UI.btnClosePrompt.addEventListener('click', () => {
    UI.promptPanelOverlay.classList.add('hidden');
  });

  // ── Close modal on backdrop click ──
  UI.promptPanelOverlay.addEventListener('click', e => {
    if (e.target === UI.promptPanelOverlay) {
      UI.promptPanelOverlay.classList.add('hidden');
    }
  });

  // ── Close modal on Escape ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !UI.promptPanelOverlay.classList.contains('hidden')) {
      UI.promptPanelOverlay.classList.add('hidden');
    }
  });

  // ── Generate study plan button ──
  UI.btnGeneratePlan.addEventListener('click', () => {
    generateStudyPlan();
    processUserMessage('Buat jadwal belajar');
  });

  // ── Error toast close ──
  UI.btnToastClose.addEventListener('click', hideError);

  // ── Task item toggle (also rendered dynamically — handled in renderTaskList) ──
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 16: BOOT — inisialisasi aplikasi
═══════════════════════════════════════════════════════════════ */

function init() {
  // Muat preferensi tema
  try {
    const savedTheme = localStorage.getItem('studypilot-theme');
    if (savedTheme) setTheme(savedTheme);
  } catch(e) {}

  // Render awal
  renderSidebar();
  generateStudyPlan();

  // Bind semua event
  bindEvents();

  // Pesan sambutan dari agent setelah 1 detik
  setTimeout(() => {
    appendMessage('agent',
      formatAgentResponse({
        text: 'Hei! Selamat datang di <strong>StudyPilot</strong>. 🎓 Aku sudah memuat <strong>8 tugas demo</strong> untukmu.',
        steps: [
          'Lihat daftar tugas di sidebar kiri',
          'Cek dashboard untuk statistik tugasmu',
          'Gunakan tombol cepat di bawah atau ketik langsung'
        ],
        nextAction: '➡️ Langkah berikutnya: Coba klik "🔥 Prioritas" untuk melihat tugas mana yang paling mendesak!'
      })
    );
  }, 1000);
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', init);
