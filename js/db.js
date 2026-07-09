// Inisialisasi Dexie
import Dexie from 'https://unpkg.com/dexie@4.0.8/dist/dexie.js'; // atau bisa pakai window.Dexie

export const db = new Dexie("TokoAndroidDB_TopSheet_FinalFix");
db.version(1).stores({
    pelanggan: '++id, nama, hp',
    penjualan: '++id, tgl, pelangganId, barang, total',
    kas: '++id, tgl, jenis, keterangan, nominal, isAutomated, pelangganId',
    produksi: '++id, tgl, bahan, produk'
});
