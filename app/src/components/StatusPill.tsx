import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { StatusIcon, type StatusTone } from "./icons";

export type { StatusTone };

/**
 * Status pill — ALWAYS color + icon + word (spec §0.1). If no children are
 * given, the localized status word for the tone is used, so the pill can
 * never render as color alone.
 */
export function StatusPill({
  tone,
  children,
  small,
}: {
  tone: StatusTone;
  children?: ReactNode;
  small?: boolean;
}) {
  const { t } = useI18n();
  return (
    <span className={`pill ${tone}${small ? " sm" : ""}`}>
      <StatusIcon tone={tone} size={small ? 13 : 15} />
      {children ?? t(`status.${tone}`)}
    </span>
  );
}
