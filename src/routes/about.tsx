import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { useI18n } from "@/lib/i18n";
import {
  ShieldCheck,
  Award,
  Sparkles,
  Rocket,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock3,
  Smartphone,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — LOUSLENS DIGITAL" },
      {
        name: "description",
        content: "Découvrez LOUSLENS DIGITAL, agence dédiée à la création et l'accompagnement de comptes TikTok et YouTube monétisables au Cameroun.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useI18n();

  return (
    <PublicLayout>
      <PageHero
        kicker="QUI SOMMES-NOUS"
        title="Une agence digitale dédiée à la réussite des créateurs"
        subtitle="LOUSLENS DIGITAL accompagne les créateurs, artistes, entrepreneurs et particuliers dans la mise en place de comptes YouTube et TikTok professionnels et monétisables."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

          {/* LEFT: MISSION & VALUES */}
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-4" /> Notre Mission
            </span>

            <h2 className="text-3xl font-extrabold sm:text-4xl text-foreground">
              Donner aux créateurs africains les mêmes chances de monétisation.
            </h2>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              En Afrique, notamment au Cameroun et dans la sous-région, des milliers de créateurs talentueux produisent un contenu exceptionnel sans pouvoir accéder directement aux programmes de monétisation de TikTok ou YouTube en raison des restrictions géographiques.
            </p>

            <p className="text-base leading-relaxed text-muted-foreground">
              Chez <strong className="text-foreground">LOUSLENS DIGITAL</strong>, nous apportons une solution clé en main, transparente et sécurisée : nous configurons et hébergeons vos comptes dans les régions éligibles pour vous permettre d'activer la rémunération sur vos vues et abonnés, avec un engagement de livraison ferme en 48 heures ou commande offerte.
            </p>

            {/* Guarantees grid */}
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <Clock3 className="size-6 text-warning" />
                <h4 className="mt-2 font-bold text-foreground">Engagement 48 Heures</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Livraison garantie en 48 h maximum ou compte offert.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <ShieldCheck className="size-6 text-primary" />
                <h4 className="mt-2 font-bold text-foreground">Sécurité & Confidentialité</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vos informations sont protégées et vos accès vous sont remis en main propre.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: FOUNDER & AGENCY PROFILE CARD */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-primary/30 bg-card p-8 shadow-glow">
              <div className="flex items-center gap-4 border-b border-border/80 pb-6">
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-tr from-primary to-violet text-primary-foreground font-display text-2xl font-bold shadow-glow">
                  LL
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">LOUSLENS DIGITAL</h3>
                  <p className="text-xs text-primary font-medium">Agence Spécialisée Créateurs de Contenu</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="size-3 text-muted-foreground" /> Cameroun & International
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Fondée par des passionnés du web et des médias numériques, l'agence réunit l'expertise technique et la connaissance pointue des algorithmes et critères de monétisation YouTube et TikTok.
                </p>

                <div className="rounded-2xl border border-border bg-surface/50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5 text-primary" /> Contact officiel :
                    </span>
                    <span className="font-semibold text-foreground">louslens6@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5 text-success" /> WhatsApp :
                    </span>
                    <span className="font-semibold text-foreground">+237 697 09 09 79</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Smartphone className="size-3.5 text-yellow-500" /> Mobile Money :
                    </span>
                    <span className="font-semibold text-foreground">MTN & Orange Money</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild variant="hero" size="lg" className="w-full shadow-glow">
                  <Link to="/order">
                    Commander mon compte <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </PublicLayout>
  );
}
