import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  CreditCard,
  FileText,
  Gift,
  Lock,
  Rocket,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PlatformIcon } from "@/components/site/brand";
import { settingsQuery, servicesQuery } from "@/lib/queries";
import { formatXAF } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import heroImg from "@/assets/hero-louslens.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LOUSLENS DIGITAL — Création de comptes YouTube & TikTok en 48 h" },
      {
        name: "description",
        content:
          "Confiez la création et la configuration de votre compte YouTube ou TikTok à des professionnels. Paiement MTN & Orange Money, livraison en 48 h garantie.",
      },
      { property: "og:title", content: "LOUSLENS DIGITAL — Création de comptes YouTube & TikTok en 48 h" },
      {
        property: "og:description",
        content: "Votre compte YouTube ou TikTok créé de A à Z par des pros, livré en 48 h ou offert.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    return Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useI18n();
  const { session } = useAuth();
  const { data: settings } = useQuery(settingsQuery);
  const { data: services } = useQuery(servicesQuery);

  const ctaTo = session ? "/dashboard" : "/auth";
  const ctaSearch = session ? undefined : { mode: "signup" };

  const steps = [
    {
      num: "01",
      icon: Rocket,
      title: lang === "fr" ? "Créez votre espace" : "Create your account",
      desc:
        lang === "fr"
          ? "Inscrivez-vous gratuitement en moins d'une minute avec votre adresse e-mail."
          : "Sign up for free in less than a minute with your email address.",
    },
    {
      num: "02",
      icon: FileText,
      title: lang === "fr" ? "Remplissez la fiche" : "Fill out details",
      desc:
        lang === "fr"
          ? "Choisissez YouTube ou TikTok et précisez vos préférences (nom, niche, pays ciblé)."
          : "Choose YouTube or TikTok and provide your preferences (name, niche, target country).",
    },
    {
      num: "03",
      icon: CreditCard,
      title: lang === "fr" ? "Payez par mobile" : "Pay via Mobile Money",
      desc:
        lang === "fr"
          ? "Réglez en toute sécurité via MTN Mobile Money ou Orange Money."
          : "Pay securely via MTN Mobile Money or Orange Money without a bank card.",
    },
    {
      num: "04",
      icon: Clock3,
      title: lang === "fr" ? "Suivez la livraison" : "Track delivery",
      desc:
        lang === "fr"
          ? "Un compte à rebours de 48 h démarre. Passé ce délai, votre commande est offerte !"
          : "A 48-hour countdown begins. If we miss the deadline, your order is free!",
    },
  ];

  const advantages = [
    {
      icon: Gift,
      title: lang === "fr" ? "Livraison 48 h ou offert" : "48h Delivery or Free",
      desc:
        lang === "fr"
          ? "Chronomètre en temps réel dès la validation. Dépassé ? La commande vous est remboursée."
          : "Real-time countdown. If we exceed the delivery window, you are refunded.",
    },
    {
      icon: Lock,
      title: lang === "fr" ? "Vos accès protégés" : "Secure Access",
      desc:
        lang === "fr"
          ? "Nous ne vous demandons jamais le mot de passe de votre boîte e-mail personnelle ni votre code PIN."
          : "We never ask for your personal email password or your Mobile Money PIN.",
    },
    {
      icon: BadgeCheck,
      title: lang === "fr" ? "Compte 100 % à votre nom" : "100% Owned by You",
      desc:
        lang === "fr"
          ? "Le compte est créé avec vos informations exactes : vous en êtes l'unique propriétaire légitime."
          : "The account is created with your details: you retain full and exclusive ownership.",
    },
    {
      icon: Smartphone,
      title: lang === "fr" ? "Paiement local MTN & Orange" : "Local Mobile Payments",
      desc:
        lang === "fr"
          ? "Paiement direct et sécurisé en Francs CFA (XAF) sans carte bancaire internationale."
          : "Direct and secure payment in CFA Francs (XAF) without international bank cards.",
    },
  ];

  // Default fallback services if DB not yet seeded
  const fallbackServices = [
    {
      id: "tiktok-setup",
      category: "tiktok" as const,
      name: lang === "fr" ? "Compte TikTok Monétisable" : "Monetizable TikTok Account",
      desc:
        lang === "fr"
          ? "Création complète de compte TikTok éligible à la monétisation, configuré dans la région optimale pour débloquer le programme de récompenses pour les créateurs."
          : "Complete TikTok account creation eligible for monetization, configured in the optimal region for creator rewards.",
      price: 25000,
      features:
        lang === "fr"
          ? [
              "Compte configuré en région éligible (Europe / USA)",
              "Optimisation de la bio et des réglages",
              "Sécurisation des accès à votre nom",
              "Guide d'activation et conseils de démarrage",
            ]
          : [
              "Configured in eligible region (Europe / USA)",
              "Bio and profile optimization",
              "Full credentials transferred to you",
              "Starter guide & activation tips",
            ],
    },
    {
      id: "youtube-setup",
      category: "youtube" as const,
      name: lang === "fr" ? "Chaîne YouTube Optimisée" : "Optimized YouTube Channel",
      desc:
        lang === "fr"
          ? "Création et paramétrage professionnel d'une chaîne YouTube prête pour le Programme Partenaire, avec configuration SEO et paramètres de monétisation."
          : "Professional setup of a YouTube channel ready for the Partner Program, with SEO settings and monetization configuration.",
      price: 35000,
      features:
        lang === "fr"
          ? [
              "Chaîne YouTube créée et vérifiée",
              "Paramétrage SEO de la chaîne et mots-clés",
              "Configuration de la sécurité à votre nom",
              "Préparation au Programme Partenaire YouTube",
            ]
          : [
              "Created and verified YouTube channel",
              "SEO tags, keywords & default settings",
              "Ownership transferred to your email",
              "Prepared for YouTube Partner Program",
            ],
    },
  ];

  const displayServices =
    services && services.length > 0
      ? services.map((s) => ({
          id: s.id,
          category: s.category as "youtube" | "tiktok",
          name: lang === "fr" ? s.name_fr : s.name_en,
          desc: lang === "fr" ? s.description_fr : s.description_en,
          price: s.price_xaf,
          features:
            s.category === "youtube"
              ? [
                  lang === "fr" ? "Création du compte et de la chaîne" : "Account & channel creation",
                  lang === "fr" ? "Nom, description et réglages SEO de base" : "Name, description and base SEO settings",
                  lang === "fr" ? "Paramètres adaptés à votre audience cible" : "Target audience optimization",
                ]
              : [
                  lang === "fr" ? "Création du compte TikTok" : "TikTok account creation",
                  lang === "fr" ? "Nom d'utilisateur et profil configurés" : "Configured username and profile",
                  lang === "fr" ? "Réglages adaptés à votre audience cible" : "Target audience optimization",
                ],
        }))
      : fallbackServices;

  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-90" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="animate-fade-up lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <ShieldCheck className="size-4 text-primary" />
              <span>{t.home.badge}</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
              <span>{t.home.title1} </span>
              <span className="text-brand">{t.home.title2}</span>
              <br />
              <span>{t.home.title3}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t.home.subtitle}
            </p>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="hero" size="xl" className="shadow-glow">
                <Link to={ctaTo} search={ctaSearch}>
                  {t.home.ctaOrder} <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <a href="#services">{t.home.seeServices}</a>
              </Button>
            </div>

            {/* TRUST BADGES */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-border/60 pt-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <span>{t.home.trust1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-violet" />
                <span>{t.home.trust2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-success" />
                <span>{t.home.trust3}</span>
              </div>
            </div>
          </div>

          {/* HERO IMAGE / VISUAL */}
          <div className="relative lg:col-span-5">
            <div className="absolute -inset-4 rounded-3xl bg-brand-soft opacity-50 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <img
                src={heroImg}
                alt={settings?.company_name || "LOUSLENS DIGITAL"}
                className="aspect-4/3 w-full object-cover transition-transform duration-500 hover:scale-105"
                width={800}
                height={600}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {settings?.company_name || "LOUSLENS DIGITAL"}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {lang === "fr" ? "Agence certifiée au Cameroun" : "Certified agency in Cameroon"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-card border border-border text-foreground">
                      <PlatformIcon platform="youtube" className="size-4 text-red-500" />
                    </span>
                    <span className="grid size-9 place-items-center rounded-xl bg-card border border-border text-foreground">
                      <PlatformIcon platform="tiktok" className="size-4 text-cyan-400" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            {t.home.servicesKicker}
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            {t.home.servicesTitle}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {lang === "fr"
              ? "Des forfaits clairs et transparents, livrés clé en main dans votre espace personnel."
              : "Clear and transparent packages, delivered ready-to-use in your personal portal."}
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {displayServices.map((svc) => (
            <div
              key={svc.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:border-primary/50 hover:shadow-glow"
            >
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-accent text-primary">
                      <PlatformIcon platform={svc.category} className="size-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {svc.category.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-bold text-foreground">{svc.name}</h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-foreground">
                      {formatXAF(svc.price, lang)}
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {svc.desc}
                </p>

                <div className="my-6 h-px bg-border/60" />

                <ul className="space-y-3 text-sm text-foreground">
                  {svc.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Button asChild variant="hero" className="w-full">
                  <Link to={ctaTo} search={ctaSearch}>
                    {lang === "fr" ? `Commander pour ${formatXAF(svc.price, lang)}` : `Order for ${formatXAF(svc.price, lang)}`}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US (ADVANTAGES) */}
      <section className="border-y border-border bg-surface/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet">
              {t.home.advantagesKicker}
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              {t.home.advantagesTitle}
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((adv, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:border-primary/40"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <adv.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-bold text-foreground">{adv.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {adv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 STEPS PROCESS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            {lang === "fr" ? "FONCTIONNEMENT" : "HOW IT WORKS"}
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            {lang === "fr" ? "Votre commande en 4 étapes simples" : "Your order in 4 simple steps"}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="font-display text-4xl font-black text-muted/50">
                {st.num}
              </span>
              <div className="mt-3 flex items-center gap-2">
                <st.icon className="size-5 text-primary" />
                <h3 className="font-bold text-foreground">{st.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {lang === "fr"
                ? "Toutes les réponses à vos questions avant de passer commande."
                : "All the answers to your questions before ordering."}
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-card">
            <Accordion type="single" collapsible className="w-full">
              {t.faq.items.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-10 text-center shadow-glow sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-hero opacity-80" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              <span>{lang === "fr" ? "Prêt à démarrer ?" : "Ready to launch?"}</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              {lang === "fr"
                ? "Lancez votre chaîne YouTube ou compte TikTok aujourd'hui."
                : "Launch your YouTube channel or TikTok account today."}
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {lang === "fr"
                ? "Créez votre espace en 30 secondes, confiez votre commande à nos spécialistes et recevez vos identifiants sécurisés sous 48 heures."
                : "Create your portal in 30 seconds, place your order with our specialists and receive your secure credentials within 48 hours."}
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild variant="hero" size="xl" className="shadow-glow">
                <Link to={ctaTo} search={ctaSearch}>
                  {lang === "fr" ? "Commencer maintenant" : "Get Started Now"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
