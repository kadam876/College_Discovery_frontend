import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { useCompare } from "../contexts/CompareContext";
import type { College } from "../types";
import { formatCurrency, formatFees } from "../utils/format";

export function ComparePage() {
  const { colleges, removeCollege, clearColleges } = useCompare();
  const [fetched, setFetched] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (colleges.length === 0) {
      setFetched([]);
      return;
    }

    setLoading(true);
    const ids = colleges.map((c) => c.id).join(",");
    api
      .get<{ colleges: College[] }>("/colleges/compare", { params: { ids } })
      .then((res) => setFetched(res.data.colleges))
      .catch(() => setFetched(colleges))
      .finally(() => setLoading(false));
  }, [colleges]);

  if (colleges.length === 0) {
    return (
      <EmptyState
        title="No colleges selected for comparison"
        description="Add up to 3 colleges from the explore page to build your decision matrix."
      />
    );
  }

  const rows = [
    { label: "Location", key: (c: College) => c.location },
    { label: "Fees / year", key: (c: College) => formatFees(c.feesPerYear) },
    {
      label: "Avg placement",
      key: (c: College) => formatCurrency(c.averagePlacement),
    },
    {
      label: "Highest placement",
      key: (c: College) => formatCurrency(c.highestPlacement),
    },
    { label: "Rating", key: (c: College) => c.rating.toFixed(1) },
  ];

  const display = fetched.length > 0 ? fetched : colleges;
  const maxFees = Math.max(...display.map((c) => c.feesPerYear));
  const maxAvg = Math.max(...display.map((c) => c.averagePlacement));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Comparison Board</h1>
          <p className="mt-1 text-slate-400">Side-by-side fees vs. placement returns</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearColleges}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Clear all
          </button>
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
          >
            Add more
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Refreshing comparison data…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-slate-400">Metric</th>
                {display.map((college) => (
                  <th key={college.id} className="px-4 py-3 font-semibold text-white">
                    <div className="flex items-start justify-between gap-2">
                      <span>{college.name}</span>
                      <button
                        type="button"
                        onClick={() => removeCollege(college.id)}
                        className="text-xs text-slate-500 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-400">{row.label}</td>
                  {display.map((college) => {
                    const value = row.key(college);
                    const highlightFees =
                      row.label === "Fees / year" && college.feesPerYear === maxFees;
                    const highlightPlacement =
                      row.label === "Avg placement" &&
                      college.averagePlacement === maxAvg &&
                      maxAvg > 0;
                    return (
                      <td
                        key={college.id}
                        className={`px-4 py-3 ${
                          highlightFees
                            ? "bg-amber-500/10 text-amber-100"
                            : highlightPlacement
                              ? "bg-emerald-500/10 text-emerald-100"
                              : ""
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
