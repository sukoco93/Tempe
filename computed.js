window.AppComputed = {
  pelangganOptions() {
    const list = Object.values(this.pelangganMap);
    return list.map(p => ({ label: p.nama, value: p.id }));
  },
  activeFormFields() {
    const fields = FORM_FIELDS[this.menu] || {};
    if (this.menu === 'penjualan' && fields.pelangganId) {
      fields.pelangganId.options = this.pelangganOptions;
    }
    return fields;
  },
  summary() {
    return this._summary || { masuk: 0, keluar: 0, netto: 0 };
  },
  cartTotal() {
    return _.sumBy(this.cart, i => i.qty * i.harga);
  },
  useVirtualScroller() {
    if (typeof VueVirtualScroller === 'undefined') return false;
    const components = this.$options.components;
    return !!(components && components.RecycleScroller);
  },
  MAX_VISIBLE_ITEMS() {
    return CONFIG.MAX_VISIBLE_ITEMS;
  },
  MAX_CART_ITEMS() {
    return CONFIG.MAX_CART_ITEMS;
  }
};
