import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import { loadApiKeys, loadPromptHistory, loadProvider, MAX_PROMPT_HISTORY, saveApiKeys, savePromptHistory, saveProvider } from './utils/storage';
import './App.css';

const PROVIDER_CONFIG = { anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' }, google: { label: 'Google', placeholder: 'AIza...' } } as const;

function App() {
  const [apiKeys, setApiKeys] = useState(loadApiKeys);
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>(loadProvider);
  const [promptHistory, setPromptHistory] = useState(loadPromptHistory);
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({ anthropic: false, google: false });
  const { components, isLoading, error, generate, removeComponent, clearAll } = useComponentGenerator();
  const apiKey = apiKeys[provider] ?? '';
  useEffect(() => { fetch('/api/config').then((res) => res.json()).then((data) => setEnvKeys(data.envKeys)).catch(() => {}); }, []);
  useEffect(() => { saveApiKeys(apiKeys); }, [apiKeys]);
  useEffect(() => { saveProvider(provider); }, [provider]);
  useEffect(() => { savePromptHistory(promptHistory); }, [promptHistory]);
  const hasEnvKey = envKeys[provider];
  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) { alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해 주세요.`); return; }
    setPromptHistory((prev) => [prompt, ...prev.filter((item) => item !== prompt)].slice(0, MAX_PROMPT_HISTORY));
    generate(prompt, apiKey || undefined, provider);
  };
  const handleProviderChange = (newProvider: Provider) => { setProvider(newProvider); setShowKey(false); };
  const activeProvider = PROVIDER_CONFIG[provider].label;

  return <div className="app">
    <header className="app-header">
      <div className="brand-mark" aria-label="React Component Generator">RC<span>_</span></div>
      <div className="header-copy"><span className="eyebrow">RC / COMPONENT WORKSHOP</span><h1>상상한 UI를<br /><em>바로 조립하세요.</em></h1><p>프롬프트를 적으면 React 컴포넌트를 만들고, 미리 보고, 코드로 가져갈 수 있습니다.</p></div>
      <div className="header-meta" aria-label="현재 작업 상태"><div><span>ENGINE</span><strong>{activeProvider}</strong></div><div><span>BUILDS</span><strong>{components.length.toString().padStart(2, '0')}</strong></div></div>
    </header>
    <main className="workspace">
      <section className="composer-panel" aria-label="컴포넌트 생성"><PromptInput onGenerate={handleGenerate} isLoading={isLoading} history={promptHistory} /></section>
      <aside className="settings-panel" aria-label="실행 설정"><div className="settings-header"><span className="panel-kicker">01 / RUNTIME</span><h2>실행 설정</h2></div><div className="provider-select"><label htmlFor="provider">AI ENGINE</label><select id="provider" value={provider} onChange={(e) => handleProviderChange(e.target.value as Provider)}>{Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="api-key-input"><label htmlFor="api-key">API KEY</label><div className="api-key-field"><input id="api-key" type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))} placeholder={hasEnvKey ? '서버 키 연결됨' : PROVIDER_CONFIG[provider].placeholder} /><button className="btn-toggle-key" onClick={() => setShowKey(!showKey)} type="button">{showKey ? '가리기' : '보기'}</button></div><p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>{hasEnvKey ? '● 서버 환경변수 연결됨' : '직접 입력하거나 서버 환경변수를 설정하세요.'}</p></div><div className="settings-note"><span>TIP</span><p>구체적인 요소와 상태를 적을수록 더 좋은 결과가 나옵니다.</p></div></aside>
    </main>
    {error && <div className="error-banner"><span>!</span><p>{error}</p></div>}
    <section className="results-section">
      {components.length > 0 && <div className="results-header"><div><span className="panel-kicker">02 / OUTPUTS</span><h2>생성한 컴포넌트</h2></div><button className="btn-clear" onClick={clearAll}>전체 지우기</button></div>}
      {components.length === 0 && !isLoading && <div className="empty-state"><div className="empty-preview" aria-hidden="true"><div className="empty-window"><span /><span /><span /></div><div className="empty-canvas"><div className="empty-card empty-card--primary" /><div className="empty-card" /><div className="empty-card empty-card--wide" /></div></div><div className="empty-copy"><span className="empty-stamp">READY / 001</span><h2>첫 번째 컴포넌트를<br />만들어 볼까요?</h2><p>왼쪽 작업대에 원하는 화면을 설명해 주세요.<br />좋은 시작은 구체적인 한 문장입니다.</p></div></div>}
      {isLoading && <div className="loading-card"><div className="loading-pulse" /><p>컴포넌트를 조립하는 중입니다...</p></div>}
      <div className="results-grid">{components.map((component) => <ComponentCard key={component.id} component={component} onRemove={removeComponent} onRegenerate={handleGenerate} isLoading={isLoading} />)}</div>
    </section>
  </div>;
}

export default App;
