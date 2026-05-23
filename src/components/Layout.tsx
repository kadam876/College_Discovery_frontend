import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCompare } from "../contexts/CompareContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const { colleges, toast, clearToast } = useCompare();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-indigo-300">
            College Discovery
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Explore
            </NavLink>
            <NavLink to="/compare" className={navClass}>
              Compare ({colleges.length}/3)
            </NavLink>
            <NavLink to="/predictor" className={navClass}>
              Predictor
            </NavLink>
            {user ? (
              <>
                <NavLink to="/shortlist" className={navClass}>
                  Shortlist
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="ml-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/auth" className={navClass}>
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      {toast && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100">
            <span>{toast}</span>
            <button type="button" onClick={clearToast} className="text-sm underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
