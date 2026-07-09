import { dataMixin } from './mixins/dataMixin.js';
import { computedMixin } from './mixins/computedMixin.js';
import { crudMixin } from './mixins/crudMixin.js';
import { uiMixin } from './mixins/uiMixin.js';
import { exportImportMixin } from './mixins/exportImportMixin.js';

new Vue({
    el: '#app',
    mixins: [
        dataMixin,
        computedMixin,
        crudMixin,
        uiMixin,
        exportImportMixin
    ],
    mounted() {
        this.loadData();
    }
});
