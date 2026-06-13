// AridSmart canvas — foundations board + core loop screens
// Onboarding · Home · Field Report · Salinity Detail

/* ============ Foundations board ============ */
function BoardFoundations() {
  const sw = (c, n, hex) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
      <span style={{ width: 64, height: 44, borderRadius: 9, background: c, border: "1px solid var(--line)" }}></span>
      <span style={{ font: "600 10.5px ui-monospace,monospace", color: "var(--ink-2)" }}>{n}</span>
      <span style={{ font: "500 10px ui-monospace,monospace", color: "var(--ink-3)" }}>{hex}</span>
    </div>
  );
  return (
    <div className="scr" style={{ padding: 22, gap: 20, background: "var(--surface)" }}>
      <div>
        <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)" }}>COLOR — WATER BLUE + FIXED STATUS SYSTEM</div>
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          {sw("var(--brand)", "brand", "#0e3a4d")}{sw("var(--accent)", "accent", "#16778f")}{sw("var(--bg)", "bg", "#f3f6f7")}{sw("var(--ink)", "ink", "#142830")}
          {sw("var(--ok)", "ok", "#18713f")}{sw("var(--warn)", "warn", "#8a5a05")}{sw("var(--bad)", "bad", "#ae2e21")}{sw("var(--na)", "no data", "#5b6b71")}
        </div>
      </div>
      <div className="divider"></div>
      <div>
        <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)" }}>TYPE — SPACE GROTESK (NUMBERS) + NOTO SANS (KAA TEXT)</div>
        <div className="big-num" style={{ marginTop: 12 }}>55 mm <span style={{ color: "var(--ink-3)", fontSize: 22, fontWeight: 500 }}>(550 m³/ga)</span></div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Suwǵarıw keńesi — Ǵárezsizlik atızı, Nókis</div>
        <div style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 4 }}>Tamır zonası 62% qurǵaǵan; 5 kún dawamında jawın kútilmeydi. Á ǵ ı ń ó ú sh belgileri tekserildi.</div>
        <div className="meta" style={{ marginTop: 4 }}>Caption 12.5px — Sentinel-2 · 8-iyun · FAO-56</div>
      </div>
      <div className="divider"></div>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        <div>
          <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)", marginBottom: 10 }}>STATUS PILLS — COLOR + ICON + WORD</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
            <Pill tone="ok">Jaqsı</Pill>
            <Pill tone="warn">Dıqqat — tez arada suwǵarıń</Pill>
            <Pill tone="bad">Qáwip — házir háreket etiń</Pill>
            <Pill tone="na">Maǵlıwmat joq</Pill>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)", marginBottom: 10 }}>BUTTONS · LANG SWITCHER (≥48PX TARGETS)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="btn pri" style={{ maxWidth: 260 }}>Atız qosıw</span>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="btn sec sm">SMS jiberiw</span>
              <span className="lang"><Ic d={P.globe} size={15} sw={1.5} />KAA</span>
              <span className="chip on-warn"><Ic d={P.alert} size={14} sw={2.2} />2 suwǵarıw</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Onboarding 0a — language ============ */
function ScrLang() {
  const langs = [["Qaraqalpaqsha", true], ["Oʻzbekcha", false], ["Русский", false], ["English", false]];
  return (
    <div className="scr">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ width: 64, height: 64, borderRadius: 18, background: "var(--brand)", color: "#7fc7da", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic d={P.drop} size={34} sw={2} />
          </span>
          <div style={{ font: "700 26px var(--font-num)", color: "var(--brand)" }}>AridSmart</div>
          <div style={{ fontSize: 15, color: "var(--ink-2)", textAlign: "center" }}>Tildi saylań · Tilni tanlang<br />Выберите язык · Choose language</div>
        </div>
        {langs.map(([l, on]) => (
          <div key={l} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            minHeight: 58, padding: "0 18px", borderRadius: 14, fontSize: 17.5, fontWeight: 700,
            background: "var(--surface)", color: on ? "var(--brand)" : "var(--ink)",
            border: on ? "2.5px solid var(--brand)" : "1.5px solid var(--line-strong)",
          }}>{l}{on ? <Ic d={P.check} size={20} sw={2.6} color="var(--brand)" /> : null}</div>
        ))}
      </div>
    </div>
  );
}

/* ============ Onboarding 0d — intro card 3 ============ */
function ScrIntro() {
  return (
    <div className="scr">
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 16px 0" }}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink-3)", padding: 10 }}>Ótkerip jiberiw</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px", gap: 22 }}>
        <div className="placeholder" style={{ height: 190 }}>illustration:<br />phone receiving SMS<br />(simple 2-color line art)</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.35 }}>Diyqan keńesti SMS arqalı aladı</div>
          <div style={{ fontSize: 15.5, color: "var(--ink-2)", marginTop: 8 }}>Ápiwayı telefon jeterli — internet kerek emes.</div>
        </div>
      </div>
      <div style={{ padding: "0 24px 28px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div className="dots"><i></i><i></i><i className="on"></i></div>
        <span className="btn pri">Birinshi atızdı qosıń</span>
      </div>
    </div>
  );
}

/* ============ Home / Dashboard ============ */
function ScrHome() {
  return (
    <div className="scr">
      <AppBar title="AridSmart" />
      <div className="scroll-body">
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>Saturday 27 June</div>
            <div className="meta">Nókis, Qaraqalpaqstan</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic d={P.sun} size={17} color="#c08a12" sw={1.6} /><b className="num" style={{ fontSize: 15 }}>34°</b></span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic d={P.drop} size={15} color="var(--accent)" sw={1.8} /><b className="num" style={{ fontSize: 15 }}>5%</b></span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic d={P.wind} size={16} color="var(--ink-3)" sw={1.8} /><b className="num" style={{ fontSize: 15 }}>6<span style={{ fontWeight: 500, fontSize: 11, color: "var(--ink-3)" }}> m/s</span></b></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, overflow: "hidden" }}>
          <span className="chip on-warn"><Ic d={P.drop} size={14} sw={2.2} />2 suwǵarıw kerek</span>
          <span className="chip on-bad"><Ic d={P.alert} size={14} sw={2.2} />1 qáwip</span>
          <span className="chip on-ok"><Ic d={P.check} size={14} sw={2.4} />1 jaqsı</span>
        </div>

        <FieldCard name="Kegeyli paxta" cropTint="#5a7d3a" metaLine="Paxta · 4.2 ga"
          irr="Suwǵarıń 12-iyun · 55 mm" irrTone="warn" sal="Shorlanıw: dıqqat" salTone="warn" time="Búgin 06:40" />
        <FieldCard name="Qanlıkól salı" cropTint="#1b7a6e" metaLine="Salı · 8.0 ga"
          irr="Suwǵarıń 11-iyun · 90 mm" irrTone="warn" sal="Shorlanıw: qáwip" salTone="bad" time="Búgin 06:40" />
        <FieldCard name="Shımbay biyday" cropTint="#a8762a" metaLine="Gúzgi biyday · 6.5 ga"
          irr="16-iyunǵa shekem kerek emes" irrTone="ok" sal="Shorlanıw: jaqsı" salTone="ok" time="Búgin 06:40" />
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ============ Field Report (core screen) ============ */
function ScrReport() {
  const days = [
    { w: "S", i: "sun", rain: "0", et0: "8.1" }, { w: "P", i: "sun", rain: "0", et0: "8.4" },
    { w: "J", i: "sun", rain: "0", et0: "8.6" }, { w: "Sh", i: "sun", rain: "0", et0: "8.2" },
    { w: "E", i: "cloud", rain: "0", et0: "7.4" }, { w: "D", i: "cloud", rain: "1", et0: "6.9" },
    { w: "S", i: "sun", rain: "0", et0: "7.8" },
  ];
  return (
    <div className="scr">
      <AppBar back menu title="Kegeyli paxta" sub="Paxta · egilgen 14-apr · 4.2 ga" />
      <div className="scroll-body">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="pill na" style={{ background: "var(--brand-soft)", color: "var(--brand)", borderColor: "#bdd6e0" }}>
            <Ic d={P.sprout} size={14} sw={2} />Ortańǵı dáwir
          </span>
          <span className="meta">vegetatsiya 57-kúni</span>
        </div>

        {/* hero recommendation */}
        <div className="card" style={{ background: "var(--warn-bg)", border: "1.5px solid var(--warn-line)", padding: "16px 16px 18px" }} data-screen-label="recommendation-hero">
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--warn)", fontWeight: 700, fontSize: 13.5 }}>
            <Ic d={P.drop} size={16} sw={2.2} />SUWǴARIW KEŃESI
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, marginTop: 10 }}>Juma, 12-iyun kúni suwǵarıń</div>
          <div className="big-num" style={{ margin: "6px 0 2px" }}>55 mm <span style={{ fontSize: 20, fontWeight: 500, color: "var(--ink-2)" }}>(550 m³/ga)</span></div>
          <div style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5 }}>
            Tamır zonası 62% qurǵaǵan; aldaǵı 5 kúnde jawın kútilmeydi.
          </div>
        </div>

        {/* water balance */}
        <div className="card">
          <h3>Suw balansı</h3>
          <Gauge pct={62} thresh={55} />
        </div>

        {/* 7-day strip */}
        <div className="card">
          <h3>7 kúnlik boljam <span style={{ float: "right", textTransform: "none", letterSpacing: 0, fontWeight: 600 }}>jawın / ET₀, mm</span></h3>
          <Strip7 days={days} hl={2} />
        </div>

        {/* salinity summary */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, flex: 1 }}>Shorlanıw</h3>
            <Pill tone="warn">Dıqqat</Pill>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
            <span className="mid-num">5.8 <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-3)" }}>dS/m</span></span>
            <span className="meta">paxta shegi: 7.7 dS/m</span>
          </div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 6 }}>Keyingi suwǵarıwda +15 mm qosıp, duzlardı juwıń.</div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <span className="btn ghost sm" style={{ paddingRight: 4 }}>Tolıq maǵlıwmat <Ic d={P.chev} size={15} sw={2.2} /></span>
          </div>
        </div>

        {/* NDVI */}
        <div className="card">
          <h3>Egin jaǵdayı (NDVI)</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
            <Spark pts={[0.31, 0.36, 0.42, 0.47, 0.52, 0.55, 0.61, 0.64]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, display: "flex", gap: 6, alignItems: "center" }}>
                <span className="num" style={{ color: "var(--ok)" }}>↗ 0.64</span> Normal
              </div>
              <div className="meta" style={{ marginTop: 2 }}>Bul dáwir ushın kútilgenge sáykes</div>
            </div>
          </div>
          <div className="meta" style={{ marginTop: 8 }}>Sentinel-2 · aqırǵı túsirim: 8-iyun</div>
        </div>

        {/* SMS preview */}
        <div className="card">
          <h3>SMS aldın ala kóriw</h3>
          <SmsBubble lang="KAA" text="Kegeyli paxta: suwǵarıń 12-iyun. 55 mm (550 m³/ga). Jawın kútilmeydi." segInfo="68 / 70 belgi — 1 SMS" />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <span className="btn pri sm" style={{ flex: 1 }}><Ic d={P.send} size={16} sw={2} />Házir jiberiw</span>
            <span className="btn sec sm" style={{ flex: 1 }}>Tariyx</span>
          </div>
        </div>

        <div className="meta" style={{ textAlign: "center", lineHeight: 1.6 }}>
          Hawa rayı: búgin 06:40 · Satellit: 8-iyun · Esaplaw: búgin 06:42
        </div>
      </div>
    </div>
  );
}

/* ============ Salinity Detail ============ */
function ScrSalinity() {
  const zones = [
    { w: 48, c: "var(--ok-bg)" }, { w: 27, c: "var(--warn-bg)" }, { w: 25, c: "var(--bad-bg)" },
  ];
  return (
    <div className="scr">
      <AppBar back title="Shorlanıw" sub="Kegeyli paxta" />
      <div className="scroll-body">
        <div className="card" style={{ background: "var(--warn-bg)", border: "1.5px solid var(--warn-line)" }}>
          <Pill tone="warn">Dıqqat</Pill>
          <div className="big-num" style={{ marginTop: 10 }}>5.8 <span style={{ fontSize: 19, fontWeight: 500, color: "var(--ink-2)" }}>dS/m (ECe, baha)</span></div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 6 }}>Topıraq sho'rlanıwı paxta shegine jaqınlap kiyatır.</div>
        </div>

        {/* tolerance scale */}
        <div className="card">
          <h3>Paxta shıdamlılıq shkalası</h3>
          <div style={{ position: "relative", margin: "30px 4px 4px" }}>
            <div style={{ display: "flex", height: 18, borderRadius: 9, overflow: "hidden", border: "1px solid var(--line)" }}>
              {zones.map((z, i) => <span key={i} style={{ width: z.w + "%", background: z.c }}></span>)}
            </div>
            {/* field marker */}
            <div style={{ position: "absolute", left: "36%", top: -26, transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ font: "700 12px var(--font-num)", color: "var(--warn)", whiteSpace: "nowrap" }}>bul atız 5.8</div>
              <div style={{ width: 0, height: 0, margin: "1px auto 0", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid var(--warn)" }}></div>
            </div>
            {/* threshold marker */}
            <div style={{ position: "absolute", left: "48%", top: -4, bottom: -4, width: 3, background: "var(--ink)", borderRadius: 2 }}></div>
            <div style={{ position: "absolute", left: "48%", top: 22, transform: "translateX(-50%)", font: "600 11.5px var(--font-ui)", color: "var(--ink-2)", whiteSpace: "nowrap" }}>paxta shegi 7.7</div>
            <div className="gauge-labels num" style={{ marginTop: 26 }}><span>0</span><span>8</span><span>16 dS/m</span></div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }} className="meta">
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--ok-bg)", border: "1px solid var(--ok-line)" }}></i>qáwipsiz</span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--warn-bg)", border: "1px solid var(--warn-line)" }}></i>zúráát joǵaltıw</span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--bad-bg)", border: "1px solid var(--bad-line)" }}></i>awır</span>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="mid-num" style={{ color: "var(--warn)" }}>~8%</span>
          <span style={{ fontSize: 14.5, color: "var(--ink-2)" }}>Usı shorlanıwda kútiletuǵın zúráát joǵaltıwı</span>
        </div>

        {/* leaching advice */}
        <div className="card" style={{ borderColor: "var(--warn-line)" }}>
          <h3 style={{ color: "var(--warn)" }}>Juwıw keńesi</h3>
          <div style={{ fontSize: 15.5, lineHeight: 1.5 }}>
            Keyingi suwǵarıwda <b className="num" style={{ fontSize: 18 }}>+15 mm</b> artıq beriń — duzlar tamır zonasınan tómenge juwıladı.
          </div>
          <div className="meta" style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
            <Ic d={P.alert} size={13} sw={2.2} />Drenaj islemese, artıq suw shorlanıwdı kúsheytiwi múmkin.
          </div>
        </div>

        {/* trend */}
        <div className="card">
          <h3>Mawsim trendi (ECe, dS/m)</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
            <Spark pts={[4.1, 4.3, 4.6, 5.0, 5.4, 5.8]} w={170} h={44} color="var(--warn)" />
            <div className="meta" style={{ flex: 1 }}>Yanvar → iyun<br />ay sayın bir baha</div>
          </div>
        </div>

        {/* how we know */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, flex: 1 }}>Bul san qayerden alınadı?</span>
          <Ic d={P.chev} size={17} color="var(--ink-3)" extra={null} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BoardFoundations, ScrLang, ScrIntro, ScrHome, ScrReport, ScrSalinity });
