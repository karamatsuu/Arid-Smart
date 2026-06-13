import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { Ic, P } from "./icons";

/**
 * Wizard frame (Add/Edit field): progress dots + step title up top,
 * fixed Back/Next bar at the bottom, scrollable content between.
 */
export function WizardFrame({
  step,
  total,
  title,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  onExit,
}: {
  step: number;
  total: number;
  title: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onExit?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="scr">
      <div className="wiz-top">
        <button
          className="iconbtn"
          style={{ marginLeft: -10 }}
          aria-label={t("common.back")}
          onClick={onExit ?? onBack}
        >
          <Ic d={P.back} size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="dots">
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i + 1 === step ? "on" : ""} />
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16.5, marginTop: 4 }}>
            {t("wizard.step", { step, total })} — {title}
          </div>
        </div>
      </div>
      <div className="scroll-body">{children}</div>
      <div className="wiz-bottom">
        <button className="btn sec" style={{ flex: 1 }} onClick={onBack}>
          {t("wizard.back")}
        </button>
        <button
          className="btn pri"
          style={{ flex: 2 }}
          onClick={onNext}
          disabled={nextDisabled}
        >
          {nextLabel ?? t("wizard.next")}
        </button>
      </div>
    </div>
  );
}
