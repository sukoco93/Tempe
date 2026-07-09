window.exportImportMixin = {
    methods: {
        handleExport() {
            const data = this.store.lists[this.store.currentMenu];
            if (!data || !data.length) { this.showToast('Tidak ada data'); return; }
            const csv = window.arrayToCSV(data);
            window.downloadFile(csv, `${this.store.currentMenu}.csv`);
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
                    await window.db[this.store.currentMenu].bulkAdd(bulk);
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
            window.downloadFile(JSON.stringify(payload, null, 2), 'Backup.json', 'application/json');
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
                        if (window.db[s]) {
                            await window.db[s].clear();
                            for (const item of data[s]) { delete item.id; await window.db[s].add(item); }
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
