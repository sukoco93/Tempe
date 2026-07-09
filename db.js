// ================================================================
// DATABASE LAYER
// ================================================================

class Database {
  constructor() {
    this.db = new Dexie(CONFIG.DB_NAME);
    this.db.version(CONFIG.DB_VERSION).stores(CONFIG.DB_STORES);
  }

  async getPelanggan() {
    return Utils.retry(() => this.db.pelanggan.toArray());
  }

  async getPelangganMap() {
    const data = await this.getPelanggan();
    return _.keyBy(data, 'id');
  }

  async getItems(menu, filter, rangeStart, rangeEnd, search, offset, limit) {
    return Utils.retry(async () => {
      const table = this.db[menu];
      if (!table) return { items: [], total: 0 };

      let collection = table.orderBy('tgl');
      const dateFilter = Utils.getDateFilter(filter, rangeStart, rangeEnd);
      if (dateFilter) {
        collection = table.where('tgl').between(dateFilter.start, dateFilter.end).reverse();
      } else {
        collection = table.orderBy('tgl').reverse();
      }

      let total = await collection.count();
      let items = await collection.offset(offset).limit(limit).toArray();

      if (search) {
        const q = search.toLowerCase().trim();
        const pelangganMap = await this.getPelangganMap();
        items = items.filter(item => {
          if (menu === 'pelanggan') return item.nama.toLowerCase().includes(q) || item.hp.includes(q);
          if (menu === 'penjualan') return item.barang.toLowerCase().includes(q) || (pelangganMap[item.pelangganId]?.nama || '').toLowerCase().includes(q);
          if (menu === 'kas') {
            const ket = item.isAutomated ? 'Penjualan - ' + (pelangganMap[item.pelangganId]?.nama || 'Umum') : (item.keterangan || '');
            return ket.toLowerCase().includes(q);
          }
          if (menu === 'produksi') return item.bahan.toLowerCase().includes(q) || item.produk.toLowerCase().includes(q);
          return true;
        });
        total = items.length;
        if (items.length >= CONFIG.SEARCH_LIMIT) items = items.slice(0, CONFIG.SEARCH_LIMIT);
      }
      return { items, total };
    });
  }

  async addItem(menu, data) {
    return Utils.retry(() => this.db[menu].add(data));
  }

  async updateItem(menu, id, data) {
    return Utils.retry(() => this.db[menu].update(id, data));
  }

  async deleteItem(menu, id) {
    return Utils.retry(() => this.db[menu].delete(id));
  }

  async bulkAdd(menu, data, chunkSize = 100) {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await Utils.retry(() => this.db[menu].bulkAdd(chunk));
      if (i + chunkSize < data.length) await Utils.sleep(50);
    }
  }

  async getAll(menu) {
    return Utils.retry(() => this.db[menu].toArray());
  }

  async clearAll(menu) {
    return Utils.retry(() => this.db[menu].clear());
  }

  async transaction(rw, stores, callback) {
    return Utils.retry(() => this.db.transaction(rw, stores, callback));
  }

  async getKasSummary(filter, rangeStart, rangeEnd) {
    return Utils.retry(async () => {
      let allKas = await this.db.kas.toArray();
      const dateFilter = Utils.getDateFilter(filter, rangeStart, rangeEnd);
      if (dateFilter) allKas = allKas.filter(i => i.tgl >= dateFilter.start && i.tgl <= dateFilter.end);
      const masuk = _.sumBy(allKas, i => i.jenis === 'masuk' ? i.nominal : 0);
      const keluar = _.sumBy(allKas, i => i.jenis === 'keluar' ? i.nominal : 0);
      return { masuk, keluar, netto: masuk - keluar };
    });
  }
}
