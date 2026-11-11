import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { OrderHistory } from "@/components/account/OrderHistory";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "My Account — ElectroHub" },
    { name: "description", content: "Your private ElectroHub profile, account details and order history." },
    { property: "og:title", content: "My Account — ElectroHub" },
    { property: "og:description", content: "Your private ElectroHub profile, account details and order history." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Account,
});

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

function Account() {
  const { accountUser: user } = Route.useRouteContext();
  const { signOut } = useAuth();
  const profile = useQuery({ queryKey: ["profile", user.id], queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("full_name, created_at").eq("id", user.id).single();
    if (error) throw error;
    return data;
  } });
  return <div className="container-x max-w-4xl py-10 sm:py-16">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="font-display text-3xl font-bold">My account</h1><Button variant="outline" onClick={() => { void signOut().catch(() => toast.error("Could not log out. Please try again.")); }}><LogOut />Log out</Button></div>
    <div className="mb-10 flex items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent text-primary"><UserRound className="h-7 w-7" /></span><div className="min-w-0"><h2 className="break-words text-xl font-bold">{profile.data?.full_name || "Your profile"}</h2><p className="break-all text-muted-foreground">{user.email}</p></div></div>

    <section aria-labelledby="details-heading" className="mb-12">
      <h2 id="details-heading" className="mb-4 font-display text-lg font-semibold">Account details</h2>
      {profile.isPending ? <p role="status">Loading your profile…</p> : profile.isError ? <div role="alert"><p className="text-destructive">Your profile could not be loaded.</p><Button variant="outline" className="mt-3" onClick={() => void profile.refetch()}>Try again</Button></div> : <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
        <ProfileForm key={profile.data.full_name} userId={user.id} fullName={profile.data.full_name} />
        <dl className="mt-6 divide-y border-t">
          {[["Email address", user.email ?? ""], ["Email status", user.email_confirmed_at ? "Verified" : "Awaiting verification"], ["Member since", longDate(profile.data.created_at)]].map(([label, value]) => <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]" key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}
        </dl>
      </div>}
    </section>

    <section aria-labelledby="orders-heading">
      <h2 id="orders-heading" className="mb-4 font-display text-lg font-semibold">Order history</h2>
      <OrderHistory userId={user.id} />
    </section>
  </div>;
}
