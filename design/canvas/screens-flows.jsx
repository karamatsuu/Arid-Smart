// AridSmart canvas — Fields (map+list), Add-Field wizard ×3, Messages, Settings

/* ============ Fields — map view + bottom sheet ============ */
function ScrFieldsMap() {
  return (
    <div className="scr">
      <div className="appbar">
        <span className="title">Atızlar</span>
        <div className="seg" style={{ width: 150 }}>
          <span className="on">Karta</span><span>Dizim</span>
        </div>
        <span className="lang"><Ic d={P.globe} size={15} sw={1.5} />KAA</span>
      </div>
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <MockMap height={420}>
          <MapPoly tone="warn" pts="60,70 150,55 165,130 75,145" label="Kegeyli"></MapPoly>
          <MapPoly tone="bad" pts="200,90 295,80 310,170 215,175" label="Qanlıkól"></MapPoly>
          <MapPoly tone="ok" pts="95,200 185,190 195,265 105,272" label="Shımbay"></MapPoly>
        </MockMap>
        <MapCtl top={14} />
        <span className="fab" style={{ bottom: 290 }}><Ic d={P.plus} size={18} sw={2.4} />Atız qosıw</span>

        {/* bottom sheet */}
        <div style={{
          marginTop: "auto", background: "var(--surface)", borderRadius: "18px 18px 0 0",
          boxShadow: "0 -6px 24px rgba(14,58,77,.18)", padding: "10px 16px 16px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <span style={{ width: 40, height: 4, borderRadius: 2, background: "var(--line-strong)", margin: "0 auto" }}></span>
          <div className="cardrow">
            <CropBadge tint="#1b7a6e" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16.5 }}>Qanlıkól salı</div>
              <div className="meta">Salı · 8.0 ga · Janabay Qalbaev</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Pill tone="warn">Suwǵarıń 11-iyun</Pill>
            <Pill tone="bad">Shorlanıw: qáwip</Pill>
          </div>
          <span className="btn pri">Esabattı ashıw</span>
        </div>
      </div>
      <TabBar active={1} />
    </div>
  );
}

/* ============ Fields — list view (offline fallback, first-class) ============ */
function ScrFieldsList() {
  const rows = [
    { n: "Kegeyli paxta", m: "Paxta · 4.2 ga", t: "#5a7d3a", p1: ["warn", "12-iyun"], p2: ["warn", "Dıqqat"] },
    { n: "Qanlıkól salı", m: "Salı · 8.0 ga", t: "#1b7a6e", p1: ["warn", "11-iyun"], p2: ["bad", "Qáwip"] },
    { n: "Shımbay biyday", m: "Biyday · 6.5 ga", t: "#a8762a", p1: ["ok", "Kerek emes"], p2: ["ok", "Jaqsı"] },
  ];
  return (
    <div className="scr">
      <div className="appbar">
        <span className="title">Atızlar</span>
        <div className="seg" style={{ width: 150 }}>
          <span>Karta</span><span className="on">Dizim</span>
        </div>
        <span className="lang"><Ic d={P.globe} size={15} sw={1.5} />KAA</span>
      </div>
      <div className="scroll-body">
        <div className="meta" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Ic d={P.wifi_off} size={13} sw={2} />Karta plitkaları júklenbedi — dizim kórinisi
        </div>
        {rows.map(r => (
          <div key={r.n} className="lrow">
            <CropBadge tint={r.t} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{r.n}</div>
              <div className="meta">{r.m}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <Pill tone={r.p1[0]} size="sm">{r.p1[1]}</Pill>
              <Pill tone={r.p2[0]} size="sm">{r.p2[1]}</Pill>
            </div>
            <Ic d={P.chev} size={17} color="var(--ink-3)" />
          </div>
        ))}
      </div>
      <span className="fab"><Ic d={P.plus} size={18} sw={2.4} />Atız qosıw</span>
      <TabBar active={1} />
    </div>
  );
}

/* ============ Wizard step 1 — location ============ */
function ScrWiz1() {
  return (
    <div className="scr">
      <WizTop step={1} title="Jaylasıw" />
      <div style={{ padding: "12px 16px 10px", display: "flex", flexDirection: "column", gap: 10, flex: "none" }}>
        <div className="seg">
          <span>Noqat qoyıw</span><span className="on">Shegara sızıw</span>
        </div>
      </div>
      <div style={{ position: "relative", flex: 1 }}>
        <MockMap height={330}>
          <MapPoly tone="ok" pts="100,80 240,65 255,200 110,215"></MapPoly>
          {["100,80", "240,65", "255,200", "110,215"].map(pt => {
            const [x, y] = pt.split(",");
            return <circle key={pt} cx={x} cy={y} r="7" fill="#fff" stroke="var(--brand)" strokeWidth="3"></circle>;
          })}
        </MockMap>
        <MapCtl top={12} />
        <div style={{ position: "absolute", left: 12, top: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="card" style={{ padding: "8px 13px", display: "flex", gap: 8, alignItems: "center", borderRadius: 11 }}>
            <span className="meta" style={{ fontWeight: 700 }}>Maydan:</span>
            <span className="num" style={{ fontWeight: 700, fontSize: 17 }}>4.2 ga</span>
          </span>
          <span className="card" style={{ width: 46, height: 46, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 11, color: "var(--ink-2)" }}>
            <Ic d={P.undo} size={19} />
          </span>
        </div>
      </div>
      <div style={{ padding: "10px 16px", textAlign: "center", flex: "none" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", textDecoration: "underline" }}>Koordinatalardı qolda kiritiw</span>
      </div>
      <WizBottom />
    </div>
  );
}

/* ============ Wizard step 2 — field & crop ============ */
function ScrWiz2() {
  const crops = ["Paxta", "Biyday", "Salı", "Beda", "Mákke", "Qawın"];
  const tints = ["#5a7d3a", "#a8762a", "#1b7a6e", "#3a7d5d", "#7d8a2a", "#b06b35"];
  return (
    <div className="scr">
      <WizTop step={2} title="Atız hám egin" />
      <div className="scroll-body">
        <div>
          <label className="field-label">Atız atı</label>
          <div className="input">Kegeyli paxta</div>
        </div>
        <div>
          <label className="field-label">Egin túri</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {crops.map((c, i) => (
              <div key={c} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "11px 4px 9px", borderRadius: 12, background: "var(--surface)",
                border: i === 0 ? "2.5px solid var(--brand)" : "1.5px solid var(--line-strong)",
                fontSize: 13.5, fontWeight: 700, color: i === 0 ? "var(--brand)" : "var(--ink-2)",
              }}>
                <span style={{ color: tints[i] }}><Ic d={P.sprout} size={24} sw={1.7} /></span>{c}
              </div>
            ))}
          </div>
          <div className="meta" style={{ marginTop: 6, textAlign: "right" }}>+ Ovoshlar (basqa)</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="field-label">Egiw sánesi</label>
            <div className="input num">14-04-2026</div>
          </div>
          <div>
            <label className="field-label">Maydan (ga)</label>
            <div className="input num">4.2 <span className="meta" style={{ marginLeft: "auto" }}>kartadan</span></div>
          </div>
        </div>
        <div>
          <label className="field-label">Topıraq túri</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {[["Qumlı", false], ["Orta (loam)", true], ["Ilaylı", false]].map(([s, on]) => (
              <div key={s} style={{
                textAlign: "center", padding: "12px 4px", borderRadius: 12, background: "var(--surface)",
                fontSize: 13.5, fontWeight: 700,
                border: on ? "2.5px solid var(--brand)" : "1.5px solid var(--line-strong)",
                color: on ? "var(--brand)" : "var(--ink-2)",
              }}>{s}</div>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Suwǵarıw usılı</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
            {[["Júyek", true], ["Tamshı", false], ["Septiw", false], ["Qaplaw", false]].map(([s, on]) => (
              <div key={s} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "10px 2px 8px", borderRadius: 12, background: "var(--surface)", fontSize: 12.5, fontWeight: 700,
                border: on ? "2.5px solid var(--brand)" : "1.5px solid var(--line-strong)",
                color: on ? "var(--brand)" : "var(--ink-2)",
              }}><Ic d={P.drop} size={18} sw={1.8} />{s}</div>
            ))}
          </div>
        </div>
      </div>
      <WizBottom />
    </div>
  );
}

/* ============ Wizard step 3 — farmer & SMS ============ */
function ScrWiz3() {
  return (
    <div className="scr">
      <WizTop step={3} title="Diyqan hám SMS" />
      <div className="scroll-body">
        <div>
          <label className="field-label">Diyqannıń atı</label>
          <div className="input">Berdaq Allambergenov</div>
        </div>
        <div>
          <label className="field-label">Telefon nomeri</label>
          <div className="input num"><span style={{ color: "var(--ink-3)", fontWeight: 700 }}>+998</span> 91 234 56 78</div>
        </div>
        <div>
          <label className="field-label">SMS tili</label>
          <div className="seg">
            <span className="on">Qaraqalpaqsha</span><span>Oʻzbekcha</span><span>Русский</span>
          </div>
        </div>
        <div>
          <label className="field-label">SMS jiyiligi</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[["Tek háreket kerek bolǵanda", true], ["Kúndelik juwmaq", false]].map(([s, on]) => (
              <div key={s} className="lrow" style={{ minHeight: 50, gap: 10, border: on ? "2px solid var(--brand)" : "1.5px solid var(--line-strong)" }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", flex: "none",
                  border: on ? "6px solid var(--brand)" : "2px solid var(--line-strong)",
                }}></span>
                <span style={{ fontSize: 15, fontWeight: on ? 700 : 500 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ background: "var(--brand-soft)", borderColor: "#c8dde6" }}>
          <h3 style={{ color: "var(--brand)" }}>Juwmaq</h3>
          <div style={{ fontSize: 14.5, lineHeight: 1.8 }}>
            <b>Kegeyli paxta</b> · Paxta · 4.2 ga<br />
            Egilgen: <span className="num">14-04-2026</span> · Orta topıraq · Júyek<br />
            Berdaq Allambergenov · <span className="num">+998 91 234 56 78</span> · KAA
          </div>
        </div>
        <span className="btn pri">Atızdı saqlaw</span>
      </div>
    </div>
  );
}

/* ============ Messages (SMS center) ============ */
function ScrMessages() {
  return (
    <div className="scr">
      <div className="appbar">
        <span className="title">Xabarlar</span>
        <span className="btn sec sm" style={{ minHeight: 42 }}><Ic d={P.send} size={15} sw={2} />Test SMS</span>
        <span className="lang"><Ic d={P.globe} size={15} sw={1.5} />KAA</span>
      </div>
      <div className="scroll-body">
        <div style={{ display: "flex", gap: 7 }}>
          <span className="chip" style={{ flex: 1, justifyContent: "space-between" }}>Barlıq atızlar <Ic d={P.chev} size={14} style={{ transform: "rotate(90deg)" }} /></span>
          <span className="chip" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>Barlıǵı</span>
          <span className="chip">Test</span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div className="cardrow">
            <b style={{ fontSize: 15, flex: 1 }}>Qanlıkól salı</b>
            <span className="meta num">Búgin 06:45</span>
          </div>
          <div className="meta num">+998 •• ••• 45 67</div>
          <SmsBubble lang="KAA" text="Qanlıkól salı: shorlanıw qáwpi joqarı. Keyingi suwǵarıwda +25 mm qosıń." segInfo="74 / 140 — 2 SMS" status="Jiberildi" statusTone="ok" />
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 9, position: "relative" }}>
          <span style={{
            position: "absolute", top: -9, right: 12, background: "var(--ink)", color: "#fff",
            font: "700 10.5px var(--font-num)", letterSpacing: ".08em", borderRadius: 5, padding: "2px 8px",
          }}>TEST</span>
          <div className="cardrow">
            <b style={{ fontSize: 15, flex: 1 }}>Kegeyli paxta</b>
            <span className="meta num">Keshe 17:12</span>
          </div>
          <div className="meta num">+998 •• ••• 22 04</div>
          <SmsBubble lang="UZ" text="Kegeyli paxta: 12-iyun kuni sug'oring. 55 mm (550 m³/ga). Yomg'ir kutilmaydi." segInfo="76 / 140 — 2 SMS" status="Test-jurnal" statusTone="na" />
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div className="cardrow">
            <b style={{ fontSize: 15, flex: 1 }}>Shımbay biyday</b>
            <span className="meta num">8-iyun 06:40</span>
          </div>
          <div className="meta num">+998 •• ••• 90 31</div>
          <SmsBubble lang="KAA" text="Shımbay biyday: bárí jaqsı. Keyingi tekseriw 16-iyun." segInfo="52 / 70 — 1 SMS" status="Qáte → qayta jiberildi" statusTone="bad" />
        </div>
      </div>
      <TabBar active={2} />
    </div>
  );
}

/* ============ Settings ============ */
function ScrSettings() {
  const row = (label, right, sub) => (
    <div className="cardrow" style={{ minHeight: 48, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 600 }}>{label}</div>
        {sub ? <div className="meta">{sub}</div> : null}
      </div>
      {right}
    </div>
  );
  return (
    <div className="scr">
      <AppBar title="Sazlawlar" />
      <div className="scroll-body">
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3>Til</h3>
          {row("Qaraqalpaqsha", <Ic d={P.check} size={19} sw={2.6} color="var(--brand)" />)}
          <div className="divider"></div>
          {row(<span style={{ color: "var(--ink-2)", fontWeight: 500 }}>Oʻzbekcha</span>)}
          <div className="divider"></div>
          {row(<span style={{ color: "var(--ink-2)", fontWeight: 500 }}>Русский</span>)}
          <div className="divider"></div>
          {row(<span style={{ color: "var(--ink-2)", fontWeight: 500 }}>English</span>)}
        </div>

        <div className="card">
          <h3>Birlikler</h3>
          {row("Suwǵarıw muǵdarı", <div className="seg" style={{ width: 140 }}><span className="on num">mm</span><span className="num">m³/ga</span></div>, "Esabatta ekewi de kórsetiledi")}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3>Maǵlıwmat</h3>
          {row("Hawa rayı", <span className="meta num">búgin 06:40</span>)}
          <div className="divider"></div>
          {row("Satellit (Sentinel-2)", <span className="meta num">8-iyun</span>)}
          <div className="divider"></div>
          <span className="btn sec sm" style={{ margin: "8px 0 4px" }}><Ic d={P.refresh} size={16} sw={2} />Barlıq maǵlıwmattı jańalaw</span>
          {row("Kesh kólemi", <span className="meta num">4.2 MB</span>)}
          {row(<span style={{ color: "var(--bad)", fontWeight: 700 }}>Keshti tazalaw</span>)}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3>Haqqında</h3>
          {row("Versiya", <span className="meta num">0.9.2 (PWA)</span>)}
          <div className="divider"></div>
          {row("Metodika", <span className="meta">FAO-56</span>, "Open-Meteo · Sentinel-2 · SoilGrids")}
          <div className="divider"></div>
          {row("Baylanıs", <span className="meta">koop. agronom</span>)}
        </div>
      </div>
      <TabBar active={3} />
    </div>
  );
}

Object.assign(window, { ScrFieldsMap, ScrFieldsList, ScrWiz1, ScrWiz2, ScrWiz3, ScrMessages, ScrSettings });
