import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
};

type AuthContextValue = {
  session: null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("pulse_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("pulse_token");
    localStorage.removeItem("pulse_user");
    setUser(null);
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
