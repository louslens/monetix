import { Link } from "@tanstack/react-router";
import { Menu, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { LangToggle } from "./LangToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth, useIsAdmin } from "@/lib/auth";

export function SiteHeader() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t.nav.home },
    { to: "/services", label: t.nav.services },
    { to: "/about", label: t.nav.about },
    { to: "/faq", label: t.nav.faq },
    { to: "/contact", label: t.nav.contact },
  ] as const;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="LOUSLENS DIGITAL"><Logo /></Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          <div className="hidden items-center gap-2 md:flex">
            {session ? (
              <>
                {isAdmin && <Button asChild variant="glass" size="sm"><Link to="/admin"><ShieldCheck />{t.nav.admin}</Link></Button>}
                <Button asChild variant="hero" size="sm"><Link to="/dashboard"><LayoutDashboard />{t.nav.dashboard}</Link></Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/auth" search={{ mode: "login" }}>{t.nav.login}</Link></Button>
                <Button asChild variant="hero" size="sm"><Link to="/auth" search={{ mode: "signup" }}>{t.nav.signup}</Link></Button>
              </>
            )}
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t.nav.menu}><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle className="mb-6"><Logo /></SheetTitle>
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-accent">{l.label}</Link>
                ))}
                <div className="my-3 h-px bg-border" />
                {session ? (
                  <>
                    {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-accent">{t.nav.admin}</Link>}
                    <Button asChild variant="hero"><Link to="/dashboard" onClick={() => setOpen(false)}>{t.nav.dashboard}</Link></Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="glass"><Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)}>{t.nav.login}</Link></Button>
                    <Button asChild variant="hero"><Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>{t.nav.signup}</Link></Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
