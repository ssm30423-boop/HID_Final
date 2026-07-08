import React, { useState, useRef, useEffect } from "react";
import { Plus, X, RefreshCw, Pencil, Check, ChevronRight, ChevronDown, ArrowUp, Trash2, Mic, Loader2, Sparkles, Copy } from "lucide-react";

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

function LensLogo({ size = 36 }) {
  // Logo_White2.svg 원본 — 별 외곽 / 눈 윤곽 / 눈동자 3패스 분리본
  return (
    <svg className="lens-logo" width={size} height={size} viewBox="0 0 84 84" fill="none" role="img" aria-label="렌즈">
      <g className="logo-spin">
        <path fill="currentColor" d="M28.2 18.3v-.8l.2-1.2-.1.4c.3-2 2-3.6 3.3-4.6l1.2-.6.7-.3.9-.1c-.1 0-1.3.2-1.9.5l-.9.5-.5.5s-1 .8-1.3 1.3c-.9 1-1.3 1.9-1.5 3.6zm22.4 56.6-.8.3h-.4l-.6-.2-.9-.2.9.2q.1 0 0 0l-.7-.2.7.1.7.1q.4.2 1.5-.5l1.2-1.4c0-.2-.5.7-.3.4l.5-1V72l-.1.4.2-.5-.3.5-.1.1v.4-.3q-.6 1-1.3 1.7-.6.5-.9.4h-.2.2q.3.1 1-.4l.6-.7.5-.6-.4.7-.7.7q-.9.6-1.3.5h-.8q-1.3-.4-1.8-.8-.5-.2.7.5c-.6-.2-1.7-1-1.7-1l1.4 1c.6.3 1.3.4 1 .4q-1-.2-2-1.1c-2.2-1.8-2.3-2.3-2.9-2.8l-1.7-1.7.1.2-1-1-2.5-2.3-.7.6-2.8 3.5q-.7.8-1.7 1.4l-1.5.5-3.4.9-1.5-.1-1.5-.5q-.5 0-.6-.3l.6.3q-.6-.2-1.4-1l-.8-1.4-.5-1.2.8 2c.4.6-.5-.8-.9-2.3-.7-3.4.5-6.4.7-7.8v-.5.5l-.1.1.8-3.3V57l.2-1.2v-.6l-.5-.2-1.9-.3-4.2-.3h-2.8c-1.6 0-.2-.2-2.8 0 2 0 0 0-1.5.4l-.9.2q-1.6.3-3-.5c-.9-.5-1-1-1.2-1.4l-.2-.7L5 52c-.3-.8 0-2 .2-2.4l.8-1.2L7 47c1.6-1.8 3-2.5 4.4-3.5-.6.5-.1.1.4-.2l.7-.5-.7.5q-.6.4-.1.2l.1-.2 3.4-2.1c-1 .6 1.3-.9 1.7-1l.5-.4c1-.6 3-2.2 3.4-3.2l-.1-.1-1-.3h.2l-2.2-.3h-1.3l-4.6-.3h.7H11l-3.7-.4-1.4-.5a4 4 0 0 1-1.7-1.3q.4.6 1.1 1-.8-.3-1.1-1-.6-.6-.6-1.5c0-1.4.6-2 1-2.4l-.7 1 .3-.5 1.2-1.2.3-.2.7-.5 1.7-1 .8-.4c3-1.5 0 0-.1 0-.2.2 1-.3-1.7 1.1l1.1-.5 1.7-.9c.7-.4 0 0 .2-.2l.4-.2 2.1-.9c1-.2-.5.2-2 1l1.6-.6c2.3-.8 1-.5 1.5-.7l.3-.1c2.2-.6.9-.2 1-.2l1.1-.2h.4q.4 0 0 0h-.3l.3-.1c1.2-.2 1.2-.1 1.7 0 1.2-.2.9 0 1.3.1 1.2.2 1 0 1 0 .3 0 1.8.5 2.9 1h.5-.6l-1.5-.6c-1.6-.4 2.2.8 1 .5l.5.2h.6l1.3-.1h-1l1.3-.2-.9.1c.4 0 4-1 1.3-.1l1-.3q.3-.2.5-1l-.3.8v.2l-.1.1q0 .2 0 0l.2-.1h.1l.3-.2h-.4l.6-1.5.2-1.4.2-1.3c0 .2 0-1.7.2-3l.2-1c0-.2-.2.3-.2.2.1-1.1 1.8-3.2 2.6-3.8l.7-.6.2-.2.5-.2c.5-.4 3.3-1 3.9-.9h.8q.9 0 2.2.9l.7.5-.5-.4c-.5-.5-1.5-1-.9-.7l1.4 1 .4.3 1.3 1.4-1.5-1.4 1.5 1.4.7.6.5.7c0 .1.7.5-.8-1l1 1 .5.7q-.1-.1-.2 0 0-.2 1.3 2.2v-.2l.4 1v-.2l.1.6-.2-.4.2.6.1.1h.3q-.1 0 0 0h-.1q-.1 0 0 0v-.1l.3-.2.6-.5-.2.2.8-.9.8-1 1.8-1.7.8-.7 2-1.2h-.2q-1.5.9-1.3.9l1.3-.8 2-.6.4-.1q3.1-.4 4.6.5t1.3 1q.1-.1-1.3-1l.1.1c1.3.7 1.5 1.5 1.7 1.9l.3.5v.2l.3.8v4.3l-.1.8v.3l-.3 4v-1l-.2 2.2v.2l.1.2.6.9.2.1-.2-.1-.5-.8-.2-.5v-.3l.1-.3v.6l.1.4.6.8c.1.4 1.6 1 2.8 1.5q3 1.1 6.4 2.1a63 63 0 0 1-7.6-2.5l-1.1-.5 2.2 1 4.3 1.4q-.1 0 0 0l2.4.7s-.9-.2-.6 0c.6.2.9 0 1.4.3l1.5.4 3 1q.7.3 0 0l-.9-.4-1.2-.4 1 .3 1.5.6.8.6q.4.8.4 1.2v1.1l-.3.6q0 .6-.4 1l-.8 1.6-.1.2-.8 1.2-.3.6-1 1.3.2-.3.6-.9.1-.1.3-.4.5-.9c.2-.2 0 0 .1-.3 0 0 .8-1 .7-1.2l-1.6 2.7c-1 1.8-3 3.7-4.5 4.6l-1.9.8 1.9-.8c-1.7 1-3.2 1-3.4 1l-1.2.3h.8c1-.3 2.4-.4 3.8-1.3a12 12 0 0 0 3.4-3c.1-.1.2 0-.5.8l.2-.3-1.6 1.5v.1l-1.9 1.2-1.5.6-1.4.3-1.2.2.7 1 1.4 2-1.6-2.2-.6-.8.8 1.2 1.9 2.6a11 11 0 0 1 1.2 6.7 3 3 0 0 1-1.1 2.2q-1 .8-2 .8h-1.3l-1.6-.4 1.6.4c-1.1 0-4-1.3-5-1.6l-.7-.2-1.1-.3-1.5-.5-1-.3-.2-.2-.8-.3-.2-.1h.1c5.9 1.9 1.5.5-.7-.2h-.2l-1.7-.7.2.3 1.6.6-1.6-.6.4 1.2.3 1.3-.4-1.5q0-.5-.3-.8v-.2h-.1l.4 1v.2q0 .4 0 0v-.2l-.4-.7.3.7v.5c.5 2 .2.1.3 1l.3 1.2v-.2.6l.1.3v1.6l-.4 2.3v-.1l-.3 1.7v-.2l-.2 1.8.3-1.4-.1.6v-.2.5l-.3 1.9v1-.4.7c.3-.7.4-1 0 .2l-.2 1v-.8.2l-.1.5v-.2l-.1.2c-.4.7-.2.3-.2.2l-1 1.3-.1.2zM35 11.2c.4 0 1.9-.2 1.2-.2zM49.5 72l.1-.3.5-1 .3-1.3q0-.3 0 0l-.2.7c.3-2.1 0 0 0 0-.2 0 .8-5.3.9-6.2l.1-1.3V62c-.2-.8 0-.2 0-.3l-.6-2.4v-.2.2-.2.1q-.1-.6-.7-1.6l-.5-1.4v-1.1q.2-.8 1-1.2l-.3.2q-.3 0-.6.6l-.2 1.2v.4-.5q0-.6.3-1.4.7-.7 1.2-.7h.6l.5.2h.1l3.5 1.4 6 2c2 .6 4 1.6 5.2 1.4l-1.2-.1-1.6-.5 1.3.4 1.2.2q.5 0 .6-.2h.2v-.2.1H67v.1-2.7.3-.6l-.4-1.5s0 .3-.2-.2l-.1-.2-1.2-1.6.5.8.6.9h.2v.2l.4 1.1c-.1-.1-.3-.9-.6-1.3l-.5-.7.5.7c.3.4.5 1.2.6 1.4q-.1-.2 0 .8l.1.8v1.8-.1h-.2.2v-2l-.3-1.7-.4-1q-1.2-1.4-2.5-3.3l-.3-.3-.3-.6c-.2-.3-.4-.6-.6-1.8V47l.1-.1.1-.3.8-1q1-.7 1.1-.6l.5-.1 1.4-.4q1.5-.1 2.5-.7-.2 0 0 0h.1a8 8 0 0 0 3.3-3.4l.4-.7-.4.7-.7 1 .7-1 2-3.5h-.2.2l-1.8-.6.6.1-1-.2-.7-.3c-.6-.1.2.1 1 .4l-5.8-1.7c-1-.3 1.4.4.4 0-2.2-.7-.6-.1-.7-.1-.6-.1-2.4-1-2.4-.8l-.7-.3-1-.4-1.6-.8a5 5 0 0 1-1.7-1.7v.1c.3.3.9 1 1.3 1.2l.8.5q.1-.1 2.2 1l.4.1q.3 0-.4-.2l-.9-.4c-.5-.3-1.8-.6-3.2-2.2q-1-1-1.4-2.9v-1l.1-.5v-.9.6l.3-2.5.2-6.2q-.5-1-.6-.9-1-.4-1.8-.3c-.4 0-1.6.2-2.1.4.6-.1.2 0-.3.2l-1.2.8-1.1 1-1.8 1.7c-1 1-1.7 2.4-3.8 2.6h-.1s-.4.2-1.4-.3q-.9-.3-1.6-1.6l-.6-1.5c-.3-.8-1-1.8-.5-.8q-.6-1.4-1.8-2.3-.6-.4-1-1l-.3-.2-.3-.3-1-.7H37l1.2.7 1 1-1-1c-.5-.5-1.2-.9-1.2-.8h-1 .1l-1.3.2-.6.3s1-.4 2.1-.5c-.3 0 0 .1-.1.1l-2.5.7c-.5.3-.4.1-.7.5l.7-.6.3-.2-.4.2c-1 .6-2.1 2-2 3l-.1 1.4v.3l-.3 2.8v.1q.1.2-.4 2l-.6 1.7.6-1.4a8 8 0 0 1-1.2 2.5l.2-.2.4-.8.1-.2.7-1.5-.4.9-.3.9-.3.5q-.1.4-1 1l-1.3.4 1.2-.5q.8-.4.9-.6l.1-.3q0 .2-.5.6l-.5.3-1.7.6c-.4 0 .8-.3 1.7-.7q.8-.4.8-.7l.2-.4q.2-.2 0-.1l-.2.5-.8.7-2.1.7-.6.1-.7.1s-1.8.3-1.5.1q-.9 0-1.7-.2c-1.6-.5-1.2-.4 0 0q2 .6 3.6.1c-.8.1-2 .5-3.6 0l-.7-.3H21a7 7 0 0 0-3.9-.5l-2.4.4c-.5.1 0 0-.1.1l-3.2 1.2.6-.4-3.3 1.7h.2l-1.7 1h.2-.1v.1q.5-.5 1-.6-.4.1-1 .6l1.6.4-1.2-.3 2 .3h1.5c-3 0 .8.2 1.6.2h.8c3.4.2 1.2.1 1.9.2h1.4l1 .1.5.1 1.8.2 1 .2q.8.2.3 0c-1.3-.4-3.3-.4-4.6-.6l2.5.2s-.7 0 0 0c.8.2 1.8 0 3.4.9l.6.5.4.4-1.3-1 .2.2q.6.3.8.7l.5 1 .1.5v.3q.1.7-.4 1.8l-.9 1.4.3-.3c-.7 1-.3.4-.5.6l-.6.7-2 1.7.6-.5.8-.6c1.9-1.8 0 0 .5-.4l.5-.5.3-.3c.3-.4 0 0 0 0 .2-.4 1.2-1.8.6-.8q.5-.6.5-1l.2-.2-.1.3a11 11 0 0 1-3 3.4l-1.5 1.2c-.4.2-1.6.8-1.5 1l-2.2 1.1c-.5.3-.3.3-.3.3l-1 .6-.4.4-1 .6c-1.2.8-.6.5-.9.7-.1.1-1.6 1-2.1 1.8l-.6.6-.8 1-.1.3v.1h-.1.1l.1.2h-.1v-.1h-.2.2v.1h.1v.2-.2h.1v.1h.1v-.1l-.1-.1h-.1v-.1l.1-.2v.2-.1l.3-.4-.2.4.2-.3-.3.4h.2l.5-.1c.2 0-.8 0 2-.3H11l4.4-.2c-.2 0-1 0 0 0h.2c.3 0 3.4 0 6.5.3q1.2.1 2.6.5.7 0 1.4.5a3 3 0 0 1 1.4 1.7l.2.8c.2 1 0 2.8 0 2.9l-.8 4v.3q0 .2 0 0l-.1.1c-.2.7-.8 4-.8 5.3v.2V65v1.7s-.1-.1-.1.6v.3l.5 1.2.1.3q1 .4 1.7.2a14 14 0 0 0 3.4-1c.3-.3 0 0 .4-.2 0-.2 1.9-2.4 2-2.5.5-.8-1.1 1.1-1.2 1.2l1.5-1.8s-1 1.3.3-.3l-.5.5 1-1 1-1 .7-.5.7-.3q.6-.3 1.7 0l.2.2h.2-.4l-.6-.2.6.1.5.3.9.7.8.7-.4-.3 2.3 2c.6.7 0 .2.7.8l1.4 1.4.6.6 1.9 2.2q.7.6 1.3.8l.4-.8c.1-.2.3-.6.2-.2q0 .5-.4 1zM27.2 24.3l.5-1.2.2-1.5V21l.1-1.7c0-.4 0 0 0 0s.2-1.2.1-.2v.9l-.1 1.4v-.7l.3-2.7-.3 3.7-.1.1-.2 1.3v.1zm4.3-6.6-.1 1.3zq0-.3 0 0m-3.2 2.1.1-1.2zm27.9-6.7-2.2.2c.7-.2 2.3-.2 2.2-.2m-12 4.3-.5-1zm-16.6 6.3.3-.5.1-.6-.2.6zm3.4.2.3-2zm14.4-4.4h-.1zl.4-.4-.3.3zm13-2.1-.4-.7-.2-.2h-.3q-.2-.2.3 0l.2.2zM12 28.7c.5-.2 1.3-.4 1.2-.5zm.3 0c2.3-.8.5-.2.8-.4zm4.2-1.1q.6 0 .2-.1zM27 24.8l.2-.2v.2zm-2.6.7s.6-.1.5-.2c-.7.1-1.3.3-.5.2m-13.2 3.7.6-.2v-.1h.1zm16-4.2v-.2zm-9.4 2.4h.9zm40.5-7.6c0-1.2 0-2.6-.1-.7v-1.9l-.2-.4.3.6zM10 30l1-.5zm-3 1.5-.1-.2zm54.6-13.8-.1-.8v.8m-15 5-.9.2q-.6 0-1.6-.3l-.8-.5.8.5a3 3 0 0 0 2.6.1M8.8 32.2l-1.1-.3q-.4 0 0 0zM58.3 19v-.7zm-49 13H9c-.4 0-1.2-.2-1 0zm52.2-13v-1zm.2.6V18zm-51 12.7-1.4-.1zM58.3 20v-.4zM11.6 32.3h-.5zm4.9.4c.7 0-1-.2-1.2-.1zm45-12.4v.6zM23 34.3l-.5-.4-1-.5h-.2l-1.6-.3q.9 0 2 .3a26 26 0 0 0-4.9-.7l1.2.1.4.1c.2.1 2.3 0 4 1zm38.6-11.1v-2zm-3.6.3v-1.1zm-.3 4.8v-.4q-.1-1.5.1-2.3v-.3q.4-3.2 0 1.2v-.2l-.2 1.6zm-36.7 8v.1M61.2 27v-.5c.1-.4.2-.9.2-.4zM23.5 38.3q0 .2.2-.3l.4-1.8q0-.4 0 0a4 4 0 0 1-.6 2.1m34.7-8.9q-.2 0-.5-1.5V27v.8q.1 1 .5 1.5m-34.5 9.3q0 .2.3-.5.4-.8.4-1.3s0 .7-.4 1.3zm35-8.4c0 .2.4.7-.1.1l-1-1.9q0-.4.3.5zm-35.3 9q.1-.4.6-1l.4-.9-.3.8zM61.8 29l-.1-.1-.4-.5zm1.3.5-1.1-.6.3.2zM18 43.6c-.2 0 .9-.6 1.3-.9h.2q-.1-.1.4-.4l.3-.2c.1 0 2.2-1.8 1.5-1.1l-2.4 1.7zm-8.4 1.2L11 44zM7 47.3l.3-.3c.5-.7 1.2-1.2.7-.8zM17.5 44s-.2 0 .3-.2zM14 46.2c-.2.2-1.2 1-.8.5l1.1-.8.3-.1c.3-.2-.2 0 .5-.3l-.2.1 1-.6-1.2.8-.5.4q-.3.1-.2 0m55.2-14.5-1.4-.4zM11.5 47.6l1-.8zm1.2-.8c-.2 0-3.2 2.3-1.5 1zM9.6 49l1.4-1.3-.5.4-1.1 1zm.5-.2 1-.8c.6-.5-.8.5-1 .8M64.6 34c.3.1 2.8 1 2 .6zM9.7 49.6l1.1-1.2-.8.9zm-.9.5q-.8.8.1-.2zm.2.6.3-.6c.8-1 .2-.2-.3.6M8 51l.1-.2.2-.3zm.2.4v-.3H8zm.3-.3V51m.3.1q.5-.2 0 0h-.2zm3.4-.5c-1.1 0 0 0 0 0L10 51l1.6-.2s-1.4.3.7 0m-3.6.7v-.1m-.1 0v-.1m.4 0 .3-.2h-.5v.1zm-.7.2q.7.2.7 0h-.4zm4.5-1c.9 0 .2-.1-.4 0zM72.7 36l-1.8-.6.6.2zq.1 0 0 0m4.8 2.3-.1.3.4-.7.2-.8q.3-.3.2-1.3c0-.3-.3-1-.5-1.2l-.4-.4-.3-.2q-.1 0 0 0l.5.4q.5.6.7 1.4 0 1.3-.3 1.7zm-57 12.5h-1zm54.2-14.4v-.2zm.1.2v-.3zm0-.2q.1-.1 0-.1m-.4.5-.3-.1-.5-.1.7.2zm.4-.2v-.2zm-.4.2v.1M70 43.6l1.3-1q.7-.8 1.4-2L74 38c0 .2.3-.3 0 .3l-.8 1.3-.5 1q-.9 1.4-2.7 3m5.3-6.3L75 37zm-.1 0H75m-1 .5c-.6 1 0 0 0 0m1.7 3.7.7-1.4zm-6.2 2q1.7-1.3 1.8-1.6.3 0-1.3 1.3zM24.1 55v-.2zm.2.2q-.2 0 0 0m3.3 2.7.2-1.8-.1-1.8s.2 1 0 1.8zm-3.7-.7L24 56v-.5zm44.2-12.6h.3c-.4 0-.9.2-.3 0M65.9 48v-.2q0-.2 0 0zm-.3.5v-.1l.2-.1zm.6-.3H66l.1.1zM49.6 58l-.4-1.1-.2-.8V55a2 2 0 0 1 1.7-1.5h1l.3.2.4.1.7.3.7.3-.4-.1-.8-.3-.5-.2-.3-.1-.3-.1h-.8q-.4 0-1 .4l-.6 1v1.7l.1.2zm15.1-6.4c.2.1-.5-.8-.7-1zm.2.3-.8-1zm-11.3 2.7-1.2-.4zm-2.2 1.2q0-.2 0 0m15.7 2.9v-.1h.1v-2.1s0-2-.8-2.9c-1-1.5-2-2.7 0 0v.2l.3.5v.1l.5 2.6v1.6zM51.8 56v-.3zm.1-.2v-.1zm.1.1v-.2.1m.1 0v-.2zm-.6.1v-.2zm.6 0v-.1zm-.1 0v-.1m-.6.4-.2-.2H51zm-.4.1h-.2l.2.1h.1m-.1 0v.1m.3 0v.1m-1 2c0-.3-.5-1.2-.5-1.2zm2.1-1.5h-.1zm1.1 3.6-.3-1.8v-.1l-.3-.8c.2.7-.2-.1-.5-.8l.2.7-.2-.5c.3.8.8 1.9.2.3l.5 1.2c.1.9 0 0 0 .2zm-1-3.5h.1m.2 0v.1m5.2-1c.4 0-.1 0-.6-.2zm-5 1.5-.1-.3h-.1q.2.4 0-.1zm3.6.9-1.8-.6-2-.7h.1zm-3-1.5c.3.2.8.3.2 0zm7-.3-1-.4.3.1c.1 0 1 .3.7.3m-9.8 4-.3-1.3v-.1q-.2-.2 0-.2v.3zm-.2-1.3v-.2zM63.8 58l-2.2-.8-.7-.3.7.3zm-22.9 5.8-1-.9.3.2zm16.8-5.2c1.1.4.4 0-.2-.1zm2 1.2c-.9-.4-3.9-1.2-2-.6h.5q-.2.1 1 .5zM53.2 62l-.2-1.5c-.2-.7.1 1.1.2 1.5m6.7-2.5-1.4-.4c.4 0 1.4.4 1.4.4m.3.4-1.6-.5zm4.9-1.5L64 58zm-11.4 3.5v.1zM43.6 66c.6.6 1.4 1.2.9 1zl-1.7-1.5 1.6 1.3zm-11.4 2c-.4.4.8-1.2.4-.6zM53 66.3l.4-2.1v-1l.1-.1v-.7.7V62l-.1-.5v.5q.1.3 0 .4v1.4q-.1.7-.2.4v.6zm-9.7-.3c0-.2-.8-.9-1.3-1.3zm-16.1 3.1q.5.3-.4 0h-.1zm39.6-10.5h-.7c-.1 0-.3-.2.4 0zm0-.2h-.6zm.2 0q0-.2 0 0m-23.7 7.4-1-.9zm10.4-3V62zq0 .1 0 0m-10 3.7-.4-.4-.8-.8.8.8zm0-.7q.5.5.2.3zm-15.5 3.4H28zl.8-.2zm41-9.4.4-1.4v.2q-.1.8-.5 1.2-.2.4 0 0m-18.5 6.3.3-2.5zm2.2-.4.2-1.3v-.7zm.3-1.8v-.2zm-.3.6q.3-.7.1-.7zm0-.2.1-.4zm.7.6c0 .6-.2 1.6-.3 1.4l.4-2.1zm-.9 4.6.4-2.7q0-.1 0 0l.1-1v.5l.2-1.3v.1-.6c0 .6-.5 3-.7 4v.4l.2-1zm.5-1.8.5-3.3zm.5-2.6v-.6zm-.2-.5v.2zm13.9-3q.5 0-.6.2l-1.6-.2.9.1zm-14.6 7.9V69v.9zM49 72.1l-.3-.2zm.3.1.1-.2zH49zm3.7.3.2-.5.1-.4zm-.6 0v-.1l.1-.3zM50 75.2h-1.1l-.8-.3.8.2q.6.2 1.7 0 .3-.2-.6.1" />
      </g>
      <g className="logo-blink">
        <path fill="currentColor" d="M44.3 48.2h-.4zm-.5-14c-.6 0 0 .1.1.1h3.2l1.6.2c-.3.1.2.1.3.2h-.3l1.5.2 1.7.6.6.2.4.2.5.3c-.2-.3 1 .7 1.2.9V37l.2.2.6.6q.3 0 .5.3l-.1-.2.4.5.1.1.2.2.3.3.1.1c.6.6 0 0 0 0s0 .3-.4-.2l.2.2.3.3.2.1.6.8c0 .5-.2-.2-.7-.7l.4.5.3.7h.1c.1 0 .1.6.1.1v.4c.1.5 0 0 0 .1v.5q0-.2 0 0c0 .1 0 .5 0 0l-.1.8c0 .5-.2.3-.3.4v.3c0 .2-.6 1-.7 1l.5-.6q0-.2-.2 0-.1.4-.2.2l-.1.4c-.2 0 0-.2-.4.3l.2-.2-.2.3.2-.2c0 .2-.8.8-.3.3l-.4.2c0 .1.3 0 0 .2l-.3.4.4-.4-.1-.1c-.1.1-1.2 1-1.4 1l-.9.5q-.3.3-.8.3l-.2.1h-.1l-.8.3-.5.1c-.5.2.4 0 .2.1h-.4l-.5.1.5-.1-.6.1h-.2.2-.2l-.2.1h-.6l-.2.1s-.3 0 0 0h-.6c-.7 0-.2 0-.3.1-.3 0-.1-.1-.4 0h-.4.3-1.1c-.3.1.5 0 .5.1h-.8.2-3.4l-1-.2h.3-.8s-.4-.1-.4 0h.8-.2l-2.3-.2h1.5-2.1l.1-.1H38h.5-1.8l-.5-.1h1l-1.8-.1q-.6 0-.8-.2l-2-.3q-1.5-.3-2.7-1.4c-.2-.3 0-.2-.4-.6l.2.4L29 44l-.2-.2-.2-.3v-.2l-.1-.2-.1-.4v.2-.3l.3.7q.4.5 0 0l-.3-1V41h.1l.2-.8-.1.7.2-1c.1-.3-.1.6.1-.1.2-.5 0 0 0-.3v-.1l.2-.2.3-.5-.4.2v-.2q.3 0 .5-.2h.1-.3.2v-.1l.3-.3-.2.3.1-.1.3-.3.2-.4h.1v-.1l-.4.4.3-.3v-.1l.5-.4-.4.3c0-.1.5-.5.4-.3v-.2h.2-.1l.5-.3-.2.2.3-.1-.3.2.3-.1-.6.3-.5.4v.1l.3-.3.2-.1.5-.2.3-.1c-.3.2 0 0 0 0l-.2.1-.1.2.2-.2-.1.2h-.2c.3-.1 1-.4.5-.3l.3-.2-.5.2.4-.2c.7-.4.4-.5 1.2-.8l.4-.2 2.4-.6 2.2-.4H38h.7-.4l1.5-.3h.6-.1.9l.1-.1h2.6m-.7 14h.5zm-.8-.1h.2zm6.3 0H48zM41 48h.4zm7.4 0h.2zm-4.7-.1h-.1zm.6 0q.3 0 0 0m0 0H44zm1.7 0h-.4zm-6.3-.1h.2zh-.1zm2 0h-.3zm8.2-.1h-.3zm-12-.1h-.6zm-5.4-.6 1.2.2h.2l2.1.2-.2.1h.1-.4l-.4-.1h-.6zm4.5.4h-.4zm17-.8c-.2.2 0 .2-.3.3l-1.3.4h-.3.4l.3-.2h.4zm-2 .5-.3.1zm3.7-1.6-.2.2-.6.5q-.1.2-.1 0 0 .2-.4.4h-.2c.4-.3.1 0 .3-.1l.3-.3h-.2l-.6.4.9-.5.5-.3zm-1.4.7-.3.1c-.2.2.2 0 .3 0m1.1-.7-.4.3q.4-.1.4-.3m-25.9-.2.4.3zm-.1-.6.4.5zm17.2-6.9h-1l.4.1c-.3 0-.7 0-.4.1h.2q.2 0 0 0h.4-.8s.2.2-.3 0h-.9q.2 0 0 0h-2.4l-.4.1h-.8v.1h-.4l-1 .2.9-.3h-.3l-.4.2h-.7l-1.3.1-.6.2h.1-.8c-.2.2.3 0 .3.1l-.4.1h-.1.1-1 .1l-.3.2h-.4c.2.1-.3.3-.3.3l-.8.3-.4.2h-.2l-.5.3-.1-.1.4-.2-.5.2h-.3v.1-.1l-.3.5v.2h-.1l-.2.7q0-.2.1-.1l-.1.2v.4l1 1.5-.3-.4.3.3.3.3-.1-.2.4.3q.1 0 0 0l.3.1h.5-.2c-.2-.2 0 0-.2 0l-.2-.1h.4-.4q0-.2-.1-.1v-.1l-.2-.1q-.1.1-.2-.2l.3.2h.1q.3.1.2.2h.4l.5.2h.6l.2.1h1q.1.2.9.2h-.3.8-.5 2-.1l.4.1h-.1.5-.3.2-.6H40c.3 0-.3 0 0 0 .5.2.1 0 .1 0 .1 0 .6.2.6 0l.4.1H41l.8.2h-1 .2c.3 0 1.4.3 1.6.2h.1c.2 0-.1 0 0 0l2.8.2h.6l.2-.1h2c0-.1.6 0 .8 0q.4 0 .2-.2h.1l.8-.2h.1c.6-.2.4 0 .5 0h.1l-.8.2 1-.3.4-.1-.5.1.6-.2h.2c.3 0-.4 0-.3.1 0 0 1.3-.4 1.2-.5h.1l.4-.3.3-.3h-.1.1q0-.3 0 0h-.2l.1-.1.4-.3s-.5.4-.2.3l.2-.3-.2.4.4-.4v-.1l.1-.1.2-.2.2-.3-.5.5.4-.5.1-.3h.1v-.1l-.4-.5-.4-.3-.2-.2-.2-.2-.4-.3c.5.5 0 .1-.2 0l-.2-.2c.5.3-.1-.2-.3-.3l-.3-.3-.4-.3-.4-.2h-.1l.7.4c.1.2-.5-.2-.5-.2l-.4-.2-.1-.1h.2-.1v-.3h-.2l-.4-.2.2.1h-.3l-.1-.1-.5-.1h.3c.5.2 0 .1 0 .2h.3l.2.1h.2v.1h-.2l-.6-.2h-.4s-.3-.3-.3 0l-.5-.3h-.8s-.9-.2-1-.1h.2zm-1.5 7h-.5zm-1 0h.2zm0-.2h.5c.5.2-.4.1-.6.1zm4.1 0H48zm.4 0h-.4zm-4.6 0q-.1 0 0 0m-1.2 0h-.3c-.7-.1 0 0 .2 0m.3 0h.3zm13.3 0q.2-.3 0-.2zm-14.3 0h.3zm-3.1-.2h.3zm3 0h.2zm-6.3-.2h.4l1.7.2h.3l-.1-.1H37zm4.9.1H40zm-2.1 0c-.1 0-1-.1-.8 0zm1.2 0h-.3zm-1.5-.1q-.2 0 0 0m-1.1 0h-.3zm.3 0H37zc-.3 0 0 0 0 0m-2.2 0q-.2 0 0 0m.5-.3q1.1.1.1.1zm-3.3-.2H32zl.7.2q.3 0 0 0l-.2-.1h-.1zm1 .2h.3zm-4.7-.3.2.4zm.1.3c0-.3-.5-.8-.3-.4h.1l.1.3zm4.8 0h-.3zm19.3-.4q.4-.1 0 .1h-.2l-.2.1zm-24 0 .2.2zm3.4 0 .1.1zm-.4-.3h.1v.1zm21.4 0-.2.1zm-25-2-.1.7q0 .9.3 1.1l-.3-1zm25.6 1.3-.1.2zm-26-.9.1.9zm3.5.5v.2zm-2.8-.3q0 .3 0 0m2.4 0q0 .1 0 0m.2-.5v.4zl.1-.2zm-.3.2v.2zm23.4 0 .1.1zm.3 0h.1zm-26-.4q-.2.2 0 0m.3-.4-.1.4zm2.2.2-.1.2zm-3 .2.1-.4zm25.4-.5.4.5zm-24.8.3q0 .2 0 0m.3-1.6v.1l-.3.6q.2 0-.1.4v.2l-.1.3c0 .3.1-.7.3-.8-.3 1 .4-.6 0 0 .2-.5 0-.1 0-.2l.1-.5zm-.3.2-.2.5v.1l-.3.9zm2.7 1v.4zm21.7-.5.2.3zm-.2 0 .2.2zm-.1-.3.2.2zm-23.6-.3q0-.2 0 0l-.1.1-.2.4.2-.4zm.2.1-.1.1q0 .1 0 0l.2-.3zm3.3 0h-.2zm.9-.2-.4.1zm18.7.1H52zm-17-.4H35l-.1.1-.3.1zm17 .2c.1.2-.2 0 0 0m-17.2 0h-.2zm-5.5-.3-.1.2zM52 39q-.2.1.1.2zm-17.7 0-.3.2zm-4.8 0v.2zm21.6-.6.2.1.2.2-.3-.1.7.4-.2-.1v-.1zm-21.5.4q-.1.2-.1 0v.2zm5.1.2h-.1zm.6-.1h-.2zm-.5 0h-.3zm-5.4 0h-.1m.6-.2-.2.1v.1h.1zm4.6.1-.2.1zm15.7 0h.3zm.1 0h.3zM30 38.2l-.4.4.3-.1zm6.7.4h-.1zm-6.1-1.3-.3.2-.4.6-.2.2q-.1.1 0 0l-.1.1v.1l.7-.9.1-.1zm7.4 1-.3.1zm-8.2-.2-.1.3zm8.6.2q.2 0 0 0m-8.6-.6c.2-.1-.4.6-.4.7zm19.4.4h.4v.1l.4.1zm1.4.2h.2zm-21.2-.1v.1q-.1 0 0-.1M48 38h.3v.1h.2l.2.1h-.4v-.1zm-17.8 0-.2.2h.1zm19 .1h-.1m-19.4-.4s-.4.6-.4.4zm.5 0-.3.4zm10.2.3h-.2zm6 0q-.1-.2.2 0zm.6 0h.4zm-5 0h-.6zm2.9 0q-.1 0 0 0m-.1 0h-.3zm.2 0q.1 0 0 0h.4zm-1.5 0h-.2zm2.9 0h.3zm1.6-.1s-.8-.1-.4 0zm-2 0q-.2 0 0 0m2-.1h-.3zm-1 0h-.2zm-.5-.2h-.2zm-.4 0h.1zm.8 0q-.2-.1 0 0m.2 0h.5zm-.4-.1q-.3 0 0 0m-.6 0h-.4zh.2zm-14.9-.2h.2zm.2-.5-.2.1zm-.8 0q-.2.2-.2 0zm17.6-2.3h.3zm-6.3-.2h.3zm2.5 0H44zm-3.2 0h.5z" />
        <g className="logo-pupil">
          <path fill="currentColor" d="M42.7 36.8h.7l2.4.4.5.3h.1l.8.5q.3.1.8.7l.1.9q0 .8-.3 1.2l.3 1.2v.7c0 .4 0 1.3-.9 2l-.4.1-.5.2-.3.1-.7.6-.2.1-1.7 1h-.7c-.5 0-1.3.2-2.4-.4l-.2-.2-.5-.5-.4-.4-.3-.1-.7-.5q-.5-.2-.8-1.3v-1.5l-.1-.4-.1-1q0-.6.3-1.6.4-.6 1-1h.5a8 8 0 0 1 3-.3h2.3l.9.2.6.4.8.4.4.3q.2.1.3.6v.2-.7l-.5-.4-.7-.5h-.2l-.4-.2-1-.3-1.2-.2h-1.8l-.1-.1-.2-.1.2-.2.3-.1h.1z" />
        </g>
      </g>
    </svg>
  );
}

function Tooltip({ label, children }) {
  return (
    <span className="tip-wrap">
      {children}
      <span className="tip">{label}</span>
    </span>
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
  const [sentAt, setSentAt] = useState(null);
  const [copied, setCopied] = useState(false);

  function fmtTime(d) {
    if (!d) return "";
    let h = d.getHours(); const m = d.getMinutes();
    const ap = h < 12 ? "오전" : "오후";
    h = h % 12; if (h === 0) h = 12;
    return `${ap} ${h}:${String(m).padStart(2, "0")}`;
  }
  function copyContent() {
    const text = content;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1400); };
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch { done(); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else { fallback(); }
  }
  function resendAll() {
    if (!content.trim()) return;
    setSentAt(new Date());
    const ids = Object.keys(panels).filter((id) => panels[id]);
    ids.forEach((id) => { const r = roles.find((x) => x.id === id); if (r) runLens(r, content); });
  }

  // 말풍선 인라인 편집 (Claude 방식: 버블이 입력으로 바뀌고 취소/저장)
  const [editingWork, setEditingWork] = useState(false);
  const editRef = useRef(null);
  function startEditWork() {
    setEditingWork(true);
    requestAnimationFrame(() => {
      const el = editRef.current;
      if (el) {
        el.value = content;
        el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 200) + "px";
        el.focus(); el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  }
  function onEditInput() {
    const el = editRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 200) + "px"; }
  }
  function cancelEditWork() { setEditingWork(false); }
  function saveEditWork() {
    const el = editRef.current;
    const t = (el ? el.value : "").trim();
    setEditingWork(false);
    if (!t || t === content) return;
    setContent(t); setSentAt(new Date());
    const ids = Object.keys(panels).filter((id) => panels[id]);
    ids.forEach((id) => { const r = roles.find((x) => x.id === id); if (r) runLens(r, t); });
  }

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

  // 전역 Steps — AI가 변환을 진행하는 과정을 단계로 보여줌 (첫 진입 전송 시)
  const STEP_LABELS = [
    "작업의 맥락을 읽고 있어요",
    "직군별 관심사를 불러오는 중",
    "각 직군의 언어로 변환하는 중",
    "직군별 요약을 정리했어요",
  ];
  const [flow, setFlow] = useState(null); // null | { idx, done }
  const [flowOpen, setFlowOpen] = useState(false); // 완료 후 상세 펼침
  const flowTimer = useRef(null);
  function startFlow() {
    if (flowTimer.current) clearInterval(flowTimer.current);
    setFlowOpen(false);
    setFlow({ idx: 0, done: false });
    flowTimer.current = setInterval(() => {
      setFlow((f) => {
        if (!f) return f;
        if (f.idx >= STEP_LABELS.length - 1) {
          clearInterval(flowTimer.current); flowTimer.current = null;
          return { idx: f.idx, done: true };
        }
        return { idx: f.idx + 1, done: false };
      });
    }, 700);
  }
  useEffect(() => () => { if (flowTimer.current) clearInterval(flowTimer.current); }, []);

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
    setSentAt(new Date());
    startFlow(); // AI 진행 단계 연출 시작
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
    setContent(t); setSentAt(new Date());
    openIds.forEach((id) => { const r = roles.find((x) => x.id === id); if (r) runLens(r, t); });
    if (el) el.value = ""; setDockHasText(false); requestAnimationFrame(() => adjust(dockRef.current));
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
        .side-brand { padding:0 6px; margin-bottom:22px; display:flex; align-items:center; color:var(--fg); }

        /* 살아있는 로고 — 외곽은 천천히 회전, 눈동자는 두리번, 이따금 깜빡 */
        .lens-logo { display:block; overflow:visible; color:var(--fg); }
        .logo-spin { transform-origin:41px 43px; animation:logoSpin 46s linear infinite; }
        .logo-blink { transform-origin:43px 41px; animation:logoBlink 7.2s ease-in-out infinite; }
        .logo-pupil { animation:logoPupil 8.6s ease-in-out infinite; }
        @keyframes logoSpin { to { transform:rotate(360deg); } }
        @keyframes logoBlink {
          0%, 36%, 40%, 74%, 78%, 100% { transform:scaleY(1); }
          38% { transform:scaleY(0.06); }
          76% { transform:scaleY(0.06); }
        }
        @keyframes logoPupil {
          0%, 15%, 100% { transform:translate(0,0); }
          19%, 29% { transform:translate(-3.5px,0.6px); }
          35%, 45% { transform:translate(3.5px,-0.6px); }
          51%, 60% { transform:translate(0,0); }
          65%, 72% { transform:translate(2.2px,-1.6px); }
          79% { transform:translate(0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-spin, .logo-blink, .logo-pupil { animation:none; }
        }
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
        .work-col { display:flex; flex-direction:column; align-items:flex-end; max-width:78%; }
        .work-bubble { background:#202024; border:1px solid var(--border); border-radius:18px; padding:12px 16px; font-size:15.5px; line-height:1.55; color:var(--fg); cursor:text; transition:border-color .15s; }
        .work-bubble:hover { border-color:#3a3a40; }
        .work-tools { display:flex; align-items:center; gap:2px; margin-top:5px; height:26px; opacity:0; transition:opacity .15s; }
        .work-col:hover .work-tools { opacity:1; }
        .work-time { font-size:11.5px; color:var(--dim); margin-right:6px; }
        .msg-btn { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:7px; border:none; background:transparent; color:var(--dim); cursor:pointer; transition:background .12s,color .12s; }
        .msg-btn:hover { background:var(--muted); color:var(--fg); }
        .tip-wrap { position:relative; display:inline-flex; }
        .tip { position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%) translateY(2px); background:#e9e9ec; color:#18181B; font-size:11.5px; font-weight:500; line-height:1; white-space:nowrap; padding:5px 7px; border-radius:6px; opacity:0; pointer-events:none; transition:opacity .12s,transform .12s; box-shadow:0 4px 14px rgba(0,0,0,.4); z-index:50; }
        .tip-wrap:hover .tip { opacity:1; transform:translateX(-50%) translateY(0); }
        .work-edit { width:100%; background:#18181C; border:1.5px solid #4a7bd4; border-radius:16px; padding:14px 16px 12px; box-shadow:0 0 0 3px rgba(74,123,212,.15); animation:fadeIn .12s ease; }
        .work-edit textarea { width:100%; border:none; outline:none; resize:none; background:transparent; font-size:15.5px; line-height:1.55; color:var(--fg); min-height:48px; max-height:200px; overflow-y:auto; white-space:pre-wrap; word-break:break-word; }
        .work-edit-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:10px; }
        .work-edit-hint { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--dim); line-height:1.45; }
        .answer-intro { font-size:13.5px; color:var(--mfg); margin-bottom:14px; }

        /* Steps — AI 진행 단계 */
        .steps { padding:14px 16px 6px; margin-bottom:16px; max-width:520px; animation:fadeIn .2s ease; }
        .step-row { display:flex; gap:11px; }
        .step-rail { display:flex; flex-direction:column; align-items:center; width:20px; flex-shrink:0; }
        .step-ico { width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid var(--border); background:var(--muted); color:var(--dim); transition:background .2s,color .2s,border-color .2s; }
        .step-row[data-state="done"] .step-ico { background:rgba(148,166,236,.16); border-color:rgba(148,166,236,.4); color:#94A6EC; }
        .step-row[data-state="active"] .step-ico { background:rgba(148,166,236,.16); border-color:rgba(148,166,236,.4); color:#94A6EC; }
        .step-dot { width:5px; height:5px; border-radius:50%; background:var(--dim); }
        .step-bar { width:2px; flex:1; min-height:14px; background:var(--border); border-radius:1px; margin:3px 0; transition:background .3s; }
        .step-bar[data-fill="true"] { background:rgba(148,166,236,.5); }
        .step-label { font-size:13.5px; padding:1px 0 14px; color:var(--dim); transition:color .2s; }
        .step-row[data-state="active"] .step-label { color:var(--fg); }
        .step-row[data-state="done"] .step-label { color:var(--mfg); }
        .spin { animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .steps-summary { display:inline-flex; align-items:center; gap:8px; padding:7px 12px; border-radius:18px; border:1px solid var(--border); background:var(--card); color:var(--mfg); font-size:13.5px; cursor:pointer; transition:background .15s,border-color .15s; font-family:inherit; }
        .steps-summary:hover { background:var(--muted); }

        .dock { position:fixed; left:var(--side); right:0; bottom:0; z-index:30; padding:18px 32px 22px; background:linear-gradient(to top, #08080A 55%, rgba(8,8,10,0)); }
        .dock-inner { max-width:1080px; margin:0 auto; display:flex; align-items:center; gap:10px; background:rgba(20,20,23,.92); backdrop-filter:blur(12px); border:1px solid #2c2c31; border-radius:24px; padding:8px 8px 8px 10px; box-shadow:0 12px 50px rgba(0,0,0,.5); transition:transform .35s cubic-bezier(.22,1,.36,1), border-color .25s, box-shadow .35s; }
        .dock-inner:focus-within { border-color:#3d3d44; }
        /* 음성 인식 중: 입력창이 떠오르고 커지며, 배경은 가라앉음 */
        .listen-backdrop { position:fixed; inset:0; z-index:29; background:rgba(8,8,10,.45); backdrop-filter:blur(5px); animation:fadeIn .25s ease; }
        .dock.listening { z-index:31; }
        .dock.listening .dock-inner { transform:translateY(-10px) scale(1.025); border-color:rgba(229,112,91,.5); box-shadow:0 22px 70px rgba(0,0,0,.65), 0 0 0 4px rgba(229,112,91,.10); }
        .dock.listening textarea::placeholder { color:#E5705B; }
        @media (prefers-reduced-motion: reduce) { .dock.listening .dock-inner { transform:none; } .listen-backdrop { backdrop-filter:none; } }
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
          <h1 style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 500, margin: "0 0 30px", letterSpacing: "-0.02em", color: "#EDEDF0" }}>
            <LensLogo size={44} />
            무엇을 공유해 볼까요?
          </h1>
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
        <div className="side-brand"><LensLogo size={36} /></div>
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
              {editingWork ? (
                <div className="work-edit">
                  <textarea ref={editRef} defaultValue={content} onInput={onEditInput} rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") { e.preventDefault(); cancelEditWork(); }
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveEditWork(); }
                    }} />
                  <div className="work-edit-foot">
                    <span className="work-edit-hint">저장하면 열린 직군 렌즈가 새 작업 기준으로 다시 생성됩니다.</span>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-outline btn-sm" onClick={cancelEditWork}>취소</button>
                      <button className="btn btn-default btn-sm" onClick={saveEditWork}>저장</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="work-col">
                  <div className="work-bubble" title="클릭하면 이 자리에서 수정할 수 있어요" onClick={startEditWork}>{content}</div>
                  <div className="work-tools">
                    <span className="work-time">{fmtTime(sentAt)}</span>
                    <Tooltip label="재시도"><button className="msg-btn" onClick={resendAll}><RefreshCw size={14} /></button></Tooltip>
                    <Tooltip label="수정"><button className="msg-btn" onClick={startEditWork}><Pencil size={14} /></button></Tooltip>
                    <Tooltip label={copied ? "복사됨" : "복사"}><button className="msg-btn" onClick={copyContent}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></Tooltip>
                  </div>
                </div>
              )}
            </div>
          )}

          {flow && !flow.done ? (
            <div className="steps card">
              {STEP_LABELS.map((label, i) => {
                const state = i < flow.idx ? "done" : i === flow.idx ? "active" : "todo";
                return (
                  <div key={i} className="step-row" data-state={state}>
                    <div className="step-rail">
                      <span className="step-ico">
                        {state === "done" && <Check size={13} />}
                        {state === "active" && <Loader2 size={13} className="spin" />}
                        {state === "todo" && <span className="step-dot" />}
                      </span>
                      {i < STEP_LABELS.length - 1 && <span className="step-bar" data-fill={i < flow.idx} />}
                    </div>
                    <div className="step-label">{label}</div>
                  </div>
                );
              })}
            </div>
          ) : flow && flow.done && openIds.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              <button className="steps-summary" onClick={() => setFlowOpen((o) => !o)}>
                <Sparkles size={14} style={{ color: "#94A6EC" }} />
                <span><span style={{ color: "var(--fg)", fontWeight: 600 }}>{subject.name}</span>의 작업을 직군별 눈높이로 옮겼어요</span>
                <ChevronDown size={14} style={{ opacity: 0.55, transform: flowOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {flowOpen && (
                <div className="steps card" style={{ marginTop: 8 }}>
                  {STEP_LABELS.map((label, i) => (
                    <div key={i} className="step-row" data-state="done">
                      <div className="step-rail">
                        <span className="step-ico"><Check size={13} /></span>
                        {i < STEP_LABELS.length - 1 && <span className="step-bar" data-fill={true} />}
                      </div>
                      <div className="step-label">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : openIds.length > 0 ? (
            <div className="answer-intro"><span style={{ color: "var(--fg)", fontWeight: 600 }}>{subject.name}</span>의 작업을 직군별 눈높이로 옮겼어요 — 조건을 다시 입력하지 않아도 됩니다.</div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--dim)", fontSize: 14 }}>
              왼쪽 <span style={{ color: "var(--mfg)" }}>대상 렌즈</span>를 누르면, 이 작업이 그 직군의 언어로 변환되어 여기에 나란히 쌓입니다.
            </div>
          )}

          {(!flow || flow.done) && (
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
          )}
        </div>
      </main>

      {listening && <div className="listen-backdrop" onClick={stopVoice} />}
      <div className={"dock" + (listening ? " listening" : "")}>
        <div className="dock-inner">
          {speechSupported && (
            <button className={"btn btn-icon mic-btn" + (listening ? " listening" : "")} style={{ width: 34, height: 34, flexShrink: 0 }}
              title={listening ? "음성 입력 중지" : "음성으로 입력"} onClick={toggleVoice}><Mic size={17} /></button>
          )}
          <textarea ref={dockRef} rows={1} defaultValue="" onInput={onDockInput}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDock(); } }}
            placeholder={listening ? "듣고 있어요… 말씀해 보세요" : "작업을 새로 입력하거나 수정하세요 — 열린 직군 렌즈가 한 번에 갱신됩니다"}
            style={{ flex: 1, minWidth: 0, width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 15, lineHeight: 1.5, color: "var(--fg)", minHeight: 24, maxHeight: 120, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "7px 4px" }} />
          <button className="btn btn-icon" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: dockHasText ? "var(--fg)" : "#2a2a2e", color: dockHasText ? "#18181B" : "var(--dim)" }}
            disabled={!dockHasText} onClick={sendDock} title="보내기"><ArrowUp size={18} /></button>
        </div>
      </div>
    </div>
  );
}
