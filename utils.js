// ================================================================
// UTILITY FUNCTIONS
// ================================================================

const Utils = {
  today: () => dayjs().format('YYYY-MM-DD'),
  offsetDay: (d) => dayjs().add(d, 'day').format('YYYY-MM-DD'),
  toNumber: (v) => isNaN(v) ? v : Number(v),
  clone: (obj) => JSON.parse(JSON.stringify(obj)),
  downloadFile: (content, name, mime = 'text/csv') => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),
  getDateFilter: (filter, start, end) => {
    const t = Utils.today();
    switch (filter) {
      case 'today': return { start: t, end: t };
      case 'yesterday': { const y = Utils.offsetDay(-1); return { start: y, end: y }; }
      case 'thisWeek': return { start: dayjs().startOf('week').format('YYYY-MM-DD'), end: t };
      case 'lastWeek': {
        const s = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
        const e = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
        return { start: s, end: e };
      }
      case 'range': if (start && end) return { start, end };
      default: return null;
    }
  },
  formatCurrency: (val) => new Intl.NumberFormat('id-ID').format(val),
  validators: {
    hp: (v) => /^08[0-9]{8,11}$/.test(v) || 'No. HP harus dimulai 08 dan 9-12 digit',
    nominal: (v) => (v > 0 && Number.isFinite(v)) || 'Nominal harus lebih dari 0',
    qty: (v) => (v > 0 && Number.isInteger(v)) || 'Qty harus bilangan bulat > 0',
    harga: (v) => (v > 0 && Number.isFinite(v)) || 'Harga harus lebih dari 0',
    required: (v) => (v !== undefined && v !== null && v !== '') || 'Field wajib diisi',
    date: (v) => dayjs(v).isValid() || 'Tanggal tidak valid'
  },
  retry: async (fn, retries = 1, delay = 300) => {
    try { return await fn(); }
    catch (err) {
      if (retries <= 0) throw err;
      await Utils.sleep(delay);
      return Utils.retry(fn, retries - 1, delay);
    }
  },
  isDuplicatePelanggan: (list, data, excludeId) => {
    const q = data.nama?.trim().toLowerCase();
    const hp = data.hp?.trim();
    return list.some(p =>
      p.id !== excludeId &&
      (p.nama.toLowerCase() === q || p.hp === hp)
    );
  }
};
