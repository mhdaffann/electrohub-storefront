import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ResendConfirmation } from "@/components/site/ResendConfirmation";
import { emailSchema, loginSchema, registrationSchema, resetSchema } from "@/lib/auth-validation";

type Mode = "login" | "signup" | "forgot" | "reset";
export function AuthForm({ mode }: { mode: Mode }) {
  const { user, loading, recovery } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!loading && user && !recovery && (mode === "login" || mode === "signup")) void navigate({ to: "/account", replace: true });
  }, [loading, user, recovery, mode, navigate]);
  const titles = { login: "Welcome back", signup: "Create your account", forgot: "Forgot password?", reset: "Set a new password" };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = mode === "signup" ? registrationSchema.safeParse(data) : mode === "reset" ? resetSchema.safeParse(data) : mode === "forgot" ? emailSchema.safeParse(data['email']) : loginSchema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0] ?? "email")] = issue.message;
      setErrors(next); return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const values = registrationSchema.parse(data);
        const { data: result, error: authError } = await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { full_name: values.fullName }, emailRedirectTo: window.location.origin } });
        if (authError) throw authError;
        if (result.session) await navigate({ to: "/account", replace: true });
        else setMessage("Check your email to confirm your account before signing in.");
      } else if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword(loginSchema.parse(data));
        if (authError?.code === "email_not_confirmed" || /not confirmed/i.test(authError?.message ?? "")) throw new Error("Your email isn’t confirmed yet. Use “Resend confirmation email” below to get a new link.");
        if (authError) throw authError;
        await navigate({ to: "/account", replace: true });
      } else if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(emailSchema.parse(data['email']), { redirectTo: `${window.location.origin}/reset-password` });
        if (authError) throw authError;
        setMessage("If an account exists for this email, you’ll receive a password reset link.");
      } else {
        if (!recovery || !user) throw new Error("Open the password reset link from your email first.");
        const { error: authError } = await supabase.auth.updateUser({ password: resetSchema.parse(data).password });
        if (authError) throw authError;
        setMessage("Your password has been updated.");
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  function field(name: string, label: string, type = "text", autoComplete = "") {
    const password = type === "password";
    return <div className="space-y-2" key={name}>
      <label htmlFor={name} className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <input id={name} name={name} type={password && visible ? "text" : type} autoComplete={autoComplete} maxLength={name === "fullName" ? 100 : name === "email" ? 255 : 128} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} className="h-12 w-full rounded-xl border bg-secondary px-4 pr-12 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
        {password && <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1.5" aria-label={visible ? "Hide passwords" : "Show passwords"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button>}
      </div>
      {errors[name] && <p id={`${name}-error`} className="text-sm text-destructive">{errors[name]}</p>}
    </div>;
  }
  return <div className="container-x flex justify-center py-10 sm:py-16">
    <section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-card sm:p-8">
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary"><LockKeyhole /></span>
      <p className="mb-2 text-sm font-semibold text-primary">ElectroHub account</p>
      <h1 className="font-display text-2xl font-bold">{titles[mode]}</h1>
      <form ref={formRef} onSubmit={submit} noValidate className="mt-6 space-y-4">
        {mode === "signup" && field("fullName", "Full name", "text", "name")}
        {mode !== "reset" && field("email", "Email address", "email", "email")}
        {mode !== "forgot" && field("password", mode === "reset" ? "New password" : "Password", "password", mode === "login" ? "current-password" : "new-password")}
        {(mode === "signup" || mode === "reset") && field("confirmPassword", "Confirm password", "password", "new-password")}
        {mode === "login" && <Link to="/forgot-password" className="block text-right text-sm font-semibold text-primary">Forgot password?</Link>}
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="flex items-start gap-2 rounded-lg bg-accent p-3 text-sm text-accent-foreground"><Mail className="h-5 w-5 shrink-0" />{message}</p>}
        <Button className="h-12 w-full rounded-full font-semibold" disabled={busy || (mode === "reset" && (!recovery || !user))}>{busy && <LoaderCircle className="animate-spin" />}{mode === "login" ? "Login" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}</Button>
        {mode === "reset" && !loading && (!recovery || !user) && <p className="text-sm text-muted-foreground">This reset link is missing or expired. <Link to="/forgot-password" className="text-primary">Request a new link</Link></p>}
      </form>
      {mode === "login" && <ResendConfirmation getEmail={() => String(new FormData(formRef.current ?? undefined).get("email") ?? "")} />}
      <p className="mt-6 text-center text-sm">{mode === "login" ? <>New here? <Link to="/signup" className="font-semibold text-primary">Sign up</Link></> : <>Already have an account? <Link to="/login" className="font-semibold text-primary">Login</Link></>}</p>
      <div className="mt-6 flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />Secure account access</div>
    </section>
  </div>;
}