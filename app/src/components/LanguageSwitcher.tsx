import { useEffect, useRef, useState } from "react";
import { LOCALES, useI18n } from "../i18n";
import { Ic, P } from "./icons";

/** Globe + current code; opens a menu of full language names. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="lang-wrap" ref={wrapRef}>
      <button
        className="lang"
        aria-label={t("common.language")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Ic d={P.globe} size={15} sw={1.5} />
        {locale.toUpperCase()}
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={l.code === locale}
              aria-current={l.code === locale}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
            >
              <span className="code">{l.code.toUpperCase()}</span>
              {l.label}
              {l.code === locale && (
                <span style={{ marginLeft: "auto", color: "var(--brand)" }}>
                  <Ic d={P.check} size={16} sw={2.4} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
