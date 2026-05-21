import { Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export const APP_NAME = "Expense - Tracker";

const sizes = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4", text: "text-base sm:text-xl" },
  md: { box: "h-10 w-10", icon: "h-5 w-5", text: "text-xl sm:text-2xl" },
} as const;

type Props = {
  to?: string;
  size?: keyof typeof sizes;
  className?: string;
};

export function AppLogo({ to = "/", size = "sm", className }: Props) {
  const s = sizes[size];
  const inner = (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow",
          s.box,
        )}
      >
        <Wallet className={cn(s.icon, "text-primary-foreground")} />
      </div>
      <span className={cn("font-display font-bold tracking-tight", s.text)}>{APP_NAME}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cn("flex items-center gap-2", className)}>
        {inner}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-2", className)}>{inner}</div>;
}
