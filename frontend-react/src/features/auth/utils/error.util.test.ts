import { describe, expect, it } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { extractApiError } from './error.util';

const buildAxiosError = (data: unknown): AxiosError => {
  const err = new AxiosError('axios message');
  err.response = { data, status: 400, statusText: 'Bad', headers: {}, config: {} as never } as AxiosResponse;
  return err;
};

describe('extractApiError', () => {
  it('reads nested ApiError.error.message', () => {
    const err = buildAxiosError({
      success: false,
      error: { code: 'AUTH_001', message: 'Invalid credentials' },
    });
    expect(extractApiError(err)).toBe('Invalid credentials');
  });

  it('falls back to flat message when ApiError absent', () => {
    const err = buildAxiosError({ message: 'Something exploded' });
    expect(extractApiError(err)).toBe('Something exploded');
  });

  it('falls back to axios message when payload empty', () => {
    const err = buildAxiosError({});
    expect(extractApiError(err)).toBe('axios message');
  });

  it('returns Error.message for non-axios errors', () => {
    expect(extractApiError(new Error('boom'))).toBe('boom');
  });

  it('returns fallback for unknown thrown values', () => {
    expect(extractApiError('just a string', 'fallback msg')).toBe('fallback msg');
  });
});
