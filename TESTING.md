# Panduan Testing Aplikasi Lapak Berkah dengan Supabase

## Persiapan Awal

### 1. Insert Data Sample ke Supabase

Buka Supabase Dashboard → **SQL Editor**, lalu jalankan query berikut:

```sql
-- Insert Users (password disimpan plain text untuk development)
INSERT INTO users (nama, email, password, role) VALUES
  ('Admin Lapak', 'admin@lapakberkah.com', 'admin123', 'admin'),
  ('Kasir Sari', 'kasir@lapakberkah.com', 'kasir123', 'kasir'),
  ('Mitra Jaya', 'mitra@lapakberkah.com', 'mitra123', 'mitra')
ON CONFLICT (email) DO NOTHING;

-- Insert Mitra
INSERT INTO mitra (full_name, address, phone, email, gender, status, total_transaction, total_omzet) VALUES
  ('Toko Makmur', 'Jl. Merdeka No. 45, Buntulia', '081234567890', 'makmur@example.com', 'Laki-laki', 'Aktif', 156, 42500000),
  ('Grosir Jaya', 'Jl. Sudirman No. 12, Buntulia', '087765432101', 'jaya@example.com', 'Laki-laki', 'Aktif', 89, 22150000),
  ('Toko Harapan', 'Jl. Diponegoro No. 8, Buntulia', '089912345678', 'harapan@example.com', 'Perempuan', 'Tidak Aktif', 45, 11200000)
ON CONFLICT (email) DO NOTHING;

-- Insert Products
INSERT INTO products (nama_produk, sku, category_id, type_id, mitra_id, mitra_price, selling_price, stock, unit, photo, description, barcode_id) VALUES
  ('Nasi Kuning', 'BRP-001', (SELECT id FROM categories WHERE name = 'Perishable'), (SELECT id FROM product_types WHERE name = 'Makanan Basah'), (SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), 14500, 18000, 45, 'Pcs', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9S0lXMpRCIso-L8CBlj_U0MUQvoGBrQKhOVgsA54pAt-PbsyTJM5gPW1TDbWseVKIKBbDhf4ZBtI9wMQ3FSzouSGDMY3xbXtIyxirFJxSlk0YSDW7OUkpsvxjNQLl2kWrsF3Q_nFdCLy1SZReZR-SRm3wBB_5OpY9hjjEWFHzgwtfw9gjAbWHi0YbuDlNjGtlO_-LjzIh24qq9oobBsLzLD9oM_y5o3An1VRKRe8fWYF5RiZ30xX89A', 'Nasi kuning siap saji', 'BC-001'),
  ('Kerupuk', 'MNG-002', (SELECT id FROM categories WHERE name = 'Non-Perishable'), (SELECT id FROM product_types WHERE name = 'Makanan Kering'), (SELECT id FROM mitra WHERE full_name = 'Grosir Jaya'), 2000, 3500, 120, 'Pack', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy_dC_R3oRxJ1d0ReP2F5QktKPUd4al-jRFlh_0wQDF5chjbpIErEr9nIyhA_Pak9a2yQqI_V_35NFG_290FDhpcyTxNSv5JBNTx01cGw0SQz98-vHdeijubwm-9cpLLsEVJ-5y1fe19ELkvf8a-Ze0RTkv1a4f7-yK5geAC8q0yx9_JtPC0wk8fWx9NOCBUxQ9rFCz0mwqFdPOaCh0bDJi3PGTTQoQMDveIbCK8762GcRQVbUuz-nkQ', 'Kerupuk gurih renyah', 'BC-002'),
  ('Es Teh Manis', 'GLP-003', (SELECT id FROM categories WHERE name = 'Perishable'), (SELECT id FROM product_types WHERE name = 'Minuman'), (SELECT id FROM mitra WHERE full_name = 'Toko Harapan'), 3000, 5000, 0, 'Gelas', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD45ZfKiOkzCqbc-spfBj-jJwJbWtVxit5ZTkS7gWepe3UrNb1wJVvMnTQqpxYY0-ZaECpGJypxNBWPJcM-NjIkiT99Gbt8kTM09FpleP3YFBpXhOzZQ0ffJVKBjqq2pToEqGI4tGDaiaPIfVWCKuz6X6cMk8NMuVlm9c31YKH5ivXc2IouBfmjKOAsA70ObFR8T5IiVgAcFYtrJHRDfvLySUxMw_I5Aw7HJPd9C1taAui0kx5wEqLipA', 'Es teh manis segar', 'BC-003'),
  ('Susu UHT 250ml', 'MIG-004', (SELECT id FROM categories WHERE name = 'Non-Perishable'), (SELECT id FROM product_types WHERE name = 'Minuman'), (SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), 5500, 8000, 24, 'Karton', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE_TgX6dU09YE_ejm-rY1i1uZgfVoBKai_Mcqh_eObBkWYkJ9vlvLEhzR9L0eIRxdgVFCsXzX8i6alv81Nm7JZmYy-wFiZjceZf3h0EtMmtvkVqWRzbUzrGaNQSKKox1PpDb8pWapwZh1el6BJYVhKwoDoXfib2bPXIENjILDqMOzMttAn97H-Qbn_MWTCSHTPswap9e-wD-XNGzYq8mX8Wdm0z4n8XH7CLGhi_ikJn-tgMjSfz5ZZ3A', 'Susu UHT segar', 'BC-004'),
  ('Mie Instan Goreng', 'SUS-005', (SELECT id FROM categories WHERE name = 'Non-Perishable'), (SELECT id FROM product_types WHERE name = 'Makanan Kering'), (SELECT id FROM mitra WHERE full_name = 'Grosir Jaya'), 3000, 4500, 120, 'Pcs', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5qejlFpuAvF4M0PzqD6tNHnw6z1CjHJelomAYXJWHwCJIMsFaVz4LizVtCJDepveg23kZ1jtsSfCsIZgoL2YHjVkruEf4beb4auqiUQP4BTdIOrcNdPRnhKI3moA-cNa28RClHLo_B-Tr-3AyluWfaAgHALbMmEp6Z9LhFjN18Nfwzl4UblrTmIp1EGoD5YzlVxYofuUezaaJjaQZgJxKGKhGEgPHN77eU21_AVhSJNoszydXrUXxJg', 'Mie instan rasa goreng', 'BC-005'),
  ('Kopi Susu Gula Aren', 'KOP-006', (SELECT id FROM categories WHERE name = 'Perishable'), (SELECT id FROM product_types WHERE name = 'Minuman'), (SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), 8000, 12000, 50, 'Gelas', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB49vG9Vi3qbccoLZTXOLCqShe83hxitKq-wO3Iud7yeRH4bnZt2z0KcWxLd05BsiXOGCsKYwMKMXivhLKmYbr5fjtWgLkZixOEhtdAXQMZFIsO098CSV5idKs-jD4BvjZ4O9yC5r0GgwI95lKuy2oX4MFkNyI0hV-fY2GQnKYnBnyKDMJHPpOFzE66yL9OywVNAdvHQb1dvhuWq4bYsPLpVExHIszD98fWP0RqV2EVmKnMEPCPM_8WEaD-B1rebwVHSrA', 'Kopi susu gula aren premium', 'BC-006')
ON CONFLICT (sku) DO NOTHING;

-- Insert Transactions
INSERT INTO transactions (user_id, mitra_id, total, paid, change, metode_pembayaran, status, created_at) VALUES
  ((SELECT id FROM users WHERE email = 'kasir@lapakberkah.com'), (SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), 36000, 50000, 14000, 'Tunai', 'Selesai', NOW() - INTERVAL '1 day'),
  ((SELECT id FROM users WHERE email = 'kasir@lapakberkah.com'), (SELECT id FROM mitra WHERE full_name = 'Toko Harapan'), 15000, 15000, 0, 'QRIS', 'Selesai', NOW() - INTERVAL '1 day'),
  ((SELECT id FROM users WHERE email = 'kasir@lapakberkah.com'), (SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), 12000, 20000, 8000, 'Tunai', 'Selesai', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Insert Transaction Items
INSERT INTO transaction_items (transaction_id, product_id, quantity, harga_satuan, subtotal) VALUES
  ((SELECT id FROM transactions WHERE metode_pembayaran = 'Tunai' AND mitra_id = (SELECT id FROM mitra WHERE full_name = 'Toko Makmur') LIMIT 1), (SELECT id FROM products WHERE sku = 'BRP-001'), 2, 18000, 36000),
  ((SELECT id FROM transactions WHERE metode_pembayaran = 'QRIS' AND mitra_id = (SELECT id FROM mitra WHERE full_name = 'Toko Harapan') LIMIT 1), (SELECT id FROM products WHERE sku = 'GLP-003'), 3, 5000, 15000),
  ((SELECT id FROM transactions WHERE metode_pembayaran = 'Tunai' AND mitra_id = (SELECT id FROM mitra WHERE full_name = 'Toko Makmur') LIMIT 1 OFFSET 1), (SELECT id FROM products WHERE sku = 'KOP-006'), 1, 12000, 12000)
ON CONFLICT DO NOTHING;

-- Insert Stock Movements
INSERT INTO stock_movements (product_id, type, quantity, note, mitra_id, created_at) VALUES
  ((SELECT id FROM products WHERE sku = 'BRP-001'), 'in', 50, 'Stok pagi dari mitra', (SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), NOW() - INTERVAL '1 day'),
  ((SELECT id FROM products WHERE sku = 'GLP-003'), 'out', 5, 'Barang rusak', NULL, NOW() - INTERVAL '1 day'),
  ((SELECT id FROM products WHERE sku = 'MNG-002'), 'in', 100, 'Restok mingguan', (SELECT id FROM mitra WHERE full_name = 'Grosir Jaya'), NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Insert Pending Stock Validations
INSERT INTO pending_stock_validations (mitra_id, product_id, date, quantity, note, status) VALUES
  ((SELECT id FROM mitra WHERE full_name = 'Toko Makmur'), (SELECT id FROM products WHERE sku = 'BRP-001'), CURRENT_DATE, 45, 'Stok pagi hari', 'pending'),
  ((SELECT id FROM mitra WHERE full_name = 'Grosir Jaya'), (SELECT id FROM products WHERE sku = 'MNG-002'), CURRENT_DATE, 120, 'Restok mingguan', 'pending'),
  ((SELECT id FROM mitra WHERE full_name = 'Toko Harapan'), (SELECT id FROM products WHERE sku = 'GLP-003'), CURRENT_DATE, 0, 'Stok habis', 'pending')
ON CONFLICT DO NOTHING;
```

---

## Langkah Testing

### 1. Buka Aplikasi
- Buka browser ke `http://localhost:5173`
- Pastikan halaman login muncul

### 2. Test Login
**Test Case 1: Login sebagai Admin**
- Email: `admin@lapakberkah.com`
- Password: `admin123`
- Role: `Admin / Owner`
- Expected: Berhasil login dan masuk ke halaman Dashboard

**Test Case 2: Login sebagai Kasir**
- Email: `kasir@lapakberkah.com`
- Password: `kasir123`
- Role: `Kasir`
- Expected: Berhasil login dan masuk ke halaman POS

**Test Case 3: Login sebagai Mitra**
- Email: `mitra@lapakberkah.com`
- Password: `mitra123`
- Role: `Mitra`
- Expected: Berhasil login dan masuk ke halaman Mitra Dashboard

**Test Case 4: Login Gagal**
- Email: `salah@email.com`
- Password: `salah`
- Expected: Muncul pesan error "Email, kata sandi, atau peran salah"

### 3. Test Halaman Dashboard (Admin)
- Setelah login sebagai Admin, cek:
  - Card "Total Transaksi" menampilkan angka
  - Card "Total Item" menampilkan angka
  - Card "Total Penjualan" menampilkan nominal
  - Card "Mitra Aktif" menampilkan jumlah mitra aktif
  - Tabel "Transaksi Hari Ini" menampilkan data transaksi
- Expected: Semua data diambil dari Supabase

### 4. Test Halaman Inventory (Admin/Kasir)
- Navigasi ke menu Inventory
- Cek:
  - Tabel produk menampilkan data dari Supabase
  - Filter kategori bekerja
  - Search by nama/SKU/barcode bekerja
  - Status stok (Habis/Stok Rendah/Tersedia) sesuai data
- Expected: Data produk ter-load dari Supabase

### 5. Test Halaman Product Management (Admin)
- Navigasi ke menu Product Management
- Test Tambah Produk:
  1. Klik "Tambah Produk"
  2. Isi form dengan data baru
  3. Klik Simpan
  4. Expected: Produk muncul di tabel dan tersimpan di Supabase
- Test Edit Produk:
  1. Klik icon edit pada produk
  2. Ubah data
  3. Klik Perbarui
  4. Expected: Data ter-update di Supabase
- Test Delete Produk:
  1. Klik icon delete
  2. Konfirmasi
  3. Expected: Produk terhapus dari Supabase
- Test Tambah Kategori:
  1. Klik + pada bagian Kategori
  2. Masukkan nama kategori baru
  3. Expected: Kategori tersimpan dan muncul di form produk
- Test Tambah Jenis:
  1. Klik + pada bagian Jenis
  2. Masukkan nama jenis baru
  3. Expected: Jenis tersimpan dan muncul di form produk
- Test Tambah Mitra:
  1. Klik + pada bagian Mitra
  2. Isi nama mitra
  3. Expected: Mitra tersimpan dan muncul di form produk

### 6. Test Halaman Kasir Desktop (Kasir/Admin)
- Login sebagai Kasir atau Admin
- Navigasi ke POS Desktop
- Cek:
  - Produk menampilkan data dari Supabase
  - Filter kategori bekerja
  - Klik produk menambahkan ke keranjang
  - Scan barcode (ketik SKU/Barcode ID) menambahkan produk
- Test Checkout:
  1. Tambah produk ke keranjang
  2. Pilih metode pembayaran "Tunai"
  3. Masukkan jumlah bayar
  4. Klik "Bayar"
  5. Expected: Transaksi tersimpan di Supabase, stok berkurang (jika ada trigger)
  6. Cek tabel transactions dan transaction_items di Supabase

### 7. Test Halaman Kasir HP (Kasir/Admin)
- Resize browser ke ukuran mobile atau gunakan DevTools mobile view
- Navigasi ke POS
- Cek:
  - Produk menampilkan data dari Supabase
  - Filter kategori bekerja
  - Search produk bekerja
  - Cart di sidebar bekerja

### 8. Test Halaman Laporan Penjualan (Admin)
- Navigasi ke menu Sales Recap
- Cek:
  - Summary cards menampilkan data dari Supabase
  - Filter tanggal bekerja
  - Filter mitra bekerja
  - Tabel transaksi menampilkan data

### 9. Test Halaman Riwayat Transaksi (Admin/Kasir)
- Navigasi ke menu Transaction History
- Cek:
  - Summary cards menampilkan data dari Supabase
  - Search by ID/Mitra bekerja
  - Filter tanggal bekerja
  - Filter metode pembayaran bekerja
  - Tabel transaksi menampilkan data

### 10. Test Halaman Manajemen Stok (Admin)
- Navigasi ke menu Stock Management
- Cek:
  - Tabel validasi stok menampilkan data dari Supabase
  - Filter tanggal dan mitra bekerja
- Test Validasi Stok:
  1. Klik "Validasi" pada pending validation
  2. Expected: Status berubah ke "Tervalidasi" dan stok bertambah
- Test Tambah Transaksi Stok:
  1. Klik "Tambah Transaksi"
  2. Pilih jenis (Masuk/Keluar)
  3. Pilih produk dan jumlah
  4. Klik Simpan
  5. Expected: Transaksi tersimpan di Supabase dan stok ter-update

### 11. Test Halaman Mitra Dashboard (Admin/Mitra)
- Login sebagai Mitra atau Admin
- Navigasi ke menu Mitra
- Cek:
  - Stat cards menampilkan data dari Supabase
  - Tabel mitra menampilkan data
  - Tabel produk menampilkan data
- Test Tambah Mitra (hanya Admin):
  1. Klik "Tambah Mitra"
  2. Isi form
  3. Expected: Mitra tersimpan di Supabase
- Test Input Stok Harian (Mitra):
  1. Klik "Tambah" pada Input Stok Harian
  2. Pilih produk dan masukkan stok
  3. Klik Simpan
  4. Expected: Stok tersimpan sebagai pending validation

### 12. Test Logout
- Klik icon logout di Top App Bar
- Expected: Kembali ke halaman login, state di-reset

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env` ada di root project
- Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah diisi
- Restart dev server setelah mengubah `.env`

### Error: "relation 'products' does not exist"
- Pastikan SQL schema sudah dijalankan di Supabase SQL Editor
- Cek di Supabase Dashboard → Table Editor, pastikan tabel-tabel sudah dibuat

### Error: "Failed to load products"
- Buka DevTools Console (F12)
- Cek error message detail
- Pastikan Supabase URL dan Key benar
- Cek jaringan: pastikan bisa akses `https://[project-id].supabase.co`

### Data tidak muncul
- Cek apakah data sample sudah di-insert ke Supabase
- Cek di Supabase Dashboard → Table Editor untuk melihat data
- Cek console browser untuk error

### Login tidak berhasil
- Pastikan tabel `users` sudah diisi dengan data sample
- Cek email, password, dan role sesuai dengan data di tabel users

---

## Cek Data di Supabase

Untuk memastikan data tersimpan dengan benar, buka Supabase Dashboard:

1. **Table Editor**: Lihat data di setiap tabel
2. **SQL Editor**: Jalankan query untuk cek data
   ```sql
   -- Cek jumlah data di setiap tabel
   SELECT 'users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'mitra', COUNT(*) FROM mitra
   UNION ALL
   SELECT 'products', COUNT(*) FROM products
   UNION ALL
   SELECT 'transactions', COUNT(*) FROM transactions
   UNION ALL
   SELECT 'transaction_items', COUNT(*) FROM transaction_items
   UNION ALL
   SELECT 'stock_movements', COUNT(*) FROM stock_movements
   UNION ALL
   SELECT 'pending_stock_validations', COUNT(*) FROM pending_stock_validations;
   ```
3. **Authentication**: Untuk mengelola user authentication (jika menggunakan Supabase Auth)

---

## Catatan Penting

- Password disimpan dalam plain text untuk development. Untuk production, gunakan hashing password.
- Foto mitra dan produk disimpan sebagai base64 string. Untuk production, gunakan Supabase Storage.
- Aplikasi menggunakan `import.meta.env` untuk environment variables (Vite).
- Jika mengubah `.env`, restart dev server dengan `Ctrl+C` lalu `npm run dev`.
