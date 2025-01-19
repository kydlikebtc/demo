// Error codes as defined in TAAP protocol specification
export const ErrorCodes = {
  E001: { code: 'E001', message: 'Invalid format', action: 'Reject order' },
  E002: { code: 'E002', message: 'Payment failed', action: 'Request new payment' },
  E003: { code: 'E003', message: 'Content generation failed', action: 'Retry once' },
  E004: { code: 'E004', message: 'Publishing failed', action: 'Retry twice' },
  E005: { code: 'E005', message: 'Rate limit exceeded', action: 'Queue order' }
};

export class TaapError extends Error {
  constructor(errorCode, details = '') {
    const error = ErrorCodes[errorCode];
    super(`${error.message}${details ? ': ' + details : ''}`);
    this.code = errorCode;
    this.action = error.action;
  }
}
