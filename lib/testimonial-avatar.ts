/** Inisial untuk avatar: dua kata → huruf pertama masing-masing (mis. "Ibu Sari" → "IS"). */
export function testimonialInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[1][0];
    return `${a}${b}`.toUpperCase();
  }
  if (parts.length === 1) {
    const w = parts[0];
    if (w.length >= 2) return w.slice(0, 2).toUpperCase();
    return w.slice(0, 1).toUpperCase() || "?";
  }
  return "?";
}
