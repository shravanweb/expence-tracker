import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
};

export function SiteHeader({ children, className }: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <AppLogo />
        {children && <div className="flex items-center gap-2 sm:gap-3">{children}</div>}
      </div>
    </header>
  );
}
