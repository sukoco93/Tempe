// ================================================================
// APP – ENTRY POINT (Gabungan semua bagian)
// ================================================================

// Registrasi VueVirtualScroller jika tersedia
if (typeof VueVirtualScroller !== 'undefined') {
  Vue.use(VueVirtualScroller);
} else {
  console.warn('[App] VueVirtualScroller tidak tersedia, menggunakan fallback v-for biasa');
}

// Gabungkan semua bagian ke dalam Vue instance
new Vue({
  el: '#app',
  data: () => storeState,
  computed: window.AppComputed || {},
  watch: window.AppWatch || {},
  methods: window.AppMethods || {},
  mounted: window.AppLifecycle?.mounted || function() {},
  beforeDestroy: window.AppLifecycle?.beforeDestroy || function() {}
});