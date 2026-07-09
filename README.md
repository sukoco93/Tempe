# Tempe
Tempe aplikasi

https://sukoco93.github.io/Tempe/

# 🌱 Tempe Legend

**Aplikasi Manajemen Toko Tempe Modern** berbasis **PWA (Progressive Web App)** yang dirancang untuk bekerja secara **offline** dengan performa tinggi dan antarmuka yang responsif.

> 🚀 Dibangun dengan Vue 2, IndexedDB, dan Service Worker. Cocok untuk UMKM dan pengelolaan stok/kas harian.

---

## ✨ Fitur Unggulan

- 📦 **Manajemen Data Lengkap**
  - **Penjualan** (dengan keranjang belanja)
  - **Kas** (Pemasukan & Pengeluaran)
  - **Produksi** (Bahan baku → Produk jadi)
  - **Pelanggan** (Data & histori)

- 💬 **Invoice WhatsApp**
  - Klik 2x (`double click`) pada daftar penjualan untuk langsung mengirim invoice via WhatsApp dengan format rapi.

- 📁 **Backup & Restore**
  - Ekspor/Impor data dalam format **CSV** dan **JSON**.

- 📱 **PWA Siap Pakai**
  - Tampilan **Splash Screen** dengan animasi.
  - **Shortcut** dari home screen (Tambah Penjualan & Lihat Kas).
  - **Theme Color** dan icon lengkap (16px – 512px).

- ⚡ **Performa Tinggi**
  - **Virtual Scrolling** untuk menangani ribuan data tanpa hambatan.
  - **Lazy Loading** (tombol "Muat Lagi").
  - Cache aset statis dengan **Service Worker** (Stale-While-Revalidate).

- 🔒 **Offline First**
  - Semua data disimpan di **IndexedDB** (melalui Dexie).
  - Aplikasi tetap berjalan normal saat mode pesawat.

---

## 🛠 Teknologi yang Digunakan

| Teknologi | Fungsi |
| :--- | :--- |
| [Vue 2](https://vuejs.org/) | Framework UI reaktif |
| [Dexie.js](https://dexie.org/) | Wrapper IndexedDB |
| [Day.js](https://day.js.org/) | Manipulasi tanggal |
| [Lodash](https://lodash.com/) | Utility functions |
| [Vue Virtual Scroller](https://github.com/Akryum/vue-virtual-scroller) | Optimasi rendering daftar besar |
| Service Worker | Caching aset & offline support |

---

## 📂 Struktur Folder

```text
/
├── index.html          # Halaman utama
├── manifest.json       # Konfigurasi PWA
├── sw.js               # Service Worker (caching & offline)
├── style.css           # Semua styling global
├── config.js           # Konstanta & konfigurasi (CONFIG, MENU_TABS, dsb)
├── utils.js            # Fungsi utilitas (validator, retry, date helper)
├── db.js               # Layer database (class Database)
├── store.js            # State reaktif (Vue.observable) & error handler
├── computed.js         # Computed properties
├── watch.js            # Watchers (menu, filter, range)
├── methods.js          # Semua method/logika bisnis
├── lifecycle.js        # Lifecycle hooks (mounted, beforeDestroy)
├── app.js              # Entry point (gabungan semua bagian)
└── icon/               # Ikon PWA (16, 32, 180, 256, 512 px)
