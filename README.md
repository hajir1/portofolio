# Portofolio Usam Muhazir

Situs statis satu halaman: PC 3D di tengah, saat digulir PC berputar, layarnya mengetik biodata,
lalu kamera **masuk ke layar** sampai layar memenuhi viewport. Proyek-proyek kemudian bergulir
*di dalam* layar itu, dan di akhir kamera mundur lagi ke bagian kontak.

Tidak ada proses build untuk situsnya. Cukup unggah folder ini (Vercel / GitHub Pages).
Bisa juga dibuka langsung dengan klik dua kali `index.html` (file://): semua skrip adalah `<script>` biasa, bukan ES module.

## Struktur

| File | Isi |
|---|---|
| `index.html` | Semua teks, daftar proyek, CSS |
| `assets/app.js` | Alur scroll, biodata yang diketik (`CONFIG` di atas file) |
| `src/scene.js` | Objek 3D PC dan isi layar 3D |
| `assets/scene.min.js` | Hasil bundel `src/scene.js` + three.js (hanya modul yang dipakai) |
| `assets/img/` | Screenshot proyek (WebP, 17 sampai 57 KB) |

## Menambah / mengubah proyek

Salin satu `<li class="win">` di `index.html`. Gambar opsional: tanpa gambar, pakai
`<div class="ph">teks</div>` sebagai sampul. Simpan gambar baru sebagai WebP lebar ±960 px.
Ubah juga angka `01 / 10` di `#os-count` bila jumlah proyek berubah (dihitung otomatis saat JS jalan).

## Mengubah objek 3D

Edit `src/scene.js`, lalu bundel ulang:

```bash
cd tools
npm install
npm run build   # menulis ../assets/scene.min.js
```
