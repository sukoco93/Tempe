import { db } from '../db.js';
import { validateForm, today } from '../utils.js';
import { DEFAULT_FORMS } from '../constants.js';

export const crudMixin = {
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
