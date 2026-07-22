// Presentational installment helper. "tra gop 0% x N thang" = price split into
// N equal monthly parts. This is demo UI only, never a real financing offer.
export function installmentMonthly(amount: number, months = 12): number {
  return Math.round(amount / months);
}
