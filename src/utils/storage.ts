import type { GeneratedComponent, Provider } from '../types';

const STORAGE_KEYS = {
  apiKeys: 'react-component-generator:api-keys',
  provider: 'react-component-generator:provider',
  promptHistory: 'react-component-generator:prompt-history',
  components: 'react-component-generator:components',
} as const;

const DEFAULT_PROVIDER: Provider = 'google';
export const MAX_PROMPT_HISTORY = 50;
type StoredComponent = Omit<GeneratedComponent, 'createdAt'> & { createdAt: string };
type ApiKeys = Partial<Record<Provider, string>>;

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; the in-memory state remains usable.
  }
}

export function loadApiKeys(): ApiKeys {
  const stored = read<unknown>(STORAGE_KEYS.apiKeys, {});
  if (!stored || typeof stored !== 'object') return {};

  const keys = stored as Record<string, unknown>;
  return {
    ...(typeof keys.anthropic === 'string' && keys.anthropic ? { anthropic: keys.anthropic } : {}),
    ...(typeof keys.google === 'string' && keys.google ? { google: keys.google } : {}),
  };
}

export function saveApiKeys(apiKeys: ApiKeys): void {
  write(STORAGE_KEYS.apiKeys, apiKeys);
}

export function loadProvider(): Provider {
  const provider = read<unknown>(STORAGE_KEYS.provider, DEFAULT_PROVIDER);
  return provider === 'anthropic' || provider === 'google' ? provider : DEFAULT_PROVIDER;
}

export function saveProvider(provider: Provider): void {
  write(STORAGE_KEYS.provider, provider);
}

export function loadPromptHistory(): string[] {
  const history = read<unknown>(STORAGE_KEYS.promptHistory, []);
  return Array.isArray(history)
    ? history.filter((prompt): prompt is string => typeof prompt === 'string').slice(0, MAX_PROMPT_HISTORY)
    : [];
}

export function savePromptHistory(history: string[]): void {
  write(STORAGE_KEYS.promptHistory, history.slice(0, MAX_PROMPT_HISTORY));
}

export function loadComponents(): GeneratedComponent[] {
  const components = read<unknown>(STORAGE_KEYS.components, []);
  if (!Array.isArray(components)) return [];

  return components.flatMap((component) => {
    if (!component || typeof component !== 'object') return [];
    const stored = component as Partial<StoredComponent>;
    if (typeof stored.id !== 'string' || typeof stored.prompt !== 'string' || typeof stored.code !== 'string' || typeof stored.createdAt !== 'string') return [];
    const createdAt = new Date(stored.createdAt);
    return Number.isNaN(createdAt.getTime()) ? [] : [{ id: stored.id, prompt: stored.prompt, code: stored.code, createdAt }];
  });
}

export function saveComponents(components: GeneratedComponent[]): void {
  const serializable: StoredComponent[] = components.map((component) => ({ ...component, createdAt: component.createdAt.toISOString() }));
  write(STORAGE_KEYS.components, serializable);
}
