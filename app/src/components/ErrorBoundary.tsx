import { Component, type ReactNode } from "react";
import { getStoredLocale, translate } from "../i18n";

/**
 * Full error fallback (spec §0.4): only when the app itself fails to boot —
 * logo, "Something went wrong", Reload. Reads the locale directly from
 * storage because the i18n provider itself may be inside the failed tree.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const locale = getStoredLocale();
    return (
      <div className="boot-error">
        <img src="/icon.svg" alt="" width={72} height={72} />
        <h1 style={{ margin: 0, fontSize: 20 }}>{translate(locale, "error.title")}</h1>
        <button
          className="btn pri"
          style={{ maxWidth: 240 }}
          onClick={() => window.location.reload()}
        >
          {translate(locale, "error.reload")}
        </button>
      </div>
    );
  }
}
