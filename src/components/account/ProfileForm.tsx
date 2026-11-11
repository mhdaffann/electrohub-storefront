import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema } from "@/lib/auth-validation";

export function ProfileForm({ userId, fullName }: { userId: string; fullName: string }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(fullName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const unchanged = value.trim() === fullName.trim();

  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setSaved(false);
    const parsed = profileSchema.safeParse({ fullName: value });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your name."); return; }
    setBusy(true);
    try {
      const { data, error: dbError } = await supabase.from("profiles").update({ full_name: parsed.data.fullName }).eq("id", userId).select("full_name, created_at").single();
      if (dbError) throw dbError;
      queryClient.setQueryData(["profile", userId], data);
      setValue(data.full_name); setSaved(true);
      toast.success("Your name has been updated.");
    } catch {
      setError("We couldn't save your changes. Please try again.");
      toast.error("We couldn't save your changes.");
    } finally { setBusy(false); }
  }

  return <form onSubmit={save} noValidate className="space-y-3">
    <label htmlFor="fullName" className="text-sm font-semibold">Full name</label>
    <div className="flex flex-col gap-3 sm:flex-row">
      <input id="fullName" name="fullName" value={value} onChange={(e) => { setValue(e.target.value); setSaved(false); setError(""); }} maxLength={100} autoComplete="name" aria-invalid={Boolean(error)} aria-describedby={error ? "fullName-error" : undefined} className="h-12 w-full rounded-xl border bg-secondary px-4 outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15" />
      <Button type="submit" className="h-12 rounded-full px-6 font-semibold" disabled={busy || unchanged}>{busy && <LoaderCircle className="animate-spin" />}Save changes</Button>
    </div>
    {error && <p id="fullName-error" role="alert" className="text-sm text-destructive">{error}</p>}
    {saved && <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-success"><CheckCircle2 className="h-4 w-4" />Changes saved.</p>}
  </form>;
}
