import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { College } from "../types";

interface CompareContextValue {
  colleges: College[];
  addCollege: (college: College) => boolean;
  removeCollege: (id: number) => void;
  clearColleges: () => void;
  toast: string | null;
  clearToast: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const addCollege = useCallback((college: College) => {
    if (colleges.some((c) => c.id === college.id)) return true;

    if (colleges.length >= MAX_COMPARE) {
      setToast("You can compare up to 3 colleges at a time.");
      return false;
    }

    setColleges((prev) => [...prev, college]);
    return true;
  }, [colleges]);

  const removeCollege = useCallback((id: number) => {
    setColleges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearColleges = useCallback(() => setColleges([]), []);
  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ colleges, addCollege, removeCollege, clearColleges, toast, clearToast }),
    [colleges, addCollege, removeCollege, clearColleges, toast, clearToast]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
