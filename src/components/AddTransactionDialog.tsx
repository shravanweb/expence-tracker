import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from "@/lib/categories";

const schema = z.object({
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive().max(1_000_000_000),
  category: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  transaction_date: z.string().min(1),
});

type Props = { onAdded: () => void };

export function AddTransactionDialog({ onAdded }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"credit" | "debit">("debit");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const cats = type === "credit" ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;

  const reset = () => {
    setType("debit");
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      type,
      amount: Number(amount),
      category,
      description: description || undefined,
      transaction_date: date,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description ?? null,
      transaction_date: parsed.data.transaction_date,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Transaction added");
    reset();
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
          <Plus className="mr-1 h-4 w-4" /> Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setType("credit"); setCategory(""); }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-smooth ${
                type === "credit"
                  ? "border-primary bg-primary/10 text-primary shadow-glow"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              ↑ Credit (in)
            </button>
            <button
              type="button"
              onClick={() => { setType("debit"); setCategory(""); }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-smooth ${
                type === "debit"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              ↓ Debit (out)
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {cats.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Note (optional)</Label>
            <Textarea id="desc" maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              {loading ? "Saving..." : "Save transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
