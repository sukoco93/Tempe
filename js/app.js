console.log('Vue version:', Vue.version);

new Vue({
    el: '#app',
    data() {
        return { message: 'Halo Tempe! Aplikasi berjalan.' };
    },
    template: `<div style="padding:20px;font-size:24px;color:#00796b;">{{ message }}</div>`
});
