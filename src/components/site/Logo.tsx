import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="ll-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ll-g)" />
      <circle cx="20" cy="20" r="10.5" fill="none" stroke="var(--primary-foreground)" strokeWidth="2.4" />
      <circle cx="20" cy="20" r="4.2" fill="var(--primary-foreground)" />
      <circle cx="26.5" cy="13.5" r="1.8" fill="var(--primary-foreground)" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const { data: settings } = useQuery(settingsQuery);
  const name = settings?.company_name || "LOUSLENS DIGITAL";
  const [first, ...rest] = name.split(" ");
  return (
    <span className="flex items-center gap-2.5">
      {settings?.logo_url ? (
        <img src={settings.logo_url} alt={name} className="size-9 rounded-xl object-cover" width={36} height={36} />
      ) : (
        <LogoMark />
      )}
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">{first}</span>
          <span className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">{rest.join(" ") || "DIGITAL"}</span>
        </span>
      )}
    </span>
  );
}
