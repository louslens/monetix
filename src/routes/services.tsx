import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { PlatformIcon } from "@/components/site/brand";
import { settingsQuery, servicesQuery } from "@/lib/queries";
import { formatXAF } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — LOUSLENS DIGITAL" },
      { name: "description", content: "Découvrez nos services de création de comptes YouTube et TikTok." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]),
  component: ServicesPage,
});

function ServicesPage() {
  const { t, lang } = useI18n();
  const { session } = useAuth();
  const { data: services } = useQuery(servicesQuery);

  const ctaTo = session ? "/order" : "/auth";
  const ctaSearch = session ? undefined : { mode: "signup" };

  const displayServices = (services ?? []).filter((s) => s.active !== false);

  return (
    <PublicLayout>
      <PageHero
        kicker={t.home.servicesKicker}
        title={t.home.servicesTitle}
        subtitle={lang === "fr"
          ? "Choisissez le service adapté à vos besoins et passez commande en quelques minutes."
          : "Choose the service that fits your needs and place an order in minutes."}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {displayServices.length === 0 ? (
          <p className="text-center text-muted-foreground">{t.orderForm.noServices}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {displayServices.map((svc) => {
              const name = lang === "fr" ? svc.name_fr : svc.name_en;
              const desc = lang === "fr" ? svc.description_fr : svc.description_en;
              const features =
                svc.category === "youtube"
                  ? lang === "fr"
                    ? [
                        "Création du compte Google et de la chaîne YouTube",
                        "Nom, description et paramètres SEO configurés",
                        "Paramètres adaptés à votre audience cible",
                        "Préparation aux critères du Programme Partenaire YouTube",
                      ]
                    : [
                        "Google account and YouTube channel creation",
                        "Name, description and SEO settings configured",
                        "Target audience optimization",
                        "Prepared for YouTube Partner Program criteria",
                      ]
                  : lang === "fr"
                    ? [
                        "Création du compte TikTok complet",
                        "Nom d'utilisateur et profil optimisés",
                        "Configuration en région éligible à la monétisation",
                        "Guide d'activation et conseils de démarrage",
                      ]
                    : [
                        "Complete TikTok account creation",
                        "Optimized username and profile",
                        "Configured in monetization-eligible region",
                        "Activation guide and starter tips",
                      ];

              return (
                <div
                  key={svc.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:border-primary/50 hover:shadow-glow"
                >
                  <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-14 place-items-center rounded-xl bg-accent text-primary">
                          <PlatformIcon platform={svc.category as "youtube" | "tiktok"} className="size-7" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">{(svc.category as string).toUpperCase()}</span>
                          <h3 className="text-xl font-bold text-foreground">{name}</h3>
                        </div>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{desc}</p>

                    <div className="my-6 h-px bg-border/60" />

                    <ul className="space-y-3 text-sm text-foreground">
                      {features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="my-6 h-px bg-border/60" />

                    {/* Guarantees */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock3 className="size-3.5 text-success" />
                        <span>{lang === "fr" ? "Livraison 48h" : "48h Delivery"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-primary" />
                        <span>{lang === "fr" ? "Accès sécurisés" : "Secure Access"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="size-3.5 text-violet" />
                        <span>MTN & Orange Money</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
                    <span className="text-3xl font-extrabold text-foreground">
                      {formatXAF(svc.price_xaf, lang)}
                    </span>
                    <Button asChild variant="hero" className="shadow-glow">
                      <Link to={ctaTo} search={ctaSearch}>
                        {lang === "fr" ? "Commander" : "Order"} <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
