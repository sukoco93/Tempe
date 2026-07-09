window.uiMixin = {
    methods: {
        getPelangganName(id) {
            const found = _.find(this.store.lists.pelanggan, { id });
            return found ? found.nama : 'Umum';
        },
        formatKeteranganKas(item) {
            if (item.isAutomated) return `Penjualan - ${this.getPelangganName(item.pelangganId)}`;
            return item.keterangan || '-';
        },
        resetLazyLoad() { this.store.lazyLimit = 10; },
        changeTab(tab) {
            this.store.currentMenu = tab;
            this.resetLazyLoad();
        },
        setFilter(val) {
            this.store.activeFilter = val;
            if (val === 'range') this.store.showRangeDialog = true;
            this.resetLazyLoad();
        },
        handleListScroll(e) {
            const el = e.target;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 20 && this.store.lazyLimit < this.filteredList.length) {
                this.store.lazyLimit += 10;
            }
        },
        showToast(msg) {
            this.store.toast.message = msg;
            this.store.toast.show = true;
            setTimeout(() => { this.store.toast.show = false; }, 1800);
        },
        sendWhatsApp(item) {
            if (this.store.currentMenu !== 'penjualan' || !item.barang) return;
            const nama = this.getPelangganName(item.pelangganId);
            const lines = item.barang.split(', ').map(i => `  ${i}`).join('\n');
            const msg = "```\n============================\n          INVOICE           \n============================\nTgl      : "+item.tgl+"\nPelanggan: "+nama+"\n----------------------------\nDaftar Barang:\n"+lines+"\n----------------------------\nTOTAL    : Rp "+item.total.toLocaleString()+"\n============================\nTerimakasih\nIda 0856-0627-1720\n```";
            window.open(`https://api.whatsapp.com/send?phone=${window.WHATSAPP_TARGET}&text=${encodeURIComponent(msg)}`, '_blank');
        }
    }
};
