import { useRef, useState } from "react";
import { FileDown, FileUp, FileText, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/components/TransactionsList";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import {
  downloadImportTemplate,
  exportMonthlyReportPdf,
  parseTransactionsCsv,
  transactionsToCsv,
  downloadCsv,
} from "@/lib/transaction-io";
import { importTransactions } from "@/lib/transactions-firestore";

type Props = {
  monthLabel: string;
  monthTransactions: Transaction[];
  monthStats: { credit: number; debit: number; net: number };
  onDataChange: () => void;
};

export function TransactionDataActions({
  monthLabel,
  monthTransactions,
  monthStats,
  onDataChange,
}: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportMonthlyReportPdf(monthLabel, monthTransactions, monthStats);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportCsv = () => {
    const slug = monthLabel.replace(/\s+/g, "-").toLowerCase();
    downloadCsv(`expense-report-${slug}.csv`, transactionsToCsv(monthTransactions));
    toast.success("CSV downloaded");
  };

  const handleImportFile = async (file: File) => {
    if (!user) return;
    setImporting(true);
    try {
      const text = await file.text();
      const result = parseTransactionsCsv(text);
      if (!result.ok) {
        toast.error(result.error ?? "Invalid CSV file");
        if (result.rowErrors.length > 0) {
          console.warn("Import row errors:", result.rowErrors);
        }
        return;
      }

      const count = await importTransactions(user.id, result.rows);
      onDataChange();

      if (result.rowErrors.length > 0) {
        toast.success(`Imported ${count} transactions (${result.rowErrors.length} rows skipped)`);
      } else {
        toast.success(`Imported ${count} transactions`);
      }
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Failed to import transactions"));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/80" disabled={importing}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => void handleExportPdf()} disabled={exportingPdf}>
            <FileText className="mr-2 h-4 w-4" />
            {exportingPdf ? "Exporting PDF…" : "Export PDF (month)"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCsv}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV (month)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <FileUp className="mr-2 h-4 w-4" />
            {importing ? "Importing…" : "Import CSV"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadImportTemplate}>
            <FileDown className="mr-2 h-4 w-4" />
            Download import template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
