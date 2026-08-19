import { beforeEach, describe, expect, it } from 'vitest';
import type { GeneratedComponent } from '../types';
import {
  loadApiKeys,
  loadComponents,
  loadPromptHistory,
  loadProvider,
  saveApiKeys,
  saveComponents,
  savePromptHistory,
  saveProvider,
} from './storage';

describe('storage persistence', () => {
  beforeEach(() => localStorage.clear());

  it('stores and restores provider-specific API keys', () => {
    saveApiKeys({ anthropic: 'anthropic-key', google: 'google-key' });

    expect(loadApiKeys()).toEqual({ anthropic: 'anthropic-key', google: 'google-key' });
  });

  it('stores and restores the selected provider', () => {
    saveProvider('anthropic');

    expect(loadProvider()).toBe('anthropic');
  });

  it('stores and restores prompt history', () => {
    savePromptHistory(['두 번째 프롬프트', '첫 번째 프롬프트']);

    expect(loadPromptHistory()).toEqual(['두 번째 프롬프트', '첫 번째 프롬프트']);
  });

  it('restores generated components with Date instances', () => {
    const component: GeneratedComponent = {
      id: 'component-1',
      prompt: '대시보드 카드',
      code: 'render(<div />)',
      createdAt: new Date('2026-08-19T00:00:00.000Z'),
    };
    saveComponents([component]);

    const [restored] = loadComponents();
    expect(restored).toEqual(component);
    expect(restored.createdAt).toBeInstanceOf(Date);
  });
});
