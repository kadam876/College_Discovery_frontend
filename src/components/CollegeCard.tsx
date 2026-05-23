import { Link } from "react-router-dom";
import type { College, Review, ReviewsResponse } from "../types";
import { formatCurrency, formatFees } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { useCompare } from "../contexts/CompareContext";
import { api } from "../api/client";
import { useState } from "react";

interface Props {
  college: College;
  shortlisted?: boolean;
  onShortlistChange?: () => void;
}

// ── Star helpers ──────────────────────────────────────────────────────────────
function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "text-amber-400" : "text-slate-600"}>
          ★
        </span>
      ))}
    </span>
  );
}

function InteractiveStar({
  index,
  hovered,
  selected,
  onHover,
  onClick,
}: {
  index: number;
  hovered: number;
  selected: number;
  onHover: (i: number) => void;
  onClick: (i: number) => void;
}) {
  const active = index <= (hovered || selected);
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(0)}
      onClick={() => onClick(index)}
      className={`text-2xl transition-transform hover:scale-125 ${
        active ? "text-amber-400" : "text-slate-600"
      }`}
      aria-label={`Rate ${index} out of 5`}
    >
      ★
    </button>
  );
}

// ── Category badge colours ─────────────────────────────────────────────────────
const CATEGORY_COLOURS: Record<string, string> = {
  OPEN: "bg-slate-700 text-slate-200",
  OBC:  "bg-green-900/60 text-green-300",
  EBC:  "bg-green-900/60 text-green-300",
  SC:   "bg-blue-900/60 text-blue-300",
  ST:   "bg-purple-900/60 text-purple-300",
  TFWS: "bg-amber-900/60 text-amber-300",
};

// ── Main Component ─────────────────────────────────────────────────────────────
export function CollegeCard({ college, shortlisted, onShortlistChange }: Props) {
  const { user } = useAuth();
  const { addCollege } = useCompare();
  const [saving, setSaving] = useState(false);

  // Reviews state
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);

  // New review form state
  const [newRating, setNewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Shortlist ──────────────────────────────────────────────────────────────
  async function toggleShortlist() {
    if (!user) return;
    setSaving(true);
    try {
      if (shortlisted) {
        await api.delete(`/shortlist/${college.id}`);
      } else {
        await api.post("/shortlist", { collegeId: college.id });
      }
      onShortlistChange?.();
    } finally {
      setSaving(false);
    }
  }

  // ── Reviews fetch ──────────────────────────────────────────────────────────
  async function handleToggleReviews() {
    if (!showReviews && !reviewsFetched) {
      setReviewsLoading(true);
      try {
        const res = await api.get<ReviewsResponse>(`/colleges/${college.id}/reviews`);
        setReviews(res.data.reviews);
        setReviewsFetched(true);
      } finally {
        setReviewsLoading(false);
      }
    }
    setShowReviews((v) => !v);
  }

  // ── Review submit ──────────────────────────────────────────────────────────
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newRating) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/colleges/${college.id}/reviews`, {
        rating: newRating,
        comment: newComment,
      });
      // Re-fetch to reflect the upserted review
      const res = await api.get<ReviewsResponse>(`/colleges/${college.id}/reviews`);
      setReviews(res.data.reviews);
      setNewComment("");
      setNewRating(0);
    } catch {
      setSubmitError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Fee display ────────────────────────────────────────────────────────────
  const displayFee = college.calculatedFee ?? college.feesPerYear;
  const category = college.appliedCategory ?? "OPEN";
  const categoryColour = CATEGORY_COLOURS[category] ?? CATEGORY_COLOURS.OPEN;

  // ── Rating display ─────────────────────────────────────────────────────────
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : college.rating;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20 transition hover:border-indigo-500/40 hover:shadow-indigo-900/20">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white leading-snug">{college.name}</h3>
          <p className="text-sm text-slate-400">{college.location}</p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-200">
          ★ {college.rating.toFixed(1)}
        </span>
      </div>

      {/* ── Stats ── */}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Fees / year</dt>
          <dd className="font-medium text-white">{formatFees(displayFee)}</dd>
          <dd className="mt-0.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColour}`}>
              {category} seat
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Avg placement</dt>
          <dd className="font-medium">{formatCurrency(college.averagePlacement)}</dd>
        </div>
      </dl>

      {/* ── Action buttons ── */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addCollege(college)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          Add to compare
        </button>
        {user && (
          <button
            type="button"
            disabled={saving}
            onClick={toggleShortlist}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {shortlisted ? "Remove shortlist" : "Shortlist"}
          </button>
        )}
        <Link
          to="/compare"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
        >
          View compare
        </Link>
      </div>

      {/* ── Reviews toggle ── */}
      <button
        type="button"
        onClick={handleToggleReviews}
        className="mt-4 flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        <span className="text-amber-400">★</span>
        <span>
          {reviewsFetched
            ? `${reviews.length} student review${reviews.length !== 1 ? "s" : ""}`
            : "Show student reviews"}
        </span>
        <span className="ml-auto text-slate-500 text-xs">{showReviews ? "▲" : "▼"}</span>
      </button>

      {/* ── Reviews panel ── */}
      {showReviews && (
        <div className="mt-3 space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">

          {reviewsLoading && (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-700/50" />
              ))}
            </div>
          )}

          {!reviewsLoading && reviews.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              No reviews yet. Be the first to review!
            </p>
          )}

          {!reviewsLoading && reviews.length > 0 && (
            <div className="space-y-3">
              {/* Average rating header */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-700/50">
                <span className="text-3xl font-bold text-amber-400">{avgRating.toFixed(1)}</span>
                <div>
                  <StarRating value={Math.round(avgRating)} />
                  <p className="text-xs text-slate-500 mt-0.5">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/40 text-xs font-bold text-indigo-300">
                        {(review.user.name ?? review.user.email)[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-200">
                        {review.user.name ?? review.user.email.split("@")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} />
                      <span className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Write a review form ── */}
          {user ? (
            <form
              onSubmit={handleSubmitReview}
              className="mt-3 space-y-3 border-t border-slate-700/50 pt-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Write a review
              </p>

              {/* Star picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <InteractiveStar
                    key={i}
                    index={i}
                    hovered={hoveredStar}
                    selected={newRating}
                    onHover={setHoveredStar}
                    onClick={setNewRating}
                  />
                ))}
                <span className="ml-2 text-xs text-slate-500">
                  {newRating ? `${newRating} / 5` : "Tap to rate"}
                </span>
              </div>

              <textarea
                required
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience at this college…"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
              />

              {submitError && (
                <p className="text-xs text-rose-400">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="mt-3 border-t border-slate-700/50 pt-3 text-center text-xs text-slate-500">
              <Link to="/auth" className="text-indigo-400 hover:underline">
                Sign in
              </Link>{" "}
              to write a review
            </p>
          )}
        </div>
      )}
    </article>
  );
}
