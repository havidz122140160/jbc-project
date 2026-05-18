# Laporan Status Aplikasi JBC

## Kemampuan Saat Ini

### 1. Autentikasi
- Login pengguna dengan autentikasi berbasis token JWT.
- Kontrol akses berbasis peran (Owner, Kapster).

### 2. Dashboard Owner
- **Analitik**: Tampilan ringkasan total pendapatan, reservasi, dan kapster aktif dengan analisis performa visual.
- **Manajemen Staf**: Tambah/Edit Kapster, aktifkan/nonaktifkan akun.
- **Manajemen Layanan**: Tambah/Edit/Hapus layanan pangkas rambut (harga, durasi).
- **Penjadwalan**: Mengelola jadwal istirahat mingguan untuk Kapster.
- **Override Darurat**: Blokir slot waktu secara paksa dan memicu shutdown darurat.

### 3. Dashboard Kapster
- **Kontrol Terminal**: Melihat dan mengelola antrean pelanggan yang ditugaskan (Check-in, Selesaikan Sesi, Skip/No-Show).
- **Pembaruan Status**: Pembaruan real-time pada status antrean.

### 4. Manajemen Profil Pengguna
- Pengguna dapat memperbarui informasi profil mereka (Username, Email, Password, Nama, nomor WhatsApp).

---

## Potensi Peningkatan

### 1. Ketahanan & Keamanan
- **Validasi Input**: Menerapkan validasi formulir yang ketat (baik di frontend maupun backend) untuk memastikan data valid (misalnya, password kuat, format email yang benar).
- **Penanganan Error**: Meningkatkan feedback pengguna untuk kegagalan API dengan pesan error yang lebih deskriptif.

### 2. Peningkatan UI/UX
- **Status Loading**: Menstandarisasi dan meningkatkan feedback visual selama permintaan API untuk pengalaman pengguna yang lebih baik.
- **Responsivitas Mobile**: Optimalisasi lebih lanjut pada dashboard untuk berbagai ukuran layar, terutama terminal Kapster.

### 3. Fitur Baru
- **Analitik Lanjutan**: Mengizinkan rentang tanggal khusus untuk laporan dan kemampuan ekspor (PDF/CSV).
- **Notifikasi**: Menerapkan peringatan sistem atau notifikasi WhatsApp/SMS untuk perubahan reservasi.
- **Portal Pelanggan**: Membuat antarmuka pemesanan khusus bagi pelanggan untuk melihat layanan dan memesan janji temu secara langsung.
- **Manajemen Kapasitas**: Menerapkan penyeimbangan beban Kapster otomatis berdasarkan durasi janji temu dan antrean saat ini.
