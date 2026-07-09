window.dataMixin = {
    data() {
        return {
            store: {
                currentMenu: 'penjualan',
                searchQuery: '',
                showSettings: false,
                isLoading: false,
                isAjaxLoading: false,
                activeFilter: 'all',
                showRangeDialog: false,
                showAddDialog: false,
                customRange: { start: window.today(), end: window.today() },
                filterOptions: window.FILTER_OPTIONS,
                lists: { pelanggan: [], penjualan: [], kas: [], produksi: [] },
                cart: [],
                lazyLimit: 10,
                toast: { show: false, message: '' },
                forms: _.cloneDeep(window.DEFAULT_FORMS)
            }
        };
    },
    watch: {
        'store.lists': { deep: true, handler() {} }
    }
};
