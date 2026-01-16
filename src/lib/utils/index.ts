export { cn } from './cn'

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatTransactionDate(date: Date) {
  // Plaid dates come as "YYYY-MM-DD"
  // new Date("2024-01-01") parses as UTC midnight.
  // We want to force it to show as that calendar date regardless of local timezone.
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}