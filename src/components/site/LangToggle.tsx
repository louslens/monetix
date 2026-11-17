import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t.common.language} className={cn("inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-bold", className)}>
      {(["fr", "en"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("rounded-full px-2.5 py-1 transition-colors", lang === l ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
