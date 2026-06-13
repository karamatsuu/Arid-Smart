import type { ReactNode } from "react";
import { useI18n } from "../i18n";

/** Bottom sheet (Fields map): field summary panel sliding over the map. */
export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div
      className="scrim sheet-pos"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true">
        <button
          className="grab"
          style={{ display: "block", border: "none" }}
          aria-label={t("common.close")}
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  );
}
