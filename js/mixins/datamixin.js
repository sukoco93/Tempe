import { DEFAULT_FORMS, FILTER_OPTIONS } from '../constants.js';
import { today } from '../utils.js';

export const dataMixin = {
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
                customRange: { start: today(), end: today() },
                filterOptions: FILTER_OPTIONS,
                lists: { pelanggan: [], penjualan: [], kas: [], produksi: [] },
                cart: [],
                lazyLimit: 10,
                toast: { show: false, message: '' },
                forms: _.cloneDeep(DEFAULT_FORMS)
            }
        };
    },
    watch: {
        'store.lists': { deep: true, handler() {} }
    }
};
