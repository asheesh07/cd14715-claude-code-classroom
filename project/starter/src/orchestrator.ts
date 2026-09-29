import { query } from '@anthropic-ai/claude-agent-sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';

import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester
} from './agents/index.js';

import { mcpServersConfig } from './config/mcp.config.js';
import { buildOrchestratorPrompt } from './prompts/orchestrator.prompt.js';
import {
  ReviewReportSchema,
  type ReviewReport
} from './types/report-types.js';

export interface OrchestratorOptions {
  model?: string;
  maxTurns?: number;
  permissionMode?:
    | 'default'
    | 'acceptEdits'
    | 'bypassPermissions'
    | 'plan'
    | 'dontAsk';
  maxBudgetUsd?: number;
}

export class CodeReviewOrchestrator {
  private readonly options: Required<
    Pick<OrchestratorOptions, 'model' | 'maxTurns' | 'permissionMode'>
  > & Pick<OrchestratorOptions, 'maxBudgetUsd'>;

  constructor(options: OrchestratorOptions = {}) {
    this.options = {
      model:
        options.model ??
        process.env.ANTHROPIC_MODEL ??
        'claude-sonnet-4-5',
      maxTurns: options.maxTurns ?? 50,
      permissionMode: options.permissionMode ?? 'dontAsk',
      maxBudgetUsd: options.maxBudgetUsd
    };
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    if (!owner || !repo) {
      throw new Error('Repository owner and name are required');
    }

    if (!Number.isInteger(prNumber) || prNumber <= 0) {
      throw new Error('Pull request number must be a positive integer');
    }

    const prompt = buildOrchestratorPrompt(owner, repo, prNumber);

    const outputSchema = zodToJsonSchema(
      ReviewReportSchema as any,
      {
        $refStrategy: 'root'
      }
    );

    const q = query({
      prompt,
      options: {
        model: this.options.model,
        maxTurns: this.options.maxTurns,
        permissionMode: this.options.permissionMode,

        ...(this.options.maxBudgetUsd !== undefined
          ? {
              maxBudgetUsd: this.options.maxBudgetUsd
            }
          : {}),

        agents: {
          'code-quality-analyzer': codeQualityAnalyzer,
          'test-coverage-analyzer': testCoverageAnalyzer,
          'refactoring-suggester': refactoringSuggester
        },

        tools: {
          type: 'preset',
          preset: 'claude_code'
        },

        allowedTools: [
          'Task',
          'Read',
          'Grep',
          'Glob',
          'Skill',
          'mcp__github__*',
          'mcp__eslint__*'
        ],

        mcpServers: mcpServersConfig,

        outputFormat: {
          type: 'json_schema',
          schema: outputSchema
        }
      }
    });

    let structuredOutput: unknown;

    for await (const message of q) {
      // Log MCP initialization and discovered MCP tools.
      if (
        message.type === 'system' &&
        message.subtype === 'init'
      ) {
        console.log(
          'MCP:',
          JSON.stringify(message.mcp_servers, null, 2)
        );

        console.log(
          'MCP TOOLS:',
          message.tools.filter((tool) =>
            tool.startsWith('mcp__')
          )
        );
      }

      if (message.type !== 'result') {
        continue;
      }

      if (message.subtype !== 'success') {
        throw new Error(
          `Claude query failed: ${JSON.stringify(message, null, 2)}`
        );
      }

      structuredOutput = message.structured_output;
    }

    if (structuredOutput === undefined) {
      throw new Error(
        'Orchestrator completed without returning structured output'
      );
    }

    const validation = ReviewReportSchema.safeParse(
      structuredOutput
    );

    if (!validation.success) {
      throw new Error(
        `ReviewReport validation failed: ${validation.error.message}`
      );
    }

    return validation.data;
  }
}

export { CodeReviewOrchestrator as Orchestrator };