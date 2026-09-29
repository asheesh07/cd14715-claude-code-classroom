import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/refactoring-suggester.prompt.js';

export const refactoringSuggester: AgentDefinition = {
  description:
    'Identifies behavior-preserving opportunities to improve code structure, clarity, modernization, naming, simplification, and design patterns.',
  prompt: REFACTORING_SUGGESTER_PROMPT,
  tools: [
  'Read',
  'Grep',
  'Glob',
  'mcp__github__*'
],
  model: 'inherit'
};
