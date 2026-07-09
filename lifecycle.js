// ================================================================
// LIFECYCLE HOOKS (mounted, beforeDestroy)
// ================================================================

window.AppLifecycle = {
  mounted() {
    this.resetAndLoad();

    // Fallback timeout untuk splash jika data terlalu lama
    setTimeout(() => {
      this.hideSplash();
    }, 5000);

    // Sinkronisasi antar tab
    const syncHandler = (e) => {
      if (e.key === 'db-updated') {
        this.resetAndLoad();
        this.showToast('Data diupdate dari tab lain');
      }
    };
    window.addEventListener('storage', syncHandler);

    // Online/offline
    const updateOnline = () => {
      this.online = navigator.onLine;
    };
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    // Simpan ref untuk cleanup
    this._syncHandler = syncHandler;
    this._updateOnline = updateOnline;
  },

  beforeDestroy() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.onSearchInput.cancel) this.onSearchInput.cancel();

    if (this._syncHandler) {
      window.removeEventListener('storage', this._syncHandler);
    }
    if (this._updateOnline) {
      window.removeEventListener('online', this._updateOnline);
      window.removeEventListener('offline', this._updateOnline);
    }
  }
};