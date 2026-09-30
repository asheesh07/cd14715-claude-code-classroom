import { describe, expect, it } from 'vitest';

import {
  withRetry,
  withTimeout,
  ErrorCodes,
  ReviewError
} from '../src/utils/error-handler.js';

describe('Error handling utilities', () => {
  it('withRetry retries a failing operation and eventually succeeds', async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts += 1;

        if (attempts < 3) {
          throw new Error('temporary failure');
        }

        return 'success';
      },
      3,
      1
    );

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('withRetry throws RETRY_EXHAUSTED after retries are exhausted', async () => {
    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts += 1;
          throw new Error('permanent failure');
        },
        2,
        1
      )
    ).rejects.toMatchObject({
      code: ErrorCodes.RETRY_EXHAUSTED
    });

    expect(attempts).toBe(3);
  });

  it('withTimeout rejects when an operation exceeds the timeout', async () => {
    const operation = new Promise<string>((resolve) => {
      setTimeout(() => resolve('finished'), 100);
    });

    await expect(
      withTimeout(() => operation, 10)
    ).rejects.toBeInstanceOf(ReviewError);
  });

  it('withTimeout returns the result when the operation completes in time', async () => {
    const result = await withTimeout(
      async () => 'finished',
      1000
    );

    expect(result).toBe('finished');
  });
});
