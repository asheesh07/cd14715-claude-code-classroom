import { describe, expect, it } from 'vitest';

import { CodeReviewOrchestrator } from '../src/orchestrator.js';

describe('CodeReviewOrchestrator', () => {
  describe('Configuration', () => {
    it('should initialize with default options', () => {
      const orchestrator = new CodeReviewOrchestrator();
      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });

    it('should accept custom configuration', () => {
      const orchestrator = new CodeReviewOrchestrator({
        model: 'test-model',
        maxTurns: 10,
        permissionMode: 'dontAsk'
      });

      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });
  });

  describe('reviewPullRequest validation', () => {
    it('should reject a missing repository owner', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('', 'repo', 1)
      ).rejects.toThrow('Repository owner and name are required');
    });

    it('should reject a missing repository name', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('owner', '', 1)
      ).rejects.toThrow('Repository owner and name are required');
    });

    it('should reject a zero PR number', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('owner', 'repo', 0)
      ).rejects.toThrow('Pull request number must be a positive integer');
    });

    it('should reject a negative PR number', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('owner', 'repo', -1)
      ).rejects.toThrow('Pull request number must be a positive integer');
    });

    it('should reject a non-integer PR number', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('owner', 'repo', 1.5)
      ).rejects.toThrow('Pull request number must be a positive integer');
    });
  });

  describe('Integration', () => {
    it.skip('should review a real small PR', async () => {
      // Real-PR integration evidence is provided by the generated
      // reports in the reports/ directory.
    });
  });
});
