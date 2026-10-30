# Motion 3D PC Developer

Template satu berkas dari OneWebDev (HTML + CSS + JavaScript).

## Cara pakai
1. Buka `index.html` di browser, atau unggah ke hosting statis (GitHub Pages, Vercel, Netlify).
2. Biodata yang tampil sebagai kode ada di objek `CONFIG` di awal skrip (`profil`, `variabel`, `komentar`, `bahasa`: js/py/json) beserta teks layar. Teks halaman ada di HTML biasa (section `data-ch`). Pose kamera dan objek 3D per bab ada di array `POSES`; animasi scroll memakai GSAP ScrollTrigger, teks dan angka memakai Motion.
3. Tidak ingin menyentuh kode? Buka template di OneWebDev lalu pilih **Edit tanpa kode**: teks, warna, dan data tampil sebagai form dengan pratinjau langsung.

## Library
three 0.169.0, GSAP 3.12.5 + ScrollTrigger, Motion 11.11.13, Lenis 1.1.13. Dimuat dari CDN dengan versi dipatok; tanpa proses build.

## Catatan
- Ukuran berkas: di bawah 250 KB (di luar font dan library).
- Menghormati pengaturan "kurangi gerak" (prefers-reduced-motion).
- Semua nama, nomor, dan kontak adalah contoh fiktif.
