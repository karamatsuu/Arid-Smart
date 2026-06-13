import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ic, P } from "../components";
import { LOCALES, useI18n } from "../i18n";
import { setOnboarded } from "../lib/firstRun";

/* --- intro illustrations: lightweight 2-color line art (no photos) --- */

const ILLO = {
  width: "100%",
  maxWidth: 260,
  height: "auto",
  margin: "0 auto",
} as const;

const illoProps = {
  viewBox: "0 0 240 170",
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: ILLO,
  "aria-hidden": true,
} as const;

/** 0b — draw your field on the map */
function IlloDraw() {
  return (
    <svg {...illoProps}>
      <rect x="20" y="18" width="200" height="134" rx="14" stroke="var(--brand)" strokeWidth="3" />
      <path d="M20 62c34 8 58-18 92-10M64 152c4-36-16-52-44-56M152 152c-6-28 12-44 68-40" stroke="var(--brand)" strokeWidth="2" opacity=".35" />
      <path d="M96 58l68 14 14 44-54 22-40-30 12-50" stroke="var(--accent)" strokeWidth="3" strokeDasharray="7 6" />
      {[
        [96, 58],
        [164, 72],
        [178, 116],
        [124, 138],
        [84, 108],
      ].map(([cx, cy]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="6" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3" />
      ))}
      <path d="M124 88s-12-11-12-19a12 12 0 0 1 24 0c0 8-12 19-12 19" stroke="var(--brand)" strokeWidth="3" />
    </svg>
  );
}

/** 0c — satellite + weather → irrigation calculation */
function IlloCalc() {
  return (
    <svg {...illoProps}>
      <rect x="100" y="22" width="40" height="26" rx="6" stroke="var(--brand)" strokeWidth="3" />
      <rect x="62" y="26" width="30" height="18" rx="4" stroke="var(--brand)" strokeWidth="3" />
      <rect x="148" y="26" width="30" height="18" rx="4" stroke="var(--brand)" strokeWidth="3" />
      <path d="M92 35h8m40 0h8" stroke="var(--brand)" strokeWidth="3" />
      <circle cx="48" cy="78" r="13" stroke="var(--accent)" strokeWidth="3" />
      <path d="M48 58v-6m0 52v-6m-20-26h-6m52 0h-6m-6-14 4-4m-48 36 4-4m44 4-4-4m-36-32-4-4" stroke="var(--accent)" strokeWidth="3" />
      <path d="M120 56v18m0 0-8-8m8 8 8-8" stroke="var(--brand)" strokeWidth="3" opacity=".55" />
      <path d="M120 86c10 12.5 18.5 22.5 18.5 33a18.5 18.5 0 1 1-37 0c0-10.5 8.5-20.5 18.5-33" stroke="var(--accent)" strokeWidth="3.5" />
      <path d="M178 96c8 0 14 6 14 13s-6 13-14 13m0-26c-8 0-14 6-14 13s6 13 14 13" stroke="var(--brand)" strokeWidth="3" opacity=".4" />
      <path d="M30 150h180" stroke="var(--brand)" strokeWidth="3" />
      <path d="M48 150v-8m24 8v-12m24 12v-8m96 8v-10" stroke="var(--brand)" strokeWidth="3" opacity=".5" />
    </svg>
  );
}

/** 0d — the farmer gets the advice by SMS */
function IlloSms() {
  return (
    <svg {...illoProps}>
      <rect x="88" y="34" width="64" height="112" rx="12" stroke="var(--brand)" strokeWidth="3.5" />
      <path d="M108 44h24m-14 92h4" stroke="var(--brand)" strokeWidth="3" />
      <rect x="100" y="60" width="68" height="44" rx="10" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3" />
      <path d="M112 116v-12h12" stroke="var(--accent)" strokeWidth="3" fill="var(--surface)" />
      <path d="M118 71c4.5 5.5 8 9.5 8 14a8 8 0 1 1-16 0c0-4.5 3.5-8.5 8-14" stroke="var(--accent)" strokeWidth="2.8" />
      <path d="M136 78h22m-22 10h16" stroke="var(--brand)" strokeWidth="3" opacity=".55" />
      <path d="M56 64a36 36 0 0 1 0-40m12 32a22 22 0 0 1 0-24" stroke="var(--brand)" strokeWidth="3" opacity=".5" />
      <path d="M184 64a36 36 0 0 0 0-40m-12 32a22 22 0 0 0 0-24" stroke="var(--brand)" strokeWidth="3" opacity=".5" />
    </svg>
  );
}

const SLIDES = [
  { key: "s1", Illo: IlloDraw },
  { key: "s2", Illo: IlloCalc },
  { key: "s3", Illo: IlloSms },
] as const;

/**
 * Page 0 — first launch only (spec Part 1): language pick (0a), then three
 * swipeable, skippable intro cards (0b–0d). Fully offline, no data loaded.
 */
export function Onboarding() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<"lang" | "intro">("lang");
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const finish = (to: string) => {
    setOnboarded();
    navigate(to, { replace: true });
  };

  if (step === "lang") {
    return (
      <div className="scr">
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 24px",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "var(--brand)",
                color: "#7fc7da",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ic d={P.drop} size={34} sw={2} />
            </span>
            <div style={{ font: "700 26px var(--font-num)", color: "var(--brand)" }}>
              {t("app.name")}
            </div>
            <div
              style={{
                fontSize: 15,
                color: "var(--ink-2)",
                textAlign: "center",
                whiteSpace: "pre-line",
              }}
            >
              {t("onb.chooseLang")}
            </div>
          </div>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              className="onb-lang"
              aria-pressed={l.code === locale}
              onClick={() => {
                setLocale(l.code);
                setStep("intro");
              }}
            >
              {l.label}
              {l.code === locale && (
                <Ic d={P.check} size={20} sw={2.6} color="var(--brand)" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const last = idx === SLIDES.length - 1;
  return (
    <div className="scr">
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px 0" }}>
        <button
          className="btn ghost"
          style={{ minHeight: 48, color: "var(--ink-3)", fontWeight: 700, fontSize: 14.5 }}
          onClick={() => finish("/")}
        >
          {t("onb.skip")}
        </button>
      </div>
      <div
        className="onb-track"
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIdx(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {SLIDES.map(({ key, Illo }) => (
          <section className="onb-slide" key={key}>
            <Illo />
            <div>
              <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, lineHeight: 1.35 }}>
                {t(`onb.${key}.title`)}
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: 15.5, color: "var(--ink-2)" }}>
                {t(`onb.${key}.body`)}
              </p>
            </div>
          </section>
        ))}
      </div>
      <div
        style={{
          padding: "0 24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div className="dots" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <i key={s.key} className={i === idx ? "on" : ""} />
          ))}
        </div>
        <button
          className="btn pri"
          style={{ visibility: last ? "visible" : "hidden" }}
          tabIndex={last ? 0 : -1}
          onClick={() => finish("/fields/new")}
        >
          {t("onb.addFirst")}
        </button>
      </div>
    </div>
  );
}
