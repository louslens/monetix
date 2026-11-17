import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";
import { settingsQuery } from "@/lib/queries";

type FooterLink = { to: "/about" | "/services" | "/contact" | "/faq" | "/support" | "/complaints" | "/terms" | "/privacy" | "/refund-policy"; l: string };

export function SiteFooter() {
  const { t } = useI18n();
  const { data: s } = useQuery(settingsQuery);
  return (
    <footer className="no-print border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
          {s?.contact_email && <p className="text-sm text-muted-foreground">{s.contact_email}</p>}
        </div>
        <FooterCol title={t.footer.company} links={[{ to: "/about", l: t.nav.about }, { to: "/services", l: t.nav.services }, { to: "/contact", l: t.nav.contact }]} />
        <FooterCol title={t.footer.help} links={[{ to: "/faq", l: t.nav.faq }, { to: "/support", l: t.nav.support }, { to: "/complaints", l: t.footer.complaints }]} />
        <FooterCol title={t.footer.legal} links={[{ to: "/terms", l: t.footer.terms }, { to: "/privacy", l: t.footer.privacy }, { to: "/refund-policy", l: t.footer.refund }]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row md:justify-between">
          <p>© 2026 {s?.company_name || "LOUSLENS DIGITAL"}. {t.footer.rights}</p>
          <p className="max-w-2xl md:text-right">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((x) => (
          <li key={x.to}><Link to={x.to} className="text-sm text-muted-foreground hover:text-foreground">{x.l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
