import { useState } from 'react';

interface PromptInputProps { onGenerate: (prompt: string) => void; isLoading: boolean; }
const EXAMPLES = ['SaaS 관리자용 KPI 카드 3개. 전월 대비 증감과 주요 수치를 선명하게 보여줘', '설정 페이지의 알림 설정 패널. 이메일, 웹훅, 주간 리포트 옵션 포함', '검색 필터 바와 결과 상태. 담당자와 날짜 범위를 고르고 결과 수를 보여줘', '온보딩 체크리스트 5단계. 완료와 대기 상태가 한눈에 보이는 카드', '요금제 비교 카드 3개. 추천 플랜을 강조하고 CTA 버튼을 포함해줘', '고객 상세보기 패널. 기본 정보와 최근 활동을 함께 보여줘'];

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (prompt.trim() && !isLoading) onGenerate(prompt.trim()); };
  return <div className="prompt-section"><div className="prompt-heading"><span className="panel-kicker">00 / BRIEF</span><h2>무엇을 만들까요?</h2></div><form onSubmit={handleSubmit} className="prompt-form"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="예: 고객 목록 테이블 위에 들어갈 검색 필터 바를 만들어줘. 상태, 담당자, 날짜 범위 필터가 필요해." className="prompt-textarea" rows={3} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e); }} /><button type="submit" className="btn-generate" disabled={!prompt.trim() || isLoading}>{isLoading ? <span className="loading-spinner">조립 중...</span> : '컴포넌트 만들기'}</button></form><div className="prompt-examples"><span className="examples-label">QUICK START / 예시 프롬프트</span>{EXAMPLES.map((example) => <button key={example} className="example-chip" onClick={() => setPrompt(example)} type="button">{example}</button>)}</div></div>;
}
