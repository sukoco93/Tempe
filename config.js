// ================================================================
// KONFIGURASI (dibekukan)
// ================================================================

const CONFIG = Object.freeze({
  WHATSAPP_NUMBER: '6285963172893',
  PAGE_SIZE: 10,
  MAX_VISIBLE_ITEMS: 500,
  MAX_CART_ITEMS: 50,
  SEARCH_LIMIT: 200,
  DB_NAME: 'TokoAndroidDB_TopSheet_FinalFix',
  DB_VERSION: 1,
  DB_STORES: {
    pelanggan: '++id, nama, hp',
    penjualan: '++id, tgl, pelangganId, barang, total',
    kas: '++id, tgl, jenis, keterangan, nominal, isAutomated, pelangganId',
    produksi: '++id, tgl, bahan, produk'
  }
});

const MENU_TABS = Object.freeze([
  { key: 'penjualan', label: 'Jual', icon: 'fas fa-shopping-cart' },
  { key: 'kas', label: 'Kas', icon: 'fas fa-wallet' },
  { key: 'produksi', label: 'Produksi', icon: 'fas fa-seedling' },
  { key: 'pelanggan', label: 'Pelanggan', icon: 'fas fa-users' }
]);

const FILTER_OPTIONS = Object.freeze([
  { label: 'Semua', value: 'all' },
  { label: 'Hari Ini', value: 'today' },
  { label: 'Kemarin', value: 'yesterday' },
  { label: 'Minggu Ini', value: 'thisWeek' },
  { label: 'Minggu Lalu', value: 'lastWeek' },
  { label: 'Rentang 📅', value: 'range' }
]);

const DEFAULT_FORMS = Object.freeze({
  pelanggan: { nama: '', hp: '' },
  penjualan: { tgl: dayjs().format('YYYY-MM-DD'), pelangganId: '' },
  kas: { tgl: dayjs().format('YYYY-MM-DD'), jenis: 'masuk', keterangan: '', nominal: '' },
  produksi: { tgl: dayjs().format('YYYY-MM-DD'), bahan: 'Kedelai', qty_bahan: 1, produk: 'Tempe', qty_produk: 1 }
});

const FORM_FIELDS = Object.freeze({
  pelanggan: {
    nama: { label: 'Nama', type: 'text', placeholder: 'Nama lengkap', required: true },
    hp: { label: 'No. WhatsApp', type: 'tel', placeholder: '0812xxxx', required: true }
  },
  penjualan: {
    tgl: { label: 'Tanggal', type: 'date', placeholder: '', required: true },
    pelangganId: { label: 'Pelanggan', type: 'select', options: [], required: true }
  },
  kas: {
    tgl: { label: 'Tanggal', type: 'date', placeholder: '', required: true },
    jenis: { label: 'Jenis', type: 'select', options: [{ label: 'Masuk (+)', value: 'masuk' }, { label: 'Keluar (-)', value: 'keluar' }], required: true },
    keterangan: { label: 'Keterangan', type: 'text', placeholder: 'Deskripsi', required: true },
    nominal: { label: 'Nominal', type: 'number', placeholder: 'Rp', required: true }
  },
  produksi: {
    tgl: { label: 'Tanggal', type: 'date', placeholder: '', required: true },
    bahan: { label: 'Bahan Baku', type: 'text', placeholder: 'Kedelai', required: true },
    qty_bahan: { label: 'Qty Bahan', type: 'number', placeholder: '', required: true },
    produk: { label: 'Produk Jadi', type: 'text', placeholder: 'Tempe', required: true },
    qty_produk: { label: 'Qty Produk', type: 'number', placeholder: '', required: true }
  }
});
