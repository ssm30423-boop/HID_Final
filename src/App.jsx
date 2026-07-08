import React, { useState, useRef, useEffect } from "react";
import { Plus, X, RefreshCw, Pencil, Check, ChevronRight, ChevronDown, ArrowUp, Trash2, Mic } from "lucide-react";

const PALETTE = ["#4DB6A4", "#E0B341", "#D08AB0", "#93C47D", "#94A6EC", "#E0875E"];
const soft = (hex) => hex + "1F";

const INITIAL_ROLES = [
  { id: "designer", name: "디자이너", concerns: "사용자 흐름, 일관성, 인터랙션 의도", tag: "#D08AB0" },
  { id: "frontend", name: "프론트엔드", concerns: "화면 구현, 레이아웃, 컴포넌트 영향, 반응형", tag: "#4DB6A4" },
  { id: "backend", name: "백엔드", concerns: "데이터·API 영향 여부, 스키마, 연동 범위", tag: "#94A6EC" },
  { id: "pm", name: "PM", concerns: "일정 영향, UX 변화, 우선순위, 릴리즈 리스크", tag: "#E0B341" },
  { id: "qa", name: "QA", concerns: "테스트 케이스, 회귀 위험, 재현 경로", tag: "#93C47D" },
  { id: "marketer", name: "마케터", concerns: "사용자 가치, 메시징, 출시 타이밍", tag: "#E0875E" },
];

const FONTS = `@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");`;

const DEMO = {
  designer: [
    { label: "사용자 흐름", detail: "이 변경이 사용자의 행동 순서를 바꾸는지, 기존 동선과 자연스럽게 이어지는지 봐야 합니다." },
    { label: "일관성", detail: "다른 화면의 같은 패턴과 어긋나지 않는지 확인이 필요합니다." },
    { label: "인터랙션 의도", detail: "이 변화로 사용자가 받을 느낌이 원래 의도와 맞는지 점검합니다." } ],
  frontend: [
    { label: "화면 구현", detail: "기존 컴포넌트로 흡수 가능한지, 마크업·스타일 구조 변경이 필요한지에 따라 작업량이 달라집니다." },
    { label: "레이아웃", detail: "주변 요소 배치·정렬에 영향을 주는지, 고정/플로팅 처리 방식이 무엇인지 확인합니다." },
    { label: "반응형", detail: "작은 화면에서 새 위치가 콘텐츠와 겹치거나 스크롤 영역을 침범하지 않는지 점검합니다." } ],
  backend: [
    { label: "API 영향 여부", detail: "화면 표시 위치만 바뀌는 변경이면 서버 응답·엔드포인트엔 영향이 없을 가능성이 높습니다." },
    { label: "데이터", detail: "새 데이터나 상태 저장이 필요한지, 기존 데이터로 충분한지 구분이 필요합니다." },
    { label: "연동 범위", detail: "외부 연동·이벤트 로깅과 엮여 있다면 그 경로에 변경이 필요한지 확인합니다." } ],
  pm: [
    { label: "일정 영향", detail: "이번 스프린트에 흡수 가능한 규모인지, 다른 작업 우선순위를 밀어내는지 가늠합니다." },
    { label: "UX 변화", detail: "사용자가 체감하는 변화 크기와 기대되는 지표 개선을 함께 봅니다." },
    { label: "릴리즈 리스크", detail: "되돌리기 쉬운 변경인지, 배포 후 모니터링이 필요한지 구분합니다." } ],
  qa: [
    { label: "테스트 케이스", detail: "정상 흐름 외 빈 값·예외 입력에서의 동작까지 확인 항목으로 잡습니다." },
    { label: "회귀 위험", detail: "기존에 잘 동작하던 화면에 영향을 주는지 회귀 범위를 정합니다." },
    { label: "재현 경로", detail: "이슈 발생 시 재현할 수 있게 전제와 단계를 기록합니다." } ],
  marketer: [
    { label: "사용자 가치", detail: "이 변경이 주는 이점을 한 문장으로 말할 수 있어야 메시징이 쉬워집니다." },
    { label: "메시징", detail: "오해 없이 가치가 전달되도록 톤과 표현을 맞춥니다." },
    { label: "출시 타이밍", detail: "다른 일정·캠페인과 겹치지 않는지, 알릴 만한 변화인지 판단합니다." } ],
};
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function translateMock(text, subject, target) {
  await delay(600 + Math.random() * 450);
  const snippet = text.trim().length > 24 ? text.trim().slice(0, 24) + "…" : text.trim();
  const headline = `${subject.name}가 공유한 "${snippet}" — ${target.name} 관점 요약`;
  let points = DEMO[target.id];
  if (!points) points = target.concerns.split(/[,，]/).map((s) => s.trim()).filter(Boolean).slice(0, 4).map((l) => ({ label: l, detail: `${l} 관점에서 이 작업을 검토할 때 먼저 확인할 부분입니다.` }));
  return { headline, points };
}

function RoleDropdown({ roles, subjectId, onSelect, compact }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const subject = roles.find((r) => r.id === subjectId);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className={"role-trigger" + (compact ? " compact" : "")} onClick={() => setOpen((o) => !o)}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: subject.tag }} />
        {subject.name}
        <ChevronDown size={14} style={{ marginLeft: compact ? 2 : "auto", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", opacity: 0.6 }} />
      </button>
      {open && (
        <div className={"role-menu" + (compact ? " compact" : "")}>
          <div style={{ fontSize: 11, color: "var(--dim)", padding: "4px 10px 6px" }}>나는…</div>
          {roles.map((r) => (
            <div key={r.id} className="role-item" data-active={r.id === subjectId} onClick={() => { onSelect(r.id); setOpen(false); }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.tag }} />
              {r.name}
              {r.id === subjectId && <Check size={13} style={{ marginLeft: "auto", opacity: 0.7 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [subjectId, setSubjectId] = useState("designer");
  const [started, setStarted] = useState(false);
  const [content, setContent] = useState("");
  const [panels, setPanels] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newConcerns, setNewConcerns] = useState("");

  const entryRef = useRef(null);
  const [entryHasText, setEntryHasText] = useState(false);
  const dockRef = useRef(null);
  const [dockHasText, setDockHasText] = useState(false);

  // 음성 입력 (Web Speech API, ko-KR) — 지원 브라우저에서만 마이크 버튼 노출
  const recogRef = useRef(null);
  const baseTextRef = useRef("");
  const [listening, setListening] = useState(false);
  const speechSupported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  function stopVoice() {
    const r = recogRef.current;
    if (r) { try { r.stop(); } catch {} }
    setListening(false);
  }
  function toggleVoice() {
    if (listening) { stopVoice(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const el = dockRef.current;
    baseTextRef.current = el ? el.value : "";
    const r = new SR();
    recogRef.current = r;
    r.lang = "ko-KR";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      const target = dockRef.current;
      if (target) {
        const base = baseTextRef.current;
        target.value = base + (base && text ? " " : "") + text;
        onDockInput();
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    try { r.start(); setListening(true); } catch { setListening(false); }
  }

  const subject = roles.find((r) => r.id === subjectId);
  const targets = roles.filter((r) => r.id !== subjectId);
  const openIds = Object.keys(panels).filter((id) => panels[id]);
  const canGenerate = content.trim().length > 0;

  function adjust(el) { if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }
  function onEntryInput() { adjust(entryRef.current); setEntryHasText(!!(entryRef.current && entryRef.current.value.trim())); }
  function onDockInput() { adjust(dockRef.current); setDockHasText(!!(dockRef.current && dockRef.current.value.trim())); }

  async function runLens(role, text = content, subj = subject) {
    setPanels((p) => ({ ...p, [role.id]: { status: "loading", basedOn: text } }));
    try { const data = await translateMock(text, subj, role); setPanels((p) => ({ ...p, [role.id]: { status: "done", data, basedOn: text } })); }
    catch { setPanels((p) => ({ ...p, [role.id]: { status: "error", basedOn: text } })); }
  }

  function submitEntry() {
    const el = entryRef.current; const t = (el ? el.value : "").trim(); if (!t) return;
    setContent(t); setStarted(true);
    // 첫 전송 시 기본 직군 렌즈(앞 3개)를 자동으로 펼쳐 바로 가치를 보여줌
    targets.slice(0, 3).forEach((r) => runLens(r, t, subject));
  }

  function changeSubject(id) {
    setSubjectId(id); setEditingId(null);
    const subj = roles.find((r) => r.id === id);
    openIds.forEach((pid) => { const r = roles.find((x) => x.id === pid); if (r) runLens(r, content, subj); });
  }
  function toggleLens(role) { if (panels[role.id]) closePanel(role.id); else if (canGenerate) runLens(role); }
  function closePanel(id) { setPanels((p) => { const n = { ...p }; delete n[id]; return n; }); }
  function saveConcerns(id) { setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, concerns: draft } : r))); setEditingId(null); }
  function removeRole(id) { setRoles((rs) => rs.filter((r) => r.id !== id)); setPanels((p) => { const n = { ...p }; delete n[id]; return n; }); setEditingId(null); }
  function addRole() {
    if (!newName.trim()) return;
    const color = PALETTE[roles.length % PALETTE.length];
    setRoles((rs) => [...rs, { id: "r" + Date.now(), name: newName.trim(), concerns: newConcerns.trim() || "핵심 관심사", tag: color }]);
    setNewName(""); setNewConcerns(""); setAdding(false);
  }
  function sendDock() {
    if (listening) stopVoice();
    const el = dockRef.current; const t = (el ? el.value : "").trim(); if (!t) return;
    setContent(t);
    openIds.forEach((id) => { const r = roles.find((x) => x.id === id); if (r) runLens(r, t); });
    if (el) el.value = ""; setDockHasText(false); requestAnimationFrame(() => adjust(dockRef.current));
  }
  function editInDock() {
    const el = dockRef.current; if (!el) return;
    el.value = content; setDockHasText(!!content.trim());
    requestAnimationFrame(() => { adjust(el); el.focus(); });
  }

  const styleBlock = (
    <>
      <style>{FONTS}</style>
      <style>{`
        html, body, #root { margin:0; background:#08080A; }
        .lens-root {
          --bg:#08080A; --panel:#0C0C0E; --card:#121214; --popover:#1A1A1D; --muted:#1B1B1F;
          --border:#26262A; --fg:#F4F4F5; --mfg:#9C9CA3; --dim:#6B6B72;
          --ring:rgba(148,166,236,.28); --ring-solid:#3b3b42; --side:288px;
          color:var(--fg); min-height:100vh; width:100%;
          font-family:'Pretendard Variable', Pretendard, -apple-system, sans-serif;
          -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden;
        }
        .lens-root * { box-sizing:border-box; }
        .bg-fixed { position:fixed; inset:0; background:#08080A; z-index:0; pointer-events:none; }
        .glow { position:fixed; pointer-events:none; z-index:0; will-change:transform,opacity; }
        .ge1 { width:72vw; height:62vh; left:50%; top:44%; background:radial-gradient(ellipse at center, rgba(66,92,184,.22), rgba(66,92,184,.06) 42%, transparent 70%); filter:blur(34px); animation:drift1 19s ease-in-out infinite alternate; }
        .ge2 { width:52vw; height:48vh; left:54%; top:36%; background:radial-gradient(ellipse at center, rgba(126,86,176,.15), transparent 66%); filter:blur(44px); animation:drift2 26s ease-in-out infinite alternate; }
        .gw1 { width:58vw; height:60vh; left:64%; top:40%; background:radial-gradient(ellipse at center, rgba(66,92,184,.16), rgba(66,92,184,.05) 42%, transparent 70%); filter:blur(36px); animation:drift1 19s ease-in-out infinite alternate; }
        .gw2 { width:44vw; height:46vh; left:72%; top:28%; background:radial-gradient(ellipse at center, rgba(126,86,176,.10), transparent 66%); filter:blur(46px); animation:drift2 26s ease-in-out infinite alternate; }
        @keyframes drift1 { 0%{transform:translate(-58%,-54%) scale(1);opacity:.8;} 50%{transform:translate(-44%,-46%) scale(1.14);opacity:1;} 100%{transform:translate(-54%,-60%) scale(1.04);opacity:.86;} }
        @keyframes drift2 { 0%{transform:translate(-38%,-40%) scale(1.12);opacity:.7;} 50%{transform:translate(-58%,-52%) scale(1);opacity:.95;} 100%{transform:translate(-46%,-44%) scale(1.08);opacity:.78;} }
        @media (prefers-reduced-motion: reduce) { .glow { animation:none; } }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes shimmer { 0%{background-position:-200px 0;} 100%{background-position:200px 0;} }
        .skel { background:linear-gradient(90deg,#1B1B1F 0,#29292e 80px,#1B1B1F 160px); background-size:400px 100%; animation:shimmer 1.1s infinite linear; border-radius:6px; }
        .panel { animation:fadeUp .35s ease both; }
        .card { background:var(--card); border:1px solid var(--border); border-radius:14px; }
        .desc { font-size:13px; color:var(--mfg); line-height:1.5; }
        .badge { display:inline-flex; align-items:center; gap:5px; border-radius:6px; padding:2px 9px; font-size:12px; font-weight:600; }
        textarea { font-family:inherit; }

        .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:36px; padding:0 16px; border-radius:9px; font-size:14px; font-weight:500; cursor:pointer; transition:background .15s,border-color .15s,box-shadow .15s,transform .1s; border:1px solid transparent; white-space:nowrap; }
        .btn:focus-visible { outline:none; box-shadow:0 0 0 3px var(--ring); }
        .btn:active { transform:translateY(.5px); }
        .btn-default { background:var(--fg); color:#18181B; } .btn-default:hover { background:#e4e4e7; }
        .btn-outline { background:transparent; border-color:var(--border); color:var(--fg); } .btn-outline:hover { background:var(--muted); }
        .btn-ghost { background:transparent; color:var(--mfg); } .btn-ghost:hover { background:var(--muted); color:var(--fg); }
        .btn-danger { background:transparent; border-color:#5A2A28; color:#E5705B; } .btn-danger:hover { background:rgba(229,112,91,.12); }
        .btn-sm { height:32px; padding:0 12px; font-size:13px; }
        .btn-icon { width:30px; height:30px; padding:0; border-radius:8px; }
        .inp { display:flex; width:100%; border-radius:9px; border:1px solid var(--border); background:#0E0E10; padding:8px 11px; font-size:13px; color:var(--fg); transition:border-color .15s,box-shadow .15s; font-family:inherit; }
        .inp::placeholder { color:var(--dim); } .inp:focus { outline:none; border-color:var(--ring-solid); box-shadow:0 0 0 3px var(--ring); }

        .role-trigger { display:flex; align-items:center; gap:8px; width:100%; height:38px; padding:0 12px; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; color:var(--fg); border:1px solid var(--border); background:#0E0E10; transition:background .15s,border-color .15s; }
        .role-trigger:hover { background:var(--muted); }
        .role-trigger.compact { width:auto; height:34px; border-radius:18px; background:rgba(18,18,20,.5); }
        .role-menu { position:absolute; z-index:40; top:calc(100% + 6px); left:0; right:0; background:var(--popover); border:1px solid var(--border); border-radius:12px; padding:5px; box-shadow:0 16px 44px rgba(0,0,0,.6); animation:fadeIn .12s ease; }
        .role-menu.compact { left:auto; right:0; min-width:180px; }
        .role-item { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:8px; font-size:13.5px; color:var(--mfg); cursor:pointer; transition:background .12s,color .12s; }
        .role-item:hover { background:var(--muted); color:var(--fg); }
        .role-item[data-active="true"] { color:var(--fg); font-weight:600; }

        /* 진입 화면 */
        .entry { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; position:relative; z-index:2; }
        .pill { display:flex; align-items:center; gap:10px; width:min(680px,92vw); background:rgba(22,22,25,.82); backdrop-filter:blur(10px); border:1px solid #2c2c31; border-radius:26px; padding:8px 8px 8px 18px; box-shadow:0 10px 50px rgba(0,0,0,.5); transition:border-color .2s; }
        .pill:focus-within { border-color:#3d3d44; }

        /* 사이드바 */
        .sidebar { position:fixed; left:0; top:0; bottom:0; width:var(--side); z-index:20; background:var(--panel); border-right:1px solid var(--border); padding:22px 16px; overflow-y:auto; }
        .side-brand { font-size:18px; font-weight:600; letter-spacing:-0.02em; padding:0 6px; margin-bottom:22px; }
        .side-label { font-size:11px; font-weight:600; letter-spacing:.06em; color:var(--dim); text-transform:uppercase; margin:0 6px 9px; }
        .side-section { margin-bottom:22px; }
        .side-lens { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:10px; border:1px solid transparent; cursor:pointer; transition:background .15s,border-color .15s; }
        .side-lens:hover { background:var(--muted); }
        .side-lens[data-active="true"] { background:var(--card); border-color:var(--border); }
        .side-add { display:flex; align-items:center; gap:7px; width:100%; padding:9px 10px; border-radius:10px; border:1px dashed var(--border); background:transparent; color:var(--mfg); font-size:13.5px; cursor:pointer; transition:background .15s; }
        .side-add:hover { background:var(--muted); }

        .main { margin-left:var(--side); padding:34px 32px 150px; position:relative; z-index:2; }
        .main-inner { max-width:1080px; margin:0 auto; }
        .work-row { display:flex; justify-content:flex-end; margin-bottom:22px; }
        .work-bubble { max-width:78%; background:#202024; border:1px solid var(--border); border-radius:18px; padding:12px 16px; font-size:15.5px; line-height:1.55; color:var(--fg); cursor:text; transition:border-color .15s; }
        .work-bubble:hover { border-color:#3a3a40; }
        .answer-intro { font-size:13.5px; color:var(--mfg); margin-bottom:14px; }

        .dock { position:fixed; left:var(--side); right:0; bottom:0; z-index:30; padding:18px 32px 22px; background:linear-gradient(to top, #08080A 55%, rgba(8,8,10,0)); }
        .dock-inner { max-width:1080px; margin:0 auto; display:flex; align-items:center; gap:10px; background:rgba(20,20,23,.92); backdrop-filter:blur(12px); border:1px solid #2c2c31; border-radius:24px; padding:8px 8px 8px 10px; box-shadow:0 12px 50px rgba(0,0,0,.5); }
        .dock-inner:focus-within { border-color:#3d3d44; }
        .mic-btn { background:transparent; color:var(--mfg); border-radius:50%; }
        .mic-btn:hover { background:var(--muted); color:var(--fg); }
        .mic-btn.listening { background:#E5705B; color:#fff; animation:micPulse 1.6s ease-in-out infinite; }
        @keyframes micPulse { 0%,100% { box-shadow:0 0 0 0 rgba(229,112,91,.45);} 50% { box-shadow:0 0 0 8px rgba(229,112,91,0);} }

        @media (max-width: 880px) {
          .lens-root { --side:0px; }
          .sidebar { position:static; width:100%; border-right:none; border-bottom:1px solid var(--border); }
          .main { margin-left:0; padding:24px 18px 150px; }
          .dock { left:0; padding:14px 18px 18px; }
          .work-bubble { max-width:90%; }
        }
      `}</style>
    </>
  );

  // ── 진입 화면 ───────────────────────────────────────────────
  if (!started) {
    return (
      <div className="lens-root">
        {styleBlock}
        <div className="bg-fixed" /><div className="glow ge1" /><div className="glow ge2" />
        <div className="entry">
          <h1 style={{ fontSize: 30, fontWeight: 500, margin: "0 0 30px", letterSpacing: "-0.02em", color: "#EDEDF0" }}>무엇을 공유해 볼까요?</h1>
          <div className="pill">
            <textarea ref={entryRef} rows={1} defaultValue="" onInput={onEntryInput}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEntry(); } }}
              placeholder="공유할 작업이나 변경사항을 적어보세요"
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 16, lineHeight: 1.5, color: "var(--fg)", minHeight: 24, maxHeight: 120, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "7px 0" }} />
            <RoleDropdown roles={roles} subjectId={subjectId} onSelect={setSubjectId} compact />
            <button className="btn btn-icon" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: entryHasText ? "var(--fg)" : "#2a2a2e", color: entryHasText ? "#18181B" : "var(--dim)" }}
              disabled={!entryHasText} onClick={submitEntry} title="시작"><ArrowUp size={18} /></button>
          </div>
          <p style={{ marginTop: 18, fontSize: 13, color: "var(--dim)", textAlign: "center" }}>
            <span style={{ color: subject.tag }}>{subject.name}</span>의 작업을 적으면, 상대 직군의 눈높이로 옮겨드려요.
          </p>
        </div>
      </div>
    );
  }

  // ── 워크스페이스 ────────────────────────────────────────────
  return (
    <div className="lens-root">
      {styleBlock}
      <div className="bg-fixed" /><div className="glow gw1" /><div className="glow gw2" />

      <aside className="sidebar">
        <div className="side-brand">렌즈<span style={{ color: "var(--dim)" }}>.</span></div>
        <div className="side-section" style={{ position: "relative" }}>
          <div className="side-label">나는 · 주체</div>
          <RoleDropdown roles={roles} subjectId={subjectId} onSelect={changeSubject} />
        </div>
        <div className="side-section">
          <div className="side-label">대상 렌즈 · 누구에게 설명할까요</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {targets.map((l) => {
              const active = !!panels[l.id];
              return (
                <div key={l.id}>
                  <div className="side-lens" data-active={active} onClick={() => toggleLens(l)}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: l.tag, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.concerns}</div>
                    </div>
                    {active && <span style={{ fontSize: 10.5, color: l.tag, fontWeight: 600, flexShrink: 0 }}>표시중</span>}
                    <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, flexShrink: 0 }} title="관심사 편집"
                      onClick={(e) => { e.stopPropagation(); setEditingId(editingId === l.id ? null : l.id); setDraft(l.concerns); }}><Pencil size={12} /></button>
                  </div>
                  {editingId === l.id && (
                    <div style={{ padding: "8px 10px 4px" }}>
                      <div className="desc" style={{ fontSize: 11.5, marginBottom: 6 }}>관심사 · 한 번 정의하면 재사용됩니다</div>
                      <textarea className="inp" value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} style={{ resize: "vertical" }} />
                      <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                        <button className="btn btn-default btn-sm" style={{ flex: 1 }} onClick={() => saveConcerns(l.id)}><Check size={13} /> 저장</button>
                        {roles.length > 2 && <button className="btn btn-danger btn-sm" title="이 직군 삭제" onClick={() => removeRole(l.id)}><Trash2 size={13} /></button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!adding ? (
              <button className="side-add" onClick={() => setAdding(true)}><Plus size={15} /> 직군 추가</button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 4px 4px" }}>
                <input autoFocus className="inp" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="직군 이름" />
                <input className="inp" value={newConcerns} onChange={(e) => setNewConcerns(e.target.value)} placeholder="관심사 (쉼표 구분)" />
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-default btn-sm" style={{ flex: 1 }} onClick={addRole}>추가</button>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setAdding(false)}>취소</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          {content.trim() && (
            <div className="work-row">
              <div className="work-bubble" title="클릭하면 아래 입력창에서 수정할 수 있어요" onClick={editInDock}>{content}</div>
            </div>
          )}

          {openIds.length > 0 ? (
            <div className="answer-intro"><span style={{ color: "var(--fg)", fontWeight: 600 }}>{subject.name}</span>의 작업을 직군별 눈높이로 옮겼어요 — 조건을 다시 입력하지 않아도 됩니다.</div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--dim)", fontSize: 14 }}>
              왼쪽 <span style={{ color: "var(--mfg)" }}>대상 렌즈</span>를 누르면, 이 작업이 그 직군의 언어로 변환되어 여기에 나란히 쌓입니다.
            </div>
          )}

          <section style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {openIds.map((id) => {
              const lens = roles.find((l) => l.id === id);
              const panel = panels[id];
              if (!lens) return null;
              const stale = panel.status === "done" && panel.basedOn !== content;
              return (
                <div key={id} className="card panel" style={{ flex: "1 1 300px", minWidth: 280, overflow: "hidden", opacity: stale ? 0.5 : 1, borderColor: stale ? "var(--border)" : lens.tag + "55", transition: "opacity .2s,border-color .2s" }}>
                  <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: soft(lens.tag), borderBottom: `1px solid ${lens.tag}2E` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: lens.tag }}>
                      <span style={{ color: "var(--dim)", fontWeight: 400 }}>{subject.name}</span><ChevronRight size={13} /><span>{lens.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      <button className="btn btn-ghost btn-icon" style={{ color: lens.tag }} title="다시 생성" onClick={() => runLens(lens)}><RefreshCw size={14} /></button>
                      <button className="btn btn-ghost btn-icon" title="닫기" onClick={() => closePanel(id)}><X size={15} /></button>
                    </div>
                  </div>
                  <div style={{ padding: "15px 16px 18px" }}>
                    {panel.status === "loading" && (<div><div className="skel" style={{ height: 16, width: "85%", marginBottom: 14 }} /><div className="skel" style={{ height: 12, width: "100%", marginBottom: 8 }} /><div className="skel" style={{ height: 12, width: "70%" }} /></div>)}
                    {panel.status === "error" && <div style={{ fontSize: 13.5, color: "#E0B341" }}>변환 실패. 새로고침으로 다시 시도하세요.</div>}
                    {panel.status === "done" && panel.data && (
                      <div>
                        <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{panel.data.headline}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {(panel.data.points || []).map((pt, i) => (
                            <div key={i}>
                              <span className="badge" style={{ background: soft(lens.tag), color: lens.tag }}>{pt.label}</span>
                              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--mfg)", marginTop: 5 }}>{pt.detail}</div>
                            </div>
                          ))}
                        </div>
                        {stale && <div style={{ marginTop: 12, fontSize: 12, color: "#E0B341" }}>이전 작업 기준입니다. 새로고침하면 최신 작업을 반영합니다.</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <div className="dock">
        <div className="dock-inner">
          {speechSupported && (
            <button className={"btn btn-icon mic-btn" + (listening ? " listening" : "")} style={{ width: 34, height: 34, flexShrink: 0 }}
              title={listening ? "음성 입력 중지" : "음성으로 입력"} onClick={toggleVoice}><Mic size={17} /></button>
          )}
          <textarea ref={dockRef} rows={1} defaultValue="" onInput={onDockInput}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDock(); } }}
            placeholder="작업을 새로 입력하거나 수정하세요 — 열린 직군 렌즈가 한 번에 갱신됩니다"
            style={{ flex: 1, minWidth: 0, width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 15, lineHeight: 1.5, color: "var(--fg)", minHeight: 24, maxHeight: 120, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "7px 4px" }} />
          <button className="btn btn-icon" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: dockHasText ? "var(--fg)" : "#2a2a2e", color: dockHasText ? "#18181B" : "var(--dim)" }}
            disabled={!dockHasText} onClick={sendDock} title="보내기"><ArrowUp size={18} /></button>
        </div>
      </div>
    </div>
  );
}
