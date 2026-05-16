# Visualisasi Interaktif GAN (Generative Adversarial Network)

Proyek ini adalah sebuah aplikasi web interaktif berbasis **Vanilla HTML, CSS, dan JavaScript** yang dirancang untuk mengilustrasikan serta mendemonstrasikan cara kerja arsitektur AI **Generative Adversarial Network (GAN)** secara visual, spasial, dan mudah dipahami. 

Dibuat khusus untuk memenuhi tugas besar pada mata kuliah *Artificial Intelligence* (Kecerdasan Buatan).

---

## Demo GitHub Pages
Aplikasi ini dapat diakses secara langsung melalui GitHub Pages:
 **https://dwifirdaus08.github.io/animasi-gan/**

---

## Konsep Dasar & Alur Cerita (Generator vs Discriminator)

Proyek ini mengadopsi metafora **"Sang Pencipta/Pemalsu" vs "Sang Detektif"** untuk mempermudah audiens memahami proses *training* pada model GAN. Target utama dari AI di simulasi ini adalah berhasil membuat atau memalsukan **Digit "3"** dalam format pixel grid 7×5 (total 35 piksel).

### 1. Generator (Sang Pemalsu)
* **Tugas:** Menciptakan data baru yang menyerupai data asli dari database.
* **Proses dalam Animasi:** Dimulai dari babak awal (Epoch 0), Generator menghasilkan gambar dari **noise acak murni** (piksel hitam-putih berantakan). Seiring bertambahnya Epoch, Generator menerima sinyal balik (*feedback*) dari Discriminator dan belajar memperbaiki posisi piksel agar menyerupai angka "3".

### 2. Discriminator (Sang Detektif)
* **Tugas:** Memeriksa data yang diberikan dan menentukan apakah data tersebut **NYATA** (dari dataset asli) atau **PALSU** (buatan Generator).
* **Proses dalam Animasi:** Discriminator memegang dataset asli (Digit "3" versi sempurna) sebagai referensi. Ia memindai kiriman paket data dari Generator, memberikan skor akurasi kemiripan, dan mengeluarkan vonis.

### 3. Keseimbangan Nash (Nash Equilibrium)
* Pada akhir pelatihan (Epoch 10), Generator berhasil membuat pola angka "3" yang sangat identik dengan aslinya.
* Hasilnya, Discriminator mengalami kebingungan mutlak dan memberikan vonis **50/50** (tidak dapat membedakan mana yang nyata dan mana yang palsu). Titik ideal inilah yang disebut sebagai *Nash Equilibrium* dalam dunia *Machine Learning*.

---

##  Fitur Utama Aplikasi

1. **Simulasi Berbasis Epoch (Babak):** Pengguna dapat menjalankan proses *training* langkah demi langkah (`→ Step`) atau secara otomatis (`▶ Mulai Training`).
2. **Animasi Aliran Data (Packet Flow):** Visualisasi pengiriman data dari Generator ke Discriminator serta pengiriman balik sinyal evaluasi secara *real-time*.
3. **Grafik Loss Real-time:** Menggunakan HTML5 Canvas murni untuk menggambar pergerakan nilai *Loss* dari kedua model selama proses belajar berlangsung.
4. **Kontrol Kecepatan:** Tersedia slider untuk mengatur tempo simulasi (Lambat, Normal, Cepat) agar memudahkan penjelasan saat presentasi.
5. **Log Status Deskriptif:** Teks penjelasan di bagian bawah yang menceritakan dinamika kondisi AI pada setiap epoch dalam bahasa Indonesia yang interaktif.

---

## Spesifikasi Teknologi (Tech Stack)

Sesuai dengan instruksi dan batasan tugas, proyek ini dibangun murni menggunakan teknologi web dasar **tanpa library atau framework eksternal** (No Three.js, No React, No Tailwind):
* **HTML5:** Menyusun struktur panggung arena, komponen kontrol, dan render grafik dasar (`<canvas>`).
* **CSS3:** Mengatur tata letak modern (CSS Grid & Flexbox), pewarnaan bertema *dark mode tech*, serta animasi transisi kelap-kelip piksel.
* **Vanilla JavaScript:** Mengontrol *State Machine*, logika matematika semu pembaruan bobot piksel (*learning rate simulation*), algoritma render grafik *Loss*, serta manipulasi DOM.

---

## 📂 Struktur File Repositori

```text
├── index.html   # Struktur halaman utama dan layout arena GAN
├── style.css    # Desain tampilan UI, tema warna, dan animasi kelap-kelip
├── script.js    # Logika Machine Learning semu, state epoch, dan grafik canvas
└── README.md    # Dokumentasi proyek (File ini)
