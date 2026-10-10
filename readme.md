# Cara Install & Menjalankan Proyek

Panduan instalasi dan menjalankan portfolio secara lokal di komputer Anda.

---

## 📋 Prasyarat

Pastikan perangkat Anda sudah terinstal:
- **[Node.js](https://nodejs.org/)** (Versi 18 atau 20+)
- **[Git](https://git-scm.com/)**

---

## 🚀 Langkah Instalasi

### 1. Clone Repository
Buka terminal (Command Prompt / PowerShell / Git Bash) dan jalankan:
```bash
git clone https://github.com/Masmas99/fortofolio.git
cd fortofolio
```

### 2. Install Dependensi
Jalankan perintah berikut untuk mengunduh semua package:
```bash
npm install
```

### 3. Jalankan Server Development
Mulai server lokal:
```bash
npm run dev
```
Buka browser dan akses tautan berikut:
```text
http://localhost:1234
```

---

## 📦 Build untuk Produksi

Untuk menghasilkan file statis siap hosting (folder `dist/`):
```bash
npm run build
```
Hasil build akan berada di dalam folder `dist/`.
