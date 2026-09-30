import { describe, expect, it } from 'vitest';

import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema
} from '../src/types/analysis-results.js';

import { ReviewReportSchema } from '../src/types/report-types.js';

describe('Analysis result schemas', () => {
  it('accepts a valid CodeQualityResult', () => {
    const result = {
      file: 'src/example.ts',
      issues: [
        {
          line: 10,
          severity: 'high',
          category: 'security',
          description: 'Potential unsafe input handling',
          suggestion: 'Validate the input before processing it'
        }
      ],
      overallScore: 85,
      summary: 'One security issue was identified'
    };

    expect(CodeQualityResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects an invalid CodeQualityResult', () => {
    const result = {
      file: 'src/example.ts',
      issues: [
        {
          line: 10,
          severity: 'invalid',
          category: 'security',
          description: 'Issue',
          suggestion: 'Fix it'
        }
      ],
      overallScore: 85,
      summary: 'Invalid severity'
    };

    expect(CodeQualityResultSchema.safeParse(result).success).toBe(false);
  });

  it('accepts boundary CodeQuality scores', () => {
    const base = {
      file: 'src/example.ts',
      issues: [],
      summary: 'No issues found'
    };

    expect(
      CodeQualityResultSchema.safeParse({
        ...base,
        overallScore: 0
      }).success
    ).toBe(true);

    expect(
      CodeQualityResultSchema.safeParse({
        ...base,
        overallScore: 100
      }).success
    ).toBe(true);
  });

  it('accepts a valid TestCoverageResult', () => {
    const result = {
      file: 'src/example.ts',
      hasTests: true,
      testFiles: ['tests/example.test.ts'],
      untestedPaths: [
        {
          type: 'function',
          location: 'calculateTotal',
          priority: 'high',
          reasoning: 'The function has no direct test coverage',
          suggestedTest: 'Add a test for normal and boundary inputs'
        }
      ],
      coverageEstimate: 80,
      summary: 'Most paths are covered'
    };

    expect(TestCoverageResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects an invalid TestCoverageResult', () => {
    const result = {
      file: 'src/example.ts',
      hasTests: 'yes',
      testFiles: [],
      untestedPaths: [],
      coverageEstimate: 80,
      summary: 'Invalid hasTests type'
    };

    expect(TestCoverageResultSchema.safeParse(result).success).toBe(false);
  });

  it('accepts a valid RefactoringSuggestionResult', () => {
    const result = {
      file: 'src/example.ts',
      suggestions: [
        {
          type: 'extract-function',
          location: 'processData',
          impact: 'medium',
          description: 'Extract repeated processing logic',
          before: 'Repeated inline logic',
          after: 'Shared helper function',
          benefits: 'Improves readability and reuse'
        }
      ],
      summary: 'One refactoring opportunity identified'
    };

    expect(
      RefactoringSuggestionSchema.safeParse(result).success
    ).toBe(true);
  });

  it('rejects an invalid refactoring suggestion type', () => {
    const result = {
      file: 'src/example.ts',
      suggestions: [
        {
          type: 'invalid-type',
          location: 'processData',
          impact: 'medium',
          description: 'Invalid',
          before: 'Before',
          after: 'After',
          benefits: 'Benefits'
        }
      ],
      summary: 'Invalid suggestion'
    };

    expect(
      RefactoringSuggestionSchema.safeParse(result).success
    ).toBe(false);
  });
});

describe('ReviewReportSchema', () => {
  it('accepts a valid ReviewReport', () => {
    const report = {
      pullRequest: {
        owner: 'example',
        repo: 'demo',
        number: 1
      },
      fileReviews: [],
      summary: {
        totalFiles: 0,
        overallScore: 100,
        criticalIssues: 0,
        highPriorityTests: 0,
        refactoringOpportunities: 0
      },
      recommendations: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        duration: 1000,
        agentVersions: {
          'code-quality-analyzer': '1.0',
          'test-coverage-analyzer': '1.0',
          'refactoring-suggester': '1.0'
        }
      }
    };

    expect(ReviewReportSchema.safeParse(report).success).toBe(true);
  });

  it('rejects a ReviewReport with an invalid PR number', () => {
    const report = {
      pullRequest: {
        owner: 'example',
        repo: 'demo',
        number: 'one'
      },
      fileReviews: [],
      summary: {
        totalFiles: 0,
        overallScore: 100,
        criticalIssues: 0,
        highPriorityTests: 0,
        refactoringOpportunities: 0
      },
      recommendations: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        duration: 1000,
        agentVersions: {}
      }
    };

    expect(ReviewReportSchema.safeParse(report).success).toBe(false);
  });
});
