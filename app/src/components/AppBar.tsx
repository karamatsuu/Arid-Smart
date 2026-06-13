import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { Ic, P } from "./icons";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Top app bar (spec §0.2): title (+optional subtitle), optional back arrow
 * for sub-pages, language switcher on every screen, optional action slot.
 */
export function AppBar({
  title,
  sub,
  back,
  backTo,
  actions,
}: {
  title: string;
  sub?: string;
  back?: boolean;
  backTo?: string;
  actions?: ReactNode;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <header className="appbar">
      {back && (
        <button
          className="iconbtn"
          style={{ marginLeft: -10 }}
          aria-label={t("common.back")}
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        >
          <Ic d={P.back} size={22} />
        </button>
      )}
      <h1 className="title" style={{ margin: 0 }}>
        {title}
        {sub && <span className="sub">{sub}</span>}
      </h1>
      <LanguageSwitcher />
      {actions}
    </header>
  );
}
