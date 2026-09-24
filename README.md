# VisualStyle Studio 🎨 (Native Desktop & Visual Web Builder)

> **Native Offline-First Desktop Utility for Visual Web Styling, Sandbox Prototyping & CSS Animation Injection**  
> Dirancang sebagai **aplikasi desktop native (standalone window)** dan workbench visual untuk pengembang web, desainer, dan siswa agar dapat mendesain tata letak, melakukan penyesuaian gaya CSS, color grading, gradient tuning, dan animasi visual secara presisi langsung di atas *live preview* interaktif.

---

## 🚀 Fitur Unggulan

### 1. 📱 Responsive Device Viewport Preview
- **Multi-Device Testing Switcher**: Beralih instan antara mode **Desktop** (100% fluid), **Laptop** (1024px), **Tablet** (768px), dan **Mobile** (375px).
- **Scale & Zoom Control**: Dilengkapi tombol zoom (50%, 75%, 100%, 125%) untuk memastikan tata letak responsif dapat dipantau dengan jelas di berbagai resolusi layar monitor.
- **Realistic Device Frame**: Bingkai preview perangkat yang elegan dengan scrollbar terisolasi dan indikator dimensi piksel aktif.

### 2. 🧩 Figma-like Sandbox Visual Builder
- **Drag-and-Drop & Click-to-Add Components**: Bangun halaman web langsung dari kanvas kosong tanpa mengetik kode awal:
  - Kotak & Kontainer (*Container / Flex Card*)
  - Kartu Profil & Produk (*Feature Cards*)
  - Tipografi (*Headings, Paragraphs, Badges*)
  - Tombol Interaktif (*Primary, Secondary, Gradient CTA*)
  - Gambar & Placeholder Media
  - Formulir Masukan (*Input Fields*)
- **Inline Text Editing**: Klik dua kali teks mana pun di sandbox untuk langsung mengedit konten teksnya secara *live*.
- **Direct Canvas Manipulations**: Duplikasi elemen, hapus elemen dengan satu klik, dan atur ulang hierarki secara instan.

### 3. 🌈 Advanced Gradient Tuner (Dual Target Mode)
- **Linear & Radial Generator**: Generator gradien visual dengan multi-stop color controller, sudut rotasi derajat (*0° - 360°*), dan preset gradien modern (Sunset, Ocean, Emerald, Cosmic, Peach, Fire).
- **Mode Target Fleksibel**:
  - **🔲 Latar Kotak (`background`)**: Menerapkan warna gradien ke latar belakang kontainer, kartu, atau tombol.
  - **T Teks Tulisan (`text-clip`)**: Menerapkan gradien memukau langsung pada huruf/tipografi menggunakan `-webkit-background-clip: text` dan `-webkit-text-fill-color: transparent` tanpa kotak hitam atau pemotongan yang rusak.
- **Copy CSS & Live Apply**: Salin sintaks CSS gradien standar dengan satu klik.

### 4. 🎯 Dynamic High-Visibility Element Inspector
- **Point-and-Click Selector**: Sorot elemen DOM mana pun di kanvas dengan outline dinamis berdaya kontras tinggi dan tooltip dimensi piksel.
- **Hierarchical Breadcrumbs**: Navigasi struktur pohon HTML dari root `<body>` hingga elemen terdalam.
- **CSS Specificity Overrides**: Opsi sakelar `!important` untuk memastikan modifikasi gaya menimpa aturan CSS warisan yang membandel.

### 5. 🎬 CSS Animation Injector
- **Preset Animasi Siap Pakai**: *Fade In*, *Slide Up*, *Bounce In*, *Pulse*, *Zoom In*, *Rotate*, *Shake*, dan *Shimmer*.
- **Parameter Kustom**: Pengaturan durasi (0.1s - 5s), kurva timing (*linear, ease-in-out, cubic-bezier*), jumlah perulangan (*1x atau Infinite*), dan pemicu (*On Load* vs *On Hover*).
- **Instant Keyframe Injection**: Mengompilasi dan menginjeksi aturan `@keyframes` langsung ke dalam dokumen target.

### 6. 💾 Non-Destructive Local Disk Sync
- **Penyimpanan Aman (Ctrl + S)**: Semua aturan styling yang Anda buat diekspor secara rapi ke `custom-styles.css` di direktori proyek.
- File HTML asli Anda tidak akan rusak karena aplikasi hanya menyematkan referensi stylesheet secara aman.

---

## 🖥️ Cara Menjalankan Aplikasi

Aplikasi ini dapat dijalankan baik sebagai **jendela desktop native** mandiri (didukung Electron) maupun melalui web browser lokal.

### Opsi 1: Menjalankan sebagai Aplikasi Desktop Native (Rekomendasi ⭐)

Jalankan script launcher desktop:
```bash
./launch-desktop.sh
```
*atau melalui npm:*
```bash
npm run desktop
```
> **Hasil:** Jendela desktop native **VisualStyle Studio** akan langsung terbuka di layar Anda dengan Clean Light Theme, frameless header, dan dialog berkas OS asli.

---

### Opsi 2: Menjalankan via Local Server / Browser

Jika Anda ingin membukanya di browser:
```bash
npm run server
```
Buka peramban di alamat: `http://localhost:4200`

---

### Opsi 3: Memindahkan Proyek ke SSD Utama

Jika proyek ingin dipindahkan dari flashdisk ke penyimpanan internal komputer:
```bash
# 1. Salin folder ke direktori kerja Anda (contoh: ~/development/)
cp -r "/media/yudz/FLASHDISK/VisualStyle Studio" ~/development/VisualStyle-Studio

# 2. Masuk ke folder baru dan jalankan
cd ~/development/VisualStyle-Studio
./launch-desktop.sh
```

---

### Opsi 4: Membangun Paket Installer Standalone (.AppImage / .deb / .exe)

Untuk memaketkan aplikasi menjadi installer mandiri yang dapat didistribusikan ke komputer lain:
- **Linux (`.AppImage` & `.deb`)**:
  ```bash
  npm run dist:linux
  ```
- **Windows (`.exe` Installer & Portable)**:
  ```bash
  npm run dist:win
  ```
Berkas installer akan otomatis dibuat di folder `release/`.

---

## ⌨️ Pintasan Keyboard (Shortcuts)

| Shortcut | Aksi |
| :--- | :--- |
| `Ctrl + S` | Menyimpan perubahan gaya ke `custom-styles.css` |
| `Esc` | Melepas seleksi elemen aktif / keluar dari fokus |
| `Delete / Backspace` | Menghapus elemen terpilih saat di Sandbox Builder |
| `Desktop / Tablet / Mobile` | Beralih mode viewport perangkat di toolbar |

---

## 📂 Struktur Proyek

```text
VisualStyle Studio/
├── electron/
│   ├── main.cjs               # Electron main process & OS native bridges
│   └── preload.cjs            # Context bridge & secure IPC channels
├── public/
│   ├── css/
│   │   ├── studio.css         # Styling antarmuka studio (Clean Light UI)
│   │   └── sandbox-template.css # Template komponen visual sandbox
│   ├── js/
│   │   ├── app.js             # Inisialisasi utama & state manager
│   │   ├── inspector-bridge.js# DOM hover highlighter & selection engine
│   │   ├── color-tuner.js     # Color picker, HEX/RGB/HSL tuner
│   │   ├── gradient-tuner.js  # Linear/Radial gradient & text-clip tuner
│   │   ├── anim-injector.js   # CSS Keyframe generator & injector
│   │   ├── viewport-resizer.js# Responsive device viewport switcher
│   │   ├── sandbox-builder.js # Figma-like canvas builder engine
│   │   ├── dom-tree.js        # DOM hierarchy breadcrumbs explorer
│   │   └── toast-boundary.js  # Notifikasi status & feedback visual
│   ├── sample-project/        # Proyek contoh bawaan (Apex Vault & Sandbox)
│   └── index.html             # Layout utama antarmuka studio
├── launch-desktop.sh          # Native desktop launcher script
├── server.js                  # Local offline static server & API
├── package.json               # Konfigurasi dependensi & build scripts
└── README.md                  # Dokumentasi teknis proyek
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Silakan gunakan dan modifikasi secara bebas.
