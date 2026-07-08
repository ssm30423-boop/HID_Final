# 렌즈 (Lens) — 데모 프로토타입

하나의 작업을 한 번만 적고, 직군(렌즈)을 갈아끼우며 상대 직군의 언어로 옮겨주는 프로토타입입니다.
크로스펑셔널 스쿼드에서 "같은 작업을 직군마다 다시 설명해야 하는" 마찰을 줄이는 인터랙션 구조를 보여줍니다.

진입 화면에서 작업을 적어 보내면 워크스페이스로 전환되며, 기본 직군 렌즈(프론트엔드·백엔드·PM)가 자동으로 펼쳐집니다.
왼쪽 사이드에서 주체(나는 누구인지)를 바꾸거나, 대상 렌즈를 켜고/끄고, `+ 직군 추가`로 직군을 더하거나 ✏️ 안에서 삭제할 수 있습니다.
아래 채팅창에 작업을 새로 입력하거나 수정하면, 열린 직군 렌즈가 한 번에 갱신됩니다.

> **데모 모드:** 실제 LLM API를 호출하지 않습니다. 직군별 예시 응답을 약간의 지연과 함께 보여주므로 배포해도 비용이 들지 않습니다.
> 실제 LLM 변환을 붙이려면 `src/App.jsx`의 `translateMock` 함수만 실제 API 호출로 교체하면 됩니다.

---

## 로컬에서 실행

```bash
npm install
npm run dev
```

브라우저에서 안내되는 주소(보통 http://localhost:5173)를 엽니다.

## 배포 (GitHub + Vercel, 무료)

1. **GitHub 저장소에 올리기**
   - 이 폴더의 *내용물 전체*(`src` 폴더, `index.html`, `package.json` 등)를 저장소에 업로드합니다.
   - 이미 저장소가 있다면 `Add file → Upload files`로 같은 파일들을 올리고 `Commit changes`를 누르면 덮어써집니다.
   - ⚠️ `lens` 폴더째로 올리지 말고, 폴더를 연 뒤 *그 안의 파일들*을 올리세요. (그래야 `index.html`이 최상단에 옵니다.)

2. **Vercel에서 배포**
   - https://vercel.com 에 GitHub로 로그인 → `Add New… → Project`
   - 이 저장소를 `Import`
   - Framework Preset이 **Vite**로 잡히는지 확인 (Build: `npm run build`, Output: `dist`)
   - `Deploy` 클릭 → 1~2분 후 `https://<프로젝트>.vercel.app` 주소가 생성됩니다.

3. **이후 업데이트**
   - GitHub에 새 커밋을 올리면 Vercel이 자동으로 다시 배포합니다.

---

## 기술 스택

- React 18 + Vite
- lucide-react (아이콘)
- Pretendard Variable (CDN 웹폰트)
- 별도 백엔드 없음 · 목업 데이터
