import { describe, expect, it } from 'vitest';
import { isValidPrompt } from './prompt';

describe('isValidPrompt', () => {
  it('500자 이하의 프롬프트만 유효한 것으로 판정한다', () => {
    expect(isValidPrompt('a'.repeat(500))).toBe(true);
    expect(isValidPrompt('a'.repeat(501))).toBe(false);
  });
});
