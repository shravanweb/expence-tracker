import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canGoToNextMonth, canGoToPrevMonth, getAvailableMonths } from "@/lib/month-utils";
import type { Transaction } from "@/components/TransactionsList";
import { cn } from "@/lib/utils";

type Props = {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  transactions: Transaction[];
  className?: string;
};

export function MonthSelector({ selectedMonth, onMonthChange, transactions, className }: Props) {
  const availableMonths = getAvailableMonths(transactions);
  const monthKey = format(selectedMonth, "yyyy-MM");
  const isCurrentMonth = canGoToNextMonth(selectedMonth) === false;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/50 p-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 shrink-0 text-primary" />
        <span>Viewing monthly report</span>
      </div>

      <div className="flex shrink-0 flex-nowrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-border/80"
          disabled={!canGoToPrevMonth(selectedMonth, transactions)}
          onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select value={monthKey} onValueChange={(v) => {
          const found = availableMonths.find((m) => format(m, "yyyy-MM") === v);
          if (found) onMonthChange(found);
        }}>
          <SelectTrigger className="h-9 w-auto min-w-[10rem] border-border/80 bg-background/50 font-medium sm:min-w-[11rem]">
            <SelectValue>{format(selectedMonth, "MMMM yyyy")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={format(m, "yyyy-MM")} value={format(m, "yyyy-MM")}>
                {format(m, "MMMM yyyy")}
                {format(m, "yyyy-MM") === format(new Date(), "yyyy-MM") ? " (Current)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-border/80"
          disabled={!canGoToNextMonth(selectedMonth)}
          onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isCurrentMonth && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-primary"
            onClick={() => onMonthChange(new Date())}
          >
            Current month
          </Button>
        )}
      </div>
    </div>
  );
}
