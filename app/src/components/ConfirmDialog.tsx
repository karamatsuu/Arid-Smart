import { useI18n } from "../i18n";

/**
 * Confirm dialog (delete field, clear cache): title, one sentence,
 * danger + cancel buttons (spec §0.4).
 */
export function ConfirmDialog({
  open,
  title,
  body,
  dangerLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  dangerLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div
      className="scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="row">
          <button className="btn sec" style={{ flex: 1 }} onClick={onCancel}>
            {t("confirm.cancel")}
          </button>
          <button className="btn danger" style={{ flex: 1 }} onClick={onConfirm}>
            {dangerLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
