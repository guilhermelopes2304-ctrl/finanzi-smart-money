/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/finanzzi/Logo";

type Mode = "login" | "signup" | "recover";
type AuthSearch = { mode?: unknown; returnTo?: unknown };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode; returnTo?: string } => {
    const { mode, returnTo: rawReturnTo } = search as AuthSearch;
    const returnTo = typeof rawReturnTo === "string" ? rawReturnTo : undefined;
    return {
      ...(mode === "recover" || mode === "login" || mode === "signup" ? { mode } : {}),
      ...(returnTo?.startsWith("/") ? { returnTo } : {}),
    };
  },
  head: () => ({ meta: [
    { title: "Entrar — FINANZZI" },
    { name: "description", content: "Acesse o FINANZZI e entenda melhor o seu dinheiro." },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, returnTo } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) void navigate({ to: returnTo ?? "/dashboard" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!", { duration: 1800 });
        await navigate({ to: returnTo === "/oferta" ? "/oferta" : "/dashboard" });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada. Vamos começar!");
          await navigate({ to: "/dashboard" });
        } else {
          toast.success("Conta criada. Confirme seu e-mail para entrar.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/redefinir-senha` });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("login");
      }
    } catch (error) {
      toast.error(translate(error instanceof Error ? error.message : "Tente novamente."));
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const title = isLogin ? "Que bom ter você de volta" : isSignup ? "Crie sua conta" : "Vamos recuperar seu acesso";
  const subtitle = isLogin ? "Entre e continue cuidando do seu dinheiro sem complicação." : isSignup ? "Comece a organizar seu dinheiro em poucos segundos." : "Digite seu e-mail e enviaremos um link seguro para redefinir sua senha.";

  return (
    <div className="min-h-screen overflow-hidden bg-[#111111] text-white lg:grid lg:grid-cols-[1.02fr_.98fr]">
      <aside className="relative hidden overflow-hidden bg-[#181818] lg:flex lg:flex-col lg:justify-between">
        <div className="relative p-10 xl:p-14">
          <Link to="/" className="inline-flex animate-fin-fade-up"><Logo /></Link>
          <div className="mt-24 max-w-xl animate-fin-fade-up" style={{ animationDelay: "100ms" }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#202020] px-3.5 py-2 text-xs font-semibold text-[#FF5A1F]"><Sparkles className="size-3.5 text-[#FF5A1F]" /> Seu dinheiro, do jeito que você fala.</span>
            <h2 className="mt-6 max-w-lg font-display text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white xl:text-6xl">Você fala. O FINANZZI organiza.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">Entre no mesmo produto que registra, lembra e mostra a próxima decisão com clareza.</p>
            <div className="mt-9 space-y-3 text-sm text-white">{["Registro por texto ou voz","Compromissos lembrados no momento certo","Uma resposta prática para cada decisão"].map((text, index) => <div key={text} className="flex items-center gap-2.5 animate-fin-fade-up" style={{ animationDelay: `${180 + index * 70}ms` }}><span className="grid size-6 place-items-center rounded-full bg-[#FF5A1F] text-white"><CheckCircle2 className="size-4" /></span><span>{text}</span></div>)}</div>
          </div>
        </div>
        <div className="relative px-10 pb-10 xl:px-14 xl:pb-14"><div className="rounded-[1.75rem] border border-white/10 bg-[#181818] p-5 animate-fin-scale-in"><div className="flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FF5A1F] text-[10px] font-black uppercase tracking-[0.14em] text-white">FIN</span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">Uma conversa real</p><p className="mt-1 font-display text-lg font-semibold text-white">“netflix 39,90 todo mês”</p><p className="mt-1 text-sm text-white/60">Assinatura criada · vence amanhã</p></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#202020]"><div className="h-full w-3/4 rounded-full bg-[#FF5A1F]" /></div></div><p className="mt-5 text-xs text-white/60">FINANZZI — inteligência para o seu dinheiro.</p></div>
      </aside>
      <main className="relative flex min-h-screen flex-col"><div className="relative flex items-center justify-between px-4 py-4 sm:px-6"><Link to="/" aria-label="Voltar para o início" className="grid size-11 place-items-center rounded-full border border-white/10 bg-[#181818] text-white/60 transition-colors hover:border-[#FF5A1F] hover:text-[#FF5A1F]"><ArrowLeft className="size-5" /></Link></div><div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6"><Link to="/" className="mx-auto mb-7 animate-fin-fade-up lg:hidden"><Logo /></Link><div className="mb-7 animate-fin-fade-up"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#181818] px-3 py-1.5 text-xs font-bold text-[#FF5A1F]"><LockKeyhole className="size-3.5" /> Acesso seguro</div><h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 text-sm leading-6 text-white/60">{subtitle}</p></div><div className="rounded-[1.75rem] border border-white/10 bg-[#181818] p-5 animate-fin-scale-in sm:p-7"><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="h-12 rounded-xl border-white/10 bg-[#111111] text-white placeholder:text-white/60 focus:border-[#FF5A1F] focus:ring-[#FF5A1F]" required /></div>{(isLogin || isSignup) && <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Senha</Label><button type="button" className="text-xs font-bold text-[#FF5A1F] transition-opacity hover:opacity-75" onClick={() => setMode("recover")}>Esqueci minha senha</button></div><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} placeholder="Mínimo de 6 caracteres" className="h-12 rounded-xl border-white/10 bg-[#111111] pr-12 text-white placeholder:text-white/60 focus:border-[#FF5A1F] focus:ring-[#FF5A1F]" required /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-white/60 transition-colors hover:text-[#FF5A1F]">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>}<Button type="submit" className="h-12 w-full rounded-xl bg-[#FF5A1F] text-base font-bold text-white shadow-[0_10px_24px_rgba(255,90,31,.18)] hover:bg-[#FF5A1F]" disabled={busy}>{busy ? "Aguarde..." : isLogin ? "Entrar no FINANZZI" : isSignup ? "Criar minha conta" : "Enviar link de recuperação"}<ArrowRight className="ml-auto size-4" /></Button></form><div className="mt-5 flex items-center justify-center gap-1 text-sm">{isLogin ? <><span className="text-white/60">Ainda não tem acesso?</span><button type="button" className="font-bold text-[#FF5A1F]" onClick={() => setMode("signup")}>Criar conta</button></> : <button type="button" className="font-bold text-[#FF5A1F]" onClick={() => setMode("login")}>Voltar para o login</button>}</div></div><div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/60 animate-fin-fade-up"><ShieldCheck className="size-4 text-[#FF5A1F]" /> Os seus dados são tratados com segurança.</div></div></main>
    </div>
  );
}

function translate(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos. Confira e tente de novo.",
    "User already registered": "Este e-mail já possui uma conta. Que tal entrar em vez de criar outra?",
    "Password should be at least 6 characters.": "A senha precisa ter pelo menos 6 caracteres.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    "Email rate limit exceeded": "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    "Signup requires a valid password": "Digite uma senha válida para continuar.",
    "Unable to validate email address: invalid format": "Digite um e-mail em um formato válido.",
    "User not found": "Não encontramos uma conta com este e-mail.",
    "For security purposes, you can only request this after some time.": "Por segurança, aguarde um instante antes de tentar de novo.",
    "New password should be different from the old password.": "A nova senha precisa ser diferente da senha atual.",
    "Token has expired or is invalid": "Este link expirou ou já foi usado. Solicite um novo.",
    "Failed to fetch": "Sem conexão com a internet no momento. Verifique sua rede e tente de novo.",
  };
  return map[message] ?? "Algo deu errado. Tente novamente em instantes.";
}
