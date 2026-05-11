import { format } from "date-fns";
import { Trash2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/categories";
import { Button } from "@/components/ui/button";

export type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
};

type Props = {
  transactions: Transaction[];
  onChange: () => void;
};

export function TransactionsList({ transactions, onChange }: Props) {
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("pulse_token");
      const response = await fetch(`http://localhost:3001/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      toast.success("Deleted");
      onChange();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm text-muted-foreground">No transactions yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-card backdrop-blur-xl">
      <ul className="divide-y divide-border">
        {transactions.map((t) => (
          <li key={t.id} className="group flex items-center gap-4 px-5 py-4 transition-smooth hover:bg-secondary/40">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                t.type === "credit" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
              }`}
            >
              {t.type === "credit" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{t.category}</p>
                <span className="text-xs text-muted-foreground">· {format(new Date(t.transaction_date), "dd MMM")}</span>
              </div>
              {t.description && <p className="truncate text-sm text-muted-foreground">{t.description}</p>}
            </div>
            <div className={`text-right font-semibold ${t.type === "credit" ? "text-primary" : "text-foreground"}`}>
              {t.type === "credit" ? "+" : "−"}{formatCurrency(Number(t.amount))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(t.id)}
              className="opacity-0 transition-smooth group-hover:opacity-100 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
