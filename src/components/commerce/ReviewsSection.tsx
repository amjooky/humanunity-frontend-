"use client";

import * as React from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-distribution.onrender.com";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  title?: string;
  body: string;
  created_at: string;
}

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

function StarRating({ value, interactive = false, onChange }: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = React.useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          disabled={!interactive}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={(hover || value) >= star ? "#D4A84F" : "none"}
            stroke={(hover || value) >= star ? "#D4A84F" : "#D4CAB8"}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    authorName: "",
    rating: 5,
    title: "",
    body: "",
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  React.useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    fetch(`${BACKEND_URL}/api/reviews?productId=${productId}&limit=20`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setReviews(res.data || []);
          setTotal(res.meta?.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.body.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: formData.authorName,
          rating: formData.rating,
          title: formData.title || undefined,
          body: formData.body,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [data.data, ...prev]);
        setTotal((prev) => prev + 1);
        setSubmitSuccess(true);
        setShowForm(false);
        setFormData({ authorName: "", rating: 5, title: "", body: "" });
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border-default pt-16 mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary tracking-tight">
            Avis Clients
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating value={Math.round(avgRating)} />
              <span className="font-display font-semibold text-sm text-text-primary">
                {avgRating.toFixed(1)}
              </span>
              <span className="font-body text-xs text-text-secondary">
                ({total} avis)
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-display font-semibold text-xs rounded-full hover:bg-primary-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Écrire un avis
        </button>
      </div>

      {/* Success banner */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-body text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Merci ! Votre avis a été publié avec succès.
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="mb-8 bg-surface-100 border border-border-default rounded-3xl p-6 animate-fadeIn">
          <h3 className="font-display font-bold text-sm text-text-primary mb-5">
            Votre avis sur : <span className="text-primary-500">{productName}</span>
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Rating picker */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                Note *
              </label>
              <StarRating
                value={formData.rating}
                interactive
                onChange={(v) => setFormData({ ...formData, rating: v })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Votre Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Ex: Ahmed B."
                  className="px-4 py-3 bg-white border border-border-default rounded-xl font-body text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Titre (Optionnel)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Excellent produit !"
                  className="px-4 py-3 bg-white border border-border-default rounded-xl font-body text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display font-semibold text-xs uppercase tracking-wider text-text-secondary">
                Votre Avis *
              </label>
              <textarea
                required
                rows={4}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Partagez votre expérience avec ce produit..."
                className="px-4 py-3 bg-white border border-border-default rounded-xl font-body text-sm focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-border-default rounded-full font-display font-semibold text-xs text-text-secondary hover:border-border-hover transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-display font-semibold text-xs hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Publication..." : "Publier l'avis"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-body text-xs text-text-secondary">Chargement des avis...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 bg-surface-100 rounded-3xl border border-dashed border-border-default text-center">
          <svg className="w-10 h-10 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="font-display font-semibold text-sm text-text-secondary">
            Soyez le premier à donner votre avis !
          </p>
          <p className="font-body text-xs text-text-tertiary max-w-xs">
            Partagez votre expérience et aidez d'autres clients à faire le bon choix.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-border-default rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-text-primary block">
                      {review.author_name}
                    </span>
                    <span className="font-body text-[10px] text-text-tertiary">
                      {new Date(review.created_at).toLocaleDateString("fr-TN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <StarRating value={review.rating} />
              </div>
              {review.title && (
                <p className="font-display font-semibold text-sm text-text-primary">
                  {review.title}
                </p>
              )}
              <p className="font-body text-sm text-text-secondary leading-relaxed">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
