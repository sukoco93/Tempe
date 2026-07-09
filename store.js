const db = new Database();

const storeState = Vue.observable({
  menu: 'penjualan',
  searchQuery: '',
  filter: 'all',
  rangeStart: Utils.today(),
  rangeEnd: Utils.today(),
  items: [],
  totalItems: 0,
  offset: 0,
  pelangganMap: {},
  _summary: { masuk: 0, keluar: 0, netto: 0 },
  loading: false,
  ajaxLoading: false,
  showAdd: false,
  showSettings: false,
  cart: [],
  toast: '',
  toastTimer: null,
  searchLimited: false,
  online: navigator.onLine,
  form: Utils.clone(DEFAULT_FORMS),
  cartForm: { barang: 'Tempe', qty: 1, harga: 2500 },
  editingId: null
});

Vue.config.errorHandler = function(err, vm, info) {
  console.error('[Vue Error]', err, info);
  if (vm && vm.showToast) vm.showToast('Terjadi error: ' + (err.message || 'unknown'));
};
