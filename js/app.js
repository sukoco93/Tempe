new Vue({
    el: '#app',
    mixins: [
        window.dataMixin,
        window.computedMixin,
        window.crudMixin,
        window.uiMixin,
        window.exportImportMixin
    ],
    mounted() {
        this.loadData();

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.error('SW registration failed', err));
        }
    }
});
