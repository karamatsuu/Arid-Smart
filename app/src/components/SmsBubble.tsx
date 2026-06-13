import { useMemo } from "react";
import { useI18n } from "../i18n";
import { smsInfo } from "../lib/sms";
import { Ic, P, type StatusTone } from "./icons";
import { StatusPill } from "./StatusPill";

/**
 * SMS bubble (spec §0.5): message text + language badge + computed
 * character/segment count (70 chars/segment for UCS-2) + delivery status.
 * Warns when the message exceeds 2 segments.
 */
export function SmsBubble({
  text,
  lang,
  status,
  statusTone,
}: {
  text: string;
  /** language badge, e.g. "KAA" */
  lang: string;
  status?: string;
  statusTone?: StatusTone;
}) {
  const { t } = useI18n();
  const info = useMemo(() => smsInfo(text), [text]);
  return (
    <div className="sms">
      <div className="text">{text}</div>
      <div className="meta-row">
        <span className="langtag">{lang}</span>
        <span className="meta num">
          {t("sms.segInfo", { chars: info.chars, segments: info.segments })} ·{" "}
          {info.encoding}
        </span>
        {status && statusTone && (
          <span style={{ marginLeft: "auto" }}>
            <StatusPill tone={statusTone} small>
              {status}
            </StatusPill>
          </span>
        )}
      </div>
      {info.overLimit && (
        <div className="seg-warn">
          <Ic d={P.alert} size={14} sw={2.2} />
          {t("sms.segWarn", { segments: info.segments })}
        </div>
      )}
    </div>
  );
}
