import { AppBar } from "../components/AppBar";
import { Ic, P } from "../components/icons";
import { useI18n } from "../i18n";

/**
 * Placeholder screen for Pages 0–7 (spec §0.2): real route + app bar so
 * later parts drop into existing slots. Never blank — shows which build
 * part will fill it.
 */
export function Placeholder({
  titleKey,
  part,
  back,
}: {
  titleKey: string;
  part: number;
  back?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="scr">
      <AppBar title={t(titleKey)} back={back} />
      <div className="scroll-body">
        <div className="center-note">
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "var(--brand-soft)",
              color: "var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic d={P.sprout} size={32} sw={1.6} />
          </span>
          <p style={{ margin: 0, fontSize: 15.5, maxWidth: 280 }}>
            {t("placeholder.body", { part })}
          </p>
        </div>
      </div>
    </div>
  );
}
