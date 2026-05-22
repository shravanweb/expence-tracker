import { format } from "date-fns";
import { z } from "zod";
import type { Transaction } from "@/components/TransactionsList";
export const CSV_HEADERS = ["date", "type", "amount", "category", "description"] as const;

const importRowSchema = z.object({
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive().max(1_000_000_000),
  category: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ImportRow = z.infer<typeof importRowSchema>;

const HEADER_ALIASES: Record<string, keyof ImportRow | "description"> = {
  date: "transaction_date",
  transaction_date: "transaction_date",
  type: "type",
  amount: "amount",
  category: "category",
  description: "description",
  desc: "description",
  note: "description",
};

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current.trim());
  return fields;
}

function normalizeDate(raw: string): string | null {
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return format(parsed, "yyyy-MM-dd");
  return null;
}

function normalizeType(raw: string): "credit" | "debit" | null {
  const v = raw.trim().toLowerCase();
  if (v === "credit" || v === "in" || v === "income") return "credit";
  if (v === "debit" || v === "out" || v === "expense") return "debit";
  return null;
}

export type ParseCsvResult = {
  ok: boolean;
  rows: ImportRow[];
  error?: string;
  rowErrors: string[];
};

export function parseTransactionsCsv(text: string): ParseCsvResult {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return { ok: false, rows: [], error: "File is empty.", rowErrors: [] };

  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { ok: false, rows: [], error: "No data rows found.", rowErrors: [] };

  const firstFields = parseCsvLine(lines[0]).map((f) => f.toLowerCase());
  const hasHeader = firstFields.some((f) => f in HEADER_ALIASES);
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const columnKeys = hasHeader
    ? firstFields.map((f) => HEADER_ALIASES[f] ?? null)
    : ([...CSV_HEADERS] as (keyof ImportRow | "description")[]);

  if (dataLines.length === 0) {
    return { ok: false, rows: [], error: "CSV has headers but no transaction rows.", rowErrors: [] };
  }

  const rows: ImportRow[] = [];
  const rowErrors: string[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const lineNo = hasHeader ? i + 2 : i + 1;
    const fields = parseCsvLine(dataLines[i]);
    const record: Record<string, string> = {};

    columnKeys.forEach((key, idx) => {
      if (!key || idx >= fields.length) return;
      record[key] = fields[idx];
    });

    const date = normalizeDate(record.transaction_date ?? "");
    const type = normalizeType(record.type ?? "");
    const amount = Number(String(record.amount ?? "").replace(/,/g, ""));

    const parsed = importRowSchema.safeParse({
      transaction_date: date ?? "",
      type: type ?? "debit",
      amount,
      category: record.category?.trim() ?? "",
      description: record.description?.trim() || undefined,
    });

    if (!date) {
      rowErrors.push(`Row ${lineNo}: invalid date`);
      continue;
    }
    if (!type) {
      rowErrors.push(`Row ${lineNo}: type must be credit or debit`);
      continue;
    }
    if (!parsed.success) {
      rowErrors.push(`Row ${lineNo}: ${parsed.error.issues[0]?.message ?? "invalid row"}`);
      continue;
    }
    rows.push(parsed.data);
  }

  if (rows.length === 0) {
    return {
      ok: false,
      rows: [],
      error: "No valid rows to import. Check date (YYYY-MM-DD), type (credit/debit), amount, and category.",
      rowErrors,
    };
  }

  return { ok: true, rows, rowErrors };
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = CSV_HEADERS.join(",");
  const body = transactions.map((t) => {
    const desc = (t.description ?? "").replace(/"/g, '""');
    const category = t.category.replace(/"/g, '""');
    return [t.transaction_date, t.type, t.amount, `"${category}"`, desc ? `"${desc}"` : ""].join(",");
  });
  return [header, ...body].join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type PdfStats = { credit: number; debit: number; net: number };

/** jsPDF default fonts do not render ₹; use Rs. prefix for reliable PDF output */
function formatPdfAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
  return `Rs. ${formatted}`;
}

function formatPdfDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

const PDF_COLORS = {
  primary: [99, 102, 241] as [number, number, number],
  primaryDark: [79, 70, 229] as [number, number, number],
  credit: [22, 163, 74] as [number, number, number],
  debit: [220, 38, 38] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  summaryBg: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export async function exportMonthlyReportPdf(
  monthLabel: string,
  transactions: Transaction[],
  stats: PdfStats,
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const generatedAt = format(new Date(), "dd MMM yyyy, h:mm a");

  // —— Header band ——
  doc.setFillColor(...PDF_COLORS.primaryDark);
  doc.rect(0, 0, pageWidth, 36, "F");

  doc.setTextColor(...PDF_COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Expense Tracker", margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Monthly Financial Report", margin, 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(monthLabel, margin, 30);

  // —— Summary cards ——
  const summaryY = 44;
  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 2) / 3;
  const cardHeight = 22;

  const summaryItems = [
    { label: "TOTAL CREDITED", value: stats.credit, color: PDF_COLORS.credit },
    { label: "TOTAL DEBITED", value: stats.debit, color: PDF_COLORS.debit },
    { label: "NET BALANCE", value: stats.net, color: PDF_COLORS.primary },
  ] as const;

  summaryItems.forEach((item, i) => {
    const x = margin + i * (cardWidth + cardGap);
    doc.setFillColor(...PDF_COLORS.summaryBg);
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, summaryY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(item.label, x + 4, summaryY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...item.color);
    doc.text(formatPdfAmount(item.value), x + 4, summaryY + 16);
  });

  // Meta line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(
    `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}  ·  Generated ${generatedAt}`,
    margin,
    summaryY + cardHeight + 6,
  );

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
  );

  const tableBody =
    sorted.length === 0
      ? [["—", "—", "—", "—", "No transactions for this month"]]
      : sorted.map((t) => [
          formatPdfDate(t.transaction_date),
          t.type === "credit" ? "Credit" : "Debit",
          formatPdfAmount(Number(t.amount)),
          t.category,
          t.description?.trim() || "—",
        ]);

  autoTable(doc, {
    startY: summaryY + cardHeight + 12,
    head: [["Date", "Type", "Amount (INR)", "Category", "Note"]],
    body: tableBody,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      lineColor: PDF_COLORS.border,
      lineWidth: 0.1,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    headStyles: {
      fillColor: PDF_COLORS.primary,
      textColor: PDF_COLORS.white,
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 34, halign: "right", fontStyle: "bold" },
      3: { cellWidth: 32 },
      4: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin, top: margin, bottom: 18 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageNum = data.pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text("Expense Tracker · Confidential", margin, pageHeight - 8);
      doc.text(`Page ${pageNum} of ${pageCount}`, pageWidth - margin, pageHeight - 8, {
        align: "right",
      });
    },
  });

  doc.save(`expense-report-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export function downloadImportTemplate() {
  const sample = [
    CSV_HEADERS.join(","),
    "2026-05-01,debit,450,Food,Lunch",
    "2026-05-02,credit,50000,Salary,May salary",
  ].join("\n");
  downloadCsv("expense-tracker-import-template.csv", sample);
}
