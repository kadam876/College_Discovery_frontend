import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { CollegeCard } from "../components/CollegeCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useDebounce } from "../hooks/useDebounce";
import type { College, CollegesResponse } from "../types";

const CATEGORIES = [
  { value: "OPEN", label: "OPEN (General)" },
  { value: "OBC",  label: "OBC / EBC (50% waiver)" },
  { value: "EBC",  label: "EBC (50% waiver)" },
  { value: "SC",   label: "SC (Dev. fees only)" },
  { value: "ST",   label: "ST (Dev. fees only)" },
  { value: "TFWS", label: "TFWS (Tuition waiver)" },
];

export function ListingPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CollegesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CollegesResponse>("/colleges", {
        params: {
          search: debouncedSearch || undefined,
          location: location || undefined,
          maxFee: maxFee || undefined,
          category,
          page,
          limit: 12,
        },
      });
      setData(res.data);
    } catch {
      setError("Failed to load colleges. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, location, maxFee, category, page]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, location, maxFee, category]);

  function resetFilters() {
    setSearch("");
    setLocation("");
    setMaxFee("");
    setCategory("OPEN");
    setPage(1);
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Discover Engineering Colleges</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Filter by location, fee budget, and your reservation category — fees are calculated
          automatically based on your selected seat quota.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
        <input
          type="text"
          placeholder="Location filter"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
        <input
          type="number"
          placeholder="Max fee per year (₹)"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </p>
      )}

      {loading && <LoadingSkeleton />}

      {!loading && data && data.colleges.length === 0 && (
        <EmptyState
          title="No colleges match your filters"
          description="Try broadening your search, removing the fee cap, or picking a different location."
          onReset={resetFilters}
        />
      )}

      {!loading && data && data.colleges.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.colleges.map((college: College) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Page {data.meta.currentPage} of {data.meta.totalPages} · {data.meta.totalCount}{" "}
              colleges
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
