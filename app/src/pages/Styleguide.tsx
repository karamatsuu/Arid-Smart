// Dev-only verification surface for Part 0 (/styleguide, not linked from
// tabs): assembles every shared component with sample data so the
// acceptance checklist can be checked visually. Sample field names and SMS
// bodies are real kaa content (spec: test with real kaa text).

import { useState } from "react";
import {
  AppBar,
  BottomSheet,
  ConfirmDialog,
  CropBadge,
  DepletionGauge,
  FieldCard,
  RecommendationHero,
  SalinityScale,
  Skeleton,
  SkeletonCard,
  SmsBubble,
  Sparkline,
  StatusPill,
  WeatherStrip,
  useToast,
  type CropKey,
} from "../components";
import { setStaleState } from "../api/client";
import { useI18n } from "../i18n";

const CROPS: CropKey[] = [
  "cotton",
  "wheat",
  "rice",
  "alfalfa",
  "maize",
  "melon",
  "vegetables",
];

const DAYS = [
  { label: "S", icon: "sun", rain: "0", et0: "8.1" },
  { label: "P", icon: "sun", rain: "0", et0: "8.4" },
  { label: "J", icon: "sun", rain: "0", et0: "8.6" },
  { label: "Sh", icon: "sun", rain: "0", et0: "8.2" },
  { label: "E", icon: "cloud", rain: "0", et0: "7.4" },
  { label: "D", icon: "cloud", rain: "1", et0: "6.9" },
  { label: "S", icon: "sun", rain: "0", et0: "7.8" },
] as const;

export function Styleguide() {
  const { t } = useI18n();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="scr">
      <AppBar title="Part 0 — Styleguide" sub="Á ǵ ı Ń ó Ú — kaa type check" back />
      <div className="scroll-body">
        <div className="card">
          <h3>Status pills — color + icon + word</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <StatusPill tone="ok" />
            <StatusPill tone="warn" />
            <StatusPill tone="bad" />
            <StatusPill tone="na" />
          </div>
        </div>

        <div className="card">
          <h3>Crop icons</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CROPS.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  width: 72,
                }}
              >
                <CropBadge crop={c} size={44} />
                <span className="meta" style={{ textAlign: "center" }}>
                  {t(`crops.${c}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <FieldCard
          name="Kegeyli paxta atızı"
          crop="cotton"
          metaLine={`${t("crops.cotton")} · 4.2 ga`}
          irrigation="Suwǵarıń 12-iyun · 55 mm"
          irrigationTone="warn"
          salinity="Shorlanıw: dıqqat"
          salinityTone="warn"
          updatedAt="Búgin 06:40"
          stale
        />

        <RecommendationHero
          tone="warn"
          kicker="Suwǵarıw keńesi"
          headline="Juma, 12-iyun kúni suwǵarıń"
          mm={55}
          m3ha={550}
          note="Tamır zonası 62% qurǵaǵan; aldaǵı 5 kúnde jawın kútilmeydi."
        />

        <div className="card">
          <h3>Depletion gauge</h3>
          <DepletionGauge
            pct={62}
            threshold={55}
            labelLeft="Tolı"
            labelMid="Usı noqatta suwǵarıń"
            labelRight="Bos"
          />
        </div>

        <div className="card">
          <h3>7-day strip — jawın / ET₀, mm</h3>
          <WeatherStrip days={[...DAYS]} highlight={2} />
        </div>

        <div className="card">
          <h3>Salinity tolerance scale</h3>
          <SalinityScale
            value={5.8}
            threshold={7.7}
            severeFrom={12}
            valueLabel="bul atız 5.8"
            thresholdLabel="paxta shegi 7.7"
            legend={{ ok: "qáwipsiz", warn: "zúráát joǵaltıw", bad: "awır" }}
          />
        </div>

        <div className="card">
          <h3>Sparklines</h3>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Sparkline pts={[0.31, 0.36, 0.42, 0.47, 0.52, 0.55, 0.61, 0.64]} />
            <Sparkline
              pts={[4.1, 4.3, 4.6, 5.0, 5.4, 5.8]}
              color="var(--warn)"
            />
            <Sparkline pts={[3, 4, 3.6, 4.2, 5]} color="var(--bad)" dashed />
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3>SMS bubbles — segment math (UCS-2 = 70/segment)</h3>
          <SmsBubble
            lang="KAA"
            text="Kegeyli paxta: suwǵarıń 12-iyun. 55 mm (550 m³/ga). Jawın kútilmeydi."
            status={t("sms.status.sent")}
            statusTone="ok"
          />
          <SmsBubble
            lang="KAA"
            text="Kegeyli paxta: shorlanıw qáwpi joqarı. Keyingi suwǵarıwda +15 mm qosıń."
            status={t("sms.status.pending")}
            statusTone="na"
          />
          <SmsBubble
            lang="KAA"
            text={
              "Kegeyli paxta: bárí jaqsı. Keyingi tekseriw 16-iyun. " +
              "Qosımsha maǵlıwmat ushın kooperativke xabarlasıń. " +
              "Suw balansı hám shorlanıw boljawları hár kúni tańǵı saat altıda jańalanadı."
            }
          />
        </div>

        <div className="card">
          <h3>Skeletons</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Skeleton h={14} w="70%" />
            <Skeleton h={14} w="45%" />
            <SkeletonCard />
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3>Overlays</h3>
          <button className="btn sec" onClick={() => toast(t("toast.fieldSaved"))}>
            Toast
          </button>
          <button className="btn sec" onClick={() => setSheetOpen(true)}>
            Bottom sheet
          </button>
          <button className="btn danger" onClick={() => setConfirmOpen(true)}>
            {t("confirm.deleteField.title")}
          </button>
          <button
            className="btn sec"
            onClick={() =>
              setStaleState({ stale: true, asOf: new Date().toISOString() })
            }
          >
            Stale banner on
          </button>
          <button
            className="btn sec"
            onClick={() => setStaleState({ stale: false, asOf: null })}
          >
            Stale banner off
          </button>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FieldCard
          name="Qanlıkól salı atızı"
          crop="rice"
          metaLine={`${t("crops.rice")} · 8.0 ga`}
          irrigation="Suwǵarıń 11-iyun · 90 mm"
          irrigationTone="warn"
          salinity="Shorlanıw: qáwip"
          salinityTone="bad"
          updatedAt="Búgin 06:40"
        />
      </BottomSheet>

      <ConfirmDialog
        open={confirmOpen}
        title={t("confirm.deleteField.title")}
        body={t("confirm.deleteField.body")}
        dangerLabel={t("confirm.delete")}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast(t("toast.fieldSaved"));
        }}
      />
    </div>
  );
}
