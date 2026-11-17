import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { settingsQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";

export function whatsappLink(num?: string | null) {
  const n = (num || "237697090979").replace(/\D/g, "");
  return `https://wa.me/${n}`;
}

export function WhatsAppButton() {
  const { data } = useQuery(settingsQuery);
  const { t } = useI18n();
  return (
    <a href={whatsappLink(data?.whatsapp_number)} target="_blank" rel="noopener noreferrer" aria-label={t.whatsapp} title={t.whatsapp}
      className="no-print fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-glow transition-transform hover:scale-105">
      <MessageCircle className="size-6" />
    </a>
  );
}
