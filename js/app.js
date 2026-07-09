// ==================== dataMixin ====================
const dataMixin = {
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

// ==================== computedMixin ====================
const computedMixin = {
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

// ==================== crudMixin ====================
const crudMixin = {
    methods: {
        async loadData() {
            try {
                this.store.isLoading = true;
                this.store.lists.pelanggan = await db.pelanggan.toArray();
                this.store.lists.penjualan = await db.penjualan.toArray();
                this.store.lists.kas = await db.kas.toArray();
                this.store.lists.produksi = await db.produksi.toArray();
            } catch (e) {
                console.error(e);
                this.showToast('Gagal muat data');
            } finally {
                this.store.isLoading = false;
            }
        },
        async deleteData(id) {
            if (this.store.isLoading || !confirm('Hapus data ini?')) return;
            this.store.isLoading = true;
            const m = this.store.currentMenu;
            try {
                const tables = [db[m]];
                if (m === 'penjualan') tables.push(db.kas);
                await db.transaction('rw', tables, async () => {
                    if (m === 'penjualan') {
                        const p = await db.penjualan.get(id);
                        if (p) {
                            const k = await db.kas.where({ tgl: p.tgl, nominal: p.total, isAutomated: true }).first();
                            if (k) await db.kas.delete(k.id);
                        }
                    }
                    await db[m].delete(id);
                });
                this.showToast('Terhapus');
                await this.loadData();
            } catch (e) {
                console.error(e);
                this.showToast('Gagal hapus');
            } finally {
                this.store.isLoading = false;
            }
        },
        async submitForm() {
            if (this.store.isLoading) return;
            const m = this.store.currentMenu;
            const data = { ...this.store.forms[m] };
            let required = [];
            if (m === 'pelanggan') required = ['nama','hp'];
            else if (m === 'kas') required = ['tgl','jenis','keterangan','nominal'];
            else if (m === 'produksi') required = ['tgl','bahan','qty_bahan','produk','qty_produk'];
            else if (m === 'penjualan') {
                if (!this.store.cart.length) { this.showToast('Keranjang kosong'); return; }
                required = ['tgl','pelangganId'];
            }
            const val = validateForm(data, required);
            if (!val.valid) { this.showToast(`"${val.field}" wajib diisi`); return; }

            this.store.isLoading = true;
            try {
                const tables = [db[m]];
                if (m === 'penjualan') tables.push(db.kas);
                await db.transaction('rw', tables, async () => {
                    if (m === 'penjualan') {
                        const rincian = this.store.cart.map(i => `${i.barang} (${i.qty}xRp${i.harga.toLocaleString()})`).join(', ');
                        const total = this.cartTotal;
                        await db.penjualan.add({ tgl: data.tgl, pelangganId: data.pelangganId, barang: rincian, total });
                        await db.kas.add({
                            tgl: data.tgl, jenis: 'masuk',
                            keterangan: `Penjualan: ${rincian}`,
                            nominal: total, isAutomated: true, pelangganId: data.pelangganId
                        });
                        this.store.cart = [];
                        this.store.forms.penjualan = _.cloneDeep(DEFAULT_FORMS.penjualan);
                    } else {
                        await db[m].add(data);
                    }
                });
                this.showToast('Tersimpan!');
                this.store.showAddDialog = false;
                this.store.forms[m] = _.cloneDeep(DEFAULT_FORMS[m]);
                this.resetLazyLoad();
                await this.loadData();
            } catch (e) {
                console.error(e);
                this.showToast('Gagal: ' + e.message);
            } finally {
                this.store.isLoading = false;
            }
        },
        async dispatchAddToCart() {
            const f = this.store.forms.penjualan;
            if (!f.barang.trim() || !f.harga) { this.showToast('Isi barang & harga'); return; }
            this.store.isAjaxLoading = true;
            await new Promise(r => setTimeout(r, 150));
            const target = _.find(this.store.cart, i => i.barang.toLowerCase() === f.barang.trim().toLowerCase());
            if (target) target.qty += f.qty;
            else this.store.cart.push({ barang: f.barang.trim(), qty: f.qty, harga: f.harga });
            this.showToast(`${f.barang.trim()} ditambahkan`);
            f.barang = f.barang.trim() === 'Tempe' ? 'Balen' : 'Tempe';
            f.harga = f.barang === 'Tempe' ? 2500 : 2000;
            f.qty = 1;
            this.store.isAjaxLoading = false;
        }
    }
};

// ==================== uiMixin ====================
const uiMixin = {
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
            window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_TARGET}&text=${encodeURIComponent(msg)}`, '_blank');
        }
    }
};

// ==================== exportImportMixin ====================
const exportImportMixin = {
    methods: {
        handleExport() {
            const data = this.store.lists[this.store.currentMenu];
            if (!data || !data.length) { this.showToast('Tidak ada data'); return; }
            const csv = arrayToCSV(data);
            downloadFile(csv, `${this.store.currentMenu}.csv`);
            this.showToast('Export berhasil');
        },
        handleImport(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    this.store.isLoading = true;
                    const lines = ev.target.result.split('\n').filter(l => l.trim());
                    if (lines.length < 2) { this.showToast('CSV kosong'); return; }
                    const headers = lines[0].split(',').map(h => h.trim());
                    const bulk = [];
                    for (let i=1; i<lines.length; i++) {
                        const vals = lines[i].split(',').map(v => v.replace(/^"|"$/g,'').trim());
                        const obj = {};
                        headers.forEach((h, idx) => { if (h !== 'id') obj[h] = isNaN(vals[idx]) ? vals[idx] : Number(vals[idx]); });
                        bulk.push(obj);
                    }
                    await db[this.store.currentMenu].bulkAdd(bulk);
                    this.showToast('Impor sukses');
                    this.resetLazyLoad();
                    await this.loadData();
                } catch (err) {
                    alert('Eror CSV: '+err.message);
                } finally {
                    this.store.isLoading = false;
                    e.target.value = '';
                }
            };
            reader.readAsText(file);
        },
        backupJSON() {
            const payload = {
                pelanggan: this.store.lists.pelanggan,
                penjualan: this.store.lists.penjualan,
                kas: this.store.lists.kas,
                produksi: this.store.lists.produksi
            };
            downloadFile(JSON.stringify(payload, null, 2), 'Backup.json', 'application/json');
            this.showToast('Backup selesai');
            this.store.showSettings = false;
        },
        restoreJSON(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    this.store.isLoading = true;
                    const data = JSON.parse(ev.target.result);
                    for (const s in data) {
                        if (db[s]) {
                            await db[s].clear();
                            for (const item of data[s]) { delete item.id; await db[s].add(item); }
                        }
                    }
                    this.showToast('Restore sukses');
                    this.store.showSettings = false;
                    setTimeout(() => location.reload(), 500);
                } catch (err) {
                    alert('JSON rusak: '+err.message);
                } finally {
                    this.store.isLoading = false;
                }
            };
            reader.readAsText(file);
        }
    }
};

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.error('SW registration failed', err));
        }
    }
});
