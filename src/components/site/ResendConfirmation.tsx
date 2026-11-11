import { useEffect, useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { emailSchema } from "@/lib/auth-validation";
import { markSent, readLastSent, secondsLeft } from "@/lib/resend-cooldown";

/** Lets an unconfirmed customer request another verification email, with a per-email cooldown. */
export function ResendConfirmation({ getEmail }: { getEmail: () => string }) {
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function resend() {
    setError(""); setMessage("");
    const parsed = emailSchema.safeParse(getEmail());
    if (!parsed.success) { setError("Enter your email address above first."); return; }
    const email = parsed.data;
    const left = secondsLeft(readLastSent(email), Date.now());
    if (left > 0) { setWait(left); setError(`Please wait ${left} seconds before requesting another email.`); return; }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: window.location.origin } });
      if (authError) {
        if (authError.status === 429) { markSent(email); setWait(60); throw new Error("Too many requests. Please wait a minute and try again."); }
        throw authError;
      }
      markSent(email); setWait(60);
      setMessage("If this email belongs to an unconfirmed account, a new confirmation link is on its way.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not send the email. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className="mt-6 rounded-2xl border bg-secondary/60 p-4">
    <p className="text-sm font-semibold">Didn’t get the confirmation email?</p>
    <p className="mt-1 text-sm text-muted-foreground">Enter your email above and we’ll send a new link.</p>
    <Button type="button" variant="outline" className="mt-3 w-full rounded-full" onClick={() => void resend()} disabled={busy || wait > 0}>
      {busy ? <LoaderCircle className="animate-spin" /> : <MailCheck />}{wait > 0 ? `Resend available in ${wait}s` : "Resend confirmation email"}
    </Button>
    {error && <p role="alert" className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {message && <p role="status" className="mt-3 rounded-lg bg-accent p-3 text-sm text-accent-foreground">{message}</p>}
  </div>;
}
