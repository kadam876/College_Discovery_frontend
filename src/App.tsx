import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { CompareProvider } from "./contexts/CompareContext";
import { AuthPage } from "./pages/AuthPage";
import { ComparePage } from "./pages/ComparePage";
import { ListingPage } from "./pages/ListingPage";
import { PredictorPage } from "./pages/PredictorPage";
import { ShortlistPage } from "./pages/ShortlistPage";

export default function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<ListingPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="predictor" element={<PredictorPage />} />
              <Route path="shortlist" element={<ShortlistPage />} />
              <Route path="auth" element={<AuthPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CompareProvider>
    </AuthProvider>
  );
}
