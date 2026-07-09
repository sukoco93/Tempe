window.db = new Dexie("TokoAndroidDB_TopSheet_FinalFix");
window.db.version(1).stores({
    pelanggan: '++id, nama, hp',
    penjualan: '++id, tgl, pelangganId, barang, total',
    kas: '++id, tgl, jenis, keterangan, nominal, isAutomated, pelangganId',
    produksi: '++id, tgl, bahan, produk'
});
