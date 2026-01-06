import { formatDateToSQL, formatDisplayDate } from '../../src/utils/date.utils';
import { calculateDays } from '../../src/rental/rental.entity';

describe('utilidades de fecha', () => {
    test('formatDateToSQL acepta Date y devuelve YYYY-MM-DD', () => {
        const d = new Date(2025, 10, 11);
        expect(formatDateToSQL(d)).toBe('2025-11-11');
    });

    test('formatDateToSQL acepta string ISO y devuelve YYYY-MM-DD', () => {
        expect(formatDateToSQL('2025-11-11')).toBe('2025-11-11');
        expect(formatDateToSQL('2025-11-11T12:00:00Z')).toBe('2025-11-11');
    });

    test('formatDisplayDate formatea Date como DD/MM/AAAA', () => {
        const d = new Date(2025, 10, 11);
        expect(formatDisplayDate(d)).toBe('11/11/2025');
    });

    test('calculateDays cuenta días de forma inclusiva y como mínimo 1', () => {
        const s = new Date(2025, 10, 11);
        const e = new Date(2025, 10, 12);
        expect(calculateDays(s, e)).toBe(1);
        const s2 = new Date(2025, 10, 11);
        const e2 = new Date(2025, 10, 11);
        expect(calculateDays(s2, e2)).toBe(1);
        const s3 = new Date(2025, 10, 11);
        const e3 = new Date(2025, 10, 13);
        expect(calculateDays(s3, e3)).toBe(2);
    });
});
