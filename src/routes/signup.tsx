import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, MailCheck } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { AuthPageLayout } from "@/components/AuthPageLayout";
import { isVerifiedUser, useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () =>
    buildPageHead({
      title: "Free Sign Up — Start Tracking Expenses",
      description:
        "Create a free Expense - Tracker account. Track monthly salary, spending, income, and balance in India.",
      path: "/signup",
    }),
  component: SignupPage,
});

const schema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!authLoading && isVerifiedUser(user)) navigate({ to: "/dashboard" });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        parsed.data.email,
        parsed.data.password,
      );
      await updateProfile(credential.user, { displayName: parsed.data.fullName });
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setEmailSent(true);
      toast.success("Account created! Check your email to verify.");
    } catch (error: unknown) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthPageLayout>
        <div className="w-full max-w-md">
          <AppLogo to="/" size="md" className="mb-8 justify-center" />

          <div className="rounded-2xl border border-border/80 bg-gradient-card p-8 text-center shadow-elegant ring-1 ring-primary/5 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <MailCheck className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>. Click the link to activate
              your account, then sign in.
            </p>
            <div className="mt-5 rounded-lg border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground">
              Don't see it? Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
            </div>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Go to Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <div className="w-full max-w-md">
        <AppLogo to="/" size="md" className="mb-8 justify-center" />

        <div className="rounded-2xl border border-border/80 bg-gradient-card p-8 shadow-elegant ring-1 ring-primary/5 backdrop-blur-xl">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Join Expense - Tracker and start managing your finances professionally.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Shravan Rasamalla"
                className="h-11 border-border/80 bg-background/50"
              />
            </div>
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
                placeholder="At least 6 characters"
                className="h-11 border-border/80 bg-background/50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
            >
              {loading ? "Creating..." : "Create account"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  );
}
