import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { toast } from "sonner";
import { Wallet, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Pulse" },
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
    if (!authLoading && user) navigate({ to: "/dashboard" });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-gradient-glow opacity-40" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">Pulse</span>
          </Link>

          <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-elegant backdrop-blur-xl">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue tracking your money.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
                {loading ? "Signing in..." : "Sign in"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
