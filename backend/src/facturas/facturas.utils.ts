export function toNum(
  v: { toNumber: () => number } | number | null | undefined,
  fallback = 0,
): number {
  if (v == null) return fallback;
  return typeof v === 'number' ? v : v.toNumber();
}
