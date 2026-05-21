import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { AuthPageLayout } from "@/components/AuthPageLayout";
import { isVerifiedUser, useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Expense - Tracker" },
      { name: "description", content: "Sign in to your money tracker." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isVerifiedUser(user)) navigate({ to: "/dashboard" });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await credential.user.reload();
      if (!credential.user.emailVerified) {
        await signOut(auth);
        throw new Error("Please verify your email first. Check your inbox for the link.");
      }
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (error: unknown) {
      toast.error(getFirebaseErrorMessage(error, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="w-full max-w-md">
        <AppLogo to="/" size="md" className="mb-8 justify-center" />

        <div className="rounded-2xl border border-border/80 bg-gradient-card p-8 shadow-elegant ring-1 ring-primary/5 backdrop-blur-xl">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in to access your secure Expense - Tracker dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-border/80 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-border/80 bg-background/50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
            >
              {loading ? "Signing in..." : "Sign in"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  );
}
