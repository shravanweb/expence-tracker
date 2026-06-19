import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { AppLogo } from "@/components/AppLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { buildPageHead, SITE_NAME } from "@/lib/seo";
import appCss from "../styles.css?url";

const themeInitScript = `(function(){try{var t=localStorage.getItem("Expense-tracker_theme");var d=t!=="light";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){document.documentElement.classList.add("dark");}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <AppLogo to="/" className="mb-10" />
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-gradient-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
        >
          Go home
        </Link>
      </div>
      <SiteFooter compact />
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...buildPageHead({
        title: `${SITE_NAME} — Free Personal Finance & Expense Tracker`,
        description:
          "Track monthly salary, expenses, income, and balance. Free expense tracker with charts, categories, and previous month history.",
        path: "/",
      }).meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      ...buildPageHead({ title: SITE_NAME, path: "/" }).links,
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="top-right" richColors />;
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoogleAnalytics />
        <Analytics />
        <Outlet />
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
