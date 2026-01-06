export const pad = (n: number) => String(n).padStart(2, '0');

export function formatDateToSQL(input: Date | string): string {
    if (typeof input === 'string') {
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
        
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
            const [dd, mm, yyyy] = input.split('/').map(Number);
            return `${yyyy}-${pad(mm)}-${pad(dd)}`;
        }
        const d = new Date(input);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    const d = input;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseSQLDate(d: string | Date): Date {
    if (d instanceof Date) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, day] = s.split('-').map(Number);
        return new Date(y, (m || 1) - 1, day || 1);
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split('/').map(Number);
        return new Date(yyyy, (mm || 1) - 1, dd || 1);
    }
    const parsed = new Date(s);
    if (isNaN(parsed.getTime())) {
        return new Date();
    }
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function formatDisplayDate(d: Date | string): string {
    if (d instanceof Date) {
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(d))) {
        const [y, m, day] = String(d).split('-').map(Number);
        return `${pad(day)}/${pad(m)}/${y}`;
    }
    const parsed = new Date(String(d));
    return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
}
