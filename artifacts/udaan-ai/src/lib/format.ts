export const inr = (n: number | null | undefined) =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : (n < 0 ? '−₹' : '₹') + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const num = (n: number) => n.toLocaleString('en-IN');
export const signed = (n: number, money = false) => (n > 0 ? '+' : n < 0 ? '−' : '') + (money ? '₹' : '') + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const pct = (a: number) => Math.round(a * 100) / 100;
export function errMsg(e: unknown, fallback: string): string {
  const d = (e as { data?: { error?: unknown; message?: unknown } } | null)?.data;
  if (d && typeof d.error === 'string') return d.error;
  if (d && typeof d.message === 'string') return d.message;
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
export const imgSrc = (p: string) => (p.startsWith('http') ? p : import.meta.env.BASE_URL.replace(/\/$/, '') + p);
