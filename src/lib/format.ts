import type { Lang } from "@/lib/i18n";

const TZ = "Africa/Douala";

export function formatXAF(n: number | null | undefined, lang: Lang) {
  const v = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(n ?? 0);
  return `${v} FCFA`;
}

export function formatDate(d: string | Date | null | undefined, lang: Lang) {
  if (!d) return "—";
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium", timeZone: TZ }).format(new Date(d));
}

export function formatDateTime(d: string | Date | null | undefined, lang: Lang) {
  if (!d) return "—";
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TZ,
  }).format(new Date(d));
}

export function formatTime(d: string | Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { timeStyle: "short", timeZone: TZ }).format(new Date(d));
}

/** Format a notification's params (amount → XAF) before interpolation. */
export function notificationParams(params: unknown, lang: Lang): Record<string, string> {
  const out: Record<string, string> = {};
  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
      if (k === "amount" && typeof v === "number") out[k] = formatXAF(v, lang);
      else out[k] = v == null ? "" : String(v);
    }
  }
  return out;
}

/** Normalise a Cameroonian mobile number to 9 local digits, or null. */
export function normaliseCmPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00237")) digits = digits.slice(5);
  else if (digits.startsWith("237") && digits.length === 12) digits = digits.slice(3);
  return /^6\d{8}$/.test(digits) ? digits : null;
}

/** Best-effort operator detection from a 9-digit Cameroonian number. */
export function detectOperator(local9: string): "MTN" | "ORANGE" | null {
  const p2 = local9.slice(0, 2);
  const p3 = local9.slice(0, 3);
  if (p2 === "67" || p2 === "68") return "MTN";
  if (p2 === "69") return "ORANGE";
  if (p2 === "65") {
    const d = Number(p3[2]);
    if (d >= 0 && d <= 4) return "MTN";
    if (d >= 5 && d <= 9) return "ORANGE";
  }
  return null;
}
