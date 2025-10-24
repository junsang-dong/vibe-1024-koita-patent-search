# Changelog

## [1.0.0] - 2024-10-23

### 추가
- ✨ 5단계 마법사형 선행특허 조사 워크플로우
- 🤖 OpenAI GPT-4o-mini 기반 AI 분석
  - 키워드 및 IPC 자동 생성
  - 특허 랭킹 및 평가
  - 종합 요약 리포트 생성
- 🔍 다국적 특허 데이터베이스 딥링크 지원
  - KIPRIS (한국)
  - USPTO (미국)
  - J-PlatPat (일본)
  - Google Patents
- 📊 로컬 스코어링 시스템
  - 키워드 매칭
  - IPC 적합도
  - 연도 가중치
  - 유사도 계산
- 📥 다양한 내보내기 형식
  - CSV (Excel)
  - JSON
  - Markdown 리포트
  - PDF 인쇄
- 🎨 반응형 UI (Tailwind CSS)
- 🔒 보안 강화
  - sessionStorage 기반 API 키 관리
  - 로컬 데이터 저장 (localStorage)
  - 서버 전송 없음

### 기술 스택
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- Zustand (상태 관리)
- Lucide React (아이콘)

### 접근성
- ARIA 레이블 적용
- 키보드 네비게이션
- 시맨틱 HTML

### 성능
- Code Splitting
- Lazy Loading 준비
- 프로덕션 빌드 최적화

