import { AgentMessage, MessageTypes } from '../src/models/agentMessage.js';
import { signMessage, verifyMessage, rateLimiter, mockKeys } from '../src/utils/security.js';

describe('Security Utils', () => {
  describe('Message Signing', () => {
    let message;

    beforeEach(() => {
      message = new AgentMessage(
        MessageTypes.NEW_ORDER,
        'ADS_123',
        { status: 'RECEIVED' }
      );
    });

    it('signs messages with agent private key', () => {
      const signedMessage = signMessage('OPA', message);
      expect(signedMessage.signature).toBeDefined();
      expect(typeof signedMessage.signature).toBe('string');
    });

    it('verifies signed messages correctly', () => {
      const signedMessage = signMessage('OPA', message);
      expect(verifyMessage('OPA', signedMessage)).toBe(true);
    });

    it('fails verification for tampered messages', () => {
      const signedMessage = signMessage('OPA', message);
      signedMessage.data.status = 'MODIFIED';
      expect(verifyMessage('OPA', signedMessage)).toBe(false);
    });

    it('fails verification for wrong agent type', () => {
      const signedMessage = signMessage('OPA', message);
      expect(verifyMessage('CPA', signedMessage)).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    beforeEach(() => {
      // Reset rate limiter state
      rateLimiter.requests.clear();
    });

    it('allows requests within rate limit', () => {
      expect(() => rateLimiter.addRequest(testAddress)).not.toThrow();
    });

    it('blocks requests exceeding rate limit', () => {
      // Add max requests
      for (let i = 0; i < 100; i++) {
        rateLimiter.addRequest(testAddress);
      }

      // Next request should fail
      expect(() => rateLimiter.addRequest(testAddress))
        .toThrow('Rate limit exceeded');
    });

    it('resets rate limit after window expires', () => {
      // Mock Date.now to simulate time passing
      const realDateNow = Date.now.bind(global.Date);
      const currentTime = Date.now();
      
      global.Date.now = jest.fn(() => currentTime);
      
      // Add max requests
      for (let i = 0; i < 100; i++) {
        rateLimiter.addRequest(testAddress);
      }

      // Move time forward past the window
      global.Date.now = jest.fn(() => currentTime + 3600001);

      // Should allow new requests
      expect(() => rateLimiter.addRequest(testAddress)).not.toThrow();

      // Restore Date.now
      global.Date.now = realDateNow;
    });
  });
});
