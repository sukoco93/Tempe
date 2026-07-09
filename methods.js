window.AppMethods = {
  getPelangganName(id) {
    return this.pelangganMap[id]?.nama || 'Umum';
  },

  async loadData(resetOffset = true) {
    if (this.loading) return;
    if (resetOffset) { this.offset = 0; this.items = []; }
    this.loading = true;
    this.searchLimited = false;

    try {
      this.pelangganMap = await db.getPelangganMap();
      const limit = this.searchQuery ? CONFIG.SEARCH_LIMIT : CONFIG.PAGE_SIZE;
      const offset = resetOffset ? 0 : this.offset;
      const result = await db.getItems(
        this.menu, this.filter, this.rangeStart, this.rangeEnd,
        this.searchQuery, offset, limit
      );
      if (this.searchQuery && result.items.length >= CONFIG.SEARCH_LIMIT) this.searchLimited = true;

      let items = result.items;
      if (this.menu === 'penjualan') {
        items = items.map(item => ({
          ...item,
          barangList: item.barang ? item.barang.split(', ').filter(s => s.trim()) : []
        }));
      }

      if (resetOffset) this.items = items;
      else this.items = [...this.items, ...items];

      if (this.items.length > CONFIG.MAX_VISIBLE_ITEMS) {
        this.items = this.items.slice(0, CONFIG.MAX_VISIBLE_ITEMS);
        this.totalItems = Math.min(result.total, CONFIG.MAX_VISIBLE_ITEMS);
      } else {
        this.totalItems = result.total;
      }

      if (this.menu === 'kas') {
        this._summary = await db.getKasSummary(this.filter, this.rangeStart, this.rangeEnd) || { masuk: 0, keluar: 0, netto: 0 };
      }

      this.hideSplash();

      if (!this.items.length && this.totalItems > 0 && this.offset > 0) {
        this.offset = 0;
        await this.loadData(true);
      }
    } catch (e) {
      console.error(e);
      this.showToast('Gagal muat data');
    } finally {
      this.loading = false;
    }
  },

  hideSplash() {
    const splash = document.getElementById('splash');
    if (splash && !splash.classList.contains('hide')) {
      splash.classList.add('hide');
      setTimeout(() => {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 800);
    }
  },

  resetAndLoad() {
    this.offset = 0;
    this.items = [];
    this.loadData(true);
  },

  loadMore() {
    if (this.loading) return;
    if (this.items.length >= CONFIG.MAX_VISIBLE_ITEMS) {
      this.showToast('Maksimal ' + CONFIG.MAX_VISIBLE_ITEMS + ' data ditampilkan');
      return;
    }
    this.offset += CONFIG.PAGE_SIZE;
    this.loadData(false);
  },

  onSearchInput: _.debounce(function() {
    this.resetAndLoad();
  }, 300),

  setFilter(val) {
    this.filter = val;
    if (val !== 'range') {
      this.rangeStart = Utils.today();
      this.rangeEnd = Utils.today();
    }
    this.resetAndLoad();
  },

  onRangeChange() {
    if (this.filter === 'range') this.resetAndLoad();
  },

  switchMenu(menu) {
    this.menu = menu;
    this.showAdd = false;
    this.showSettings = false;
    this.resetAndLoad();
  },

  openAddForm() {
    this.editingId = null;
    this.form = Utils.clone(DEFAULT_FORMS);
    this.cart = [];
    this.cartForm = { barang: 'Tempe', qty: 1, harga: 2500 };
    this.showAdd = true;
  },

  editItem(item) {
    this.editingId = item.id;
    const menu = this.menu;
    const formData = {};
    for (const key of Object.keys(FORM_FIELDS[menu] || {})) {
      formData[key] = item[key] !== undefined ? item[key] : '';
    }
    this.form[menu] = formData;
    if (menu === 'penjualan') this.cart = [];
    this.showAdd = true;
  },

  closeForm() {
    this.showAdd = false;
    this.editingId = null;
    this.cart = [];
  },

  showToast(msg) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = msg;
    this.toastTimer = setTimeout(() => {
      this.toast = '';
      this.toastTimer = null;
    }, 2500);
  },

  addToCart() {
    if (this.cart.length >= CONFIG.MAX_CART_ITEMS) {
      this.showToast('Keranjang penuh (maks ' + CONFIG.MAX_CART_ITEMS + ' item)');
      return;
    }
    const form = this.cartForm;
    if (!form.barang.trim() || !form.harga) {
      this.showToast('Isi barang & harga');
      return;
    }
    this.ajaxLoading = true;
    setTimeout(() => {
      const existing = _.find(this.cart, i => i.barang.toLowerCase() === form.barang.trim().toLowerCase());
      if (existing) existing.qty += form.qty;
      else this.cart.push({ barang: form.barang.trim(), qty: form.qty, harga: form.harga });
      this.showToast(form.barang.trim() + ' ditambahkan');
      form.barang = form.barang.trim() === 'Tempe' ? 'Balen' : 'Tempe';
      form.harga = form.barang === 'Tempe' ? 2500 : 2000;
      form.qty = 1;
      this.ajaxLoading = false;
    }, 150);
  },

  async submitForm() {
    if (this.loading) return;
    const menu = this.menu;
    const formData = { ...this.form[menu] };

    if (menu === 'pelanggan') {
      const allPelanggan = await db.getPelanggan();
      if (Utils.isDuplicatePelanggan(allPelanggan, formData, this.editingId)) {
        this.showToast('Nama atau HP sudah terdaftar');
        return;
      }
    }

    const validateMap = {
      hp: (v) => Utils.validators.hp(v),
      nominal: (v) => Utils.validators.nominal(v),
      qty: (v) => Utils.validators.qty(v),
      harga: (v) => Utils.validators.harga(v),
      tgl: (v) => Utils.validators.date(v)
    };
    for (const [key, rule] of Object.entries(validateMap)) {
      if (formData[key] !== undefined) {
        const result = rule(formData[key]);
        if (result !== true) {
          this.showToast(result);
          return;
        }
      }
    }
    const required = Object.keys(FORM_FIELDS[menu] || {});
    for (const key of required) {
      const val = formData[key];
      const result = Utils.validators.required(val);
      if (result !== true) {
        this.showToast(result);
        return;
      }
    }

    this.loading = true;
    try {
      await db.transaction('rw', [db.db[menu], db.db.kas], async () => {
        if (menu === 'penjualan') {
          if (!this.editingId && !this.cart.length) throw new Error('Keranjang kosong');
          if (this.editingId) {
            await db.updateItem('penjualan', this.editingId, {
              tgl: formData.tgl,
              pelangganId: formData.pelangganId
            });
          } else {
            const rincian = this.cart.map(i =>
              `${i.barang} (${i.qty}xRp${i.harga.toLocaleString()})`
            ).join(', ');
            const total = this.cartTotal;
            await db.addItem('penjualan', {
              tgl: formData.tgl,
              pelangganId: formData.pelangganId,
              barang: rincian,
              total
            });
            await db.addItem('kas', {
              tgl: formData.tgl,
              jenis: 'masuk',
              keterangan: `Penjualan: ${rincian}`,
              nominal: total,
              isAutomated: true,
              pelangganId: formData.pelangganId
            });
            this.cart = [];
            this.form.penjualan = Utils.clone(DEFAULT_FORMS.penjualan);
          }
        } else {
          if (this.editingId) await db.updateItem(menu, this.editingId, formData);
          else await db.addItem(menu, formData);
        }
      });
      this.showToast(this.editingId ? 'Diperbarui!' : 'Tersimpan!');
      this.closeForm();
      this.pelangganMap = await db.getPelangganMap();
      this.resetAndLoad();
    } catch (e) {
      console.error(e);
      this.showToast('Gagal: ' + e.message);
    } finally {
      this.loading = false;
    }
  },

  async deleteItem(id) {
    if (this.loading || !confirm('Hapus data ini?')) return;
    this.loading = true;
    const menu = this.menu;
    try {
      await db.transaction('rw', [db.db[menu], db.db.kas], async () => {
        if (menu === 'penjualan') {
          const p = await db.db.penjualan.get(id);
          if (p) {
            const k = await db.db.kas.where({
              tgl: p.tgl,
              nominal: p.total,
              isAutomated: true
            }).first();
            if (k) await db.deleteItem('kas', k.id);
          }
        }
        await db.deleteItem(menu, id);
      });
      this.showToast('Terhapus');
      this.items = this.items.filter(i => i.id !== id);
      this.totalItems--;
    } catch (e) {
      console.error('[Delete Error]', e);
      this.showToast('Gagal hapus: ' + e.message);
    } finally {
      this.loading = false;
    }
  },

  sendWhatsApp(item) {
    if (this.menu !== 'penjualan' || !item.barang) return;
    const nama = this.getPelangganName(item.pelangganId);
    const lines = item.barang.split(', ').map(i => `  ${i}`).join('\n');
    const msg = "```\n============================\n          INVOICE           \n============================\nTgl      : " + item.tgl + "\nPelanggan: " + nama + "\n----------------------------\nDaftar Barang:\n" + lines + "\n----------------------------\nTOTAL    : Rp " + item.total.toLocaleString() + "\n============================\nTerimakasih\nIda 0856-0627-1720\n```";
    window.open(`https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`, '_blank');
  },

  async exportData() {
    const allData = await db.getAll(this.menu);
    if (!allData.length) {
      this.showToast('Tidak ada data');
      return;
    }
    this.showToast('Memproses export...');
    await Utils.sleep(100);
    const headers = Object.keys(allData[0]);
    const CHUNK = 500;
    let csv = headers.join(',') + '\n';
    for (let i = 0; i < allData.length; i += CHUNK) {
      const chunk = allData.slice(i, i + CHUNK);
      const rows = chunk.map(obj => headers.map(k => `"${obj[k]}"`).join(','));
      csv += rows.join('\n') + '\n';
      if (i + CHUNK < allData.length) await Utils.sleep(50);
    }
    Utils.downloadFile(csv, `${this.menu}_${Utils.today()}.csv`);
    this.showToast('Export berhasil (' + allData.length + ' data)');
  },

  async importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        this.loading = true;
        const lines = ev.target.result.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          this.showToast('CSV kosong');
          return;
        }
        const headers = lines[0].split(',').map(s => s.trim());
        const bulk = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
          const obj = {};
          headers.forEach((k, idx) => {
            if (k !== 'id') obj[k] = Utils.toNumber(vals[idx]);
          });
          bulk.push(obj);
        }
        await db.bulkAdd(this.menu, bulk);
        this.showToast('Impor sukses (' + bulk.length + ' data)');
        this.pelangganMap = await db.getPelangganMap();
        this.resetAndLoad();
      } catch (err) {
        alert('Eror CSV: ' + err.message);
      } finally {
        this.loading = false;
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  },

  async backupData() {
    const payload = {
      pelanggan: await db.getAll('pelanggan'),
      penjualan: await db.getAll('penjualan'),
      kas: await db.getAll('kas'),
      produksi: await db.getAll('produksi')
    };
    Utils.downloadFile(JSON.stringify(payload, null, 2), `Backup_${Utils.today()}.json`, 'application/json');
    this.showToast('Backup selesai');
    this.showSettings = false;
  },

  async restoreData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        this.loading = true;
        const data = JSON.parse(ev.target.result);
        for (const s of ['pelanggan', 'penjualan', 'kas', 'produksi']) {
          if (data[s]) {
            await db.clearAll(s);
            const chunked = data[s].map(item => {
              delete item.id;
              return item;
            });
            await db.bulkAdd(s, chunked);
          }
        }
        this.showToast('Restore sukses');
        this.showSettings = false;
        this.pelangganMap = await db.getPelangganMap();
        this.resetAndLoad();
      } catch (err) {
        alert('JSON rusak: ' + err.message);
      } finally {
        this.loading = false;
      }
    };
    reader.readAsText(file);
  },

  getItemClass(item) {
    if (this.menu === 'kas') {
      return item.jenis === 'masuk' ? 'kas-masuk' : 'kas-keluar';
    }
    return '';
  }
};
