import { Link } from "@tanstack/react-router";
import { AppLogo } from "@/components/AppLogo";
import { trackCtaClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const AUTHOR = "Shravan Rasamalla";
const YEAR = 2026;

type Props = {
  className?: string;
  compact?: boolean;
};

export function SiteFooter({ className, compact = false }: Props) {
  return (
    <footer
      className={cn(
        "border-t border-border/60 bg-card/40 backdrop-blur-xl",
        compact ? "py-5" : "py-8",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <AppLogo to="/" />
          {!compact && (
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Professional personal finance tracking for salary, expenses, and monthly balance insights.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/" className="text-muted-foreground transition-smooth hover:text-foreground">
              Home
            </Link>
            <Link
              to="/login"
              onClick={() => trackCtaClick("login", "footer")}
              className="text-muted-foreground transition-smooth hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={() => trackCtaClick("signup", "footer")}
              className="text-muted-foreground transition-smooth hover:text-foreground"
            >
              Register
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {YEAR}{" "}
            <span className="font-medium text-foreground">{AUTHOR}</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
