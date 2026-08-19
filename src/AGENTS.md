# Frontend Agent Rules

## Module Context

`src/`는 프롬프트와 provider/API 키 입력을 관리하고, `/api/generate` 결과를 생성 목록과 `react-live` 미리보기로 연결하는 React 애플리케이션이다. UI 컴포넌트, 상태 훅, 테스트 설정이 같은 Vite 실행 경계를 공유한다.

## Tech Stack and Constraints

- React 19와 TypeScript를 사용한다.
- API 요청은 `fetch('/api/...')`로 보내며 Vite 개발 서버가 Bun API로 proxy한다 (`src/hooks/useComponentGenerator.ts:23-27`, `vite.config.ts:8-14`).
- 생성 코드는 `react-live`의 `LiveProvider`와 `noInline` 미리보기 모델에 전달된다 (`src/components/LivePreview.tsx:1-19`).

## Implementation Patterns

- 비동기 생성 상태는 `isLoading`, `error`, `components`로 관리하고 요청 종료 시 성공·실패 모두 loading을 해제한다 (`src/hooks/useComponentGenerator.ts:13-49`).
- 생성 항목의 id는 timestamp와 random suffix를 조합하며 새 결과는 목록 앞에 추가한다 (`src/hooks/useComponentGenerator.ts:35-42`).
- provider를 변경하면 입력한 API 키를 비운다 (`src/App.tsx:18-20`). provider 설정을 추가할 때 이 초기화와 서버 provider 타입을 함께 갱신한다.
- 프롬프트 제출은 trim된 값만 전달하고 빈 값 또는 loading 중에는 제출하지 않는다 (`src/components/PromptInput.tsx:6-9`).

## Testing Strategy

- 프론트엔드 테스트는 `bun run test`로 실행하며 `vite.config.ts`의 `jsdom` 및 `src/test/setup.ts` 환경을 사용한다 (`vite.config.ts:16-21`, `src/test/setup.ts:1-8`).
- `PromptInput` 변경 시 빈 입력 disabled, 입력 후 submit, loading 표시를 검증한다 (`src/components/PromptInput.test.tsx:6-28`).
- API 상태 훅 변경 시 성공 결과 추가, HTTP 오류, loading 해제 경계를 확인한다 (`src/hooks/useComponentGenerator.ts:22-49`).

## Local Golden Rules

- API 키 입력값은 요청 body에 필요한 경우에만 포함하고, 서버 설정 상태는 boolean으로만 사용한다 (`src/hooks/useComponentGenerator.ts:23-27`, `src/App.tsx:14-18`). 키를 localStorage, URL, 표시용 상태에 추가하지 않는다.
- 생성 요청의 오류는 `res.ok`를 확인한 뒤 서버의 `data.error`를 사용자 상태로 전달한다 (`src/hooks/useComponentGenerator.ts:29-33`, `src/hooks/useComponentGenerator.ts:43-48`).
- 미리보기 오류 표시를 제거하지 않는다. `LiveError`는 생성 코드 실행 실패를 사용자에게 전달하는 유일한 현재 UI 경로다 (`src/components/LivePreview.tsx:13-19`).
