import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PlatformIcon } from "@/components/site/brand";
import { useI18n } from "@/lib/i18n";
import { useAuth, useProfile, useSignOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatXAF, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Loader2,
  ArrowRight,
  CreditCard,
  MessageCircle,
  HelpCircle,
  Send,
  Gift,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  User,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: ClientDashboardPage,
});

const PRE_RECORDED_FAQ = [
  {
    q: "Quel est le délai exact de livraison de ma commande ?",
    a: "Votre compte YouTube ou TikTok est préparé et livré en 48 heures maximum à compter de la confirmation. Si nous dépassons ce délai de 48 heures, votre commande devient automatiquement 100 % gratuite et vous est offerte !",
  },
  {
    q: "Pourrai-je modifier le mot de passe après la livraison ?",
    a: "Oui, absolument ! Dès la livraison, vous recevez les accès complets. Nous vous invitons immédiatement à changer le mot de passe et à ajouter vos propres numéros de téléphone et adresses de récupération personnelles.",
  },
  {
    q: "Comment le compte est-il configuré pour être monétisable ?",
    a: "Pour TikTok, nous configurons le compte avec une adresse IP et une localisation dans une région éligible (ex: France, USA) pour débloquer le Programme de Récompenses. Pour YouTube, la chaîne est paramétrée selon les critères optimaux du Programme Partenaire.",
  },
  {
    q: "Où vais-je recevoir les identifiants de mon compte ?",
    a: "Vos identifiants et les instructions de connexion seront affichés directement dans cet espace client, ainsi que par message privé dans votre messagerie intégrée.",
  },
  {
    q: "Comment puis-je payer par Mobile Money ou Orange Money ?",
    a: "Le paiement se fait directement lors de votre commande vers le numéro officiel de LOUSLENS DIGITAL (+237 697 09 09 79). Vous n'avez jamais à communiquer votre code PIN.",
  },
];

function ClientDashboardPage() {
  const { lang } = useI18n();
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"orders" | "chat">("orders");
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Auto redirection if unauthenticated
  if (!ready) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!session) {
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
    return null;
  }

  // 1. Fetch Client's Orders
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["my-orders", session.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, services(name_fr, name_en, price_xaf, category)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 10000, // auto poll every 10s
  });

  // 2. Fetch or Create Conversation for Chat
  const { data: conversation } = useQuery({
    queryKey: ["client-conversation", session.user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) return data;

      // Create conversation if none
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          user_id: session.user.id,
          subject: "Assistance Client",
        })
        .select()
        .single();

      return newConv;
    },
  });

  // 3. Fetch Messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["client-messages", conversation?.id],
    enabled: !!conversation?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  // Send message to Admin
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim() || !conversation) return;

    setSendingMsg(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: session.user.id,
        is_admin: false,
        kind: "text",
        body: chatMessage.trim(),
      });

      if (error) throw error;

      setChatMessage("");
      refetchMessages();
      toast.success("Message envoyé à l'administrateur !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
    } finally {
      setSendingMsg(false);
    }
  };

  const userName = profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Client";

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">

          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                  Espace Client
                </h1>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-xs text-primary">
                  {profile?.client_code || "Client"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Bienvenue, <span className="font-semibold text-foreground">{userName}</span>. Suivez vos commandes et contactez l'équipe.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="hero" size="lg" className="shadow-glow">
                <Link to="/order">
                  <Plus className="size-4" /> Passer une commande
                </Link>
              </Button>
              <Button variant="glass" size="sm" onClick={signOut}>
                <LogOut className="size-4" /> Déconnexion
              </Button>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <Package className="size-4" />
              <span>Mes Commandes</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <MessageCircle className="size-4" />
              <span>Assistance & Chat Admin</span>
            </button>
          </div>

          {/* ─── TAB 1: ORDERS LIST WITH 48H COUNTDOWN ─── */}
          {activeTab === "orders" && (
            <div className="mt-8 space-y-6">
              {loadingOrders ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
                  <Package className="mx-auto size-16 text-muted-foreground/30" />
                  <h3 className="mt-4 text-xl font-bold text-foreground">Vous n'avez pas encore de commande</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Commandez dès maintenant votre compte YouTube ou TikTok monétisable livré en 48 h.
                  </p>
                  <Button asChild variant="hero" size="lg" className="mt-6 shadow-glow">
                    <Link to="/order">
                      <Plus className="size-4" /> Commander mon compte
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const isDelivered = ord.status === "delivered";
                    const isCancelled = ord.status === "cancelled";

                    // Calculate countdown
                    const createdAt = new Date(ord.created_at).getTime();
                    const deadline = ord.deadline_at
                      ? new Date(ord.deadline_at).getTime()
                      : createdAt + 48 * 60 * 60 * 1000;
                    const now = Date.now();
                    const timeLeftMs = deadline - now;
                    const isExpired = timeLeftMs <= 0 && !isDelivered;

                    // Remaining time calculation
                    const hoursLeft = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60)));
                    const minutesLeft = Math.max(0, Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)));

                    return (
                      <div
                        key={ord.id}
                        className={`overflow-hidden rounded-2xl border p-6 shadow-card transition-all ${
                          isExpired
                            ? "border-emerald-500/50 bg-emerald-950/10"
                            : isDelivered
                            ? "border-success/40 bg-card"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="grid size-12 place-items-center rounded-2xl bg-accent text-primary">
                              <PlatformIcon platform={ord.category || "youtube"} className="size-6" />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-foreground">
                                  {ord.service_name_fr || "Création de compte"}
                                </h3>
                                <span className="font-mono text-xs font-semibold text-muted-foreground">
                                  ({ord.order_number})
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Commandé le {formatDateTime(ord.created_at, lang)}
                              </p>

                              {/* Form details recap */}
                              <div className="mt-2 text-xs text-muted-foreground">
                                {ord.form_data?.channel_name && (
                                  <span>Chaîne : <strong className="text-foreground">{ord.form_data.channel_name}</strong> • </span>
                                )}
                                {ord.form_data?.account_name && (
                                  <span>Compte : <strong className="text-foreground">{ord.form_data.account_name}</strong> • </span>
                                )}
                                {ord.form_data?.dedicated_email && (
                                  <span>Email : <span className="font-mono text-foreground">{ord.form_data.dedicated_email}</span></span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* STATUS & 48H COUNTDOWN */}
                          <div className="text-left sm:text-right">
                            {isDelivered ? (
                              <Badge variant="default" className="bg-success text-success-foreground gap-1.5 py-1 px-3">
                                <CheckCircle2 className="size-3.5" /> Commande Livrée
                              </Badge>
                            ) : isExpired ? (
                              <div className="inline-flex flex-col items-end">
                                <Badge variant="default" className="bg-emerald-500 text-white gap-1.5 py-1 px-3 animate-pulse">
                                  <Gift className="size-3.5" /> Offert — Délai 48 h Dépassé
                                </Badge>
                                <span className="mt-1 text-[11px] font-bold text-emerald-400">
                                  Délai dépassé : Ce compte vous est 100% offert !
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col sm:items-end">
                                <div className="flex items-center gap-1.5 text-warning">
                                  <Clock3 className="size-4 animate-spin" />
                                  <span className="font-mono text-base font-extrabold">
                                    {hoursLeft} h {minutesLeft} min restantes
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                  Garantie 48h ou offert
                                </span>
                              </div>
                            )}

                            <p className="mt-2 font-display text-sm font-bold text-foreground">
                              {formatXAF(ord.amount_xaf, lang)}
                            </p>
                          </div>
                        </div>

                        {/* If delivered, show note */}
                        {isDelivered && (
                          <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-4 text-xs text-foreground">
                            <p className="font-bold text-success flex items-center gap-1.5">
                              <CheckCircle2 className="size-4" /> Votre compte est prêt !
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              Votre compte a été configuré avec succès. Rendez-vous dans l'onglet « Assistance & Chat » si vous avez besoin d'aide pour finaliser votre accès.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: FAQ & DIRECT CHAT WITH ADMIN ─── */}
          {activeTab === "chat" && (
            <div className="mt-8 grid gap-8 lg:grid-cols-12">

              {/* LEFT: PRE-RECORDED QUESTIONS (FAQ) */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center gap-2 text-primary">
                    <HelpCircle className="size-5" />
                    <h3 className="font-bold text-foreground">Questions fréquentes</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cliquez sur une question pour afficher la réponse immédiate.
                  </p>

                  <div className="mt-4 space-y-2">
                    {PRE_RECORDED_FAQ.map((faq, idx) => {
                      const isOpen = selectedFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="overflow-hidden rounded-xl border border-border/80 bg-surface/50 text-xs transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedFaq(isOpen ? null : idx)}
                            className="flex w-full items-center justify-between p-3 text-left font-semibold text-foreground hover:text-primary"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown
                              className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                            />
                          </button>
                          {isOpen && (
                            <div className="border-t border-border/60 bg-background/50 p-3 text-muted-foreground leading-relaxed">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Votre question n'est pas listée ?</p>
                  <p className="mt-1">
                    Écrivez directement à l'administrateur dans la boîte de discussion à droite. Il vous répondra ici même !
                  </p>
                </div>
              </div>

              {/* RIGHT: LIVE CHAT MESSAGING BOX */}
              <div className="flex flex-col rounded-2xl border border-border bg-card shadow-card lg:col-span-7">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-success"></span>
                    </span>
                    <div>
                      <h3 className="font-bold text-foreground">Chat Direct avec l'Administrateur</h3>
                      <p className="text-xs text-muted-foreground">LOUSLENS DIGITAL Support</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">En ligne</Badge>
                </div>

                {/* Messages feed */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4 min-h-[320px] max-h-[420px]">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <MessageCircle className="size-10 text-muted-foreground/30" />
                      <p className="mt-2 text-sm font-semibold">Aucun message pour l'instant</p>
                      <p className="text-xs">Posez votre question à l'administrateur ci-dessous.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === session.user.id && !msg.is_admin;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? "bg-primary text-primary-foreground shadow-glow rounded-br-none"
                                : "bg-surface border border-border text-foreground rounded-bl-none"
                            }`}
                          >
                            {!isMe && (
                              <p className="mb-1 text-[10px] font-bold text-primary uppercase">
                                Administrateur LOUSLENS
                              </p>
                            )}
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                            <span className="mt-1 block text-right text-[10px] opacity-70">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-border p-3">
                  <Input
                    placeholder="Écrivez votre message à l'administrateur..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <Button type="submit" variant="hero" disabled={sendingMsg || !chatMessage.trim()}>
                    {sendingMsg ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </div>

            </div>
          )}

        </div>
      </section>
    </PublicLayout>
  );
}
