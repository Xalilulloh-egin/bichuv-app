import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const ALL_SIZES = {
  harf: ["XS","S","M","L","XL","XXL","XXXL","3XL","4XL","5XL"],
  son: ["40","42","44","46","48","50","52","54","56","58","60","62","64","66","68","70"],
  bola: ["72","76","80","84","128","130","134","140","146","152","158","164"],
};

const DEMO_DATA = [
  { id:"B26-146", name:"BIG FAMILY - Свитшот детский 27G-0704", color:"Бежевый", orderQty:1000, mavjudKg:191,
    partiyalar:[
      { partiya:"P-001", sana:"2026-06-28", bichildiKg:95, topBoshi:2.5, otxod:4.1, tozaBichilgan:88.4, dona:480 },
      { partiya:"P-002", sana:"2026-06-30", bichildiKg:90, topBoshi:1.8, otxod:3.2, tozaBichilgan:85, dona:460 },
    ], sizes:{ group:"bola", active:["128","134","140","152"], reja:{"128":250,"134":280,"140":260,"152":150}, fakt:{"128":240,"134":270,"140":250,"152":0} }},
  { id:"B26-147", name:"BIG FAMILY - Свитшот детский 27G-0704", color:"Бордовый", orderQty:800, mavjudKg:185,
    partiyalar:[
      { partiya:"P-003", sana:"2026-07-01", bichildiKg:80, topBoshi:2.0, otxod:3.5, tozaBichilgan:74.5, dona:390 },
    ], sizes:{ group:"bola", active:["128","134","140","152"], reja:{"128":200,"134":220,"140":200,"152":180}, fakt:{"128":195,"134":195,"140":0,"152":0} }},
  { id:"B26-153", name:"BIG FAMILY - Лонгслив 27М-0092", color:"Графит серый", orderQty:2480, mavjudKg:896,
    partiyalar:[
      { partiya:"P-010", sana:"2026-07-01", bichildiKg:200, topBoshi:5.0, otxod:8.5, tozaBichilgan:186.5, dona:550 },
      { partiya:"P-011", sana:"2026-07-03", bichildiKg:250, topBoshi:4.2, otxod:10.1, tozaBichilgan:235.7, dona:700 },
    ], sizes:{ group:"harf", active:["M","L","XL","XXL","XXXL"], reja:{"M":400,"L":600,"XL":550,"XXL":480,"XXXL":450}, fakt:{"M":200,"L":350,"XL":300,"XXL":150,"XXXL":0} }},
  { id:"B26-163", name:"BIG FAMILY - Свитшот женский 27W-1305", color:"Коричневый", orderQty:25000, mavjudKg:5534,
    partiyalar:[], sizes:null },
  { id:"B26-165", name:"BIG FAMILY - Свитшот женский 27W-1305", color:"ЧЕРНЫЙ", orderQty:17000, mavjudKg:8455,
    partiyalar:[
      { partiya:"P-020", sana:"2026-07-04", bichildiKg:500, topBoshi:12, otxod:22, tozaBichilgan:466, dona:1200 },
    ], sizes:{ group:"harf", active:["S","M","L","XL","XXL"], reja:{"S":2000,"M":4000,"L":5000,"XL":3500,"XXL":2500}, fakt:{"S":300,"M":450,"L":350,"XL":100,"XXL":0} }},
  { id:"B26-179", name:"ТРИ ПУТИ - ФУТБОЛКА ОВЕРЗАЙЗ RD 250г", color:"ЧЕРНЫЙ", orderQty:1500, mavjudKg:619,
    partiyalar:[], sizes:null },
  { id:"B26-187", name:"ТРИ ПУТИ ЭКЗОСТ - ФУТБОЛКА 200Г", color:"ЧЕРНЫЙ", orderQty:5400, mavjudKg:1555,
    partiyalar:[
      { partiya:"P-030", sana:"2026-07-02", bichildiKg:400, topBoshi:8, otxod:15, tozaBichilgan:377, dona:1300 },
      { partiya:"P-031", sana:"2026-07-04", bichildiKg:350, topBoshi:7, otxod:14, tozaBichilgan:329, dona:1100 },
      { partiya:"P-032", sana:"2026-07-05", bichildiKg:300, topBoshi:6, otxod:12, tozaBichilgan:282, dona:950 },
    ], sizes:{ group:"harf", active:["M","L","XL","XXL"], reja:{"M":1200,"L":1800,"XL":1500,"XXL":900}, fakt:{"M":800,"L":1100,"XL":900,"XXL":550} }},
  { id:"B26-190", name:"ТРИ ПУТИ - ФУТБОЛКА 180Г ОВЕРСАЙЗ", color:"ЧЕРНЫЙ", orderQty:11000, mavjudKg:3000,
    partiyalar:[], sizes:null },
  { id:"B26-191", name:"ТРИ ПУТИ - ФУТБОЛКА 180Г ОВЕРСАЙЗ", color:"БЕЛЫЙ", orderQty:13000, mavjudKg:3508,
    partiyalar:[], sizes:null },
  { id:"B26-192", name:"ТРИ ПУТИ - ФУТБОЛКА 180Г БАЗОВЫЙ", color:"ЧЕРНЫЙ", orderQty:5400, mavjudKg:902,
    partiyalar:[], sizes:null },
  { id:"B26-198", name:"ТРИ ПУТИ ЭКЗОСТ - ФУТБОЛКА 200Г", color:"ЧЕРНЫЙ", orderQty:9000, mavjudKg:2116,
    partiyalar:[], sizes:null },
];

const emptyP = () => ({ partiya:"", sana:new Date().toISOString().slice(0,10), bichildiKg:"", topBoshi:"", otxod:"", tozaBichilgan:"", dona:"" });

// Number input that ignores scroll
function NumInput({ style, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    return () => el.removeEventListener("wheel", prevent);
  }, []);
  return <input ref={ref} type="number" {...props} style={style} />;
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [view, setView] = useState("list");
  const [allData, setAllData] = useState([]);
  const [connected, setConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [scriptUrl, setScriptUrl] = useState("https://script.google.com/macros/s/AKfycbwWmSTnjJ_oAsi9ITCzLw9BTLAqJsT3YQIYX2JzVWGs2IXQ1oWbuqJcHofJQCybcQ5I/exec");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [pForm, setPForm] = useState(emptyP());
  const [editIdx, setEditIdx] = useState(null);
  const [activeSizes, setActiveSizes] = useState([]);
  const [reja, setReja] = useState({});
  const [fakt, setFakt] = useState({});
  const [saving, setSaving] = useState(false);
  const [dashFilter, setDashFilter] = useState("all");
  const [hisobotTab, setHisobotTab] = useState("trim");
  const [sortCol, setSortCol] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  // Load
  const load = useCallback(async () => {
    if (demoMode) { setAllData(JSON.parse(JSON.stringify(DEMO_DATA))); setConnected(true); setLoading(false); return; }
    if (!scriptUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`${scriptUrl}?action=getAllData`);
      const d = await res.json();
      if (d.status === "ok" && d.data) {
        setAllData(d.data);
        setConnected(true);
        flash("Sheets dan yuklandi ✓");
      } else { flash("Xatolik: " + (d.message || "Ma'lumot kelmadi")); }
    } catch (e) { console.error(e); flash("Ulanish xatosi — URL ni tekshiring"); }
    setLoading(false);
  }, [demoMode, scriptUrl]);

  useEffect(() => { if (connected || demoMode) load(); }, [connected, demoMode]);

  // Stats
  const umumiy = useMemo(() => {
    const r = { trimkartaSoni:allData.length, jamiZakaz:0, jamiMavjud:0, jamiBichildi:0, jamiTopBoshi:0, jamiOtxod:0, jamiToza:0, jamiDona:0, jamiPartiya:0, jamiRejaD:0, jamiFaktD:0, activeCount:0, waitingCount:0 };
    allData.forEach(t => {
      r.jamiZakaz += t.orderQty || 0;
      r.jamiMavjud += t.mavjudKg || 0;
      const parts = t.partiyalar || [];
      r.jamiPartiya += parts.length;
      if (parts.length > 0) r.activeCount++; else r.waitingCount++;
      parts.forEach(p => { r.jamiBichildi += p.bichildiKg||0; r.jamiTopBoshi += p.topBoshi||0; r.jamiOtxod += p.otxod||0; r.jamiToza += p.tozaBichilgan||0; r.jamiDona += p.dona||0; });
      if (t.sizes) {
        (t.sizes.active||[]).forEach(sz => { r.jamiRejaD += Number(t.sizes.reja?.[sz])||0; r.jamiFaktD += Number(t.sizes.fakt?.[sz])||0; });
      }
    });
    r.qolganKg = r.jamiMavjud - r.jamiBichildi;
    r.otxodPct = r.jamiBichildi > 0 ? ((r.jamiOtxod / r.jamiBichildi)*100).toFixed(1) : "0";
    r.topBoshiPct = r.jamiBichildi > 0 ? ((r.jamiTopBoshi / r.jamiBichildi)*100).toFixed(1) : "0";
    r.bichilganPct = r.jamiZakaz > 0 ? ((r.jamiDona / r.jamiZakaz)*100).toFixed(1) : "0";
    r.farqDona = r.jamiRejaD - r.jamiFaktD;
    return r;
  }, [allData]);

  const trimStats = useMemo(() => {
    return allData.map(t => {
      const parts = t.partiyalar || [];
      const st = { bichildi:0, topBoshi:0, otxod:0, toza:0, dona:0 };
      parts.forEach(p => { st.bichildi+=p.bichildiKg||0; st.topBoshi+=p.topBoshi||0; st.otxod+=p.otxod||0; st.toza+=p.tozaBichilgan||0; st.dona+=p.dona||0; });
      st.qolgan = (t.mavjudKg||0) - st.bichildi;
      st.partCount = parts.length;
      st.status = parts.length > 0 ? "active" : "waiting";
      return { ...t, st };
    });
  }, [allData]);

  const openTrim = (item) => {
    setSelected(item);
    setPForm(emptyP());
    setEditIdx(null);
    if (item.sizes) {
      setActiveSizes(item.sizes.active || []);
      setReja(item.sizes.reja || {});
      setFakt(item.sizes.fakt || {});
    } else { setActiveSizes([]); setReja({}); setFakt({}); }
    setView("detail");
    setTab("trim");
  };

  // Partiya
  const addPartiya = async () => {
    if (!pForm.partiya) { flash("Partiya № kiriting"); return; }
    setSaving(true);
    const p = { ...pForm, bichildiKg:+pForm.bichildiKg||0, topBoshi:+pForm.topBoshi||0, otxod:+pForm.otxod||0, tozaBichilgan:+pForm.tozaBichilgan||0, dona:+pForm.dona||0 };
    if (!demoMode && scriptUrl) {
      try {
        const payload = { action:"savePartiya", trimId:selected.id, mahsulot:selected.name, rangi:selected.color, ...p };
        if (editIdx !== null && selected.partiyalar?.[editIdx]?.rowIndex) payload.rowIndex = selected.partiyalar[editIdx].rowIndex;
        await fetch(scriptUrl, { method:"POST", body:JSON.stringify(payload) });
      } catch(e) { console.error(e); }
    }
    setAllData(prev => prev.map(t => {
      if (t.id !== selected.id) return t;
      const parts = [...(t.partiyalar||[])];
      if (editIdx !== null) parts[editIdx] = p; else parts.push(p);
      const updated = { ...t, partiyalar: parts };
      setSelected(updated);
      return updated;
    }));
    setPForm(emptyP()); setEditIdx(null); setView("detail"); setSaving(false);
    flash(editIdx !== null ? "Saqlandi ✓" : "Qo'shildi ✓");
    if (!demoMode && scriptUrl) setTimeout(() => load(), 1000);
  };

  const delPartiya = async (idx) => {
    const p = selected?.partiyalar?.[idx];
    if (!demoMode && scriptUrl && p?.rowIndex) {
      try { await fetch(scriptUrl, { method:"POST", body:JSON.stringify({ action:"deletePartiya", rowIndex:p.rowIndex }) }); } catch(e) { console.error(e); }
    }
    setAllData(prev => prev.map(t => {
      if (t.id !== selected.id) return t;
      const parts = (t.partiyalar||[]).filter((_,i) => i !== idx);
      const updated = { ...t, partiyalar: parts };
      setSelected(updated);
      return updated;
    }));
    flash("O'chirildi ✓");
    if (!demoMode && scriptUrl) setTimeout(() => load(), 1000);
  };

  // Save only FAKT (reja is read-only from Sheets)
  const saveFakt = async () => {
    setSaving(true);
    const payload = { action:"saveFaktRazmer", trimId:selected.id, sizes:activeSizes, fakt };
    if (!demoMode && scriptUrl) {
      try { await fetch(scriptUrl, { method:"POST", body:JSON.stringify(payload) }); } catch(e) { console.error(e); }
    }
    setAllData(prev => prev.map(t => {
      if (t.id !== selected.id) return t;
      const oldSizes = t.sizes || { group:"harf", active:[], reja:{} };
      return { ...t, sizes: { ...oldSizes, active: activeSizes, fakt } };
    }));
    setSaving(false);
    flash("Fakt saqlandi ✓");
  };

  // Auto toza
  useEffect(() => {
    const b = +pForm.bichildiKg||0, t = +pForm.topBoshi||0, o = +pForm.otxod||0;
    if (b > 0) setPForm(prev => ({ ...prev, tozaBichilgan: (b - t - o).toFixed(1) }));
  }, [pForm.bichildiKg, pForm.topBoshi, pForm.otxod]);

  const curParts = selected?.partiyalar || [];
  const curStats = useMemo(() => {
    const st = { bichildi:0, topBoshi:0, otxod:0, toza:0, dona:0 };
    curParts.forEach(p => { st.bichildi+=p.bichildiKg||0; st.topBoshi+=p.topBoshi||0; st.otxod+=p.otxod||0; st.toza+=p.tozaBichilgan||0; st.dona+=p.dona||0; });
    st.qolgan = (selected?.mavjudKg||0) - st.bichildi;
    return st;
  }, [curParts, selected]);

  const totalReja = activeSizes.reduce((s, sz) => s + (+reja[sz]||0), 0);
  const totalFakt = activeSizes.reduce((s, sz) => s + (+fakt[sz]||0), 0);

  const filteredTrims = trimStats.filter(t => {
    if (dashFilter === "active" && t.st.status !== "active") return false;
    if (dashFilter === "waiting" && t.st.status !== "waiting") return false;
    if (search && !(t.id+t.name+t.color).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allPartiyalar = useMemo(() => {
    const list = [];
    allData.forEach(t => { (t.partiyalar||[]).forEach(p => { list.push({ ...p, trimId:t.id, trimName:t.name, color:t.color, orderQty:t.orderQty, mavjudKg:t.mavjudKg }); }); });
    return list.sort((a, b) => (a.sana||"").localeCompare(b.sana||"")).reverse();
  }, [allData]);

  const sortedTrims = useMemo(() => {
    const arr = [...trimStats];
    arr.sort((a, b) => {
      let va, vb;
      switch(sortCol) {
        case "id": va=a.id; vb=b.id; break;
        case "zakaz": va=a.orderQty; vb=b.orderQty; break;
        case "mavjud": va=a.mavjudKg||0; vb=b.mavjudKg||0; break;
        case "bichildi": va=a.st.bichildi; vb=b.st.bichildi; break;
        case "qolgan": va=a.st.qolgan; vb=b.st.qolgan; break;
        case "topBoshi": va=a.st.topBoshi; vb=b.st.topBoshi; break;
        case "otxod": va=a.st.otxod; vb=b.st.otxod; break;
        case "dona": va=a.st.dona; vb=b.st.dona; break;
        default: va=a.id; vb=b.id;
      }
      if (typeof va === "string") return sortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);
      return sortDir==="asc"?va-vb:vb-va;
    });
    return arr;
  }, [trimStats, sortCol, sortDir]);

  const toggleSort = (col) => { if (sortCol===col) setSortDir(d => d==="asc"?"desc":"asc"); else { setSortCol(col); setSortDir("asc"); } };
  const sortIcon = (col) => sortCol===col ? (sortDir==="asc"?" ↑":" ↓") : "";

  // ==================== VIEWS ====================

  // --- Settings ---
  if (view === "settings") return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <Hdr left={<Back onClick={() => setView("list")} />} title="Sozlamalar" />
      <div style={S.card}>
        <Lbl>Apps Script URL</Lbl>
        <input style={S.inp} value={scriptUrl} onChange={e => setScriptUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." />
        <p style={S.hint}>1. "Бичув база" → Extensions → Apps Script<br/>2. Kodni joylashtiring → Deploy → Web app<br/>3. URL ni shu yerga kiriting</p>
        <div style={{ display:"flex", gap:8, marginTop:16 }}>
          <Btn primary flex onClick={() => { setDemoMode(false); setConnected(true); setView("list"); setTab("dashboard"); load(); }} disabled={!scriptUrl||loading}>
            {loading ? "Yuklanmoqda..." : "Ulanish"}
          </Btn>
          <Btn flex onClick={() => { setDemoMode(true); setConnected(true); setView("list"); setTab("dashboard"); }}>Demo</Btn>
        </div>
        {connected && !demoMode && <Btn full style={{marginTop:12}} onClick={load}>🔄 Qayta yuklash</Btn>}
      </div>
    </Shell>
  );

  // --- Add/Edit Partiya ---
  if (view === "addPartiya" && selected) return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <Hdr left={<Back onClick={() => { setView("detail"); setEditIdx(null); setPForm(emptyP()); }} />} title={editIdx !== null ? "Tahrirlash" : "Yangi partiya"} />
      <div style={S.infoMini}><span style={S.miniId}>{selected.id}</span><span style={S.miniClr}>{selected.color}</span></div>
      <div style={S.card}>
        <Row>
          <Half><Lbl>Partiya №</Lbl><input style={S.inp} value={pForm.partiya} onChange={e => setPForm(p=>({...p,partiya:e.target.value}))} placeholder="P-001" /></Half>
          <Half><Lbl>Sana</Lbl><input style={S.inp} type="date" value={pForm.sana} onChange={e => setPForm(p=>({...p,sana:e.target.value}))} /></Half>
        </Row>
        <Row>
          <Half><Lbl>Bichildi кг</Lbl><NumInput style={{...S.inp,...S.inpN}} inputMode="decimal" value={pForm.bichildiKg} placeholder="0" onChange={e => setPForm(p=>({...p,bichildiKg:e.target.value}))} /></Half>
          <Half><Lbl>Топ боши кг</Lbl><NumInput style={{...S.inp,...S.inpN}} inputMode="decimal" value={pForm.topBoshi} placeholder="0" onChange={e => setPForm(p=>({...p,topBoshi:e.target.value}))} /></Half>
        </Row>
        <Row>
          <Half><Lbl>Отход кг</Lbl><NumInput style={{...S.inp,...S.inpN}} inputMode="decimal" value={pForm.otxod} placeholder="0" onChange={e => setPForm(p=>({...p,otxod:e.target.value}))} /></Half>
          <Half><Lbl>Тоза бичилган кг</Lbl><input style={{...S.inp, background:"#f0fdf4", fontWeight:700, borderColor:"#86efac"}} value={pForm.tozaBichilgan} readOnly /></Half>
        </Row>
        <Row>
          <Half><Lbl>Бичилди дона</Lbl><NumInput style={{...S.inp,...S.inpN, borderColor:"#a78bfa", background:"#faf5ff"}} inputMode="numeric" value={pForm.dona} placeholder="0" onChange={e => setPForm(p=>({...p,dona:e.target.value}))} /></Half>
        </Row>
        <Btn primary full style={{marginTop:18}} onClick={addPartiya} disabled={saving}>{saving ? "Saqlanmoqda..." : editIdx !== null ? "Saqlash" : "Qo'shish"}</Btn>
      </div>
    </Shell>
  );

  // --- RAZMER (Reja: read-only | Fakt: editable) ---
  if (view === "razmer" && selected) {
    const hasReja = activeSizes.length > 0 && activeSizes.some(sz => +reja[sz] > 0);
    return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <Hdr left={<Back onClick={() => setView("detail")} />} title="Razmerlar" />
      <div style={S.infoMini}><span style={S.miniId}>{selected.id}</span><span style={S.miniClr}>{selected.color} — Zakaz: {selected.orderQty?.toLocaleString()}</span></div>

      {/* Reja bo'lmasa xabar */}
      {!hasReja && (
        <div style={{...S.card, background:"#fef3c7", borderColor:"#fde68a", textAlign:"center", padding:20}}>
          <div style={{fontSize:28, marginBottom:8}}>📋</div>
          <div style={{fontSize:14, fontWeight:600, color:"#92400e", marginBottom:4}}>Reja topilmadi</div>
          <div style={{fontSize:12, color:"#a16207"}}>Google Sheets dagi "Razmerlar rejasi" varag'iga bu trimkarta uchun razmerlar kiriting.</div>
        </div>
      )}

      {hasReja && (<>
        {/* Reja + Fakt + Farq jadvali */}
        <Lbl style={{marginTop:12}}>Razmer bo'yicha reja va fakt</Lbl>
        <div style={{...S.card, padding:0, overflow:"hidden"}}>
          <table style={S.tbl}><thead><tr>
            <th style={{...S.th,textAlign:"left",paddingLeft:14}}>Razmer</th>
            <th style={{...S.th,color:"#64748b",background:"#f1f5f9"}}>📋 Reja</th>
            <th style={{...S.th,color:"#16a34a"}}>✅ Fakt</th>
            <th style={S.th}>Farq</th>
            <th style={S.th}>%</th>
          </tr></thead><tbody>
            {activeSizes.map(sz => {
              const r = +reja[sz]||0, f = +fakt[sz]||0, d = r - f;
              const pct = r > 0 ? ((f/r)*100).toFixed(0) : "—";
              return (<tr key={sz}>
                <td style={{...S.td,fontWeight:700,paddingLeft:14,fontSize:15}}>{sz}</td>
                <td style={{...S.td,textAlign:"center",color:"#475569",background:"#f8fafc",fontWeight:500}}>{r > 0 ? r.toLocaleString() : "—"}</td>
                <td style={{...S.td,textAlign:"center",padding:"4px 2px"}}>
                  <NumInput
                    style={{...S.inp,...S.inpN,maxWidth:80,margin:"0 auto",fontSize:15,borderColor:"#86efac",background:f>0?"#f0fdf4":"#fff",color:"#166534"}}
                    inputMode="numeric"
                    value={fakt[sz]||""}
                    placeholder="0"
                    onChange={e => setFakt(p => ({...p, [sz]: e.target.value}))}
                  />
                </td>
                <td style={{...S.td,textAlign:"center",fontWeight:700,fontSize:14,
                  color: d>0?"#dc2626":d<0?"#16a34a":"#94a3b8"
                }}>{d > 0 ? `−${d.toLocaleString()}` : d < 0 ? `+${Math.abs(d).toLocaleString()}` : "✓"}</td>
                <td style={{...S.td,textAlign:"center"}}>
                  {r > 0 ? <span style={{
                    padding:"2px 6px",borderRadius:6,fontSize:10,fontWeight:600,
                    background:+pct>=100?"#dcfce7":+pct>=50?"#fef9c3":"#fee2e2",
                    color:+pct>=100?"#166534":+pct>=50?"#854d0e":"#991b1b"
                  }}>{pct}%</span> : "—"}
                </td>
              </tr>);
            })}
          </tbody><tfoot><tr style={{borderTop:"2px solid #e2e8f0",background:"#f8fafc"}}>
            <td style={{...S.td,fontWeight:800,paddingLeft:14}}>Jami</td>
            <td style={{...S.td,textAlign:"center",fontWeight:700,color:"#475569"}}>{totalReja.toLocaleString()}</td>
            <td style={{...S.td,textAlign:"center",fontWeight:700,color:"#16a34a"}}>{totalFakt.toLocaleString()}</td>
            <td style={{...S.td,textAlign:"center",fontWeight:800,fontSize:14,
              color:(totalReja-totalFakt)>0?"#dc2626":"#16a34a"
            }}>{(totalReja-totalFakt)>0?`−${(totalReja-totalFakt).toLocaleString()}`:(totalReja-totalFakt)<0?`+${Math.abs(totalReja-totalFakt).toLocaleString()}`:"✓"}</td>
            <td style={{...S.td,textAlign:"center",fontWeight:600,fontSize:11}}>
              {totalReja>0?((totalFakt/totalReja)*100).toFixed(0)+"%":"—"}
            </td>
          </tr></tfoot></table>
        </div>

        <Btn primary full style={{marginTop:16}} onClick={saveFakt} disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Fakt saqlash"}
        </Btn>

        <p style={{fontSize:11,color:"#94a3b8",textAlign:"center",marginTop:8}}>
          📋 Reja — faqat Google Sheets dan o'qiladi
        </p>
      </>)}
    </Shell>
    );
  }

  // --- Detail ---
  if (view === "detail" && selected) {
    const otxPct = curStats.bichildi>0?((curStats.otxod/curStats.bichildi)*100).toFixed(1):"0";
    const tbPct = curStats.bichildi>0?((curStats.topBoshi/curStats.bichildi)*100).toFixed(1):"0";
    return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <Hdr left={<Back onClick={() => { setView("list"); setSelected(null); setTab("trim"); }} />} title={selected.id} />
      <div style={S.card}>
        <div style={{fontSize:13,color:"#334155",fontWeight:500,marginBottom:4}}>{selected.name}</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{...S.dot,background:getColor(selected.color)}} />
          <span style={{fontSize:13,color:"#64748b"}}>{selected.color}</span>
          <span style={{color:"#cbd5e1"}}>•</span>
          <span style={{fontSize:13,fontWeight:600}}>Zakaz: {selected.orderQty?.toLocaleString()} dona</span>
        </div>
        <div style={{display:"flex",gap:8,marginTop:8,fontSize:12}}>
          <span style={{color:"#2563eb",fontWeight:600}}>Mavjud: {selected.mavjudKg?.toLocaleString()} кг</span>
          <span style={{color:"#16a34a",fontWeight:600}}>Qolgan: {curStats.qolgan.toFixed(1)} кг</span>
        </div>
      </div>

      {curParts.length > 0 && (
        <div style={{...S.card, background:"#f8fafc", padding:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#475569",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Ombor xulosasi</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <SBox label="Bichildi" value={`${curStats.bichildi.toFixed(1)} кг`} color="#2563eb" />
            <SBox label="Тоза" value={`${curStats.toza.toFixed(1)} кг`} color="#16a34a" />
            <SBox label="Дона" value={curStats.dona.toLocaleString()} color="#7c3aed" />
            <SBox label="Топ боши" value={`${curStats.topBoshi.toFixed(1)} кг`} sub={`${tbPct}%`} color="#ea580c" />
            <SBox label="Отход" value={`${curStats.otxod.toFixed(1)} кг`} sub={`${otxPct}%`} color="#dc2626" />
            <SBox label="Қолган" value={`${curStats.qolgan.toFixed(1)} кг`} color="#0891b2" />
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8,margin:"12px 0"}}>
        <Btn primary flex onClick={() => setView("addPartiya")}>+ Partiya</Btn>
        <Btn flex onClick={() => setView("razmer")}>📐 Razmer</Btn>
      </div>

      <Lbl>Partiyalar ({curParts.length})</Lbl>
      {curParts.length === 0 ? <div style={{textAlign:"center",padding:30,color:"#94a3b8",fontSize:14}}>Partiya yo'q</div> : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {curParts.map((p,i) => (
            <div key={i} style={S.pCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div><span style={{fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:14}}>{p.partiya}</span><span style={{color:"#94a3b8",fontSize:12,marginLeft:8}}>{p.sana}</span></div>
                <div style={{display:"flex",gap:4}}>
                  <button style={S.iBtn} onClick={() => { setPForm({...p}); setEditIdx(i); setView("addPartiya"); }}>✏️</button>
                  <button style={S.iBtn} onClick={() => delPartiya(i)}>🗑</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4,fontSize:12}}>
                <MS label="Bichildi" value={`${p.bichildiKg} кг`} />
                <MS label="Топ боши" value={`${p.topBoshi} кг`} />
                <MS label="Отход" value={`${p.otxod} кг`} />
                <MS label="Дона" value={p.dona} accent />
              </div>
              <div style={{marginTop:4,fontSize:12,color:"#16a34a",fontWeight:600}}>Тоза: {p.tozaBichilgan} кг</div>
            </div>
          ))}
        </div>
      )}
    </Shell>
    );
  }

  // --- DASHBOARD ---
  if (tab === "dashboard" && connected) return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 10px",borderBottom:"1px solid #e2e8f0",marginBottom:12}}>
        <h1 style={{fontSize:20,fontWeight:800,margin:0}}>📊 Dashboard</h1>
        <div style={{display:"flex",gap:4}}>
          <button style={{border:"none",background:"none",fontSize:18,cursor:"pointer"}} onClick={load} title="Yangilash">🔄</button>
          <button style={{border:"none",background:"none",fontSize:18,cursor:"pointer"}} onClick={() => setView("settings")}>⚙️</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <KPI icon="📦" label="Jami mavjud" value={`${umumiy.jamiMavjud.toLocaleString()} кг`} color="#2563eb" />
        <KPI icon="✂️" label="Jami bichildi" value={`${umumiy.jamiBichildi.toLocaleString()} кг`} color="#16a34a" />
        <KPI icon="📏" label="Қолган mato" value={`${umumiy.qolganKg.toLocaleString()} кг`} color="#0891b2" />
        <KPI icon="👕" label="Jami dona" value={umumiy.jamiDona.toLocaleString()} color="#7c3aed" />
      </div>

      <div style={{...S.card, background:"linear-gradient(135deg, #fef2f2, #fff7ed)", padding:14, marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"#92400e",textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Chiqindlar</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <SBox label="Топ боши" value={`${umumiy.jamiTopBoshi.toFixed(1)} кг`} sub={`${umumiy.topBoshiPct}%`} color="#ea580c" />
          <SBox label="Отход" value={`${umumiy.jamiOtxod.toFixed(1)} кг`} sub={`${umumiy.otxodPct}%`} color="#dc2626" />
          <SBox label="Тоза бичилган" value={`${umumiy.jamiToza.toFixed(1)} кг`} color="#16a34a" />
        </div>
      </div>

      <div style={{...S.card, padding:14, marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Zakaz bajarilishi</div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
          <span>Jami zakaz: <b>{umumiy.jamiZakaz.toLocaleString()}</b></span>
          <span style={{color:"#16a34a",fontWeight:700}}>{umumiy.bichilganPct}%</span>
        </div>
        <div style={{height:10,background:"#f1f5f9",borderRadius:6,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(+umumiy.bichilganPct,100)}%`,background:"linear-gradient(90deg,#2563eb,#16a34a)",borderRadius:6,transition:"width 0.5s"}} />
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#94a3b8",marginTop:4}}>
          <span>Bichildi: {umumiy.jamiDona.toLocaleString()}</span>
          <span>Qoldi: {(umumiy.jamiZakaz - umumiy.jamiDona).toLocaleString()}</span>
        </div>
      </div>

      {umumiy.jamiRejaD > 0 && (
        <div style={{...S.card, padding:14, marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Razmer reja / fakt</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
            <span>Reja: <b>{umumiy.jamiRejaD.toLocaleString()}</b></span>
            <span>Fakt: <b>{umumiy.jamiFaktD.toLocaleString()}</b></span>
            <span style={{color:umumiy.farqDona>0?"#dc2626":"#16a34a",fontWeight:700}}>Farq: {umumiy.farqDona>0?`−${umumiy.farqDona.toLocaleString()}`:umumiy.farqDona<0?`+${Math.abs(umumiy.farqDona).toLocaleString()}`:"—"}</span>
          </div>
          <div style={{height:10,background:"#f1f5f9",borderRadius:6,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(umumiy.jamiRejaD>0?(umumiy.jamiFaktD/umumiy.jamiRejaD)*100:0,100)}%`,background:"linear-gradient(90deg,#7c3aed,#2563eb)",borderRadius:6}} />
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {[["all",`Hammasi (${umumiy.trimkartaSoni})`],["active",`Faol (${umumiy.activeCount})`],["waiting",`Kutmoqda (${umumiy.waitingCount})`]].map(([k,l]) => (
          <button key={k} style={{...S.tabBtn,flex:1,fontSize:11,...(dashFilter===k?S.tabAct:{})}} onClick={() => setDashFilter(k)}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filteredTrims.map(t => (
          <button key={t.id} style={{...S.listItem,padding:"10px 12px"}} onClick={() => openTrim(t)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:12}}>{t.id}</span>
              <span style={{fontSize:11,color:t.st.status==="active"?"#16a34a":"#94a3b8",fontWeight:600}}>{t.st.status==="active"?"● Faol":"○ Kutmoqda"}</span>
            </div>
            <div style={{fontSize:12,color:"#334155",marginBottom:4}}>{t.name} — <span style={{color:"#64748b"}}>{t.color}</span></div>
            {t.st.partCount > 0 ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4,fontSize:11}}>
                <span><b style={{color:"#2563eb"}}>{t.st.bichildi.toFixed(0)}</b> кг bichildi</span>
                <span><b style={{color:"#0891b2"}}>{t.st.qolgan.toFixed(0)}</b> кг qolgan</span>
                <span><b style={{color:"#dc2626"}}>{t.st.otxod.toFixed(1)}</b> кг otxod</span>
                <span><b style={{color:"#7c3aed"}}>{t.st.dona}</b> dona</span>
              </div>
            ) : (
              <div style={{fontSize:11,color:"#94a3b8"}}>Mavjud: {t.mavjudKg?.toLocaleString()} кг — bichilmagan</div>
            )}
          </button>
        ))}
      </div>
      {demoMode && <div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:"#94a3b8",marginTop:8}}>Demo rejim</div>}
    </Shell>
  );

  // --- HISOBOT ---
  if (tab === "hisobot" && connected) return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 10px",borderBottom:"1px solid #e2e8f0",marginBottom:12}}>
        <h1 style={{fontSize:20,fontWeight:800,margin:0}}>📋 Hisobot</h1>
      </div>

      <div style={S.tabs}>
        <button style={{...S.tabBtn,...(hisobotTab==="trim"?S.tabAct:{})}} onClick={() => setHisobotTab("trim")}>Trimkarta bo'yicha</button>
        <button style={{...S.tabBtn,...(hisobotTab==="partiya"?S.tabAct:{})}} onClick={() => setHisobotTab("partiya")}>Partiya bo'yicha</button>
      </div>

      {hisobotTab === "trim" ? (
        <>
          <div style={{fontSize:12,color:"#94a3b8",margin:"10px 0 6px"}}>{sortedTrims.length} ta trimkarta</div>
          <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e2e8f0"}}>
            <table style={{...S.tbl,minWidth:700}}>
              <thead><tr style={{background:"#f1f5f9"}}>
                <th style={S.rth} onClick={() => toggleSort("id")}>Trimkarta{sortIcon("id")}</th>
                <th style={{...S.rth,minWidth:140}}>Mahsulot</th>
                <th style={S.rth}>Rangi</th>
                <th style={{...S.rth,color:"#7c3aed"}} onClick={() => toggleSort("zakaz")}>Zakaz{sortIcon("zakaz")}</th>
                <th style={{...S.rth,color:"#2563eb"}} onClick={() => toggleSort("mavjud")}>Mavjud кг{sortIcon("mavjud")}</th>
                <th style={{...S.rth,color:"#16a34a"}} onClick={() => toggleSort("bichildi")}>Bichildi кг{sortIcon("bichildi")}</th>
                <th style={{...S.rth,color:"#0891b2"}} onClick={() => toggleSort("qolgan")}>Qolgan кг{sortIcon("qolgan")}</th>
                <th style={{...S.rth,color:"#ea580c"}} onClick={() => toggleSort("topBoshi")}>Топ боши{sortIcon("topBoshi")}</th>
                <th style={{...S.rth,color:"#dc2626"}} onClick={() => toggleSort("otxod")}>Отход{sortIcon("otxod")}</th>
                <th style={{...S.rth,color:"#7c3aed"}} onClick={() => toggleSort("dona")}>Дона{sortIcon("dona")}</th>
                <th style={S.rth}>%</th>
              </tr></thead>
              <tbody>
                {sortedTrims.map(t => {
                  const pct = t.orderQty > 0 ? ((t.st.dona / t.orderQty)*100).toFixed(1) : "0";
                  return (
                    <tr key={t.id} style={{cursor:"pointer"}} onClick={() => openTrim(t)}>
                      <td style={{...S.rtd,fontWeight:700,color:"#1e40af",fontFamily:"monospace"}}>{t.id}</td>
                      <td style={{...S.rtd,fontSize:11,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</td>
                      <td style={S.rtd}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{...S.dot,background:getColor(t.color),width:8,height:8}} />{t.color}</span></td>
                      <td style={{...S.rtd,fontWeight:600}}>{t.orderQty?.toLocaleString()}</td>
                      <td style={{...S.rtd,color:"#2563eb"}}>{(t.mavjudKg||0).toLocaleString()}</td>
                      <td style={{...S.rtd,color:"#16a34a",fontWeight:600}}>{t.st.bichildi>0?t.st.bichildi.toFixed(1):"—"}</td>
                      <td style={{...S.rtd,color:"#0891b2",fontWeight:600}}>{t.st.bichildi>0?t.st.qolgan.toFixed(1):(t.mavjudKg||0).toLocaleString()}</td>
                      <td style={{...S.rtd,color:"#ea580c"}}>{t.st.topBoshi>0?t.st.topBoshi.toFixed(1):"—"}</td>
                      <td style={{...S.rtd,color:"#dc2626"}}>{t.st.otxod>0?t.st.otxod.toFixed(1):"—"}</td>
                      <td style={{...S.rtd,fontWeight:700,color:"#7c3aed"}}>{t.st.dona>0?t.st.dona.toLocaleString():"—"}</td>
                      <td style={S.rtd}>{t.st.dona>0?<span style={{padding:"2px 6px",borderRadius:6,fontSize:10,fontWeight:600,background:+pct>=100?"#dcfce7":+pct>=50?"#fef9c3":"#fee2e2",color:+pct>=100?"#166534":+pct>=50?"#854d0e":"#991b1b"}}>{pct}%</span>:"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot><tr style={{background:"#f8fafc",borderTop:"2px solid #cbd5e1"}}>
                <td style={{...S.rtd,fontWeight:800}} colSpan={3}>JAMI</td>
                <td style={{...S.rtd,fontWeight:700}}>{umumiy.jamiZakaz.toLocaleString()}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#2563eb"}}>{umumiy.jamiMavjud.toLocaleString()}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#16a34a"}}>{umumiy.jamiBichildi.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#0891b2"}}>{umumiy.qolganKg.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#ea580c"}}>{umumiy.jamiTopBoshi.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#dc2626"}}>{umumiy.jamiOtxod.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:800,color:"#7c3aed"}}>{umumiy.jamiDona.toLocaleString()}</td>
                <td style={{...S.rtd,fontWeight:700,fontSize:11}}>{umumiy.bichilganPct}%</td>
              </tr></tfoot>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={{fontSize:12,color:"#94a3b8",margin:"10px 0 6px"}}>{allPartiyalar.length} ta partiya</div>
          <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e2e8f0"}}>
            <table style={{...S.tbl,minWidth:750}}>
              <thead><tr style={{background:"#f1f5f9"}}>
                <th style={S.rth}>Sana</th>
                <th style={S.rth}>Partiya</th>
                <th style={S.rth}>Trimkarta</th>
                <th style={{...S.rth,minWidth:130}}>Mahsulot</th>
                <th style={S.rth}>Rangi</th>
                <th style={{...S.rth,color:"#2563eb"}}>Bichildi кг</th>
                <th style={{...S.rth,color:"#ea580c"}}>Топ боши</th>
                <th style={{...S.rth,color:"#dc2626"}}>Отход</th>
                <th style={{...S.rth,color:"#16a34a"}}>Тоза кг</th>
                <th style={{...S.rth,color:"#7c3aed"}}>Дона</th>
                <th style={S.rth}>Отход%</th>
              </tr></thead>
              <tbody>
                {allPartiyalar.map((p, i) => {
                  const otxPct = p.bichildiKg>0?((p.otxod/p.bichildiKg)*100).toFixed(1):"0";
                  return (
                    <tr key={i}>
                      <td style={{...S.rtd,whiteSpace:"nowrap"}}>{p.sana}</td>
                      <td style={{...S.rtd,fontWeight:700,color:"#1e40af",fontFamily:"monospace"}}>{p.partiya}</td>
                      <td style={{...S.rtd,fontFamily:"monospace",fontSize:11,fontWeight:600}}>{p.trimId}</td>
                      <td style={{...S.rtd,fontSize:11,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.trimName}</td>
                      <td style={S.rtd}>{p.color}</td>
                      <td style={{...S.rtd,color:"#2563eb",fontWeight:600}}>{p.bichildiKg}</td>
                      <td style={{...S.rtd,color:"#ea580c"}}>{p.topBoshi}</td>
                      <td style={{...S.rtd,color:"#dc2626"}}>{p.otxod}</td>
                      <td style={{...S.rtd,color:"#16a34a",fontWeight:600}}>{p.tozaBichilgan}</td>
                      <td style={{...S.rtd,fontWeight:700,color:"#7c3aed"}}>{p.dona}</td>
                      <td style={S.rtd}><span style={{padding:"2px 6px",borderRadius:6,fontSize:10,fontWeight:600,background:+otxPct>5?"#fee2e2":"#dcfce7",color:+otxPct>5?"#991b1b":"#166534"}}>{otxPct}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot><tr style={{background:"#f8fafc",borderTop:"2px solid #cbd5e1"}}>
                <td style={{...S.rtd,fontWeight:800}} colSpan={5}>JAMI ({allPartiyalar.length})</td>
                <td style={{...S.rtd,fontWeight:700,color:"#2563eb"}}>{umumiy.jamiBichildi.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#ea580c"}}>{umumiy.jamiTopBoshi.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#dc2626"}}>{umumiy.jamiOtxod.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:700,color:"#16a34a"}}>{umumiy.jamiToza.toFixed(1)}</td>
                <td style={{...S.rtd,fontWeight:800,color:"#7c3aed"}}>{umumiy.jamiDona.toLocaleString()}</td>
                <td style={{...S.rtd,fontWeight:700}}>{umumiy.otxodPct}%</td>
              </tr></tfoot>
            </table>
          </div>
        </>
      )}
      {demoMode && <div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:"#94a3b8",marginTop:8}}>Demo rejim</div>}
    </Shell>
  );

  // --- TRIM LIST ---
  if (tab === "trim" && connected) return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 10px",borderBottom:"1px solid #e2e8f0",marginBottom:12}}>
        <h1 style={{fontSize:20,fontWeight:800,margin:0}}>✂️ Trimkartalar</h1>
      </div>
      <input style={S.searchInp} placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{fontSize:12,color:"#94a3b8",margin:"8px 0 6px"}}>{filteredTrims.length} ta</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filteredTrims.map(t => (
          <button key={t.id} style={S.listItem} onClick={() => openTrim(t)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:13}}>{t.id}</span>
              <span style={{fontSize:12,color:"#64748b"}}>{t.orderQty?.toLocaleString()} dona</span>
            </div>
            <div style={{fontSize:13,color:"#334155",marginBottom:4}}>{t.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{...S.dot,background:getColor(t.color)}} />
              <span style={{fontSize:12,color:"#64748b"}}>{t.color}</span>
              {t.st.partCount>0 && <span style={{fontSize:11,color:"#16a34a",marginLeft:8,fontWeight:600}}>✓ {t.st.partCount} partiya</span>}
            </div>
          </button>
        ))}
      </div>
    </Shell>
  );

  // --- WELCOME ---
  return (
    <Shell tab={tab} setTab={setTab} toast={toast}>
      <div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{fontSize:52,marginBottom:12}}>✂️</div>
        <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 8px"}}>Bichuv boshqaruvi</h2>
        <p style={{fontSize:14,color:"#64748b",lineHeight:1.5,margin:"0 0 24px"}}>Partiya, otxod, top boshi, razmer kuzatuvi va ombor hisobi.</p>
        <Btn primary full onClick={() => { setDemoMode(true); setConnected(true); }}>Demo rejimda boshlash</Btn>
        <Btn full style={{marginTop:8}} onClick={() => setView("settings")}>Google Sheets ga ulanish</Btn>
      </div>
    </Shell>
  );
}

// ===== COMPONENTS =====
function Shell({ children, tab, setTab, toast }) {
  return (
    <div style={{maxWidth:540,margin:"0 auto",padding:"0 12px 80px",fontFamily:"'Inter',-apple-system,sans-serif",color:"#1e293b",minHeight:"100vh"}}>
      {children}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"center",zIndex:50}}>
        <div style={{display:"flex",maxWidth:540,width:"100%"}}>
          {[["dashboard","📊","Dashboard"],["trim","✂️","Trimkartalar"],["hisobot","📋","Hisobot"]].map(([k,ico,label]) => (
            <button key={k} onClick={() => setTab(k)} style={{flex:1,padding:"10px 0 8px",border:"none",background:"none",cursor:"pointer",textAlign:"center",color:tab===k?"#2563eb":"#94a3b8",fontWeight:tab===k?700:400,fontSize:11}}>
              <div style={{fontSize:18}}>{ico}</div>{label}
            </button>
          ))}
        </div>
      </div>
      <Toast msg={toast} />
    </div>
  );
}

function Hdr({ left, title, right }) {
  return (<div style={{display:"flex",alignItems:"center",padding:"14px 0 10px",borderBottom:"1px solid #e2e8f0",marginBottom:12,position:"sticky",top:0,background:"#fff",zIndex:10}}>
    <div style={{width:60}}>{left}</div><h2 style={{flex:1,textAlign:"center",fontSize:16,fontWeight:700,margin:0}}>{title}</h2><div style={{width:60,textAlign:"right"}}>{right}</div>
  </div>);
}
function Back({ onClick }) { return <button style={{border:"none",background:"none",color:"#2563eb",fontWeight:500,fontSize:14,cursor:"pointer",padding:0}} onClick={onClick}>← Ortga</button>; }
function Btn({ children, primary, flex, full, style={}, ...r }) {
  return <button style={{padding:"11px 18px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",border:"none",...(primary?{background:"#2563eb",color:"#fff"}:{background:"transparent",color:"#2563eb",border:"1.5px solid #2563eb"}),...(flex?{flex:1}:{}),...(full?{width:"100%"}:{}),...style}} {...r}>{children}</button>;
}
function Lbl({ children, style={} }) { return <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6,...style}}>{children}</div>; }
function Row({ children }) { return <div style={{display:"flex",gap:10}}>{children}</div>; }
function Half({ children }) { return <div style={{flex:1}}>{children}</div>; }
function SBox({ label, value, sub, color }) {
  return <div style={{textAlign:"center",padding:"8px 4px",borderRadius:8,background:"#fff",border:"1px solid #e2e8f0"}}>
    <div style={{fontSize:13,fontWeight:700,color}}>{value}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{label}</div>
    {sub && <div style={{fontSize:10,color,marginTop:1}}>{sub}</div>}
  </div>;
}
function MS({ label, value, accent }) {
  return <div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:accent?700:500,color:accent?"#7c3aed":"#334155"}}>{value}</div><div style={{fontSize:10,color:"#94a3b8"}}>{label}</div></div>;
}
function KPI({ icon, label, value, color }) {
  return <div style={{padding:"14px 12px",border:"1px solid #e2e8f0",borderRadius:12,background:"#fff"}}>
    <div style={{fontSize:18,marginBottom:4}}>{icon}</div><div style={{fontSize:17,fontWeight:800,color}}>{value}</div><div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{label}</div>
  </div>;
}
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{position:"fixed",bottom:60,left:"50%",transform:"translateX(-50%)",padding:"10px 24px",background:"#1e293b",color:"#fff",borderRadius:10,fontSize:14,fontWeight:500,zIndex:100,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{msg}</div>;
}

function getColor(n) {
  const m={"бежевый":"#d4a574","бордовый":"#800020","красный":"#dc2626","серый":"#9ca3af","графит":"#4b5563","коричневый":"#8b4513","хаки":"#6b7c3f","черный":"#1e1e1e","белый":"#e5e5e5","синий":"#2563eb","голубой":"#38bdf8","розовый":"#f472b6","фиолетовый":"#7c3aed","молочный":"#fffdd0","капучино":"#a0826d"};
  const l=(n||"").toLowerCase(); for(const[k,v] of Object.entries(m)) if(l.includes(k)) return v; return "#94a3b8";
}

const S = {
  card:{padding:16,border:"1px solid #e2e8f0",borderRadius:14,marginBottom:8,background:"#fff"},
  dot:{width:10,height:10,borderRadius:"50%",display:"inline-block",border:"1px solid #ddd",flexShrink:0},
  tabs:{display:"flex",gap:6},
  tabBtn:{flex:1,padding:"9px 6px",fontSize:13,fontWeight:500,border:"1px solid #e2e8f0",borderRadius:9,background:"#fff",cursor:"pointer",color:"#64748b",textAlign:"center"},
  tabAct:{background:"#2563eb",color:"#fff",borderColor:"#2563eb"},
  chips:{display:"flex",flexWrap:"wrap",gap:6},
  chip:{padding:"7px 14px",fontSize:13,fontWeight:600,border:"1.5px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",color:"#475569",minWidth:40,textAlign:"center"},
  chipAct:{background:"#eff6ff",borderColor:"#2563eb",color:"#2563eb"},
  inp:{width:"100%",padding:"10px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",boxSizing:"border-box",background:"#fff"},
  inpN:{fontWeight:600,textAlign:"center"},
  searchInp:{width:"100%",padding:"11px 14px",fontSize:14,border:"1px solid #e2e8f0",borderRadius:10,outline:"none",boxSizing:"border-box",background:"#f8fafc"},
  listItem:{display:"block",width:"100%",textAlign:"left",padding:"13px 16px",border:"1px solid #e2e8f0",borderRadius:12,background:"#fff",cursor:"pointer"},
  hint:{fontSize:12,color:"#94a3b8",marginTop:6,lineHeight:1.4},
  pCard:{padding:"12px 14px",border:"1px solid #e2e8f0",borderRadius:12,background:"#fff"},
  iBtn:{border:"none",background:"none",fontSize:14,cursor:"pointer",padding:"2px 6px"},
  infoMini:{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0",marginBottom:12},
  miniId:{fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:13},
  miniClr:{fontSize:12,color:"#64748b"},
  tbl:{width:"100%",borderCollapse:"collapse"},
  th:{padding:"10px 8px",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"center"},
  td:{padding:"9px 8px",fontSize:13,borderBottom:"1px solid #f1f5f9"},
  rth:{padding:"8px 6px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,color:"#475569",background:"#f1f5f9",borderBottom:"1px solid #e2e8f0",textAlign:"center",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"},
  rtd:{padding:"8px 6px",fontSize:12,borderBottom:"1px solid #f1f5f9",textAlign:"center"},
};
