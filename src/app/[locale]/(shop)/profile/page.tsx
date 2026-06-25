"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { createClient } from "@/utils/supabase/client";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PhoneVerification } from "@/components/commerce/PhoneVerification";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-distribution.onrender.com";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const { items: wishlistItems } = useWishlistStore();

  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"profile" | "orders" | "wishlist">("profile");
  const [saved, setSaved] = React.useState(false);

  const [form, setForm] = React.useState({ full_name: "", phone: "" });
  const [phoneVerified, setPhoneVerified] = React.useState(false);

  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState("");
  const [authLoading, setAuthLoading] = React.useState(false);

  // Load session & profile on mount
  const loadProfile = async (currentUser: any) => {
    // Fetch profile from backend
    const res = await fetch(`${API_URL}/api/profile/${currentUser.id}`);
    const json = await res.json();
    if (json.success) {
      setProfile(json.data);
      setForm({ full_name: json.data.full_name || "", phone: json.data.phone || "" });
      
      // Auto-authorize admin if role is admin
      if (json.data.role === "admin") {
        window.sessionStorage?.setItem("cf_admin_auth", "true");
        window.localStorage?.setItem("cf_admin_auth", "true");
        router.push("/admin");
      }
    }

    // Fetch orders
    const ordRes = await fetch(`${API_URL}/api/orders?userId=${currentUser.id}&limit=10`);
    const ordJson = await ordRes.json();
    if (ordJson.success) setOrders(ordJson.data || []);
  };

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadProfile(user);
      }
      setLoading(false);
    })();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await loadProfile(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0],
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await loadProfile(data.user);
          setAuthMode("login");
          setAuthError(locale === "ar" ? "تم تسجيل حسابك بنجاح! يرجى تسجيل الدخول." : "Compte créé ! Veuillez vous connecter.");
        }
      }
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
        setAuthError(locale === "ar" ? "بيانات تسجيل الدخول غير صحيحة. حاول مرة أخرى." : "Identifiants incorrects. Veuillez réessayer.");
      } else if (msg.includes("Email not confirmed")) {
        setAuthError(locale === "ar" ? "يرجى تأكيد بريدك الإلكتروني أولاً." : "Veuillez confirmer votre email avant de vous connecter.");
      } else if (msg.includes("Too many requests")) {
        setAuthError(locale === "ar" ? "تجاوزت عدد المحاولات. حاول لاحقاً." : "Trop de tentatives. Veuillez réessayer plus tard.");
      } else if (msg.includes("User already registered")) {
        setAuthError(locale === "ar" ? "هذا البريد مسجل مسبقاً." : "Cet email est déjà enregistré.");
      } else {
        setAuthError(locale === "ar" ? "حدث خطأ. حاول مرة أخرى." : "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.full_name, phone: form.phone, avatarUrl: profile?.avatar_url }),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/upload/product-image`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        // Save the new avatar URL
        const saveRes = await fetch(`${API_URL}/api/profile/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: form.full_name, phone: form.phone, avatarUrl: json.data.url }),
        });
        const saveJson = await saveRes.json();
        if (saveJson.success) setProfile(saveJson.data);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.sessionStorage?.removeItem("cf_admin_auth");
    window.localStorage?.removeItem("cf_admin_auth");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <Section padding="lg" background="white" className="flex-1 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display text-sm text-text-secondary">Chargement du profil...</p>
        </div>
      </Section>
    );
  }

  if (!user) {
    return (
      <Section padding="luxury" background="cream" className="flex-1 min-h-[80vh] flex items-center justify-center">
        <Container className="max-w-md">
          <div className="p-8 md:p-10 bg-white border border-border-default shadow-elevated rounded-3xl text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </div>
            <h1 className="font-display font-bold text-2xl text-text-primary tracking-tight mb-2">
              {authMode === "login"
                ? (locale === "ar" ? "تسجيل الدخول" : "Connexion Client")
                : (locale === "ar" ? "إنشاء حساب" : "Créer un compte")}
            </h1>
            <p className="font-body text-xs text-text-secondary mb-6">
              {locale === "ar"
                ? "سجل الدخول لإدارة ملفك الشخصي وتتبع طلباتك."
                : "Accédez à votre espace pour suivre vos commandes et gérer vos informations."}
            </p>

            {authError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-left font-body text-xs">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div className="text-left flex flex-col gap-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-wider text-text-secondary">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="px-4 py-3 bg-surface-50 border border-border-default rounded-xl font-body text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="text-left flex flex-col gap-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-wider text-text-secondary">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-4 py-3 bg-surface-50 border border-border-default rounded-xl font-body text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-4 mt-2 bg-black hover:bg-neutral-800 text-white font-display font-bold text-[10px] uppercase tracking-[0.15em] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97]"
              >
                {authLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {authMode === "login" ? "Se connecter" : "S'inscrire"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-text-secondary font-display font-medium text-[10px] tracking-wider">
                  {locale === "ar" ? "أو سجل عبر" : "Ou continuer avec"}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                setAuthLoading(true);
                setAuthError("");
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/${locale}/profile`,
                    },
                  });
                  if (error) throw error;
                } catch (err: any) {
                  setAuthError(err.message || "Une erreur est survenue avec Google.");
                  setAuthLoading(false);
                }
              }}
              disabled={authLoading}
              className="w-full py-3.5 bg-white border-2 border-black hover:bg-black hover:text-white text-black font-display font-bold text-[10px] uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
              className="mt-6 font-display font-semibold text-xs text-primary-500 hover:text-primary-600 underline"
            >
              {authMode === "login"
                ? (locale === "ar" ? "إنشاء حساب جديد" : "Pas encore de compte ? S'inscrire")
                : (locale === "ar" ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Déjà un compte ? Se connecter")}
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  const initials = form.full_name
    ? form.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const tabs = [
    { id: "profile" as const, label: "Mon Profil", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
    { id: "orders" as const, label: "Mes Commandes", icon: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" },
    { id: "wishlist" as const, label: "Liste de Souhaits", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  ];

  return (
    <Section padding="lg" background="white" className="flex-1">
      <Container className="max-w-4xl">

        {/* Page Header */}
        <div className="mb-10">
          <p className="font-display font-semibold text-xs uppercase tracking-widest text-primary-500 mb-1">Mon Espace</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight">
            {form.full_name || "Mon Profil"}
          </h1>
          <p className="font-body text-sm text-text-secondary mt-1">{user?.email}</p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-surface-100 p-1 rounded-2xl mb-8 border border-border-default w-full overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-xs transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-primary-500 shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2">
                <path d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Avatar Column */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-surface-200 shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-primary-500 flex items-center justify-center border-4 border-surface-200 shadow-md">
                    <span className="font-display font-bold text-3xl text-white">{initials}</span>
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-surface-100 border border-border-default rounded-full font-display font-semibold text-xs text-text-secondary hover:border-primary-500 hover:text-primary-500 transition-all">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  {uploadingAvatar ? "Upload..." : "Changer la photo"}
                </span>
              </label>

              {/* Role badge */}
              <span className={`px-3 py-1 rounded-full font-display font-bold text-[10px] uppercase tracking-widest ${
                profile?.role === "admin"
                  ? "bg-primary-500/10 text-primary-600"
                  : profile?.role === "wholesale"
                    ? "bg-accent-400/10 text-accent-600"
                    : "bg-surface-200 text-text-secondary"
              }`}>
                {profile?.role === "admin" ? "Administrateur" : profile?.role === "wholesale" ? "Compte Pro" : "Client"}
              </span>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="mt-4 w-full py-3 px-4 border border-red-200 text-red-500 font-display font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Se déconnecter
              </button>
            </div>

            {/* Form Column */}
            <div className="md:col-span-2 flex flex-col gap-5">
              {saved && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 font-body text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Profil mis à jour avec succès !
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Ex: Ahmed Ben Salah"
                  className="px-4 py-3 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="px-4 py-3 bg-surface-200 border border-border-default rounded-xl font-body text-sm text-text-tertiary cursor-not-allowed"
                />
                <p className="font-body text-[10px] text-text-tertiary">L'email ne peut pas être modifié ici.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                    Numéro de téléphone
                  </label>
                  {phoneVerified && (
                    <span className="flex items-center gap-1 font-display font-bold text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      Vérifié
                    </span>
                  )}
                </div>
                <PhoneVerification
                  currentPhone={form.phone}
                  locale={locale}
                  onVerified={(verifiedPhone) => {
                    setForm(f => ({ ...f, phone: verifiedPhone }));
                    setPhoneVerified(true);
                  }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="self-start mt-2 px-8 py-3 bg-black text-white font-display font-bold text-[10px] uppercase tracking-[0.12em] hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                    Sauvegarder les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-4">
            {orders.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 bg-surface-100 rounded-3xl border border-dashed border-border-default text-center">
                <svg className="w-12 h-12 text-text-tertiary stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <p className="font-display font-semibold text-sm text-text-secondary">Aucune commande pour le moment.</p>
                <p className="font-body text-xs text-text-tertiary">Vos commandes apparaîtront ici dès que vous passez une commande.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white border border-border-default rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary-200 hover:shadow-sm transition-all">
                  <div className="flex flex-col gap-1">
                    <span className="font-display font-bold text-sm text-text-primary">#{order.order_number}</span>
                    <span className="font-body text-xs text-text-tertiary">
                      {new Date(order.created_at).toLocaleDateString(locale === "ar" ? "ar-TN" : "fr-TN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-display font-semibold text-[10px] uppercase tracking-wider ${statusColors[order.status] || "bg-surface-200 text-text-secondary"}`}>
                      {order.status}
                    </span>
                    <span className="font-display font-bold text-sm text-text-primary">
                      {order.total.toFixed(2)} TND
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Wishlist Tab ── */}
        {activeTab === "wishlist" && (
          <div className="flex flex-col gap-4">
            {wishlistItems.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 bg-surface-100 rounded-3xl border border-dashed border-border-default text-center">
                <svg className="w-12 h-12 text-text-tertiary stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <p className="font-display font-semibold text-sm text-text-secondary">Votre liste de souhaits est vide.</p>
                <p className="font-body text-xs text-text-tertiary">Ajoutez des produits à votre liste en cliquant sur le cœur ❤️.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {wishlistItems.map(productId => (
                  <div key={productId} className="bg-white border border-border-default rounded-2xl p-4 flex flex-col gap-2 items-center text-center">
                    <div className="w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400 fill-current" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <p className="font-body text-xs text-text-tertiary break-all">{productId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </Container>
    </Section>
  );
}
