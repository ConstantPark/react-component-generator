# Server Agent Rules

## Module Context

`server/`는 Bun 서버에서 AI provider를 호출하고 생성된 React 코드를 정규화해 `/api/generate`로 반환한다. `generator.ts`와 `fallback.ts`는 서버 엔드포인트에서 분리해 단위 테스트 가능한 순수 로직으로 사용된다.

## Tech Stack and Constraints

- Bun 런타임과 내장 `fetch`를 사용한다 (`server/index.ts:68-109`).
- provider 타입은 `'anthropic' | 'google'`로 제한한다 (`server/index.ts:57-62`).
- 생성 결과는 plain JavaScript, inline style, `render(...)` 호출을 전제로 한다 (`server/index.ts:7-20`).

## Implementation Patterns

- 외부 provider 호출은 응답 상태를 먼저 확인한 뒤 provider 응답 구조에서 텍스트만 추출한다 (`server/index.ts:84-95`, `server/index.ts:111-131`).
- Google 모델을 추가하거나 순서를 바꿀 때 `GOOGLE_MODELS`와 `withModelFallback`의 동작을 함께 확인한다 (`server/index.ts:4-5`, `server/index.ts:134-136`, `server/fallback.ts:3-20`).
- 생성 코드 전처리는 `stripCodeFences` 후 `ensureRenderCall` 순서를 유지한다 (`server/index.ts:188`).
- 새 API 경로는 CORS 헤더와 명시적 오류 상태를 기존 응답 패턴에 맞춰 반환한다 (`server/index.ts:51-55`, `server/index.ts:169-180`, `server/index.ts:215-220`).

## Testing Strategy

- 서버 단위 테스트: `bun run test -- server/*.test.ts` 또는 전체 `bun run test`.
- `generator.ts`를 변경하면 fence 제거와 render 자동 삽입 경계를 검증한다 (`server/generator.test.ts:4-40`).
- `fallback.ts`를 변경하면 성공 시 조기 반환, 중간 실패 fallback, 전체 실패, 빈 모델 목록을 검증한다 (`server/fallback.test.ts:4-41`).

## Local Golden Rules

- API 키는 `resolveApiKey`를 통해 환경변수 또는 요청 값으로만 해석하고, `/api/config`에는 boolean만 반환한다 (`server/index.ts:59-66`, `server/index.ts:147-156`). 실제 키를 응답이나 로그에 추가하지 않는다.
- provider별 실패 처리를 유지한다. Google은 모델 fallback을 거치지만 Anthropic은 직접 호출한다 (`server/index.ts:134-136`, `server/index.ts:183-186`).
- `ensureRenderCall`의 대문자 컴포넌트명 탐색 규칙을 바꾸면 생성 코드가 미리보기에서 실행되는지 테스트로 확인한다 (`server/generator.ts:16-23`).
