import { format, parseISO, startOfMonth, isSameMonth, subMonths } from "date-fns";
import type { Transaction } from "@/components/TransactionsList";

export function toMonthKey(date: Date): string {
  return format(startOfMonth(date), "yyyy-MM");
}

export function filterTransactionsByMonth(transactions: Transaction[], month: Date): Transaction[] {
  const key = toMonthKey(month);
  return transactions.filter((t) => format(parseISO(t.transaction_date), "yyyy-MM") === key);
}

export function getEarliestTransactionMonth(transactions: Transaction[]): Date {
  if (transactions.length === 0) return startOfMonth(new Date());
  let earliest = parseISO(transactions[0].transaction_date);
  for (const t of transactions) {
    const d = parseISO(t.transaction_date);
    if (d < earliest) earliest = d;
  }
  return startOfMonth(earliest);
}

export function canGoToNextMonth(selected: Date): boolean {
  return !isSameMonth(selected, new Date());
}

export function canGoToPrevMonth(selected: Date, transactions: Transaction[]): boolean {
  const earliest = getEarliestTransactionMonth(transactions);
  return startOfMonth(selected) > earliest;
}

/** List of months from earliest transaction through current month (newest first). */
export function getAvailableMonths(transactions: Transaction[]): Date[] {
  const end = startOfMonth(new Date());
  const start = getEarliestTransactionMonth(transactions);
  const months: Date[] = [];
  let cursor = end;
  while (cursor >= start) {
    months.push(cursor);
    cursor = subMonths(cursor, 1);
  }
  return months;
}
