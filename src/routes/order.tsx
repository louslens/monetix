import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PlatformIcon } from "@/components/site/brand";
import { formatXAF } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  Mail,
  Lock,
  Clock3,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/order")({
  component: OrderFlowPage,
});

type PlatformChoice = "youtube" | "tiktok";
type OrderStep = "choose_platform" | "fill_details" | "payment" | "success";

const ELIGIBLE_HOSTING_COUNTRIES = [
  "France (Recommandé pour monétisation)",
  "États-Unis",
  "Royaume-Uni",
  "Allemagne",
  "Espagne",
  "Italie",
  "Autre pays éligible",
];

const RESIDENCE_COUNTRIES = [
  "Cameroun",
  "Côte d'Ivoire",
  "Sénégal",
  "Gabon",
  "RDC",
  "Bénin",
  "Togo",
  "Mali",
  "Autre pays d'Afrique",
  "Europe / Diaspora",
];

export function OrderFlowPage() {
  const { lang } = useI18n();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!session) {
    navigate({ to: "/auth", search: { mode: "signup" }, replace: true });
    return null;
  }

  const [step, setStep] = useState<OrderStep>("choose_platform");
  const [platform, setPlatform] = useState<PlatformChoice>("youtube");

  // Form Fields
  // Common / YouTube
  const [channelName, setChannelName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // TikTok Specific
  const [accountName, setAccountName] = useState("");
  const [hostingCountry, setHostingCountry] = useState(ELIGIBLE_HOSTING_COUNTRIES[0]);
  const [residenceCountry, setResidenceCountry] = useState(RESIDENCE_COUNTRIES[0]);

  // Extra notes
  const [notes, setNotes] = useState("");

  // Payment State
  const [operator, setOperator] = useState<"MTN" | "ORANGE">("MTN");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Prices: YouTube 35 000 FCFA, TikTok 25 000 FCFA
  const price = platform === "youtube" ? 35000 : 25000;

  // Validation before payment step
  const handleProceedToPayment = () => {
    if (platform === "youtube") {
      if (!channelName.trim()) {
        toast.error("Veuillez indiquer le nom de la chaîne YouTube souhaité.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        toast.error("Veuillez fournir une adresse e-mail valide jamais utilisée pour YouTube.");
        return;
      }
      if (!password || password.length < 6) {
        toast.error("Veuillez renseigner le mot de passe de cette adresse e-mail.");
        return;
      }
    } else {
      if (!accountName.trim()) {
        toast.error("Veuillez indiquer le nom souhaité pour le compte TikTok.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        toast.error("Veuillez fournir une adresse e-mail valide jamais utilisée pour TikTok.");
        return;
      }
      if (!password || password.length < 6) {
        toast.error("Veuillez renseigner le mot de passe de cette adresse e-mail.");
        return;
      }
    }
    setStep("payment");
  };

  // Submit Order and record Payment
  const handleConfirmOrder = async () => {
    if (!paymentPhone.trim() || paymentPhone.replace(/\D/g, "").length < 8) {
      toast.error("Veuillez saisir votre numéro Mobile Money ou Orange Money.");
      return;
    }

    setLoading(true);

    const now = new Date();
    // 48 hours deadline
    const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const orderNumber = `LLD-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const formDataPayload = {
      platform,
      channel_name: platform === "youtube" ? channelName.trim() : null,
      account_name: platform === "tiktok" ? accountName.trim() : null,
      hosting_country: platform === "tiktok" ? hostingCountry : "France / Éligible",
      residence_country: platform === "tiktok" ? residenceCountry : "Cameroun",
      dedicated_email: email.trim(),
      dedicated_password: password.trim(),
      notes: notes.trim(),
      full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Client",
      email: session.user.email,
      phone: paymentPhone.trim(),
      operator,
      transaction_ref: paymentRef.trim() || `TXN-${Date.now().toString(36).toUpperCase()}`,
    };

    try {
      // 1. Insert order into DB
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          order_number: orderNumber,
          category: platform,
          service_name_fr: platform === "youtube" ? "Chaîne YouTube Monétisable" : "Compte TikTok Monétisable",
          service_name_en: platform === "youtube" ? "Monetizable YouTube Channel" : "Monetizable TikTok Account",
          amount_xaf: price,
          status: "in_queue", // Order received, in queue
          payment_status: "paid", // Direct simulated / recorded payment
          countdown_started_at: now.toISOString(),
          deadline_at: deadline.toISOString(),
          form_data: formDataPayload,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Also register payment record
      await supabase.from("payments").insert({
        order_id: orderData.id,
        user_id: session.user.id,
        operator,
        phone: paymentPhone.trim(),
        amount_xaf: price,
        status: "successful",
        operator_reference: formDataPayload.transaction_ref,
      });

      setCreatedOrder(orderData);
      setStep("success");
      toast.success("Commande enregistrée avec succès ! Le délai de 48 h est enclenché.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de la validation de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-30" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">

          {/* Stepper progress */}
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Clock3 className="size-3.5" /> Livraison en 48 heures ou offert
            </span>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Passer une commande
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Créez votre compte YouTube ou TikTok monétisable en toute simplicité.
            </p>
          </div>

          {/* ─── STEP 1: CHOOSE PLATFORM ─── */}
          {step === "choose_platform" && (
            <div className="space-y-6 animate-fade-up">
              <h2 className="text-center text-lg font-bold">
                Quelle plateforme souhaitez-vous créer ?
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* YOUTUBE OPTION */}
                <div
                  onClick={() => setPlatform("youtube")}
                  className={`cursor-pointer rounded-2xl border-2 p-6 transition-all hover:border-red-500/80 hover:shadow-glow ${
                    platform === "youtube"
                      ? "border-red-500 bg-red-500/5 shadow-glow"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-500">
                      <PlatformIcon platform="youtube" className="size-8" />
                    </span>
                    <span className="font-display text-2xl font-black text-foreground">
                      {formatXAF(35000, lang)}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    Compte YouTube Monétisable
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chaîne YouTube configurée pour le Programme Partenaire avec réglages d'éligibilité et optimisation SEO.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success" />
                    <span>Livrée en 48 h ou offerte</span>
                  </div>
                </div>

                {/* TIKTOK OPTION */}
                <div
                  onClick={() => setPlatform("tiktok")}
                  className={`cursor-pointer rounded-2xl border-2 p-6 transition-all hover:border-cyan-400/80 hover:shadow-glow ${
                    platform === "tiktok"
                      ? "border-cyan-400 bg-cyan-400/5 shadow-glow"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-400">
                      <PlatformIcon platform="tiktok" className="size-8" />
                    </span>
                    <span className="font-display text-2xl font-black text-foreground">
                      {formatXAF(25000, lang)}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    Compte TikTok Monétisable
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Compte TikTok créé et hébergé dans un pays éligible pour débloquer le Programme de Récompenses pour Créateurs.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success" />
                    <span>Livré en 48 h ou offert</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="hero" size="xl" onClick={() => setStep("fill_details")} className="shadow-glow">
                  Continuer avec {platform === "youtube" ? "YouTube" : "TikTok"} <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: FILL INFORMATION DETAILS ─── */}
          {step === "fill_details" && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface/50 p-4">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={platform} className="size-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">
                      {platform === "youtube" ? "Compte YouTube Monétisable" : "Compte TikTok Monétisable"}
                    </h3>
                    <p className="text-xs text-muted-foreground">Tarif : {formatXAF(price, lang)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("choose_platform")}>
                  Modifier le choix
                </Button>
              </div>

              {/* YOUTUBE FORM FIELDS */}
              {platform === "youtube" ? (
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
                  <h3 className="text-base font-bold text-foreground">
                    Informations nécessaires pour la création YouTube
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="channelName">Nom de la chaîne souhaité *</Label>
                    <Input
                      id="channelName"
                      placeholder="Ex: Passion Business, Studio Créatif..."
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Le nom public qui apparaîtra sur votre nouvelle chaîne YouTube.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ytEmail">
                      Adresse e-mail (jamais utilisée pour YouTube) *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="ytEmail"
                        type="email"
                        placeholder="exemple-chaine@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Utilisez une adresse e-mail vierge n'ayant jamais servi à créer un compte YouTube.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ytPassword">
                      Mot de passe de cette adresse e-mail *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="ytPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe du compte mail"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Permet à notre équipe de configurer et sécuriser votre chaîne. Vous pourrez le modifier dès la livraison.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Thématique / Niche / Précisions (Facultatif)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ex: Thème gaming, motivation, humour, cible francophone..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                /* TIKTOK FORM FIELDS */
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
                  <h3 className="text-base font-bold text-foreground">
                    Informations nécessaires pour la création TikTok
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nom du compte souhaité *</Label>
                    <Input
                      id="accountName"
                      placeholder="Ex: @monpseudo ou Nom d'affichage"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hostingCountry">
                        Pays d'hébergement du compte (pour la monétisation) *
                      </Label>
                      <select
                        id="hostingCountry"
                        value={hostingCountry}
                        onChange={(e) => setHostingCountry(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {ELIGIBLE_HOSTING_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Le pays dans lequel le compte sera paramétré pour débloquer la rémunération TikTok.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="residenceCountry">
                        Pays dans lequel vous résidez actuellement *
                      </Label>
                      <select
                        id="residenceCountry"
                        value={residenceCountry}
                        onChange={(e) => setResidenceCountry(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {RESIDENCE_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Permet d'adapter les recommandations pour une utilisation fluide sans blocage.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ttEmail">
                      Adresse e-mail (jamais utilisée pour TikTok) *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="ttEmail"
                        type="email"
                        placeholder="exemple-tiktok@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ttPassword">
                      Mot de passe de cette adresse e-mail *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="ttPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe du compte mail"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Préférences / Niche (Facultatif)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ex: Humour, actualités, e-commerce, lifestyle..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="glass" onClick={() => setStep("choose_platform")}>
                  <ArrowLeft className="size-4" /> Retour
                </Button>
                <Button variant="hero" size="xl" onClick={handleProceedToPayment} className="shadow-glow">
                  Passer au paiement ({formatXAF(price, lang)}) <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: DIRECT PAYMENT (MTN / ORANGE MONEY) ─── */}
          {step === "payment" && (
            <div className="space-y-6 animate-fade-up">
              <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-glow">
                <h3 className="text-xl font-bold text-foreground">
                  Paiement Mobile Money direct
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Réglez instantanément votre commande pour lancer le compte à rebours de 48 heures.
                </p>

                <div className="my-6 rounded-xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {platform === "youtube" ? "Chaîne YouTube Monétisable" : "Compte TikTok Monétisable"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {platform === "youtube" ? `Chaîne : ${channelName}` : `Compte : ${accountName}`}
                      </p>
                    </div>
                    <span className="font-display text-2xl font-black text-primary">
                      {formatXAF(price, lang)}
                    </span>
                  </div>
                </div>

                {/* Operator selector */}
                <div className="space-y-3">
                  <Label>Sélectionnez votre opérateur</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setOperator("MTN")}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 font-bold transition-all ${
                        operator === "MTN"
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                          : "border-border bg-background text-muted-foreground hover:border-yellow-500/40"
                      }`}
                    >
                      <Smartphone className="size-5" />
                      <span>MTN Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOperator("ORANGE")}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 font-bold transition-all ${
                        operator === "ORANGE"
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-border bg-background text-muted-foreground hover:border-orange-500/40"
                      }`}
                    >
                      <Smartphone className="size-5" />
                      <span>Orange Money</span>
                    </button>
                  </div>
                </div>

                {/* Phone number */}
                <div className="mt-5 space-y-2">
                  <Label htmlFor="paymentPhone">Votre numéro de téléphone ({operator}) *</Label>
                  <Input
                    id="paymentPhone"
                    type="tel"
                    placeholder="6XX XXX XXX (Ex: 697090979)"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Numéro camerounais sur lequel le paiement sera effectué.
                  </p>
                </div>

                {/* Notice agency number */}
                <div className="mt-4 rounded-xl border border-warning/40 bg-warning/5 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Numéro officiel de réception LOUSLENS DIGITAL :</p>
                  <p className="mt-1 font-mono text-sm font-bold text-primary">
                    +237 697 09 09 79 ({operator === "MTN" ? "MTN MoMo" : "Orange Money"})
                  </p>
                  <p className="mt-1">
                    Nous ne vous demanderons jamais votre code secret. Validez la demande sur votre téléphone.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="glass" onClick={() => setStep("fill_details")} disabled={loading}>
                  <ArrowLeft className="size-4" /> Modifier les informations
                </Button>
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="shadow-glow"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      Confirmer et Payer {formatXAF(price, lang)} <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: SUCCESS & COUNTDOWN LAUNCHED ─── */}
          {step === "success" && (
            <div className="space-y-6 text-center animate-fade-up">
              <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-success/10 text-success">
                <CheckCircle2 className="size-10" />
              </div>

              <h2 className="text-3xl font-extrabold text-foreground">
                Commande validée avec succès !
              </h2>
              <p className="mx-auto max-w-lg text-muted-foreground">
                Votre commande <span className="font-mono font-bold text-primary">{createdOrder?.order_number}</span> est enregistrée.
                Le chronomètre de 48 heures est officiellement enclenché. Si nous dépassons le délai, le compte vous sera offert !
              </p>

              <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-center gap-2 text-warning">
                  <Clock3 className="size-6 animate-pulse" />
                  <span className="font-display text-2xl font-bold">48 h 00 min</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Suivez l'avancement de votre commande en direct dans votre espace client.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <Button variant="hero" size="xl" asChild className="shadow-glow">
                  <Link to="/dashboard">Voir mon Espace Client <ArrowRight className="size-4" /></Link>
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>
    </PublicLayout>
  );
}
