export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function calculateDiscount(priceInCents: number, compareAtInCents?: number | null): number | null {
  if (!compareAtInCents || compareAtInCents <= priceInCents) return null;
  return Math.round(((compareAtInCents - priceInCents) / compareAtInCents) * 100);
}
