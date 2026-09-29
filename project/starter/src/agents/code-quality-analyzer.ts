import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts/code-quality-analyzer.prompt.js';

export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Analyzes changed source code for security vulnerabilities, performance issues, bugs, maintainability concerns, style problems, and best-practice violations.',
  prompt: CODE_QUALITY_ANALYZER_PROMPT,
  tools: [
  'Read',
  'Grep',
  'Glob',
  'Skill',
  'mcp__github__*'
],
  model: 'inherit'
};
