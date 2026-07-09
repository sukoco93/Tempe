// Fungsi bantu
export function today() {
    return dayjs().format('YYYY-MM-DD');
}

export function getDateOffset(d) {
    return dayjs().add(d, 'day').format('YYYY-MM-DD');
}

export function validateForm(data, fields) {
    for (let f of fields) {
        const v = data[f];
        if (typeof v === 'string' && v.trim() === '') return { valid: false, field: f };
        if (typeof v === 'number' && v <= 0) return { valid: false, field: f };
        if (v === undefined || v === null || v === '') return { valid: false, field: f };
    }
    return { valid: true };
}

export function downloadFile(content, name, mime = 'text/csv') {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function arrayToCSV(data) {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(k => `"${obj[k]}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
}
