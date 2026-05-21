import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp, PieChart, ShieldCheck, BarChart3, Lock } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Expense - Tracker — Track every rupee with clarity" },
      { name: "description", content: "A beautiful, fast money tracker for monthly salary, credits, debits and balance." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-grid-subtle opacity-50" />
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-gradient-glow opacity-50 blur-3xl" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-gradient-glow opacity-30 blur-3xl" />

        <SiteHeader>
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link to="/signup">
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
              Get started
            </Button>
          </Link>
        </SiteHeader>

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-primary shadow-glow" />
            Trusted personal finance platform
          </div>

          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Track every rupee with
            <br />
            <span className="text-gradient">professional clarity</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Expense - Tracker helps you monitor salary, credits, debits, and monthly balance in one secure,
            beautifully designed dashboard built for modern earners.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button
                size="lg"
                className="h-12 min-w-[200px] bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
              >
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 min-w-[200px] border-border/80 bg-card/50 backdrop-blur-md">
                Sign in to dashboard
              </Button>
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 rounded-2xl border border-border/80 bg-card/40 p-6 shadow-soft backdrop-blur-xl sm:gap-8">
            {[
              { label: "Secure auth", icon: Lock },
              { label: "Live insights", icon: BarChart3 },
              { label: "Cloud sync", icon: ShieldCheck },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-20 grid gap-5 text-left md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Monthly salary & balance",
                desc: "See income, expenses, and net balance at a glance with real-time totals.",
              },
              {
                icon: PieChart,
                title: "Category intelligence",
                desc: "Understand spending patterns with clear category charts and transaction history.",
              },
              {
                icon: ShieldCheck,
                title: "Enterprise-grade privacy",
                desc: "Firebase authentication and isolated data rules keep your finances protected.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border/80 bg-gradient-card p-7 shadow-soft backdrop-blur-xl transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-smooth group-hover:scale-105">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
