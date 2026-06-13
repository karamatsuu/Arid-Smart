import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { sendChatMessage, type ChatMessage, type FieldContext } from "../api/chat";
import { AppBar, Ic, P } from "../components";
import { useI18n } from "../i18n";

const CHIPS_WITH_CTX = ["irrigate", "salinity", "sms", "advice"] as const;
const CHIPS_WITHOUT_CTX = ["waterTime", "salinityGeneral", "cropHealth", "weather"] as const;

export function Chat() {
  const { t } = useI18n();
  const location = useLocation();
  const [fieldContext, setFieldContext] = useState<FieldContext | null>(
    (location.state as { fieldContext?: FieldContext } | null)?.fieldContext ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const offline = !navigator.onLine;
  const chips = fieldContext ? CHIPS_WITH_CTX : CHIPS_WITHOUT_CTX;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming || offline) return;
      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);
      const assistantIdx = nextMessages.length;
      abortRef.current = new AbortController();
      try {
        await sendChatMessage(
          nextMessages,
          fieldContext,
          (chunk) => {
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantIdx] = {
                role: "assistant",
                content: (updated[assistantIdx]?.content ?? "") + chunk,
              };
              return updated;
            });
          },
          abortRef.current.signal,
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((prev) => prev.slice(0, assistantIdx));
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = { role: "assistant", content: t("chat.error") };
            return updated;
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, offline, fieldContext, t],
  );

  return (
    <div className="scr chat-layout">
      <AppBar title={t("chat.title")} sub={t("chat.subtitle")} />

      {fieldContext && (
        <div className="context-banner">
          <Ic d={P.sprout} size={14} sw={2} color="var(--accent)" />
          <span className="ctx-text">
            {fieldContext.fieldName} · {fieldContext.salinityLevel}
          </span>
          <button className="ctx-clear" onClick={() => setFieldContext(null)}>
            {t("chat.clearContext")}
          </button>
        </div>
      )}

      <div className="chat-body">
        {messages.length === 0 && (
          <div className="center-note" style={{ margin: "auto" }}>
            <Ic d={P.bot} size={34} color="var(--ink-3)" sw={1.6} />
            <p style={{ margin: 0 }}>{t("chat.empty.title")}</p>
            <p className="report-muted" style={{ margin: 0, textAlign: "center" }}>
              {t("chat.empty.subtitle")}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="ai-label">{t("chat.aiLabel")}</div>
            )}
            <div className={`msg-bubble ${msg.role}`}>
              {msg.role === "assistant" && msg.content === "" && streaming ? (
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 && (
        <div className="chat-chips">
          {chips.map((chip) => (
            <button
              key={chip}
              className="chat-chip"
              onClick={() => void send(t(`chat.chips.${chip}` as Parameters<typeof t>[0]))}
              disabled={offline || streaming}
            >
              {t(`chat.chips.${chip}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        {offline && (
          <p className="inline-error" style={{ margin: "0 0 6px" }}>
            {t("chat.offline")}
          </p>
        )}
        <div className="chat-input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) void send(input);
            }}
            placeholder={t("chat.placeholder")}
            disabled={offline || streaming}
          />
          <button
            className="chat-send-btn"
            onClick={() => void send(input)}
            disabled={!input.trim() || offline || streaming}
            aria-label={t("chat.placeholder")}
          >
            <Ic d={P.send} size={18} sw={1.9} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
