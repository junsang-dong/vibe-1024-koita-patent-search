# KOITA 선행특허 조사 워크플로우 (Prior Art Search Workflow)

AI 기반 5단계 마법사형 선행특허 조사 웹 애플리케이션입니다.

## 🎯 주요 기능

### 1. 목표 정의
- 발명 정보 입력 (명칭, 기술분야, 목적, 요약)
- 조사 목적 명확화

### 2. 키워드 및 IPC 도출
- **AI 자동 생성**: GPT가 발명 요약을 분석하여 키워드 제안
- 다국어 키워드 (한국어, 영어, 일본어)
- IPC/CPC 분류코드 자동 추출
- 수동 추가/편집 지원

### 3. 검색 실행
- **다국적 데이터베이스 지원**:
  - 🇰🇷 KIPRIS (한국특허정보원)
  - 🇺🇸 USPTO (미국특허청)
  - 🇯🇵 J-PlatPat (일본특허청)
  - 🌐 Google Patents
- 딥링크 자동 생성 (스크래핑 없음)
- 특허 수동 추가 인터페이스

### 4. 스크리닝 및 랭킹
- **로컬 스코어링**: 키워드, IPC, 연도, 유사도 기반 점수 계산
- **AI 랭킹**: GPT가 특허 전문가 관점에서 평가
- 가중치 조정 슬라이더
- 설명 가능한 평가 근거 제공

### 5. 요약 및 리포트
- **AI 종합 요약**: 핵심 특허 분석, 차별성, FTO 체크리스트
- **다양한 내보내기 형식**:
  - 📄 CSV (Excel용)
  - 📋 JSON (데이터 교환)
  - 📝 Markdown (리포트)
  - 🖨️ PDF (인쇄)

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+ 
- OpenAI API 키 (AI 기능 사용 시)

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프리뷰
npm run preview
```

### OpenAI API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 발급
2. 앱 실행 후 2단계 또는 설정 페이지에서 키 입력
3. **보안**: 키는 브라우저 `sessionStorage`에만 저장되며 서버로 전송되지 않음

## 🏗️ 프로젝트 구조

```
src/
├── components/       # 공통 컴포넌트
│   ├── ProgressBar.tsx
│   ├── WizardNav.tsx
│   ├── StepHeader.tsx
│   └── TagChips.tsx
├── steps/           # 5단계 페이지
│   ├── Step1.tsx    # 목표 정의
│   ├── Step2.tsx    # 키워드 도출
│   ├── Step3.tsx    # 검색 실행
│   ├── Step4.tsx    # 스크리닝
│   └── Step5.tsx    # 요약 리포트
├── pages/           # 기타 페이지
│   ├── Home.tsx
│   └── Settings.tsx
├── stores/          # 상태 관리
│   └── useAppStore.ts (Zustand)
├── lib/             # 유틸리티
│   ├── gpt.ts       # GPT API 래퍼
│   ├── search.ts    # 검색 & 유사도
│   └── export.ts    # 내보내기
├── types/           # TypeScript 타입
│   └── index.ts
└── App.tsx          # 라우팅
```

## 🔒 보안 및 개인정보

- ✅ API 키는 `sessionStorage`에만 저장 (서버 전송 없음)
- ✅ 조사 데이터는 `localStorage`에 로컬 저장
- ✅ 외부 API 통신은 OpenAI만 사용 (HTTPS)
- ✅ 특허 데이터베이스는 딥링크만 생성 (스크래핑 금지)

## 🎨 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: Zustand + persist
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4o-mini

## 📊 데이터 모델

```typescript
interface PriorArtItem {
  id: string;
  title: string;
  applicant: string;
  number: string;
  year: number;
  ipc: string[];
  url: string;
  keyClaims?: string;
  diffPoints?: string[];
  note?: string;
  score?: number;
  scoreReason?: string;
}
```

## 🌐 배포

### Vercel (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

### GitHub Pages

```bash
# vite.config.ts에 base 추가
export default defineConfig({
  base: '/repo-name/',
  // ...
})

# 빌드 & 배포
npm run build
npx gh-pages -d dist
```

### Netlify

```bash
# netlify.toml 생성
[build]
  command = "npm run build"
  publish = "dist"

# Netlify CLI로 배포
npm install -g netlify-cli
netlify deploy --prod
```

## ⚙️ 환경 변수 (선택사항)

프록시 서버를 사용할 경우:

```env
# .env
VITE_API_PROXY_URL=http://localhost:3001
```

## 📝 프롬프트 템플릿

내장된 GPT 프롬프트는 `src/lib/gpt.ts`에서 확인/수정 가능:

- **키워드 생성**: 발명 요약 → 다국어 키워드 + IPC/CPC
- **랭킹**: 후보 특허 → 점수 + 근거 + 리스크
- **요약**: 선정 특허 → 종합 리포트 + FTO 체크리스트

## 🐛 문제 해결

### API Rate Limit 에러
- 지수 백오프 재시도 로직 내장
- 프롬프트 축약 또는 배치 처리 권장

### CORS 에러
- `vite.config.ts`에서 프록시 설정 활성화
- 또는 백엔드 프록시 서버 구축

### 빌드 오류
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

## ♿ 접근성

- ARIA 레이블 적용
- 키보드 네비게이션 지원
- 시맨틱 HTML 사용

## 📈 성능

- Lighthouse Score 목표: 90+
- Code Splitting (vendor, store)
- Lazy Loading 적용 가능

## 🤝 기여

이슈 및 PR 환영합니다!

## ⚠️ 면책 조항

본 도구는 참고용이며, 특허 전문가의 검토를 대체할 수 없습니다.
최종 판단은 반드시 전문가와 함께 진행하세요.

## 📄 라이센스

MIT License

---

**Made with ❤️ for Patent Researchers**
