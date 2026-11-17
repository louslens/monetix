import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  awaiting_payment: "bg-warning/15 text-warning border-warning/30",
  in_queue: "bg-primary/15 text-primary border-primary/30",
  processing: "bg-violet/15 text-violet border-violet/30",
  delivered: "bg-success/15 text-success border-success/30",
  expired_free: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  unpaid: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/30",
  paid: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  refund_pending: "bg-violet/15 text-violet border-violet/30",
  refunded: "bg-primary/15 text-primary border-primary/30",
  successful: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
};

function Pill({ status, children }: { status: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", tone[status] ?? tone.cancelled)}>{children}</span>;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <Pill status={status}>{(t.orderStatus as Record<string, string>)[status] ?? status}</Pill>;
}
export function PaymentStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <Pill status={status}>{(t.paymentStatus as Record<string, string>)[status] ?? status}</Pill>;
}
export function TxnStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <Pill status={status}>{(t.txnStatus as Record<string, string>)[status] ?? status}</Pill>;
}
export function RefundStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <Pill status={status === "processing" ? "refund_pending" : status}>{(t.refundStatus as Record<string, string>)[status] ?? status}</Pill>;
}
