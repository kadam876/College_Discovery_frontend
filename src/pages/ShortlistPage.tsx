import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { CollegeCard } from "../components/CollegeCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useAuth } from "../contexts/AuthContext";
import type { College } from "../types";

export function ShortlistPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<{ id: number; college: College }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ shortlist: { id: number; college: College }[] }>("/shortlist");
      setItems(res.data.shortlist);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) load();
  }, [user, authLoading, navigate, load]);

  if (authLoading || !user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold">Your Shortlist</h1>
      <p className="mt-2 text-slate-400">Signed in as {user.email}</p>

      {loading && <div className="mt-6"><LoadingSkeleton /></div>}

      {!loading && items.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No shortlisted colleges yet"
            description="Browse colleges and tap Shortlist while signed in."
          />
          <div className="mt-4 text-center">
            <Link to="/" className="text-indigo-300 hover:underline">
              Explore colleges
            </Link>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((entry) => (
            <CollegeCard
              key={entry.id}
              college={entry.college}
              shortlisted
              onShortlistChange={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
