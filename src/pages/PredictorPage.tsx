import { FormEvent, useState } from "react";
import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import type { PredictResponse, PredictResult, PredictStatus } from "../types";

const STATUS_STYLES: Record<PredictStatus, { label: string; className: string; dot: string }> = {
  SAFE:   { label: "Safe Pick",   className: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40", dot: "bg-emerald-400" },
  TARGET: { label: "Target",      className: "bg-sky-500/20 text-sky-200 border-sky-500/40",             dot: "bg-sky-400" },
  REACH:  { label: "Reach",       className: "bg-rose-500/20 text-rose-200 border-rose-500/40",          dot: "bg-rose-400" },
};

const BRANCHES = [
  "Computer Science Engineering",
  "Information Technology",
];

const CATEGORIES = [
  { value: "OPEN",  label: "OPEN (General)" },
  { value: "OBC",   label: "OBC (50% waiver)" },
  { value: "EBC",   label: "EBC (50% waiver)" },
  { value: "SC",    label: "SC (100% waiver)" },
  { value: "ST",    label: "ST (100% waiver)" },
  { value: "TFWS",  label: "TFWS (Fee waiver)" },
];

export function PredictorPage() {
  const [examType, setExamType] = useState("MHT-CET");
  const [rank, setRank] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [category, setCategory] = useState("OPEN");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<PredictResponse>("/predict", {
        examType,
        rank: Number.parseInt(rank, 10),
        branch,
        category,
      });
      setResult(res.data);
    } catch {
      setError("Could not run prediction. Check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Smart Admission Predictor</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Enter your exam rank and reservation category to see which colleges and branches you
          can safely target — filtered against real Maharashtra CAP round cutoffs.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-2xl gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Exam type */}
          <label className="grid gap-1 text-sm">
            <span className="text-slate-400">Exam type</span>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="MHT-CET">MHT-CET</option>
              <option value="JEE">JEE</option>
            </select>
          </label>

          {/* Reservation category */}
          <label className="grid gap-1 text-sm">
            <span className="text-slate-400">Reservation category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Rank */}
          <label className="grid gap-1 text-sm">
            <span className="text-slate-400">Your rank</span>
            <input
              type="number"
              required
              min={1}
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="e.g. 8000"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>

          {/* Branch */}
          <label className="grid gap-1 text-sm">
            <span className="text-slate-400">Branch</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Predict matches"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </p>
      )}

      {result && result.results.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No cutoff matches found"
            description={`No cutoffs found for ${result.examType} · ${result.branch} · ${result.category} category. Try a different category or exam type.`}
          />
        </div>
      )}

      {result && result.results.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span>
              {result.meta.totalMatches} institutions for{" "}
              <strong className="text-slate-200">{result.examType}</strong> ·{" "}
              <strong className="text-slate-200">{result.branch}</strong>
            </span>
            <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-200">
              {result.category} category · Rank {result.rank.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            {(Object.entries(STATUS_STYLES) as [PredictStatus, typeof STATUS_STYLES[PredictStatus]][]).map(
              ([key, s]) => (
                <span key={key} className="flex items-center gap-1.5 text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              )
            )}
          </div>

          {result.results.map((item: PredictResult) => {
            const style = STATUS_STYLES[item.status];
            return (
              <div
                key={item.college.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-4"
              >
                <div>
                  <h3 className="font-semibold">{item.college.name}</h3>
                  <p className="text-sm text-slate-400">
                    {item.college.location} · {item.category} cutoff:{" "}
                    <strong className="text-slate-200">
                      {item.closingRank.toLocaleString("en-IN")}
                    </strong>
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style.className}`}
                >
                  <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
