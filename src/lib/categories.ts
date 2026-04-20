export const CREDIT_CATEGORIES = [
  "Salary",
  "Bonus",
  "Freelance",
  "Investment",
  "Refund",
  "Gift",
  "Other Income",
] as const;

export const DEBIT_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Subscriptions",
  "Other Expense",
] as const;

export const ALL_CATEGORIES = [...CREDIT_CATEGORIES, ...DEBIT_CATEGORIES];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
