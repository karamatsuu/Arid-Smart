import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet, apiMutate, queueMutation, type ApiResult } from "../api/client";
import type {
  Field,
  MessageLogItem,
  MessagesResponse,
  MessageStatus,
  SmsLanguage,
} from "../api/types";
import {
  AppBar,
  Ic,
  P,
  SkeletonCard,
  SmsBubble,
  useToast,
} from "../components";
import { useI18n } from "../i18n";
import { formatShortDateTime } from "../lib/dates";

type StatusFilter = "all" | MessageStatus;

const STATUS_FILTERS: StatusFilter[] = ["all", "sent", "failed", "test"];
const SMS_LANGS: SmsLanguage[] = ["kaa", "uz", "ru"];

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `+998 ●● ●●● ${last4.slice(0, 2)} ${last4.slice(2)}`;
}

function toneForStatus(status: MessageStatus) {
  if (status === "sent") return "ok";
  if (status === "failed") return "bad";
  return "na";
}

export function Messages() {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [params] = useSearchParams();
  const initialField = params.get("field") ?? "";
  const [fieldId, setFieldId] = useState(initialField);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [res, setRes] = useState<ApiResult<MessagesResponse> | null>(null);
  const [fieldsRes, setFieldsRes] = useState<ApiResult<{ fields: Field[] }> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testField, setTestField] = useState(initialField);
  const [testLang, setTestLang] = useState<SmsLanguage>("kaa");

  const load = useCallback(async () => {
    setRes(null);
    const suffix = fieldId ? `?field_id=${encodeURIComponent(fieldId)}` : "";
    setRes(await apiGet<MessagesResponse>(`/messages${suffix}`));
  }, [fieldId]);

  useEffect(() => {
    void apiGet<{ fields: Field[] }>("/fields").then(setFieldsRes);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fields = fieldsRes?.data?.fields ?? [];
  const selectedTestField = fields.find((f) => f.id === testField) ?? fields[0];
  const testText = selectedTestField
    ? t("messages.testText", { field: selectedTestField.name })
    : "";
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const messages = useMemo(() => {
    const all = res?.data?.messages ?? [];
    return status === "all" ? all : all.filter((m) => m.status === status);
  }, [res, status]);

  const sendTest = async () => {
    if (!selectedTestField) return;
    const item: MessageLogItem = {
      id: `local-${Date.now()}`,
      field_id: selectedTestField.id,
      field_name: selectedTestField.name,
      phone: selectedTestField.phone ?? "",
      lang: testLang,
      text: testText,
      status: "test",
      timestamp: new Date().toISOString(),
      test: true,
    };
    try {
      if (!navigator.onLine) throw new Error("offline");
      await apiMutate("POST", "/messages/test", {
        field_id: selectedTestField.id,
        lang: testLang,
        text: testText,
      });
    } catch {
      queueMutation("POST", "/messages/test", {
        field_id: selectedTestField.id,
        lang: testLang,
        text: testText,
      });
    }
    setRes((prev) => ({
      data: { messages: [item, ...(prev?.data?.messages ?? [])] },
      stale: prev?.stale ?? false,
      asOf: prev?.asOf ?? null,
    }));
    setDialogOpen(false);
    toast(t("toast.testSms"));
  };

  return (
    <div className="scr">
      <AppBar
        title={t("pages.messages")}
        actions={
          <button
            className="btn sec sm"
            disabled={offline}
            onClick={() => setDialogOpen(true)}
          >
            <Ic d={P.send} size={16} sw={1.8} />
            {t("messages.sendTest")}
          </button>
        }
      />
      <div className="scroll-body">
        <section className="card filter-card">
          <label className="field-label" htmlFor="message-field">
            {t("messages.filterField")}
          </label>
          <select
            id="message-field"
            className="input"
            value={fieldId}
            onChange={(e) => setFieldId(e.target.value)}
          >
            <option value="">{t("messages.allFields")}</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <div className="seg status-seg" role="group">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className={status === s ? "on" : ""}
                onClick={() => setStatus(s)}
              >
                {t(`messages.status.${s}`)}
              </button>
            ))}
          </div>
          {offline && <p className="inline-error">{t("messages.offlineSend")}</p>}
        </section>

        {res === null && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {res !== null && messages.length === 0 && (
          <section className="center-note card">
            <Ic d={P.msg} size={34} color="var(--ink-3)" sw={1.6} />
            <p style={{ margin: 0 }}>{t("messages.empty")}</p>
          </section>
        )}

        {messages.map((m) => (
          <article className="card message-card" key={m.id}>
            <div className="message-head">
              <div>
                <strong>{m.field_name}</strong>
                <div className="report-muted">
                  {formatShortDateTime(m.timestamp, locale)} · {maskPhone(m.phone)}
                </div>
              </div>
              {m.test && <span className="test-badge">{t("messages.testBadge")}</span>}
            </div>
            <SmsBubble
              text={m.text}
              lang={m.lang.toUpperCase()}
              status={t(`messages.delivery.${m.status}`)}
              statusTone={toneForStatus(m.status)}
            />
          </article>
        ))}
      </div>

      {dialogOpen && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setDialogOpen(false)}>
          <div className="dialog" role="dialog" aria-modal="true" aria-label={t("messages.dialog.title")}>
            <h2>{t("messages.dialog.title")}</h2>
            <div className="dialog-form">
              <label className="field-label" htmlFor="test-field">
                {t("messages.filterField")}
              </label>
              <select
                id="test-field"
                className="input"
                value={testField || selectedTestField?.id || ""}
                onChange={(e) => setTestField(e.target.value)}
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <label className="field-label">{t("wizard.sms.language")}</label>
              <div className="seg">
                {SMS_LANGS.map((l) => (
                  <button
                    key={l}
                    className={testLang === l ? "on" : ""}
                    onClick={() => setTestLang(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="dialog-preview">{testText}</p>
            </div>
            <div className="row">
              <button className="btn sec" style={{ flex: 1 }} onClick={() => setDialogOpen(false)}>
                {t("confirm.cancel")}
              </button>
              <button className="btn pri" style={{ flex: 1 }} onClick={() => void sendTest()}>
                {t("messages.dialog.send")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
