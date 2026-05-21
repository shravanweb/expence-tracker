import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AppUser = {
  id: string;
  fullName: string | null;
  email: string | null;
};

type AuthContextValue = {
  session: null;
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAppUser(fbUser: FirebaseUser): AppUser {
  return {
    id: fbUser.uid,
    fullName: fbUser.displayName,
    email: fbUser.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? toAppUser(fbUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ session: null, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
