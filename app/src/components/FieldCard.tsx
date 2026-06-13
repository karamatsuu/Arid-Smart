import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { CropBadge, Ic, P, type CropKey, type StatusTone } from "./icons";
import { StatusPill } from "./StatusPill";

/**
 * Field card (Home): name, crop icon, meta line (crop · area),
 * two status pills (irrigation + salinity), refresh timestamp.
 */
export function FieldCard({
  name,
  crop,
  metaLine,
  irrigation,
  irrigationTone,
  salinity,
  salinityTone,
  updatedAt,
  stale,
  onClick,
}: {
  name: string;
  crop: CropKey;
  metaLine: string;
  irrigation: ReactNode;
  irrigationTone: StatusTone;
  salinity: ReactNode;
  salinityTone: StatusTone;
  updatedAt: string;
  stale?: boolean;
  onClick?: () => void;
}) {
  const { t } = useI18n();
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className="card"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "13px 14px",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div className="cardrow">
        <CropBadge crop={crop} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16.5 }}>{name}</div>
          <div className="meta">{metaLine}</div>
        </div>
        <Ic d={P.chev} size={18} color="var(--ink-3)" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <StatusPill tone={irrigationTone}>{irrigation}</StatusPill>
        <StatusPill tone={salinityTone}>{salinity}</StatusPill>
      </div>
      <div className="meta" style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Ic d={P.refresh} size={12} sw={2} />
        {updatedAt}
        {stale ? ` · ${t("common.stale")}` : ""}
      </div>
    </Tag>
  );
}
