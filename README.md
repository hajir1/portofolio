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

## Kenapa sekarang lebih ringan

- Teks tampil langsung; tidak ada layar "Memuat" yang menunggu three.js.
- three.js dimuat belakangan, dibundel hanya modul yang dipakai (±135 KB gzip, dari server sendiri).
- GSAP, ScrollTrigger, Lenis, dan Motion dihapus; satu loop kecil menggantikannya.
- Render 3D hanya saat ada perubahan (scroll, kursor, ketikan); diam ±30 fps; berhenti total saat
  layar proyek menutupi viewport atau tab tidak terlihat.
- Pixel ratio dibatasi (1,5 HP / 1,75 desktop) dan turun otomatis bila FPS rendah.
- Tidak ada `backdrop-filter: blur` di atas canvas yang terus berubah.
- Mode statis (tanpa 3D) untuk `prefers-reduced-motion`, hemat data, RAM ≤ 2 GB, atau tanpa WebGL.
