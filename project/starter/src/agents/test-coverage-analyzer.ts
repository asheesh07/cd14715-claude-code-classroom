import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts/test-coverage-analyzer.prompt.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Evaluates test completeness for changed code, identifies untested functions, classes, branches, and edge cases, and proposes actionable tests.',
  prompt: TEST_COVERAGE_ANALYZER_PROMPT,
  tools: [
  'Read',
  'Grep',
  'Glob',
  'mcp__github__*'
],
  model: 'inherit'
};
