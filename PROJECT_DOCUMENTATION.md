# Dokumentasi Project StudyPilot
**IBM AI Builders — Final Project**
*Bahasa: Indonesia*

---

## 1. Ringkasan Project

**StudyPilot** adalah AI Agent berbasis web yang dirancang khusus untuk membantu mahasiswa Indonesia mengelola tugas akademik, memantau deadline, dan menyusun jadwal belajar secara cerdas. Proyek ini dibangun sebagai solusi all-in-one yang dapat diakses langsung dari browser tanpa instalasi apa pun.

Agent ini bekerja dengan pendekatan *rule-based conversational AI* yang dipandu oleh arsitektur prompt 4 layer: Identitas, Kemampuan, Aturan & Batasan, dan Format Output. StudyPilot mampu mendeteksi 5 intent utama pengguna — menambah tugas, membuat jadwal belajar, memprioritaskan tugas, meringkas materi, dan memberikan pengingat deadline — lalu merespons dengan panduan langkah-langkah konkret yang selalu diakhiri dengan satu tindakan nyata yang bisa langsung dilakukan.

---

## 2. Problem Statement

### Masalah

Mahasiswa Indonesia, terutama di semester awal, sering kali kewalahan mengelola beban akademik yang datang dari berbagai mata kuliah sekaligus. Tugas menumpuk tanpa sistem prioritas yang jelas, deadline terlewat karena tidak ada pengingat terpusat, dan waktu belajar tidak terencana dengan baik sehingga sering belajar "sistem kebut semalam" (SKS).

### Kondisi Saat Ini

Sebagian besar mahasiswa mengandalkan catatan fisik, chat WhatsApp, atau aplikasi to-do generik (seperti Google Keep atau Notion) yang tidak memahami konteks akademik. Tidak ada sistem yang:
- Secara otomatis memprioritaskan tugas berdasarkan deadline DAN tingkat kepentingan.
- Menghasilkan jadwal belajar yang disesuaikan dengan tenggat waktu.
- Bisa diajak berdialog untuk meminta bantuan perencanaan.

### Dampak Jika Tidak Diatasi

- Nilai tugas menurun akibat pengerjaan terburu-buru.
- Stres dan kecemasan akademik meningkat.
- Kebiasaan belajar yang tidak produktif terbawa hingga semester lanjut.
- Potensi akademis mahasiswa tidak tercapai secara optimal.

---

## 3. Target Pengguna

### Profil Utama

| Atribut | Deskripsi |
|---|---|
| **Peran** | Mahasiswa aktif perguruan tinggi di Indonesia |
| **Tingkat** | Semester 1–4 (mahasiswa baru hingga pertengahan studi) |
| **Karakteristik** | Digital native, terbiasa chat, butuh bantuan organisasi akademik |
| **Kebutuhan utama** | Manajemen tugas, pengingat deadline, jadwal belajar |
| **Pain point** | Terlalu banyak tugas, deadline bertabrakan, tidak tahu harus mulai dari mana |
| **Akses teknologi** | Laptop/HP dengan browser modern |

### Profil Sekunder

- **Mahasiswa Tingkat Akhir** yang perlu mengatur riset, skripsi, dan sidang secara paralel.
- **Mahasiswa Part-Time** yang harus membagi waktu antara kuliah dan pekerjaan.

---

## 4. Arsitektur Prompt / Prompt Layering

StudyPilot menggunakan arsitektur **4-Layer Prompt System** yang tersimpan di file `agent-prompts.js`. Setiap layer memiliki tanggung jawab yang berbeda dan terpisah secara konseptual.

### Layer A — Identitas Agent

**Tujuan:** Mendefinisikan *persona*, nama, dan gaya komunikasi agent.

**Isi Prompt:**
> "Kamu adalah StudyPilot, asisten belajar AI untuk mahasiswa Indonesia... Gaya komunikasimu: ramah, ringkas, langsung ke poin, menggunakan Bahasa Indonesia yang santai namun sopan."

**Mengapa penting:** Konsistensi persona membangun kepercayaan pengguna. Agent yang terasa "manusiawi" dan konsisten lebih mudah diadopsi.

---

### Layer B — Kemampuan Agent

**Tujuan:** Mendefinisikan scope fungsional — apa yang *bisa* dan *siap* dilakukan agent.

**5 Kemampuan Utama:**
1. Tambah dan catat tugas baru dengan detail lengkap.
2. Buat jadwal belajar mingguan berbasis deadline dan prioritas.
3. Analisis dan urutkan tugas dari yang paling mendesak.
4. Ringkas materi/topik menjadi poin-poin utama.
5. Ingatkan deadline yang mendekati batas waktu.

**Mengapa penting:** Membatasi ekspektasi pengguna secara transparan dan memastikan agent tidak mencoba melakukan hal di luar kapasitasnya.

---

### Layer C — Aturan & Batasan (Guardrails)

**Tujuan:** Menjaga agent tetap akurat, relevan, aman, dan tidak berlebihan.

**6 Aturan Kunci:**
1. **Jangan fabrikasi fakta** — hanya gunakan data dari input pengguna.
2. **Tanya deadline** jika pengguna ingin menambah tugas tanpa menyebut deadline.
3. **Satu pertanyaan klarifikasi** jika input ambigu — tidak boleh lebih.
4. **Tolak off-topic** dengan sopan dan redirect ke fungsi utama.
5. Jangan berikan saran medis, hukum, atau finansial.
6. Hormati privasi; jangan minta data di luar kebutuhan fungsional.

**Mengapa penting:** Guardrails adalah perbedaan antara agent yang *berguna* dan yang *berbahaya*. Layer ini mencegah halusinasi dan penyalahgunaan.

---

### Layer D — Format Output

**Tujuan:** Memastikan setiap respons terstruktur, konsisten, dan *actionable*.

**Struktur Wajib Setiap Respons:**
1. **Ringkasan Singkat** (1–2 kalimat): konfirmasi pemahaman agent.
2. **Langkah Bernomor**: tindakan atau informasi dalam format list terurut.
3. **Next Action** (WAJIB): satu tindakan konkret yang bisa langsung dilakukan pengguna, diawali `➡️ Langkah berikutnya:`.

**Mengapa penting:** Format yang konsisten meningkatkan *scanability* dan memastikan pengguna selalu tahu langkah selanjutnya — tidak pernah dibiarkan bingung.

---

## 5. Iterasi Prompt

Tabel ini mencatat perubahan yang dilakukan selama proses build dan self-review.

| Iterasi | Masalah yang Ditemukan | Layer yang Direvisi | Perubahan | Dampak |
|---|---|---|---|---|
| **v1.0** | Respons agent terlalu panjang dan bertele-tele | Layer A (Identitas) | Menambahkan instruksi eksplisit: "sampaikan inti pesan dalam 3–5 kalimat pertama" | Respons lebih ringkas dan mudah dibaca |
| **v1.1** | Agent menjawab pertanyaan off-topic (misalnya tentang cuaca) tanpa penolakan | Layer C (Aturan) | Menambahkan guardrail: tolak permintaan non-akademik dengan redirect sopan | Agent lebih fokus dan tidak menjawab di luar domain |
| **v1.2** | Format output tidak konsisten — kadang ada Next Action, kadang tidak | Layer D (Format Output) | Mengubah "Next Action" dari opsional menjadi **wajib** di setiap respons | Setiap respons kini selalu berakhir dengan arahan konkret |
| **v1.3** | Guardrail "tanya deadline" tidak aktif jika nama tugas terlalu pendek (<3 karakter) | Layer C (Aturan) | Menambahkan kondisi threshold panjang string pada intent handler `tambahTugas` di `script.js` | Tidak ada lagi false-positive pada guardrail deadline |
| **v1.4** | Tone agent terasa robotik saat menolak permintaan | Layer A (Identitas) | Menambahkan contoh frasa: "Maaf, aku hanya bisa membantu urusan belajar..." dengan nada hangat | Penolakan terasa lebih manusiawi dan tidak menyinggung |
| **v1.5** | Self-review: Panel Prompt tidak interaktif dan sulit dibaca | Layer D (Format Output) + UI | Mengubah panel menjadi accordion yang bisa dibuka/tutup per layer, dengan kode ditampilkan dalam `pre` block | Juri lebih mudah memahami arsitektur prompt tanpa kewalahan |
| **v1.6** | Self-review: Intent "ringkas materi" tidak memberikan nilai jika topik tidak disebut | Layer B (Kemampuan) + Layer C | Menambahkan conditional check: jika topik tidak ada, agent bertanya lebih dulu (satu pertanyaan klarifikasi) | Selaras dengan guardrail Layer C — agent tidak berasumsi |
| **v1.7** | Self-review: Tombol "Lihat Prompt" membuka panel tapi fokus keyboard tidak berpindah (aksesibilitas WCAG) | UI/Aksesibilitas | Mengubah `promptPanelOverlay.focus()` menjadi `btnClosePrompt.focus()` dengan delay 50ms setelah panel tampil | Panel prompt kini keyboard-navigable sejak pertama dibuka; isu WCAG 2.4.3 Focus Order teratasi |
| **v1.8** | Self-review: Tidak ada validasi visual saat intent "tambah tugas" dipanggil via quick-button (tanpa nama tugas) | Layer C (Aturan) + script.js | Intent handler `tambahTugas` menangani input pendek dengan menetapkan nama default "Tugas baru" untuk mencegah tugas terdaftar tanpa nama | Edge case tertutup; tidak ada tugas kosong di daftar |

---

## 6. Potensi Pengembangan Lanjutan

### Integrasi Teknologi

| Pengembangan | Deskripsi |
|---|---|
| **Integrasi LLM nyata** | Mengganti rule-based engine dengan API GPT-4o / Watsonx.ai untuk pemahaman intent yang lebih natural dan generasi konten dinamis |
| **Google Calendar / Notion Sync** | Sinkronisasi jadwal belajar yang dibuat StudyPilot langsung ke kalender pengguna |
| **Push Notification** | Implementasi browser notification atau SMS/WhatsApp reminder via Twilio untuk pengingat deadline real-time |
| **Backend & Auth** | Menambahkan user account dengan database (Supabase/Firebase) agar data tugas persisten antar perangkat |

### Fitur Baru

| Fitur | Deskripsi |
|---|---|
| **Analitik Belajar** | Dashboard visual yang menunjukkan pola produktivitas, mata kuliah paling banyak membutuhkan waktu, dan tren penyelesaian tugas |
| **Kolaborasi Kelompok** | Mode grup untuk tugas bersama — siapa mengerjakan apa, dengan deadline dan progress bersama |
| **Ringkasan Otomatis dari PDF** | Upload modul/buku ajar, agent otomatis mengekstrak poin-poin penting menggunakan LLM |
| **Pomodoro Timer Terintegrasi** | Timer Pomodoro yang tersinkron dengan jadwal belajar yang dibuat agent |
| **Voice Input** | Pengguna bisa menambah tugas dengan suara menggunakan Web Speech API |

### Peningkatan Kemampuan Agent

| Area | Deskripsi |
|---|---|
| **Multi-turn Memory** | Agent mengingat konteks percakapan sebelumnya dalam satu sesi (saat ini setiap pesan diproses independen) |
| **Personalisasi** | Agent belajar dari pola belajar pengguna — jam produktif, mata kuliah favorit, estimasi durasi pengerjaan |
| **Prompt Versioning** | Sistem A/B testing untuk mengoptimalkan prompt berdasarkan feedback pengguna secara terukur |
| **Multi-bahasa** | Dukungan bahasa daerah (Jawa, Sunda, Batak, dll.) untuk mahasiswa yang lebih nyaman dengan bahasa ibu |
