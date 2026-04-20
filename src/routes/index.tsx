import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Wallet, TrendingUp, PieChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Track every rupee with clarity" },
      { name: "description", content: "A beautiful, fast money tracker for monthly salary, credits, debits and balance." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-gradient-glow opacity-60 blur-3xl" />
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-gradient-glow opacity-40 blur-3xl" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Pulse</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">
            Sign in
          </Link>
          <Link to="/signup">
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-primary shadow-glow" />
          Personal finance, reimagined
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Track every rupee
          <br />
          with <span className="text-gradient">crystal clarity</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Monthly salary, credits, debits and balance — all in one beautifully fast dashboard built for the modern earner.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
              Start free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="border-border bg-card/50 backdrop-blur-md">
              I have an account
            </Button>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid gap-4 md:grid-cols-3">
          {[
            { icon: TrendingUp, title: "Monthly Salary", desc: "Auto-calculated income, expenses and net balance per month." },
            { icon: PieChart, title: "Smart Categories", desc: "Visualize where your money goes with rich category breakdowns." },
            { icon: ShieldCheck, title: "Private & Secure", desc: "Bank-grade encryption. Your data stays yours, always." },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-gradient-card p-6 text-left shadow-soft backdrop-blur-xl transition-smooth hover:shadow-glow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
