// Konfigurasi statis
const DEFAULT_FORMS = {
    pelanggan: { nama: '', hp: '' },
    penjualan: { tgl: dayjs().format('YYYY-MM-DD'), pelangganId: '', barang: 'Tempe', qty: 1, harga: 2500 },
    kas: { tgl: dayjs().format('YYYY-MM-DD'), jenis: 'masuk', keterangan: '', nominal: '' },
    produksi: { tgl: dayjs().format('YYYY-MM-DD'), bahan: 'Kedelai', qty_bahan: 1, produk: 'Tempe', qty_produk: 1 }
};

const FILTER_OPTIONS = [
    { label: 'Semua', value: 'all' },
    { label: 'Hari Ini', value: 'today' },
    { label: 'Kemarin', value: 'yesterday' },
    { label: 'Minggu Ini', value: 'thisWeek' },
    { label: 'Minggu Lalu', value: 'lastWeek' },
    { label: 'Rentang 📅', value: 'range' }
];

const WHATSAPP_TARGET = "6285963172893";
