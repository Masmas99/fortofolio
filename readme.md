# 🚗 Mashudi - 3D Interactive Portfolio

Selamat datang di repository resmi **Portfolio Interaktif 3D Mashudi** ([mashudi.web.id](https://www.mashudi.web.id/)).

Portfolio ini merupakan pengalaman interaktif 3D di mana pengunjung dapat mengendarai mobil kecil untuk menjelajahi berbagai zona proyek, area informasi kontak, hingga arena bermain interaktif berbasis fisika WebGL.

---

## 🌟 Fitur Utama

- **🎮 3D Car Physics & Controls**: Kendalikan mobil menggunakan keyboard (panah / WASD) dengan simulasi gravitasi, suspensi, dan tubrukan menggunakan Cannon.js.
- **📁 9 Papan Proyek Interaktif**:
  1. **IoT & Networking** - Class Introduction
  2. **LSP LIBRARY** - Library Management & Information System
  3. **MediStock** - Medication Inventory Management Application
  4. **E-Commerce** - Minimalist Fashion E-Commerce Store
  5. **MikroTik NOC** - Network Monitoring & Diagnostic Dashboard
  6. **Atnet** - Official Company Website
  7. **Screen Monitoring System** - Endpoint Computer Monitoring Dashboard
  8. **Coming Soon** - Proyek Mendatang di GitHub
  9. **Coming Soon** - Proyek Mendatang di GitHub
- **⚽ Playground Interaktif**: Lapangan sepak bola dengan bola dinamis, ring bowling, dan gawang dengan deteksi gol serta jaring berfisika anti-tembus.
- **📬 Kontak Terintegrasi**: Titik interaktif untuk langsung mengirim email via Gmail, membuka LinkedIn, dan GitHub.
- **⚡ Super Cepat**: Ditenagai oleh Vite bundler modern, GLSL custom shaders, dan tekstur beresolusi tinggi dengan *Anisotropic Filtering*.

---

## 🛠️ Tech Stack

- **Framework / Runtime**: Node.js
- **Bundler**: [Vite](https://vitejs.dev/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **Physics Engine**: [Cannon.js](https://github.com/schteppe/cannon.js)
- **Animation**: [GSAP](https://greensock.com/gsap/)
- **Shaders**: Custom GLSL Shaders (`vite-plugin-glsl`)

---

## 📋 Prasyarat Sistem

Sebelum memulai instalasi, pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

1. **[Node.js](https://nodejs.org/)** (Rekomendasi versi LTS 18.x atau 20.x ke atas)
2. **[Git](https://git-scm.com/)**
3. **NPM** (Otomatis terinstal bersama Node.js)

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

Ikuti langkah-langkah mudah di bawah ini untuk menjalankan proyek ini di komputer lokal Anda:

### 1. Clone Repository

Buka terminal (Command Prompt / PowerShell / Git Bash) lalu jalankan:

```bash
git clone https://github.com/Masmas99/fortofolio.git
cd fortofolio
```

### 2. Install Dependencies

Unduh seluruh dependensi paket yang dibutuhkan:

```bash
npm install
```

### 3. Jalankan Mode Development

Mulai server lokal pengembangan:

```bash
npm run dev
```

Setelah server aktif, terminal akan menampilkan tautan lokal:
```text
  VITE v5.2.11  ready in 350 ms

  ➜  Local:   http://localhost:1234/
  ➜  Network: use --host to expose
```

Buka browser Anda dan akses: **`http://localhost:1234`**

---

## 📦 Build untuk Produksi (Production Build)

Untuk menghasilkan file statis siap hosting (folder `dist/`):

```bash
npm run build
```

Folder `dist/` siap diunggah ke layanan hosting apa pun seperti GitHub Pages, Vercel, Netlify, atau cPanel/hosting konvensional.

Untuk menguji hasil build produksi secara lokal:
```bash
npm run preview
```

---

## 🎮 Kontrol Navigasi Mobil

| Tombol Keyboard | Aksi |
| :--- | :--- |
| **⬆️ / W** | Maju (Gas) |
| **⬇️ / S** | Mundur |
| **⬅️ / A** | Belok Kiri |
| **➡️ / D** | Belok Kanan |
| **Spasi (Space)** | Rem Tangan (Brake) |
| **H** | Bunyikan Klakson |
| **R** | Reset / Respawn Mobil ke posisi awal |
| **Shift** | Boost Kecepatan |
| **Klik / Tabrak 'OPEN'** | Membuka tautan proyek atau situs terkait |

---

## 🌐 Panduan Deployment ke GitHub Pages

Proyek ini sudah dilengkapi dengan **GitHub Actions Workflow** otomatis (`.github/workflows/deploy.yml`).

1. Buka repository Anda di GitHub: **[https://github.com/Masmas99/fortofolio](https://github.com/Masmas99/fortofolio)**
2. Masuk ke tab **Settings** > **Pages**.
3. Di bagian **Build and deployment > Source**, pilih **GitHub Actions**.
4. Workflow akan otomatis mem-build dan men-deploy situs ke domain Anda (`mashudi.web.id`).

---

## 📂 Struktur Direktori Proyek

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Otomasi deploy ke GitHub Pages
├── src/
│   ├── favicon/                # Favicon dan ikon web
│   ├── fonts/                  # Font 3D dan tipografi
│   ├── javascript/             # Sumber kode logika aplikasi
│   │   ├── Materials/          # Material custom Three.js
│   │   ├── World/              # Objek 3D dunia, mobil, fisika & section proyek
│   │   ├── Application.js      # Controller utama Three.js
│   │   └── Resources.js        # Asset loader
│   ├── shaders/                # Shader GLSL
│   ├── style/                  # CSS styling
│   └── index.html              # HTML utama & Open Graph meta tags
├── static/                     # Aset statis (model GLTF/GLB, gambar, audio)
│   ├── CNAME                   # Custom domain mapping
│   ├── models/                 # Model 3D mobil, papan proyek, dan playground
│   └── social/                 # Gambar Open Graph / preview media sosial
├── package.json                # Konfigurasi dependensi NPM
├── vite.config.js              # Konfigurasi Vite bundler
└── README.md                   # Dokumentasi panduan instalasi
```

---

## 👨‍💻 Profil & Kontak

- **Nama**: Mashudi
- **Website**: [mashudi.web.id](https://www.mashudi.web.id/)
- **GitHub**: [@Masmas99](https://github.com/Masmas99)
- **LinkedIn**: [Mashudi on LinkedIn](https://www.linkedin.com/in/masmas-masa-b1568b38a/)
- **Email**: [masamasmas88@gmail.com](mailto:masamasmas88@gmail.com)

---

*Lisensi: Terbuka untuk keperluan portofolio personal. Berdasarkan kreasi asli Bruno Simon.*
