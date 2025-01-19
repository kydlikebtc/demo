// Timeout and retry configuration as per TAAP specification
export const ProcessTimeouts = {
  ORDER_PARSE: {
    timeout: 30 * 1000, // 30 seconds
    retries: 0
  },
  PAYMENT_VERIFICATION: {
    timeout: 5 * 60 * 1000, // 5 minutes
    retries: 2
  },
  CONTENT_GENERATION: {
    timeout: 15 * 60 * 1000, // 15 minutes
    retries: 1
  },
  CONTENT_REVIEW: {
    timeout: 10 * 60 * 1000, // 10 minutes
    retries: 1
  },
  PUBLISHING: {
    timeout: 5 * 60 * 1000, // 5 minutes
    retries: 2
  }
};

export class RetryHandler {
  constructor(process, maxRetries) {
    this.process = process;
    this.maxRetries = maxRetries;
    this.attempts = 0;
    this.startTime = null;
  }

  async execute(operation) {
    this.startTime = Date.now();
    this.attempts = 0;

    while (this.attempts <= this.maxRetries) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        this.attempts++;
        
        if (this.attempts > this.maxRetries) {
          throw error;
        }

        // Exponential backoff: 2^attempt * 1000ms
        const backoffTime = Math.min(Math.pow(2, this.attempts) * 1000, 30000);
        console.log(`Retry attempt ${this.attempts} for ${this.process}. Waiting ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  hasTimedOut() {
    if (!this.startTime) return false;
    const elapsed = Date.now() - this.startTime;
    return elapsed > ProcessTimeouts[this.process].timeout;
  }

  getAttempts() {
    return this.attempts;
  }
}
