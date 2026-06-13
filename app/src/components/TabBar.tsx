import { NavLink } from "react-router-dom";
import { useI18n } from "../i18n";
import { Ic, P } from "./icons";

const TABS = [
  { to: "/", key: "tabs.home", d: P.home },
  { to: "/fields", key: "tabs.fields", d: P.layers },
  { to: "/chat", key: "tabs.chat", d: P.bot },
  { to: "/messages", key: "tabs.messages", d: P.msg },
  { to: "/settings", key: "tabs.settings", d: P.sliders },
] as const;

/** Bottom tab bar — 5 tabs, icons + labels (spec §0.2 + Maslahatchi chat). */
export function TabBar() {
  const { t } = useI18n();
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) => "tab" + (isActive ? " on" : "")}
        >
          {({ isActive }) => (
            <>
              <span className="tabglow">
                <Ic d={tab.d} size={21} sw={isActive ? 2.2 : 1.8} />
              </span>
              {t(tab.key)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
