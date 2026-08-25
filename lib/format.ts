// Centralized formatting helpers for EMMY NOIR.

export function formatPrice(value: number): string {
  if (value === 0) return 'Coming soon';
  return `₦${value.toLocaleString('en-NG')}`;
}

export function getDiscountPercentage(
  price: number,
  salePrice: number | null | undefined
): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function generateOrderReference(): string {
  return `EN-${Date.now().toString().slice(-6)}`;
}
