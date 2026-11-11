import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/order-status";

const tones: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-accent text-accent-foreground",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/10 text-destructive",
};

export function StatusPill({ label, tone, prefix }: { label: string; tone: Tone; prefix?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>
    {prefix && <span className="font-medium opacity-75">{prefix}:</span>}{label}
  </span>;
}
