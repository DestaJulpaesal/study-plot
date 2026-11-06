# StudyPilot — Asisten Belajar AI 🎓

> AI Agent untuk mahasiswa Indonesia dalam mengelola tugas, deadline, dan jadwal belajar.
> Dibuat untuk IBM AI Builders Final Project.

---

## Deskripsi

StudyPilot adalah AI Agent berbasis web yang membantu mahasiswa Indonesia mengelola kehidupan akademiknya dengan lebih cerdas. Agent ini memahami 5 intent utama pengguna dan merespons dengan panduan terstruktur yang selalu berakhir dengan satu langkah konkret.

**Dibangun dengan:** Vanilla HTML + CSS + JavaScript — tanpa framework, tanpa library eksternal, tanpa API key. Cukup buka `index.html` di browser.

---

## Fitur Utama

### 🤖 AI Agent
- **5 Intent Handler**: Tambah tugas, buat jadwal belajar, prioritaskan tugas, ringkas materi, cek deadline
- **Arsitektur Prompt 4 Layer**: Identity → Capabilities → Rules & Guardrails → Output Format
- **Panel "Lihat Prompt Agent"**: Tampilkan struktur prompt untuk transparansi kepada juri
- **Typing indicator** dan animasi percakapan yang natural

### 📊 Dashboard
- **3 KPI Cards**: Total tugas, deadline terdekat, persentase selesai
- **Daftar tugas** dengan badge prioritas dan status deadline real-time
- **Weekly Study Plan Generator**: distribusi tugas otomatis ke 7 hari ke depan

### 🎨 UI/UX
- Glassmorphism design dengan palet Teal (#0A7C6E) + Amber (#F59E0B)
- Dark / Light mode toggle dengan preferensi tersimpan
- Fully responsive dari 375px hingga 1440px+
- Quick action buttons untuk semua 5 intent
- Empty state, error toast, dan tombol "Reset Demo"

---

## Cara Menjalankan

1. **Clone atau unduh** repository ini.
2. **Buka** file `index.html` langsung di browser (Chrome / Firefox / Edge modern).
3. Tidak diperlukan server, build process, atau instalasi apa pun.

```bash
# Opsi: jalankan via server lokal (opsional)
npx serve .
# atau
python -m http.server 8080
```

---

## Struktur Folder

```
studypilot/
├── index.html               # Struktur HTML utama
├── style.css                # Design system: CSS variables, glassmorphism, responsive
├── script.js                # Engine utama: state, intent handlers, render, events
├── agent-prompts.js         # Arsitektur prompt 4 layer + definisi intent
├── PROJECT_DOCUMENTATION.md # Dokumentasi lengkap Bahasa Indonesia (untuk form IBM)
└── README.md                # File ini
```

---

## Arsitektur Prompt Agent

File `agent-prompts.js` memuat seluruh definisi perilaku agent dalam objek `AGENT_PROMPTS`:

| Layer | Nama | Fungsi |
|---|---|---|
| A | Identitas | Persona, nama, dan gaya komunikasi agent |
| B | Kemampuan | 5 fungsi yang bisa dilakukan agent |
| C | Aturan & Batasan | Guardrails: no hallucination, ask deadline, refuse off-topic |
| D | Format Output | Struktur wajib: ringkasan → langkah → next action |

---

## Intent yang Didukung

| Intent | Kata Kunci Pemicu | Contoh Input |
|---|---|---|
| Tambah Tugas | "tambah tugas", "deadline", "submit" | "Tambah tugas kalkulus deadline Jumat" |
| Buat Jadwal | "buat jadwal", "atur waktu", "plan" | "Buatkan jadwal belajar minggu ini" |
| Prioritas Tugas | "prioritas", "mana dulu", "mendesak" | "Tugas mana yang paling mendesak?" |
| Ringkas Materi | "ringkas", "rangkum", "poin penting" | "Ringkas materi Hukum Newton" |
| Cek Deadline | "ingatkan", "deadline mana", "besok" | "Deadline apa yang sudah dekat?" |

---

## Data Demo

8 tugas realistis mahasiswa sudah dimuat saat aplikasi dibuka:
- Laporan Praktikum Kimia Dasar
- Makalah Pancasila & Kewarganegaraan
- Tugas Besar Kalkulus — Integral Tertentu
- Quiz Online Pemrograman Dasar
- Resume Bab 3 Pengantar Ekonomi *(sudah selesai)*
- Presentasi Kelompok Bahasa Inggris
- Jawab Soal Latihan Fisika Bab 4
- Ringkasan Sejarah Kebudayaan Islam

---

## Screenshots

> *Tambahkan screenshot di sini setelah menjalankan aplikasi.*

| Light Mode | Dark Mode |
|---|---|
| `[screenshot-light.png]` | `[screenshot-dark.png]` |

---

## Teknologi

- **HTML5** — Semantic markup, ARIA labels, keyboard navigation
- **CSS3** — Custom properties, glassmorphism, CSS Grid/Flexbox, responsive
- **Vanilla JavaScript (ES2020)** — Rule-based NLP, state management, DOM manipulation

---

## Pembuat

Dibuat dengan ❤️ untuk **IBM AI Builders Final Project**
Bahasa antarmuka: Bahasa Indonesia
Target pengguna: Mahasiswa aktif di Indonesia
