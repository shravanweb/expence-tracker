import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { LogOut, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { isVerifiedUser, useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TransactionsList, type Transaction } from "@/components/TransactionsList";
import { MonthlyChart, CategoryPie } from "@/components/Charts";
import { formatCurrency } from "@/lib/categories";
import { fetchTransactions } from "@/lib/transactions-firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Expense - Tracker" },
      { name: "description", content: "Your money at a glance." },
    ],
  }),
  component: Dashboard,
});

type Profile = { full_name: string | null; avatar_url: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isVerifiedUser(user)) {
      if (user && !user.emailVerified) {
        void signOut(auth);
        toast.error("Please verify your email before accessing the dashboard.");
      }
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!isVerifiedUser(user)) return;
    try {
      const data = await fetchTransactions(user.id);
      setTransactions(data);
      setProfile({ full_name: user.fullName || null, avatar_url: null });
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error(getFirebaseErrorMessage(error, "Failed to load transactions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerifiedUser(user)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthKey = format(now, "yyyy-MM");
    let monthCredit = 0, monthDebit = 0, allCredit = 0, allDebit = 0;
    for (const t of transactions) {
      const amt = Number(t.amount);
      if (t.type === "credit") allCredit += amt;
      else allDebit += amt;
      const k = format(parseISO(t.transaction_date), "yyyy-MM");
      if (k === monthKey) {
        if (t.type === "credit") monthCredit += amt;
        else monthDebit += amt;
      }
    }
    return {
      monthCredit,
      monthDebit,
      monthBalance: monthCredit - monthDebit,
      totalBalance: allCredit - allDebit,
    };
  }, [transactions]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-primary shadow-glow" />
      </div>
    );
  }

  if (!isVerifiedUser(user)) return null;

  const displayName = profile?.full_name ?? user.fullName ?? user.email?.split("@")[0] ?? "there";
  const monthLabel = format(new Date(), "MMMM yyyy");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-hero opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-30" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <header className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 px-4 py-3 shadow-soft backdrop-blur-xl sm:px-5">
            <AppLogo />
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <span className="hidden text-sm text-muted-foreground md:inline">
                Welcome, <span className="font-medium text-foreground">{displayName}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <section className="mt-8 rounded-3xl border border-border/80 bg-gradient-card p-8 shadow-elegant ring-1 ring-primary/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p>
              <h1 className="mt-2 text-5xl font-bold tracking-tight">
                {formatCurrency(stats.totalBalance)}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{monthLabel} · {transactions.length} total transactions</p>
            </div>
            <AddTransactionDialog onAdded={load} />
          </div>
        </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Credited this month"
            value={formatCurrency(stats.monthCredit)}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            tone="primary"
          />
          <StatCard
            label="Debited this month"
            value={formatCurrency(stats.monthDebit)}
            icon={<TrendingDown className="h-5 w-5 text-destructive" />}
            tone="destructive"
          />
          <StatCard
            label="Net this month"
            value={formatCurrency(stats.monthBalance)}
            icon={<Coins className="h-5 w-5 text-accent" />}
            tone="accent"
          />
        </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <MonthlyChart transactions={transactions} />
          <CategoryPie transactions={transactions} />
        </section>

          <section className="mt-6 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Recent transactions</h2>
                <p className="text-sm text-muted-foreground">Your latest financial activity</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{transactions.length} total</p>
            </div>
            <TransactionsList transactions={transactions} onChange={load} />
          </section>
        </div>
      </div>

      <SiteFooter compact />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "primary" | "destructive" | "accent";
}) {
  const ring = {
    primary: "bg-primary/10",
    destructive: "bg-destructive/10",
    accent: "bg-accent/10",
  }[tone];
  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-card p-5 shadow-soft backdrop-blur-xl transition-smooth hover:border-primary/20 hover:shadow-glow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${ring}`}>{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
