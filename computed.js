// ================================================================
// COMPUTED PROPERTIES
// ================================================================

window.AppComputed = {
  pelangganOptions() {
    const list = Object.values(this.pelangganMap);
    return list.map(p => ({ label: p.nama, value: p.id }));
  },
  formFields() {
    const fields = Utils.clone(FORM_FIELDS);
    if (this.menu === 'penjualan' && fields.penjualan) {
      fields.penjualan.pelangganId.options = this.pelangganOptions;
    }
    return fields;
  },
  summary() {
    return this._summary;
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