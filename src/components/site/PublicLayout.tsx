import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppButton } from "./WhatsAppButton";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

export function PageHero({ title, subtitle, kicker }: { title: string; subtitle?: string; kicker?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-hero" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
        {kicker && <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">{kicker}</p>}
        <h1 className="animate-fade-up text-3xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
