if (typeof VueVirtualScroller !== 'undefined') {
  Vue.use(VueVirtualScroller);
} else {
  console.warn('[App] VueVirtualScroller tidak tersedia, menggunakan fallback v-for biasa');
}

new Vue({
  el: '#app',
  data: () => storeState,
  computed: window.AppComputed || {},
  watch: window.AppWatch || {},
  methods: window.AppMethods || {},
  mounted: window.AppLifecycle?.mounted || function() {},
  beforeDestroy: window.AppLifecycle?.beforeDestroy || function() {}
});
