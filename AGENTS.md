# Agent Governance

## Operational Commands

- 패키지 설치: `bun install`
- 개발 서버: `bun run dev` (Vite와 Bun API 서버를 함께 실행)
- API 서버만 실행: `bun run server`
- 린트: `bun run lint`
- 테스트: `bun run test`
- 타입 검사 및 프로덕션 빌드: `bun run build`
- 패키지 매니저는 `bun`을 사용한다. `npm`, `yarn`, `pnpm`으로 lockfile이나 의존성을 변경하지 않는다.
- API 키가 필요할 때는 `.env`를 사용하며, `.env`는 저장소에 커밋하지 않는다 (`.gitignore:29-33`).

## Golden Rules

### Immutable

- 생성 컴포넌트의 실행 경계를 유지한다. 생성 결과는 서버의 시스템 프롬프트가 요구하는 self-contained plain JavaScript와 `render(...)` 호출 형식을 따라야 한다 (`server/index.ts:7-20`, `server/generator.ts:16-23`).
- API 키를 소스 코드, 로그, 응답에 하드코딩하거나 노출하지 않는다. 서버는 환경변수와 요청 키를 해석하고 설정 여부만 `/api/config`로 공개한다 (`server/index.ts:59-66`, `server/index.ts:147-156`).
- Vite의 `/api` 프록시 대상은 Bun 서버 `http://localhost:3002`로 유지한다 (`vite.config.ts:8-14`). API 경로를 변경하면 프론트엔드 호출과 함께 갱신한다.

### Do's and Don'ts

- `server/`의 API 동작을 바꾸면 `server/**/*.test.ts`의 관련 단위 테스트를 함께 갱신한다. 현재 테스트 경계는 생성 코드 정규화와 모델 fallback에 집중되어 있다 (`server/generator.test.ts:4-40`, `server/fallback.test.ts:4-41`).
- `src/`의 사용자 흐름을 바꾸면 `src/**/*.test.{ts,tsx}`의 테스트 설정과 접근성 쿼리를 확인한다. 테스트 환경은 `jsdom`과 `src/test/setup.ts`를 사용한다 (`vite.config.ts:16-21`, `src/test/setup.ts:1-8`).
- API 키 흐름을 변경할 때 서버의 키 해석·검증과 클라이언트의 입력 검증을 함께 검토한다 (`server/index.ts:167-180`, `src/App.tsx:16-19`). 한쪽 방어만 제거하지 않는다.
- Google provider의 모델 fallback 동작을 Anthropic 경로에 무심코 복사하지 않는다. 현재 Google만 모델 목록과 fallback을 사용하고 Anthropic은 단일 호출 경로다 (`server/index.ts:4-5`, `server/index.ts:134-136`, `server/index.ts:183-186`).
- 생성 결과를 `react-live`에 전달하는 경로를 우회하거나 TypeScript/import 코드를 허용하지 않는다. 미리보기는 `LiveProvider`의 `noInline` 실행 모델에 의존한다 (`server/index.ts:9-20`, `src/components/LivePreview.tsx:14-18`).

## Project Context

AI 프롬프트로 React 컴포넌트를 생성하고, 생성된 코드를 즉시 미리보기와 코드 형태로 확인하는 개발 도구다. Anthropic Claude와 Google Gemini를 선택해 사용할 수 있다.

Tech Stack: React 19, TypeScript, Vite, Bun, react-live, Vitest, Testing Library, ESLint

## Standards and References

- 기존 사용법과 기능 설명은 [README.md](./README.md)를 기준으로 하며, 이 파일에는 에이전트 전용 제약만 추가한다.
- 기존 코드 스타일과 파일별 패턴을 우선 따른다. 넓은 리팩터링보다 요청 범위에 맞는 최소 변경을 선호한다.
- 커밋은 논리적으로 하나의 목적만 담고, 프로젝트가 Conventional Commits를 별도로 강제하지 않는 한 짧은 명령형 메시지를 사용한다.
- 규칙과 코드의 동작이 어긋나면 코드 또는 이 문서의 업데이트를 제안하고, 근거가 오래된 규칙은 제거한다.

## Context Map

- **[Bun API 및 AI 생성 로직 수정](./server/AGENTS.md)** — provider 호출, 생성 코드 정규화, HTTP 응답, 서버 테스트를 변경할 때.
- **[React UI 및 상태 흐름 수정](./src/AGENTS.md)** — 프롬프트 입력, API 호출 상태, 생성 결과 미리보기, 프론트엔드 테스트를 변경할 때.

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

이 섹션은 전역 기본값(fallback)이다. 하위 디렉토리의 `AGENTS.md`에 별도 TDD 규칙이 있으면 **하위 규칙을 우선 적용한다.**

### 적용 기준

**TDD를 반드시 적용한다.**

- **비즈니스 로직**
- **API 동작 및 오류 처리**
- **재사용 유틸리티**
- **버그 수정**

**TDD가 불필요하다.**

- **타입 정의만 변경하는 작업**
- **설정 파일만 변경하는 작업**
- **상태·동작 변화가 없는 순수 UI 마크업 및 스타일 작업**
- **SQL 작성 또는 스키마 변경 자체**

### RED-GREEN-REFACTOR 사이클

1. **RED**
   - **하나의 동작 = 하나의 테스트**로 작성한다.
   - 테스트를 반드시 실행해 실패를 확인한다.
   - 실패 이유는 **기능 미구현**이어야 한다. 오타, 잘못된 테스트 설정, 환경 오류를 RED로 간주하지 않는다.
2. **GREEN**
   - 테스트를 통과시키는 **최소한의 코드만** 작성한다.
   - 아직 필요하지 않은 추상화와 기능은 추가하지 않는다. **YAGNI**를 따른다.
   - 신규 테스트와 기존 테스트가 모두 통과하는지 확인한다.
3. **REFACTOR**
   - **중복 제거, 이름 개선, 헬퍼 추출**만 수행한다.
   - 리팩터링 중에도 green 상태를 유지한다.
   - **새 동작을 추가하지 않는다.**
4. **반복**
   - 현재 동작이 green이면 다음 동작에 대한 **RED**로 돌아간다.

### 삭제 강제 규칙

- 테스트보다 먼저 프로덕션 코드를 작성했다면 **해당 코드를 삭제하고 RED부터 재시작한다.**
- 먼저 작성한 코드를 "참고용", 주석, 임시 구현으로 남기는 것도 금지한다.

### 변명 차단표

| 변명 | 반론 |
|---|---|
| "너무 단순해서 테스트 불필요" | 단순한 동작일수록 기대 동작을 한 줄의 테스트로 고정하는 비용이 낮다. |
| "나중에 추가하겠다" | 나중에는 구현 세부사항이 굳어져 테스트 비용과 누락 위험이 커진다. |
| "시간이 없다" | RED 테스트 없이 작성한 코드는 디버깅과 회귀 확인에 더 많은 시간을 요구한다. |
| "삭제하면 낭비" | 검증되지 않은 선행 구현을 보존하는 것이 실제 낭비다. 삭제 후 작은 단계로 다시 작성한다. |
| "프로토타입이다" | 프로토타입도 핵심 동작의 계약을 보존해야 하며, 폐기할 코드는 애초에 검증 대상에서 제외한다. |
