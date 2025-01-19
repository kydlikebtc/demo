import { RetryHandler, ProcessTimeouts } from '../src/utils/timeouts.js';

describe('RetryHandler', () => {
  let retryHandler;
  
  beforeEach(() => {
    retryHandler = new RetryHandler('PAYMENT_VERIFICATION', ProcessTimeouts.PAYMENT_VERIFICATION.retries);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retries failed operations with exponential backoff', async () => {
    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts <= 2) {
        throw new Error('Operation failed');
      }
      return 'success';
    });

    const promise = retryHandler.execute(operation);
    
    // Fast-forward through retries
    jest.runAllTimers();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('respects maximum retry count', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
    
    await expect(retryHandler.execute(operation))
      .rejects.toThrow('Operation failed');
      
    expect(operation).toHaveBeenCalledTimes(ProcessTimeouts.PAYMENT_VERIFICATION.retries + 1);
  });

  it('detects timeout correctly', () => {
    const now = Date.now();
    retryHandler.startTime = now - (ProcessTimeouts.PAYMENT_VERIFICATION.timeout + 1000);
    
    expect(retryHandler.hasTimedOut()).toBe(true);
  });
});
