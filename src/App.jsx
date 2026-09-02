import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Privacy } from "./pages/Privacy.jsx";
import { Terms } from "./pages/Terms.jsx";

const Admin = lazy(() => import("./pages/Admin.jsx").then((m) => ({ default: m.Admin })));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/politica-confidentialitate" element={<Privacy />} />
      <Route path="/termeni-conditii" element={<Terms />} />
      <Route path="/admin" element={<Suspense fallback={<p className="muted" style={{ padding: "2rem" }}>Se încarcă…</p>}><Admin /></Suspense>} />
      <Route path="/politica-confidentialitate.html" element={<Navigate to="/politica-confidentialitate" replace />} />
      <Route path="/termeni-conditii.html" element={<Navigate to="/termeni-conditii" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
