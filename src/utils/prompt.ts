export const MAX_PROMPT_LENGTH = 500;

export function isValidPrompt(prompt: string): boolean {
  const trimmedPrompt = prompt.trim();
  return trimmedPrompt.length > 0 && trimmedPrompt.length <= MAX_PROMPT_LENGTH;
}
