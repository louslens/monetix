import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PlatformIcon } from "@/components/site/brand";
import { useI18n } from "@/lib/i18n";
import { useAuth, useIsAdmin, useSignOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatXAF, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  Users,
  CreditCard,
  Settings,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Gift,
  MessageCircle,
  Send,
  Lock,
  Globe,
  Mail,
  User,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type AdminTab = "orders" | "clients" | "payments" | "chat" | "services" | "settings";

function AdminPage() {
  const { lang } = useI18n();
  const { session, ready } = useAuth();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Chat state in admin
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [sendingAdminReply, setSendingAdminReply] = useState(false);

  // 1. Loading
  if (!ready || checkingAdmin) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement de l'administration...</p>
        </div>
      </PublicLayout>
    );
  }

  // 2. Auth check
  if (!session) {
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
    return null;
  }

  // 3. Strictest Admin check
  const userEmail = session.user.email?.toLowerCase();
  const isAuthorized = userEmail === "louslens6@gmail.com" || isAdmin;

  if (!isAuthorized) {
    return (
      <PublicLayout>
        <section className="relative overflow-hidden py-24">
          <div className="relative mx-auto max-w-md px-4 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-10" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Accès Réservé à l'Administrateur</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Cet espace est strictement réservé à <span className="font-semibold text-foreground">louslens6@gmail.com</span>.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild variant="hero">
                <Link to="/dashboard">Retourner à mon Espace Client</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  // ─── ADMIN QUERIES ───
  // Orders
  const { data: orders = [], isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, services(name_fr, name_en, price_xaf, category)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  // Clients
  const { data: clients = [], isLoading: loadingClients, refetch: refetchClients } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Payments
  const { data: payments = [], isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, orders(order_number, service_name_fr)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, profiles(full_name, email, client_code)")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  // Messages in selected conversation
  const { data: conversationMessages = [], refetch: refetchConvMessages } = useQuery({
    queryKey: ["admin-conv-messages", selectedConversation?.id],
    enabled: !!selectedConversation?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 3000,
  });

  // Services
  const { data: services = [], isLoading: loadingServices, refetch: refetchServices } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Settings
  const { data: adminSettings } = useQuery({
    queryKey: ["admin-settings-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // ─── ACTIONS ───
  // Update order status
  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (status === "delivered") updateData.delivered_at = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Statut de la commande mis à jour !");
      refetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status, ...(paymentStatus ? { payment_status: paymentStatus } : {}) }));
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour");
    }
  };

  // Send admin reply in chat
  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminReplyText.trim() || !selectedConversation) return;

    setSendingAdminReply(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: session.user.id,
        is_admin: true,
        kind: "text",
        body: adminReplyText.trim(),
      });

      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", selectedConversation.id);

      setAdminReplyText("");
      refetchConvMessages();
      refetchConversations();
      toast.success("Réponse envoyée au client !");
    } catch (err: any) {
      toast.error(err.message || "Erreur d'envoi");
    } finally {
      setSendingAdminReply(false);
    }
  };

  // Compute 48h deadline & free orders
  const now = Date.now();
  const awaitingCount = orders.filter((o) => o.status === "awaiting_payment").length;
  const inQueueCount = orders.filter((o) => o.status === "in_queue" || o.status === "processing").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const expiredFreeOrders = orders.filter((o) => {
    if (o.status === "delivered") return false;
    const deadline = o.deadline_at ? new Date(o.deadline_at).getTime() : new Date(o.created_at).getTime() + 48 * 3600 * 1000;
    return now > deadline;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((acc, curr) => acc + (curr.amount_xaf || curr.services?.price_xaf || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    let matchesStatus = true;
    if (statusFilter === "expired_free") {
      const deadline = ord.deadline_at ? new Date(ord.deadline_at).getTime() : new Date(ord.created_at).getTime() + 48 * 3600 * 1000;
      matchesStatus = now > deadline && ord.status !== "delivered";
    } else if (statusFilter !== "all") {
      matchesStatus = ord.status === statusFilter;
    }

    const clientName = ord.form_data?.full_name?.toLowerCase() || "";
    const orderNum = ord.order_number?.toLowerCase() || "";
    const email = ord.form_data?.dedicated_email?.toLowerCase() || "";
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || orderNum.includes(query) || clientName.includes(query) || email.includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <PublicLayout>
      {/* TOP ADMIN BAR */}
      <div className="border-b border-border bg-card/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                  Panneau de Contrôle Administrateur
                </h1>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-xs text-primary">
                  SUPER ADMIN
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Connecté en tant que <span className="font-semibold text-foreground">{userEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="glass" size="sm">
              <Link to="/dashboard">Vue Client</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-destructive hover:bg-destructive/10">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* ─── STATS SUMMARY CARDS ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Commandes Totales</span>
              <Package className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{orders.length}</p>
          </div>

          <div className="rounded-2xl border border-warning/40 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">En cours (48 h)</span>
              <Clock3 className="size-4 text-warning" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-warning">{inQueueCount}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Offertes (Délai Dépassé)</span>
              <Gift className="size-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">{expiredFreeOrders.length}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Clients Inscrits</span>
              <Users className="size-4 text-violet" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{clients.length}</p>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-glow">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Encaissé</span>
              <DollarSign className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">{formatXAF(totalRevenue, lang)}</p>
          </div>
        </div>

        {/* ─── NAVIGATION TABS ─── */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "orders", label: "Commandes", icon: Package, count: orders.length },
            { id: "clients", label: "Inscrits", icon: Users, count: clients.length },
            { id: "payments", label: "Paiements", icon: CreditCard, count: payments.length },
            { id: "chat", label: "Chat & Assistance", icon: MessageCircle, count: conversations.length },
            { id: "services", label: "Tarifs & Services", icon: DollarSign },
            { id: "settings", label: "Paramètres", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/20 text-white" : "bg-accent text-foreground"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: ALL ORDERS & 48H TRACKING ─── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par commande, email, chaîne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Filtrer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les commandes</SelectItem>
                    <SelectItem value="in_queue">En file (En cours)</SelectItem>
                    <SelectItem value="processing">En traitement</SelectItem>
                    <SelectItem value="delivered">Livrées ✅</SelectItem>
                    <SelectItem value="expired_free">Offertes (Délai Dépassé) 🎁</SelectItem>
                    <SelectItem value="awaiting_payment">Attente paiement</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="glass" size="icon" onClick={() => refetchOrders()} title="Actualiser">
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Package className="mx-auto size-12 text-muted-foreground/30" />
                <p className="mt-4 font-semibold text-foreground">Aucune commande ne correspond</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Commande</th>
                      <th className="px-5 py-3.5">Plateforme & Détails</th>
                      <th className="px-5 py-3.5">Email & Mot de Passe</th>
                      <th className="px-5 py-3.5">Délai 48 h</th>
                      <th className="px-5 py-3.5">Statut Commande</th>
                      <th className="px-5 py-3.5">Paiement</th>
                      <th className="px-5 py-3.5 text-right">Fiche</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredOrders.map((ord) => {
                      const isDelivered = ord.status === "delivered";
                      const deadline = ord.deadline_at ? new Date(ord.deadline_at).getTime() : new Date(ord.created_at).getTime() + 48 * 3600 * 1000;
                      const isOverdue = now > deadline && !isDelivered;

                      return (
                        <tr key={ord.id} className="transition-colors hover:bg-surface/30">
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-foreground">{ord.order_number}</span>
                            <div className="text-xs text-muted-foreground">{formatDateTime(ord.created_at, lang)}</div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <PlatformIcon platform={ord.category || "youtube"} className="size-4" />
                              <span className="font-bold text-foreground">
                                {ord.form_data?.channel_name || ord.form_data?.account_name || ord.service_name_fr}
                              </span>
                            </div>
                            {ord.category === "tiktok" && ord.form_data?.hosting_country && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Globe className="size-3 text-cyan-400" />
                                <span>Hébergement : {ord.form_data.hosting_country}</span>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-mono text-xs text-foreground">{ord.form_data?.dedicated_email || "—"}</div>
                            <div className="font-mono text-xs text-primary flex items-center gap-1 mt-0.5">
                              <Lock className="size-3" />
                              <span>{ord.form_data?.dedicated_password || "••••••"}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {isDelivered ? (
                              <span className="text-xs font-semibold text-success flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" /> Livré à temps
                              </span>
                            ) : isOverdue ? (
                              <Badge className="bg-emerald-500 text-white gap-1 text-xs">
                                <Gift className="size-3" /> Offert (+48 h)
                              </Badge>
                            ) : (
                              <span className="font-mono text-xs text-warning flex items-center gap-1 font-semibold">
                                <Clock3 className="size-3.5" /> Compte à rebours actif
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <Select
                              value={ord.status}
                              onValueChange={(val) => updateOrderStatus(ord.id, val)}
                            >
                              <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in_queue">Reçue (En file)</SelectItem>
                                <SelectItem value="processing">En cours</SelectItem>
                                <SelectItem value="delivered">Livrée ✅</SelectItem>
                                <SelectItem value="expired_free">Offerte 🎁</SelectItem>
                                <SelectItem value="cancelled">Annulée ❌</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="px-5 py-4">
                            <Select
                              value={ord.payment_status}
                              onValueChange={(val) => updateOrderStatus(ord.id, ord.status, val)}
                            >
                              <SelectTrigger className="h-8 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Payé ✅</SelectItem>
                                <SelectItem value="unpaid">Non payé</SelectItem>
                                <SelectItem value="refunded">Remboursé</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Button variant="glass" size="sm" onClick={() => setSelectedOrder(ord)}>
                              <Eye className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: REGISTERED USERS (INSCRITS) ─── */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-bold text-foreground">Utilisateurs inscrits sur la plateforme</h3>
              <p className="text-xs text-muted-foreground">Liste de toutes les personnes ayant créé un compte client.</p>
            </div>

            {loadingClients ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                Aucun utilisateur inscrit pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Code Client</th>
                      <th className="px-5 py-3.5">Nom</th>
                      <th className="px-5 py-3.5">E-mail</th>
                      <th className="px-5 py-3.5">Téléphone</th>
                      <th className="px-5 py-3.5">Date Inscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {clients.map((cli) => (
                      <tr key={cli.id} className="hover:bg-surface/30">
                        <td className="px-5 py-4 font-mono font-bold text-primary">{cli.client_code}</td>
                        <td className="px-5 py-4 font-semibold text-foreground">{cli.full_name || "—"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{cli.email}</td>
                        <td className="px-5 py-4 text-muted-foreground">{cli.phone || "—"}</td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDateTime(cli.created_at, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: PAYMENTS RECEIVED ─── */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-bold text-foreground">Historique des paiements Mobile Money</h3>
              <p className="text-xs text-muted-foreground">Paiements enregistrés par MTN MoMo et Orange Money.</p>
            </div>

            {loadingPayments ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                Aucun paiement enregistré pour l'instant.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Opérateur</th>
                      <th className="px-5 py-3.5">Numéro Client</th>
                      <th className="px-5 py-3.5">Montant</th>
                      <th className="px-5 py-3.5">Réf. Commande</th>
                      <th className="px-5 py-3.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-surface/30">
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDateTime(pay.created_at, lang)}</td>
                        <td className="px-5 py-4 font-bold">
                          <span className={pay.operator === "MTN" ? "text-yellow-500" : "text-orange-500"}>
                            {pay.operator}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono">{pay.phone}</td>
                        <td className="px-5 py-4 font-bold text-foreground">{formatXAF(pay.amount_xaf, lang)}</td>
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{pay.operator_reference || "—"}</td>
                        <td className="px-5 py-4">
                          <Badge variant="default" className="bg-success text-success-foreground text-xs">
                            Confirmé ✅
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: CHAT & LIVE MESSAGING WITH CLIENTS ─── */}
        {activeTab === "chat" && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Conversation list */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card lg:col-span-4">
              <h3 className="font-bold text-foreground">Conversations Clients ({conversations.length})</h3>
              <p className="text-xs text-muted-foreground mb-4">Cliquez pour répondre au client.</p>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation en cours.</p>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full rounded-xl p-3 text-left transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-surface hover:bg-accent text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">
                            {conv.profiles?.full_name || conv.profiles?.email?.split("@")[0] || "Client"}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs opacity-80 mt-1 truncate">
                          {conv.profiles?.email}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation active thread */}
            <div className="flex flex-col rounded-2xl border border-border bg-card shadow-card lg:col-span-8 min-h-[500px]">
              {selectedConversation ? (
                <>
                  <div className="border-b border-border p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground">
                        {selectedConversation.profiles?.full_name || selectedConversation.profiles?.email}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Code client : {selectedConversation.profiles?.client_code || "—"} • {selectedConversation.profiles?.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Discussion en direct</Badge>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
                    {conversationMessages.map((msg) => {
                      const isFromAdmin = msg.is_admin;
                      return (
                        <div key={msg.id} className={`flex ${isFromAdmin ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                              isFromAdmin
                                ? "bg-primary text-primary-foreground rounded-br-none shadow-glow"
                                : "bg-surface border border-border text-foreground rounded-bl-none"
                            }`}
                          >
                            <p className="text-[10px] opacity-70 font-semibold mb-1">
                              {isFromAdmin ? "Vous (Admin)" : "Client"}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                            <span className="block text-right text-[10px] opacity-60 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply form */}
                  <form onSubmit={handleSendAdminReply} className="border-t border-border p-3 flex gap-2">
                    <Input
                      placeholder="Écrivez votre réponse au client..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button type="submit" variant="hero" disabled={sendingAdminReply || !adminReplyText.trim()}>
                      {sendingAdminReply ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center p-8 text-muted-foreground">
                  <MessageCircle className="size-12 text-muted-foreground/30 mb-3" />
                  <p className="font-semibold text-foreground">Sélectionnez une conversation</p>
                  <p className="text-xs">Cliquez sur un client à gauche pour lire ses messages et lui répondre.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 5: SERVICES & TARIFS ─── */}
        {activeTab === "services" && (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((svc) => (
              <div key={svc.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-accent text-primary">
                      <PlatformIcon platform={svc.category as any} className="size-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{svc.category}</span>
                      <h3 className="text-lg font-bold text-foreground">{svc.name_fr}</h3>
                    </div>
                  </div>
                  <Badge variant={svc.active ? "default" : "secondary"}>
                    {svc.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{svc.description_fr}</p>

                <div className="mt-6 border-t border-border pt-4">
                  <Label className="text-xs text-muted-foreground">Prix du forfait (en FCFA)</Label>
                  <div className="mt-2 flex gap-3">
                    <Input
                      type="number"
                      defaultValue={svc.price_xaf}
                      id={`p-${svc.id}`}
                      className="font-mono text-base font-bold"
                    />
                    <Button
                      variant="hero"
                      onClick={async () => {
                        const val = (document.getElementById(`p-${svc.id}`) as HTMLInputElement)?.value;
                        if (val) {
                          await supabase.from("services").update({ price_xaf: parseInt(val, 10) }).eq("id", svc.id);
                          toast.success("Prix mis à jour !");
                          refetchServices();
                        }
                      }}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── TAB 6: SETTINGS ─── */}
        {activeTab === "settings" && (
          <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-bold text-foreground">Coordonnées Officielles LOUSLENS DIGITAL</h3>
            <div className="mt-6 space-y-4">
              <div className="space-y-1">
                <Label>Agence</Label>
                <Input defaultValue={adminSettings?.company_name || "LOUSLENS DIGITAL"} disabled />
              </div>
              <div className="space-y-1">
                <Label>E-mail Administrateur</Label>
                <Input defaultValue="louslens6@gmail.com" disabled />
              </div>
              <div className="space-y-1">
                <Label>Numéro Mobile Money Réception</Label>
                <Input defaultValue={adminSettings?.mobile_money_number || "697090979"} disabled />
              </div>
              <div className="space-y-1">
                <Label>Numéro WhatsApp Clientèle</Label>
                <Input defaultValue={adminSettings?.whatsapp_number || "237697090979"} disabled />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── ORDER DETAILS MODAL ─── */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Fiche Commande {selectedOrder?.order_number}</span>
              <Badge variant="outline">{selectedOrder?.status}</Badge>
            </DialogTitle>
            <DialogDescription>
              Passée le {selectedOrder ? formatDateTime(selectedOrder.created_at, lang) : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-2">
              <div className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Détails de la création demandée</h4>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Plateforme : </span>
                    <strong className="text-foreground">{selectedOrder.category?.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nom souhaité : </span>
                    <strong className="text-foreground">
                      {selectedOrder.form_data?.channel_name || selectedOrder.form_data?.account_name || "—"}
                    </strong>
                  </div>
                  {selectedOrder.form_data?.hosting_country && (
                    <div>
                      <span className="text-muted-foreground">Pays d'hébergement : </span>
                      <strong className="text-cyan-400">{selectedOrder.form_data.hosting_country}</strong>
                    </div>
                  )}
                  {selectedOrder.form_data?.residence_country && (
                    <div>
                      <span className="text-muted-foreground">Pays de résidence : </span>
                      <strong className="text-foreground">{selectedOrder.form_data.residence_country}</strong>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">E-mail dédié : </span>
                    <span className="font-mono font-bold text-success">{selectedOrder.form_data?.dedicated_email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Mot de passe fourni : </span>
                    <span className="font-mono font-bold text-primary">{selectedOrder.form_data?.dedicated_password}</span>
                  </div>
                </div>

                {selectedOrder.form_data?.notes && (
                  <div className="pt-2">
                    <span className="text-muted-foreground text-xs">Notes / Préférences :</span>
                    <p className="mt-1 rounded bg-background p-2 text-xs text-foreground">{selectedOrder.form_data.notes}</p>
                  </div>
                )}
              </div>

              {/* Status actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Changer en :</span>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "processing" ? "default" : "glass"}
                    onClick={() => updateOrderStatus(selectedOrder.id, "processing")}
                  >
                    En traitement
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "delivered" ? "default" : "hero"}
                    onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                  >
                    Livré ✅
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant={selectedOrder.payment_status === "paid" ? "secondary" : "default"}
                  onClick={() =>
                    updateOrderStatus(
                      selectedOrder.id,
                      selectedOrder.status,
                      selectedOrder.payment_status === "paid" ? "unpaid" : "paid"
                    )
                  }
                >
                  {selectedOrder.payment_status === "paid" ? "Marquer Non payé" : "Valider Paiement Reçu ✅"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
