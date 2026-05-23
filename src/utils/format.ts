export function formatCurrency(value: number): string {
  if (!value) return "Not Available";
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatFees(value: number): string {
  if (!value) return "Not Available";
  return `₹${value.toLocaleString("en-IN")}/yr`;
}
