import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth } from "date-fns";
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
import { MonthSelector } from "@/components/MonthSelector";
import { TransactionDataActions } from "@/components/TransactionDataActions";
import { formatCurrency } from "@/lib/categories";
import { filterTransactionsByMonth, toMonthKey } from "@/lib/month-utils";
import { fetchTransactions } from "@/lib/transactions-firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () =>
    buildPageHead({
      title: "Dashboard",
      description: "Your personal finance dashboard.",
      path: "/dashboard",
      noIndex: true,
    }),
  component: Dashboard,
});

type Profile = { full_name: string | null; avatar_url: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
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

  const monthTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  );

  const selectedMonthKey = toMonthKey(selectedMonth);
  const selectedMonthLabel = format(selectedMonth, "MMMM yyyy");

  const stats = useMemo(() => {
    let monthCredit = 0;
    let monthDebit = 0;
    let allCredit = 0;
    let allDebit = 0;
    for (const t of transactions) {
      const amt = Number(t.amount);
      if (t.type === "credit") allCredit += amt;
      else allDebit += amt;
    }
    for (const t of monthTransactions) {
      const amt = Number(t.amount);
      if (t.type === "credit") monthCredit += amt;
      else monthDebit += amt;
    }
    return {
      monthCredit,
      monthDebit,
      monthBalance: monthCredit - monthDebit,
      totalBalance: allCredit - allDebit,
    };
  }, [transactions, monthTransactions]);

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

          <MonthSelector
            className="mt-6"
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            transactions={transactions}
          />

          <section className="mt-6 rounded-3xl border border-border/80 bg-gradient-card p-8 shadow-elegant ring-1 ring-primary/5 backdrop-blur-xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {selectedMonthLabel} balance
                </p>
                <h1 className="mt-2 text-5xl font-bold tracking-tight">
                  {formatCurrency(stats.monthBalance)}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {monthTransactions.length} transaction
                  {monthTransactions.length === 1 ? "" : "s"} this month · All-time{" "}
                  {formatCurrency(stats.totalBalance)}
                </p>
              </div>
              <AddTransactionDialog onAdded={load} />
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label={`Credited · ${selectedMonthLabel}`}
              value={formatCurrency(stats.monthCredit)}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              tone="primary"
            />
            <StatCard
              label={`Debited · ${selectedMonthLabel}`}
              value={formatCurrency(stats.monthDebit)}
              icon={<TrendingDown className="h-5 w-5 text-destructive" />}
              tone="destructive"
            />
            <StatCard
              label={`Net · ${selectedMonthLabel}`}
              value={formatCurrency(stats.monthBalance)}
              icon={<Coins className="h-5 w-5 text-accent" />}
              tone="accent"
            />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <MonthlyChart transactions={transactions} />
            <CategoryPie transactions={transactions} monthKey={selectedMonthKey} />
          </section>

          <section className="mt-6 pb-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{selectedMonthLabel} transactions</h2>
                <p className="text-sm text-muted-foreground">
                  Income and expenses for the selected month
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {monthTransactions.length} in month · {transactions.length} all time
                </p>
                <TransactionDataActions
                  monthLabel={selectedMonthLabel}
                  monthTransactions={monthTransactions}
                  monthStats={{
                    credit: stats.monthCredit,
                    debit: stats.monthDebit,
                    net: stats.monthBalance,
                  }}
                  onDataChange={load}
                />
              </div>
            </div>
            <TransactionsList transactions={monthTransactions} onChange={load} emptyMessage={`No transactions in ${selectedMonthLabel}.`} />
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
