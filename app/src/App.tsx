import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { InstallHint, OfflineBanner, TabBar, ToastProvider } from "./components";
import { I18nProvider } from "./i18n";
import { isOnboarded } from "./lib/firstRun";
import { Fields } from "./pages/Fields";
import { FieldReport } from "./pages/FieldReport";
import { FieldWizard } from "./pages/FieldWizard";
import { Home } from "./pages/Home";
import { Messages } from "./pages/Messages";
import { Onboarding } from "./pages/Onboarding";
import { SalinityDetail } from "./pages/SalinityDetail";
import { Settings } from "./pages/Settings";
import { Chat } from "./pages/Chat";
import { Styleguide } from "./pages/Styleguide";

/** First-launch gate: evaluated on every route render, not once per app. */
function HomeGate() {
  return isOnboarded() ? <Home /> : <Navigate to="/onboarding" replace />;
}

/** Layout for the 4 top-level tabs: offline banner, page, tab bar. */
function TabLayout() {
  return (
    <div className="app">
      <OfflineBanner />
      <Outlet />
      <TabBar />
      <InstallHint />
    </div>
  );
}

/** Layout for sub-pages (report, salinity, wizard): back arrow, no tabs. */
function SubLayout() {
  return (
    <div className="app">
      <OfflineBanner />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route element={<TabLayout />}>
              {/* Page 1 — Home; onboarding gate on first launch (Part 1) */}
              <Route path="/" element={<HomeGate />} />
              {/* Page 2 — Fields map+list (Part 2) */}
              <Route path="/fields" element={<Fields />} />
              {/* Page 6 — Messages (Part 5) */}
              <Route path="/messages" element={<Messages />} />
              {/* Page 7 — Settings (Part 5) */}
              <Route path="/settings" element={<Settings />} />
              {/* Maslahatchi — AI chat assistant */}
              <Route path="/chat" element={<Chat />} />
            </Route>

            <Route element={<SubLayout />}>
              {/* Page 0 — Onboarding (Part 1) */}
              <Route path="/onboarding" element={<Onboarding />} />
              {/* Page 3 — Add/Edit wizard (Part 3) */}
              <Route path="/fields/new" element={<FieldWizard />} />
              <Route path="/fields/:id/edit" element={<FieldWizard />} />
              {/* Page 5 — Salinity detail (Part 5) */}
              <Route path="/fields/:id/salinity" element={<SalinityDetail />} />
              {/* Page 4 — Field report (Part 4) */}
              <Route path="/fields/:id" element={<FieldReport />} />
              {/* Part 0 verification surface */}
              <Route path="/styleguide" element={<Styleguide />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  );
}
