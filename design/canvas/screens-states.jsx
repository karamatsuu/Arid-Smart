// AridSmart canvas — system states + overlays

/* ============ Home: empty state ============ */
function ScrHomeEmpty() {
  return (
    <div className="scr">
      <AppBar title="AridSmart" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", gap: 18, textAlign: "center" }}>
        <div className="placeholder" style={{ width: 150, height: 120 }}>illustration:<br />empty field + pin</div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>Atızlar ele joq</div>
          <div style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 6 }}>Birinshi atızdı qosıń — keńesler avtomat esaplanadı.</div>
        </div>
        <span className="btn pri" style={{ maxWidth: 240 }}><Ic d={P.plus} size={18} sw={2.4} />Atız qosıw</span>
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ============ Home: loading skeleton ============ */
function ScrHomeLoading() {
  const skelCard = (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="cardrow">
        <span className="skel" style={{ width: 40, height: 40, borderRadius: 11 }}></span>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="skel" style={{ width: "55%", height: 14 }}></span>
          <span className="skel" style={{ width: "35%", height: 11 }}></span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span className="skel" style={{ width: 130, height: 26, borderRadius: 999 }}></span>
        <span className="skel" style={{ width: 100, height: 26, borderRadius: 999 }}></span>
      </div>
    </div>
  );
  return (
    <div className="scr">
      <AppBar title="AridSmart" />
      <div className="scroll-body">
        <span className="skel" style={{ height: 58, borderRadius: 12 }}></span>
        <div style={{ display: "flex", gap: 7 }}>
          <span className="skel" style={{ width: 140, height: 40, borderRadius: 999 }}></span>
          <span className="skel" style={{ width: 90, height: 40, borderRadius: 999 }}></span>
        </div>
        {skelCard}{skelCard}{skelCard}
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ============ Home: offline / stale cache ============ */
function ScrHomeOffline() {
  return (
    <div className="scr">
      <AppBar title="AridSmart" />
      <OfflineBanner />
      <div className="scroll-body">
        <div style={{ display: "flex", gap: 7 }}>
          <span className="chip on-warn"><Ic d={P.drop} size={14} sw={2.2} />2 suwǵarıw kerek</span>
          <span className="chip on-ok"><Ic d={P.check} size={14} sw={2.4} />1 jaqsı</span>
        </div>
        <FieldCard name="Kegeyli paxta" cropTint="#5a7d3a" metaLine="Paxta · 4.2 ga"
          irr="Suwǵarıń 12-iyun · 55 mm" irrTone="warn" sal="Shorlanıw: dıqqat" salTone="warn" time="9-iyun 18:05" stale />
        <FieldCard name="Shımbay biyday" cropTint="#a8762a" metaLine="Gúzgi biyday · 6.5 ga"
          irr="16-iyunǵa shekem kerek emes" irrTone="ok" sal="Shorlanıw: jaqsı" salTone="ok" time="9-iyun 18:05" stale />
        {/* no-cache variant */}
        <div className="card" style={{ textAlign: "center", padding: "20px 16px", borderStyle: "dashed" }}>
          <div style={{ display: "flex", justifyContent: "center", color: "var(--ink-3)" }}><Ic d={P.wifi_off} size={26} sw={1.6} /></div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", margin: "8px 0 12px" }}>Serverge jetip bolmadı — baylanıstı tekseriń.<br /><span className="meta">(kesh joq bolǵanda kórsetiledi)</span></div>
          <span className="btn sec sm" style={{ margin: "0 auto", width: 160 }}><Ic d={P.refresh} size={15} sw={2} />Qaytalaw</span>
        </div>
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ============ Overlays board: toast · confirm · PWA hint · boot error ============ */
function BoardOverlays() {
  return (
    <div className="scr" style={{ background: "var(--bg)", padding: 22, gap: 24, flexDirection: "row", flexWrap: "wrap", display: "flex", alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 300 }}>
        <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)" }}>TOASTS</div>
        <span className="toast"><Ic d={P.check} size={16} sw={2.6} color="#7ed09c" />Atız saqlandı</span>
        <span className="toast"><Ic d={P.check} size={16} sw={2.6} color="#7ed09c" />Test SMS jurnalǵa jazıldı</span>
        <span className="toast" style={{ alignItems: "flex-start" }}><Ic d={P.wifi_off} size={16} sw={2} color="#f2c66e" /><span>Usı qurılmada saqlandı — internet payda bolǵanda sinxronlanadı</span></span>

        <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)", marginTop: 14 }}>PWA INSTALL HINT (DISMISSIBLE)</div>
        <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", borderColor: "#c8dde6", background: "var(--brand-soft)" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand)", color: "#7fc7da", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ic d={P.drop} size={21} sw={2} /></span>
          <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.4 }}><b>AridSmart-tı bas ekranǵa qosıń</b><br /><span className="meta">Oflayn da isleydi</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="btn pri sm" style={{ minHeight: 38, fontSize: 13.5 }}>Ornatıw</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", textAlign: "center" }}>Keyin</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 300 }}>
        <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)" }}>CONFIRM DIALOG (DELETE / CLEAR CACHE)</div>
        <div className="card" style={{ padding: 18, boxShadow: "0 12px 40px rgba(14,58,77,.25)" }}>
          <div style={{ fontSize: 17.5, fontWeight: 700 }}>Atızdı óshiriw?</div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", margin: "8px 0 16px" }}>«Kegeyli paxta» hám onıń SMS tariyxı qaytarılmaytuǵın óshiriledi.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="btn sec sm" style={{ flex: 1 }}>Biykarlaw</span>
            <span className="btn danger sm" style={{ flex: 1 }}>Óshiriw</span>
          </div>
        </div>

        <div style={{ font: "700 12px ui-monospace,monospace", letterSpacing: ".08em", color: "var(--ink-3)", marginTop: 14 }}>BOOT ERROR FALLBACK</div>
        <div className="card" style={{ textAlign: "center", padding: "26px 18px" }}>
          <span style={{ width: 52, height: 52, borderRadius: 15, background: "var(--brand)", color: "#7fc7da", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ic d={P.drop} size={27} sw={2} /></span>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>Bir nárse qáte ketti</div>
          <div style={{ fontSize: 14, color: "var(--ink-2)", margin: "6px 0 14px" }}>Betti qayta júklep kóriń.</div>
          <span className="btn pri sm" style={{ margin: "0 auto", width: 170 }}><Ic d={P.refresh} size={15} sw={2} />Qayta júklew</span>
        </div>
      </div>
    </div>
  );
}

/* ============ Salinity: no-data state ============ */
function ScrSalinityNoData() {
  return (
    <div className="scr">
      <AppBar back title="Shorlanıw" sub="Taxtakópir mákke" />
      <div className="scroll-body">
        <div className="card" style={{ borderColor: "var(--na-line)", background: "var(--na-bg)" }}>
          <Pill tone="na">Maǵlıwmat joq</Pill>
          <div style={{ fontSize: 15.5, lineHeight: 1.55, marginTop: 10 }}>
            Bul atız ushın satellit maǵlıwmatları ele jetkiliksiz.
          </div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 6 }}>
            Birinshi baha: <b className="num" style={{ color: "var(--ink)" }}>≈ 24-iyun</b> (eki ashıq túsirimnen keyin)
          </div>
        </div>
        <div className="card">
          <h3>Sol waqıtqa shekem</h3>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            Suwǵarıw keńesleri ádettegidey isleydi — olar hawa rayı hám topıraq kartasına tiykarlanǵan.
          </div>
        </div>
        <span className="skel" style={{ height: 90, borderRadius: 12, opacity: .55 }}></span>
        <span className="skel" style={{ height: 60, borderRadius: 12, opacity: .35 }}></span>
      </div>
    </div>
  );
}

Object.assign(window, { ScrHomeEmpty, ScrHomeLoading, ScrHomeOffline, BoardOverlays, ScrSalinityNoData });
