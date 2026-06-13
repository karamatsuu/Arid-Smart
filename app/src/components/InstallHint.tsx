import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { Ic, P } from "./icons";

const DISMISS_KEY = "aridsmart:installDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

/**
 * PWA install hint (spec §0.4): dismissible bottom banner, never a modal.
 * Appears only when the browser fires beforeinstallprompt.
 */
export function InstallHint() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDeferred(null);
  };

  return (
    <div className="banner-install">
      <Ic d={P.download} size={20} sw={2} style={{ flex: "none" }} />
      <span style={{ flex: 1 }}>{t("install.text")}</span>
      <button
        className="btn sm"
        style={{ background: "#fff", color: "var(--brand)", borderRadius: 9 }}
        onClick={() => {
          void deferred.prompt();
          dismiss();
        }}
      >
        {t("install.install")}
      </button>
      <button
        className="btn sm"
        style={{ color: "#cfe2ea", padding: "0 8px" }}
        onClick={dismiss}
      >
        {t("install.later")}
      </button>
    </div>
  );
}
