import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Timer, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerNow } from "@/lib/server-time";
import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";
import { splitDuration, DEADLINE_MS, pad2 } from "@/lib/countdown";
import { cn } from "@/lib/utils";

type CountdownOrder = {
  status: string;
  deadline_at: string | null;
  delivered_at: string | null;
};

export function Countdown({ order, compact = false }: { order: CountdownOrder; compact?: boolean }) {
  const { t, lang } = useI18n();
  const now = useServerNow();
  const qc = useQueryClient();
  const triggered = useRef(false);

  const deadline = order.deadline_at ? new Date(order.deadline_at).getTime() : null;
  const remaining = deadline != null && now != null ? deadline - now : null;
  const overdue = !order.delivered_at && (order.status === "expired_free" || (remaining != null && remaining <= 0));

  useEffect(() => {
    // The server is the source of truth: once the timer hits zero, ask it to process deadlines.
    if (overdue && order.status !== "expired_free" && !triggered.current) {
      triggered.current = true;
      supabase.rpc("process_order_deadlines").then(() => qc.invalidateQueries());
    }
  }, [overdue, order.status, qc]);

  if (order.delivered_at) {
    const d = splitDuration(deadline ? deadline - new Date(order.delivered_at).getTime() : 0);
    if (compact) return <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="size-3.5" />{t.order.stopped}</span>;
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="size-4" />{t.order.stopped}</p>
        {deadline && <p className="mt-1 font-mono-num text-2xl font-bold">{pad2(d.h)} {t.countdown.h} : {pad2(d.m)} {t.countdown.min} : {pad2(d.s)} {t.countdown.sec}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{t.order.deliveredOn} {formatDateTime(order.delivered_at, lang)}</p>
      </div>
    );
  }

  if (!deadline) {
    if (compact) return <span className="text-xs text-muted-foreground">—</span>;
    return <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground"><Timer className="mb-2 size-5" />{t.order.countdownWaiting}</div>;
  }

  if (overdue) {
    if (compact) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive"><AlertTriangle className="size-3.5" />{t.order.overdue}</span>;
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertTriangle className="size-4" />{t.order.overdue}</p>
        <p className="mt-1 font-mono-num text-2xl font-bold">00 {t.countdown.h} : 00 {t.countdown.min} : 00 {t.countdown.sec}</p>
      </div>
    );
  }

  const d = splitDuration(remaining ?? DEADLINE_MS);
  const pct = remaining != null ? Math.min(100, Math.max(0, (remaining / DEADLINE_MS) * 100)) : 100;
  const urgent = remaining != null && remaining < 6 * 3600 * 1000;

  if (compact) {
    return <span className={cn("font-mono-num text-xs font-bold", urgent ? "text-warning" : "text-primary")}>{now == null ? "…" : `${pad2(d.h)}h ${pad2(d.m)}m ${pad2(d.s)}s`}</span>;
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-brand-soft p-5">
      <p className="flex items-center gap-2 text-sm font-semibold"><Timer className="size-4 text-primary" />{t.order.countdown}</p>
      <div className="mt-3 flex items-end gap-2 font-mono-num">
        {[{ v: d.h, l: t.countdown.h }, { v: d.m, l: t.countdown.min }, { v: d.s, l: t.countdown.sec }].map((x, i) => (
          <div key={i} className="flex items-end gap-2">
            {i > 0 && <span className="pb-4 text-2xl font-bold text-muted-foreground">:</span>}
            <div className="rounded-xl bg-background/70 px-3 py-2 text-center">
              <div className={cn("text-3xl font-bold sm:text-4xl", urgent && "text-warning")}>{now == null ? "--" : pad2(x.v)}</div>
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{x.l}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background/60">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t.order.deadline} : {formatDateTime(order.deadline_at, lang)}</p>
    </div>
  );
}
