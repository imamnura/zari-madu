// Tanggal bisnis (nomor order, laporan bulanan) selalu dalam WIB, bukan zona waktu server.
// Indonesia tidak memakai DST, jadi offset Asia/Jakarta tetap UTC+7.
const JAKARTA_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

export interface IJakartaDateParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

export function jakartaDateParts(now: Date = new Date()): IJakartaDateParts {
  const shifted = new Date(now.getTime() + JAKARTA_UTC_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

/** Rentang [start, end) bulan berjalan dalam WIB, sebagai instant UTC untuk query DB. */
export function jakartaMonthRange(now: Date = new Date()): { start: Date; end: Date } {
  const { year, month } = jakartaDateParts(now);
  return {
    start: new Date(Date.UTC(year, month - 1, 1) - JAKARTA_UTC_OFFSET_MS),
    end: new Date(Date.UTC(year, month, 1) - JAKARTA_UTC_OFFSET_MS),
  };
}
