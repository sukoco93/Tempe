console.log('Vue version:', Vue.version);
import { dataMixin } from './mixins/dataMixin.js';
import { computedMixin } from './mixins/computedMixin.js';
import { crudMixin } from './mixins/crudMixin.js';
import { uiMixin } from './mixins/uiMixin.js';
import { exportImportMixin } from './mixins/exportImportMixin.js';

// ... import mixins
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
        console.log('Vue mounted!');
        this.loadData();

        // Registrasi Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.error('SW registration failed', err));
        }
    }
});
