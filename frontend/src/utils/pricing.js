export function calculateDiscountPercent(originalPrice, salePrice) {
  const isMissing = (value) => value === "" || value == null;
  if (isMissing(originalPrice) || isMissing(salePrice)) return "0";

  const original = Number(originalPrice);
  const sale = Number(salePrice);
  if (!Number.isFinite(original) || !Number.isFinite(sale) || original <= 0) return "0";

  return Math.max(0, ((original - sale) / original) * 100).toFixed(1);
}
