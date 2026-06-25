"use client";

import * as React from "react";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

interface PhoneVerificationProps {
  currentPhone?: string;
  onVerified: (phone: string) => void;
  locale?: string;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
  }
}

export function PhoneVerification({ currentPhone, onVerified, locale = "fr" }: PhoneVerificationProps) {
  const [step, setStep] = React.useState<"idle" | "sending" | "verifying" | "done">("idle");
  const [phone, setPhone] = React.useState(currentPhone || "");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = React.useRef<HTMLDivElement>(null);

  // Countdown timer for resend
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const setupRecaptcha = () => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          window.recaptchaVerifier = undefined;
        },
      });
    }
    return window.recaptchaVerifier;
  };


  const formatPhone = (raw: string) => {
    const stripped = raw.replace(/\s+/g, "").replace(/^00/, "+").replace(/^0/, "+216");
    if (!stripped.startsWith("+")) return `+216${stripped}`;
    return stripped;
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);

    const formatted = formatPhone(phone);
    if (formatted.length < 8) {
      setError(locale === "ar" ? "أدخل رقم هاتف صحيح" : "Numéro de téléphone invalide.");
      setLoading(false);
      return;
    }

    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth!, formatted, verifier);
      setConfirmationResult(result);

      setStep("verifying");
      setCountdown(60);
    } catch (err: any) {
      const msg: string = err?.code || err?.message || "";
      if (msg.includes("invalid-phone-number")) {
        setError(locale === "ar" ? "رقم الهاتف غير صالح" : "Numéro de téléphone invalide.");
      } else if (msg.includes("too-many-requests")) {
        setError(locale === "ar" ? "كثير من المحاولات. حاول لاحقاً." : "Trop de tentatives. Réessayez plus tard.");
      } else {
        setError(locale === "ar" ? "خطأ في إرسال الرمز" : "Erreur lors de l'envoi du code SMS.");
      }
      window.recaptchaVerifier = undefined;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || otp.length < 6) return;
    setError("");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setStep("done");
      onVerified(formatPhone(phone));
    } catch (err: any) {
      const msg: string = err?.code || "";
      if (msg.includes("invalid-verification-code")) {
        setError(locale === "ar" ? "الرمز غير صحيح" : "Code de vérification incorrect.");
      } else if (msg.includes("code-expired")) {
        setError(locale === "ar" ? "انتهت صلاحية الرمز" : "Code expiré. Renvoyez un nouveau SMS.");
        setStep("idle");
      } else {
        setError(locale === "ar" ? "خطأ في التحقق" : "Erreur de vérification.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-text-tertiary select-none">🇹🇳</span>
        <input
          type="tel"
          value={phone}
          onChange={e => {
            const val = e.target.value;
            setPhone(val);
            onVerified(val);
          }}
          placeholder="Ex: 50 123 456"
          className="w-full pl-9 pr-4 py-3 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="font-display font-semibold text-xs text-green-700">
          {locale === "ar" ? "تم التحقق من الهاتف ✓" : "Téléphone vérifié ✓"}
        </span>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-3">
      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} />

      {step === "idle" && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-text-tertiary select-none">🇹🇳</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ex: 50 123 456"
                className="w-full pl-9 pr-4 py-3 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || !phone}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-display font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 16 19.79 19.79 0 0 1 1.95 7.37 2 2 0 0 1 3.92 5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 12.91a16 16 0 0 0 5.61 5.25l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              )}
              {locale === "ar" ? "إرسال رمز" : "Envoyer SMS"}
            </button>
          </div>
          <p className="font-body text-[10px] text-text-tertiary">
            {locale === "ar"
              ? "سيُرسَل رمز التحقق عبر SMS إلى هاتفك."
              : "Un code de vérification sera envoyé par SMS."}
          </p>
        </>
      )}

      {step === "verifying" && (
        <>
          <p className="font-body text-xs text-text-secondary">
            {locale === "ar"
              ? `أُرسل رمز SMS إلى ${formatPhone(phone)}`
              : `Un SMS a été envoyé au ${formatPhone(phone)}`}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="_ _ _ _ _ _"
              className="flex-1 px-4 py-3 bg-surface-50 border border-border-default rounded-xl font-display font-bold text-lg text-center tracking-[0.4em] text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-display font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {locale === "ar" ? "تحقق" : "Vérifier"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep("idle"); setOtp(""); setError(""); window.recaptchaVerifier = undefined; }}
              className="font-display font-semibold text-[10px] text-text-tertiary hover:text-text-secondary underline"
            >
              {locale === "ar" ? "تغيير الرقم" : "Changer le numéro"}
            </button>
            {countdown > 0 ? (
              <span className="font-body text-[10px] text-text-tertiary">
                {locale === "ar" ? `إعادة الإرسال في ${countdown}ث` : `Renvoyer dans ${countdown}s`}
              </span>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="font-display font-semibold text-[10px] text-primary-500 hover:text-primary-600 underline"
              >
                {locale === "ar" ? "إعادة إرسال الرمز" : "Renvoyer le code"}
              </button>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-body text-xs">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
