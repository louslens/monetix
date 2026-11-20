import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicLayout } from "@/components/site/PublicLayout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Loader2 } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: string } => ({
    mode: (search.mode as string) || "login",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>((initialMode as Mode) || "login");
  const { t } = useI18n();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (session) {
    const isAdmin = session.user.email?.toLowerCase() === "louslens6@gmail.com";
    navigate({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
    return null;
  }

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-60" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-16">
          <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-card">
            {mode === "login" && <LoginForm t={t} onSwitch={setMode} />}
            {mode === "signup" && <SignupForm t={t} onSwitch={setMode} />}
            {mode === "forgot" && <ForgotForm t={t} onSwitch={setMode} />}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ─────────── LOGIN ─────────── */
function LoginForm({ t, onSwitch }: { t: any; onSwitch: (m: Mode) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error(t.auth.errors.emailNotConfirmed);
      } else if (error.message.includes("Invalid login")) {
        toast.error(t.auth.errors.invalidCredentials);
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(t.auth.loginTitle);
    const isAdmin = email.toLowerCase().trim() === "louslens6@gmail.com";
    navigate({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t.auth.email}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t.auth.password}</Label>
          <button type="button" onClick={() => onSwitch("forgot")} className="text-xs text-primary hover:underline">
            {t.auth.forgot}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : t.auth.login}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <button type="button" onClick={() => onSwitch("signup")} className="font-semibold text-primary hover:underline">
          {t.auth.signup}
        </button>
      </p>
    </form>
  );
}

/* ─────────── SIGNUP ─────────── */
function SignupForm({ t, onSwitch }: { t: any; onSwitch: (m: Mode) => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) { toast.error(t.auth.errors.passwordMismatch); return; }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) { toast.error(t.auth.errors.weakPassword); return; }
    if (!acceptTerms) { toast.error(t.auth.errors.acceptTerms); return; }
    if (fullName.trim().length < 2) { toast.error(t.auth.errors.invalidName); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim(), phone: phone.trim() },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) toast.error(t.auth.errors.alreadyRegistered);
      else toast.error(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-7" />
        </div>
        <h2 className="text-xl font-bold">{t.auth.checkEmailTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.auth.checkEmail.replace("{email}", email)}</p>
        <Button variant="glass" onClick={() => onSwitch("login")} className="mx-auto">
          <ArrowLeft className="size-4" /> {t.auth.login}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t.auth.signupTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">{t.auth.fullName}</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupEmail">{t.auth.email}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="signupEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t.auth.phone}</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XXX XXX" className="pl-10" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPw">{t.auth.password}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="signupPw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPw">{t.auth.confirmPassword}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="confirmPw" type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="pl-10" required />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(!!v)} className="mt-0.5" />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          {t.auth.acceptTerms}
        </label>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : t.auth.signup}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <button type="button" onClick={() => onSwitch("login")} className="font-semibold text-primary hover:underline">
          {t.auth.login}
        </button>
      </p>
    </form>
  );
}

/* ─────────── FORGOT ─────────── */
function ForgotForm({ t, onSwitch }: { t: any; onSwitch: (m: Mode) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-7" />
        </div>
        <h2 className="text-xl font-bold">{t.auth.forgotTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.auth.resetSent}</p>
        <Button variant="glass" onClick={() => onSwitch("login")} className="mx-auto">
          <ArrowLeft className="size-4" /> {t.auth.login}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleForgot} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t.auth.forgotTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.auth.forgotSubtitle}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forgotEmail">{t.auth.email}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="forgotEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="pl-10" required />
        </div>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : t.auth.sendLink}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <button type="button" onClick={() => onSwitch("login")} className="font-semibold text-primary hover:underline">
          <ArrowLeft className="mr-1 inline size-3" />{t.auth.login}
        </button>
      </p>
    </form>
  );
}
