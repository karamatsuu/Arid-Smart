import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

// Self-hosted fonts (spec: no CDN fonts). Noto Sans covers Karakalpak
// Latin-Ext (Á Ǵ Í Ń Ó Ú ı) + Cyrillic for Russian; Space Grotesk = numerals.
import "@fontsource/noto-sans/latin-400.css";
import "@fontsource/noto-sans/latin-600.css";
import "@fontsource/noto-sans/latin-700.css";
import "@fontsource/noto-sans/latin-ext-400.css";
import "@fontsource/noto-sans/latin-ext-600.css";
import "@fontsource/noto-sans/latin-ext-700.css";
import "@fontsource/noto-sans/cyrillic-400.css";
import "@fontsource/noto-sans/cyrillic-600.css";
import "@fontsource/noto-sans/cyrillic-700.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";

import "./styles/tokens.css";
import "./styles/base.css";

import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initConnectivityWatch } from "./api/client";
import { getStoredLocale } from "./i18n";

document.documentElement.lang = getStoredLocale();
initConnectivityWatch();
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
