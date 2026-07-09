export const computedMixin = {
    computed: {
        filteredList() {
            const q = this.store.searchQuery.toLowerCase();
            const m = this.store.currentMenu;
            const data = this.store.lists[m] || [];
            let filtered = _.filter(data, item => {
                if (m === 'pelanggan') return item.nama.toLowerCase().includes(q) || item.hp.includes(q);
                if (m === 'penjualan') return item.barang.toLowerCase().includes(q) || this.getPelangganName(item.pelangganId).toLowerCase().includes(q);
                if (m === 'kas') return this.formatKeteranganKas(item).toLowerCase().includes(q);
                if (m === 'produksi') return item.bahan.toLowerCase().includes(q) || item.produk.toLowerCase().includes(q);
                return true;
            });
            if (m !== 'pelanggan') {
                const f = this.store.activeFilter;
                const hari = dayjs().format('YYYY-MM-DD'), kemarin = dayjs().add(-1,'day').format('YYYY-MM-DD');
                const mingguIni = dayjs().startOf('week').format('YYYY-MM-DD');
                const mingguLaluStart = dayjs().subtract(1,'week').startOf('week').format('YYYY-MM-DD');
                const mingguLaluEnd = dayjs().subtract(1,'week').endOf('week').format('YYYY-MM-DD');
                filtered = _.filter(filtered, item => {
                    if (f === 'all') return true;
                    if (f === 'today') return item.tgl === hari;
                    if (f === 'yesterday') return item.tgl === kemarin;
                    if (f === 'thisWeek') return item.tgl >= mingguIni && item.tgl <= hari;
                    if (f === 'lastWeek') return item.tgl >= mingguLaluStart && item.tgl <= mingguLaluEnd;
                    if (f === 'range') return item.tgl >= this.store.customRange.start && item.tgl <= this.store.customRange.end;
                    return true;
                }, this);
            }
            return _.orderBy(filtered, ['tgl','id'], ['desc','desc']);
        },
        pipelineResult() {
            return {
                data: this.filteredList.slice(0, this.store.lazyLimit),
                totalItems: this.filteredList.length
            };
        },
        kasSummary() {
            if (this.store.currentMenu !== 'kas') return { masuk: 0, keluar: 0, netto: 0 };
            const masuk = _.sumBy(this.filteredList, i => i.jenis === 'masuk' ? i.nominal : 0);
            const keluar = _.sumBy(this.filteredList, i => i.jenis === 'keluar' ? i.nominal : 0);
            return { masuk, keluar, netto: masuk - keluar };
        },
        cartTotal() {
            return _.sumBy(this.store.cart, i => i.qty * i.harga);
        }
    }
};
