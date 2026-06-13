// AridSmart canvas — shared primitives (icons, pills, bars, cards)
// All exported to window for use by screen files.

const S = 1.8; // stroke width

function Ic({ d, size = 20, color = "currentColor", fill = "none", sw = S, extra = null, style = null }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} style={style}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d}></path>{extra}
    </svg>
  );
}

/* --- icon paths: deliberately simple geometry --- */
const P = {
  back: "M15 5 8 12l7 7",
  more: "M12 5.5v.01M12 12v.01M12 18.5v.01",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c-2.5 2.5-3.7 5.6-3.7 9s1.2 6.5 3.7 9c2.5-2.5 3.7-5.6 3.7-9S14.5 5.5 12 3",
  drop: "M12 3.5c3.2 4 6 7.2 6 10.5a6 6 0 1 1-12 0c0-3.3 2.8-6.5 6-10.5",
  check: "M5 12.5 10 17.5 19 7",
  alert: "M12 4 2.8 20h18.4L12 4m0 6v4.5m0 3v.01",
  minus: "M6 12h12",
  plus: "M12 5v14M5 12h14",
  home: "M4 11.5 12 4.5l8 7M6 10.5V20h12v-9.5",
  layers: "M12 3 3 8.5l9 5.5 9-5.5L12 3M5 13l7 4.5 7-4.5",
  msg: "M4 5h16v11H9l-5 4V5",
  sliders: "M5 7h14M5 12h14M5 17h14",
  pin: "M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11m0-8.5v.01",
  sun: "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4",
  cloud: "M7 18.5h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18.5",
  wind: "M3 9h11a2.5 2.5 0 1 0-2.5-2.5M3 14h15a2.5 2.5 0 1 1-2.5 2.5",
  sprout: "M12 21v-8m0 0c0-3.5-2.5-6-6.5-6 0 4 2.5 6.5 6.5 6m0-2c.2-3.6 2.6-5.5 6.5-5.5-.3 4-2.7 5.7-6.5 5.5",
  send: "M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10l18-7",
  trash: "M5 7h14M10 7V5h4v2m-7 0 1 13h8l1-13",
  refresh: "M20 8A8 8 0 0 0 5.5 6.5L4 8m0 8a8 8 0 0 0 14.5 1.5L20 16M4 4v4h4m12 12v-4h-4",
  edit: "M4 20h4L19 9l-4-4L4 16v4",
  wifi_off: "M3 3l18 18M8.5 13.5a6 6 0 0 1 4-1.7m4.6 1.9a6 6 0 0 0-1.6-1M5 10a10 10 0 0 1 3.4-2.2M19 10a10 10 0 0 0-4-2.4M12 18.5v.01",
  undo: "M8 5 4 9l4 4M4 9h10a6 6 0 0 1 0 12h-3",
  chev: "M9 6l6 6-6 6",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M20 20l-4.5-4.5",
  locate: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0-6v3m0 14v3M2 12h3m14 0h3",
};
window.IcPaths = P;

/* --- status pill: color + icon + word (never color alone) --- */
function Pill({ tone = "ok", children, size }) {
  const icons = { ok: P.check, warn: P.alert, bad: P.alert, na: P.minus };
  return (
    <span className={"pill " + tone} style={size === "sm" ? { fontSize: 12, padding: "2px 9px 2px 6px" } : null}>
      <Ic d={icons[tone]} size={size === "sm" ? 13 : 15} sw={2.4} />{children}
    </span>
  );
}

/* --- app bar --- */
function AppBar({ title, sub, back, menu, lang = "KAA", noLang }) {
  return (
    <div className="appbar">
      {back ? <span className="iconbtn" style={{ marginLeft: -10 }}><Ic d={P.back} size={22} /></span> : null}
      <span className="title">{title}{sub ? <span className="sub">{sub}</span> : null}</span>
      {noLang ? null : <span className="lang"><Ic d={P.globe} size={15} sw={1.5} />{lang}</span>}
      {menu ? <span className="iconbtn" style={{ marginRight: -6 }}><Ic d={P.more} size={22} sw={2.6} /></span> : null}
    </div>
  );
}

/* --- bottom tabs --- */
function TabBar({ active = 0 }) {
  const tabs = [
    { l: "Bas bet", d: P.home },
    { l: "Atızlar", d: P.layers },
    { l: "Xabarlar", d: P.msg },
    { l: "Sazlawlar", d: P.sliders },
  ];
  return (
    <div className="tabbar">
      {tabs.map((t, i) => (
        <span key={t.l} className={"tab" + (i === active ? " on" : "")}>
          <span className="tabglow"><Ic d={t.d} size={21} sw={i === active ? 2.2 : 1.8} /></span>
          {t.l}
        </span>
      ))}
    </div>
  );
}

/* --- crop badge (placeholder glyph: simple sprout, tinted) --- */
function CropBadge({ tint = "#5a7d3a" }) {
  return (
    <span style={{
      width: 40, height: 40, borderRadius: 11, flex: "none",
      background: tint + "1f", color: tint,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}><Ic d={P.sprout} size={22} sw={1.7} /></span>
  );
}

/* --- field card (Home) --- */
function FieldCard({ name, cropTint, metaLine, irr, irrTone, sal, salTone, time, stale }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "13px 14px" }}>
      <div className="cardrow">
        <CropBadge tint={cropTint} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16.5 }}>{name}</div>
          <div className="meta">{metaLine}</div>
        </div>
        <Ic d={P.chev} size={18} color="var(--ink-3)" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Pill tone={irrTone}>{irr}</Pill>
        <Pill tone={salTone}>{sal}</Pill>
      </div>
      <div className="meta" style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Ic d={P.refresh} size={12} sw={2} />{time}{stale ? " · gónergen" : ""}
      </div>
    </div>
  );
}

/* --- depletion gauge --- */
function Gauge({ pct = 62, thresh = 55, label = "Usı noqatta suwǵarıń" }) {
  return (
    <div>
      <div className="gauge-track" style={{ margin: "14px 2px 0" }}>
        <div className="gauge-fill" style={{ width: pct + "%", background: pct >= thresh ? "var(--warn)" : "var(--accent)" }}></div>
        <div className="gauge-thresh" style={{ left: thresh + "%" }}></div>
        <div className="gauge-marker" style={{ left: pct + "%" }}></div>
      </div>
      <div className="gauge-labels">
        <span>Tolı</span>
        <span style={{ color: "var(--ink)", fontWeight: 700 }}>▾ {label}</span>
        <span>Bos</span>
      </div>
    </div>
  );
}

/* --- 7-day strip --- */
function Strip7({ days, hl }) {
  const wIcon = { sun: P.sun, cloud: P.cloud };
  return (
    <div className="strip7">
      {days.map((d, i) => (
        <div key={i} className={"day" + (i === hl ? " hl" : "")}>
          <span className="dw">{d.w}</span>
          <Ic d={wIcon[d.i]} size={17} color={d.i === "sun" ? "#c08a12" : "var(--ink-3)"} sw={1.6} />
          <span className="v">{d.rain}</span>
          <span className="v2">{d.et0}</span>
        </div>
      ))}
    </div>
  );
}

/* --- sparkline --- */
function Spark({ pts, w = 130, h = 34, color = "var(--accent)", dash }) {
  const min = Math.min(...pts), max = Math.max(...pts);
  const xy = pts.map((p, i) => `${(i / (pts.length - 1)) * (w - 6) + 3},${h - 4 - ((p - min) / (max - min || 1)) * (h - 8)}`).join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline points={xy} fill="none" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "4 4" : "none"}></polyline>
      <circle cx={xy.split(" ").pop().split(",")[0]} cy={xy.split(" ").pop().split(",")[1]} r="3.2" fill={color}></circle>
    </svg>
  );
}

/* --- offline banner --- */
function OfflineBanner({ date = "9-iyun, 18:05" }) {
  return (
    <div className="banner-offline">
      <Ic d={P.wifi_off} size={15} sw={2} />Oflayn — {date} maǵlıwmatları kórsetilmekte
    </div>
  );
}

/* --- stylized map placeholder (real Leaflet+OSM in the prototype) --- */
function MockMap({ height = 300, children, note = "Leaflet + OSM tiles in prototype" }) {
  return (
    <div style={{
      position: "relative", height, flex: "none", overflow: "hidden",
      background: "linear-gradient(160deg,#e7edea 0%,#e3eaec 60%,#dde7ea 100%)",
    }}>
      <svg width="100%" height="100%" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {/* canal + road hints */}
        <polyline points="-10,210 80,190 150,196 230,178 370,186" fill="none" stroke="#b9d2da" strokeWidth="7" strokeLinecap="round"></polyline>
        <polyline points="40,-10 70,80 90,160 84,310" fill="none" stroke="#cfd8d3" strokeWidth="4"></polyline>
        <polyline points="120,-10 260,140 360,200" fill="none" stroke="#e0e3dd" strokeWidth="3"></polyline>
        {children}
      </svg>
      <div style={{
        position: "absolute", left: 8, bottom: 6, fontSize: 10, color: "var(--ink-3)",
        fontFamily: "ui-monospace,monospace", background: "rgba(255,255,255,.75)", padding: "1px 6px", borderRadius: 4,
      }}>© OpenStreetMap · {note}</div>
    </div>
  );
}

function MapPoly({ pts, tone = "ok", label }) {
  const c = { ok: ["#18713f", "#18713f2e"], warn: ["#8a5a05", "#c0892033"], bad: ["#ae2e21", "#ae2e2130"] }[tone];
  const xs = pts.split(" ").map(p => +p.split(",")[0]); const ys = pts.split(" ").map(p => +p.split(",")[1]);
  const cx = xs.reduce((a, b) => a + b) / xs.length, cy = ys.reduce((a, b) => a + b) / ys.length;
  return (
    <g>
      <polygon points={pts} fill={c[1]} stroke={c[0]} strokeWidth="2"></polygon>
      {label ? <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={c[0]} fontFamily="Noto Sans">{label}</text> : null}
    </g>
  );
}

/* --- map control buttons --- */
function MapCtl({ top }) {
  const b = { width: 46, height: 46, background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", boxShadow: "var(--shadow)" };
  return (
    <div style={{ position: "absolute", right: 10, top, display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={b}><Ic d={P.plus} size={20} sw={2.2} /></span>
      <span style={b}><Ic d={P.minus} size={20} sw={2.2} /></span>
      <span style={{ ...b, marginTop: 8 }}><Ic d={P.locate} size={20} sw={1.8} /></span>
    </div>
  );
}

/* --- SMS bubble --- */
function SmsBubble({ text, lang = "KAA", segInfo, status, statusTone }) {
  return (
    <div style={{ background: "var(--brand-soft)", border: "1px solid #c8dde6", borderRadius: "4px 14px 14px 14px", padding: "11px 13px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 15, lineHeight: 1.5, fontFamily: "ui-monospace,monospace", color: "var(--ink)" }}>{text}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "700 11px var(--font-num)", letterSpacing: ".05em", background: "var(--brand)", color: "#fff", borderRadius: 5, padding: "2px 7px" }}>{lang}</span>
        <span className="meta num">{segInfo}</span>
        {status ? <span style={{ marginLeft: "auto" }}><Pill tone={statusTone} size="sm">{status}</Pill></span> : null}
      </div>
    </div>
  );
}

/* --- wizard chrome --- */
function WizTop({ step, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)", flex: "none" }}>
      <span className="iconbtn" style={{ marginLeft: -10 }}><Ic d={P.back} size={22} /></span>
      <div style={{ flex: 1 }}>
        <div className="dots">{[1, 2, 3].map(i => <i key={i} className={i === step ? "on" : ""}></i>)}</div>
        <div style={{ fontWeight: 700, fontSize: 16.5, marginTop: 4 }}>{step}/3 — {title}</div>
      </div>
    </div>
  );
}
function WizBottom({ next = "Keyingi", back = "Artqa", primary }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 16px 16px", background: "var(--surface)", borderTop: "1px solid var(--line)", flex: "none", marginTop: "auto" }}>
      <span className="btn sec" style={{ flex: 1 }}>{back}</span>
      <span className={"btn " + (primary ? "pri" : "pri")} style={{ flex: 2 }}>{next}</span>
    </div>
  );
}

Object.assign(window, {
  Ic, P, Pill, AppBar, TabBar, CropBadge, FieldCard, Gauge, Strip7, Spark,
  OfflineBanner, MockMap, MapPoly, MapCtl, SmsBubble, WizTop, WizBottom,
});
