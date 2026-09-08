import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, session: null, loading: true });
const AUTH_INIT_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("AUTH_INIT_TIMEOUT")), timeoutMs);
    }),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (initializedRef.current) setLoading(false);
    });

    void withTimeout(supabase.auth.getSession(), AUTH_INIT_TIMEOUT_MS)
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .catch((error) => {
        if (error instanceof Error && error.message === "AUTH_INIT_TIMEOUT") {
          console.error("[FINANZZI] Tempo limite ao inicializar autenticação.");
        } else {
          console.error("[FINANZZI] Falha ao inicializar sessão:", error);
        }
        if (!mounted) return;
        setSession(null);
      })
      .finally(() => {
        if (!mounted) return;
        initializedRef.current = true;
        setLoading(false);
      });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user: session?.user ?? null, session, loading }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
