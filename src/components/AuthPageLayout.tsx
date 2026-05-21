import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  children: ReactNode;
};

export function AuthPageLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-grid-subtle opacity-60" />
        <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-gradient-glow opacity-50 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 h-80 w-80 rounded-full bg-gradient-glow opacity-30 blur-3xl" />

        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <ThemeToggle className="rounded-full border border-border/60 bg-card/60 backdrop-blur-md" />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
          {children}
        </div>
      </div>
      <SiteFooter compact />
    </div>
  );
}
