import { processOrder } from '../src/index.js';
import { OrderStates } from '../src/models/orderState.js';

describe('TAAP Integration Tests', () => {
  const validEthAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const validSolAddress = '7RCz8wb6WXxUhAigZXF4kNxNgAKTi9sF5Z4FxXYq7czM';

  describe('Ethereum Chain', () => {
    it('processes valid Ethereum order tweets correctly', async () => {
      const tweet = `#aiads ${validEthAddress} S1 Create an engaging promotional tweet about AI technology #adtech #promotion #eth`;
      
      const result = await processOrder(tweet);
      
      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(result.status).toContain(OrderStates.COMPLETED);
    });

    it('processes S2 service type on Ethereum correctly', async () => {
      const tweetS2 = `#aiads ${validEthAddress} S2 Create a series about blockchain technology #adtech #promotion #eth`;
      
      const result = await processOrder(tweetS2);
      
      expect(result.success).toBe(true);
      expect(result.status).toContain(OrderStates.COMPLETED);
    });

    it('defaults to Ethereum when no chain is specified', async () => {
      const tweet = `#aiads ${validEthAddress} S1 Create content #adtech #promotion`;
      const result = await processOrder(tweet);
      expect(result.success).toBe(true);
    });
  });

  describe('Solana Chain', () => {
    it('processes valid Solana order tweets correctly', async () => {
      const tweet = `#aiads ${validSolAddress} S1 Create an engaging promotional tweet #adtech #promotion #solana`;
      
      const result = await processOrder(tweet);
      
      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(result.status).toContain(OrderStates.COMPLETED);
    });

    it('processes S3 service type on Solana correctly', async () => {
      const tweetS3 = `#aiads ${validSolAddress} S3 Launch campaign for new AI product #adtech #promotion #solana`;
      
      const result = await processOrder(tweetS3);
      
      expect(result.success).toBe(true);
      expect(result.status).toContain(OrderStates.COMPLETED);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid tweet format correctly', async () => {
      const invalidTweet = 'invalid tweet format';
      const result = await processOrder(invalidTweet);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('E001');
    });

    it('rejects Ethereum address on Solana chain', async () => {
      const invalidChainTweet = `#aiads ${validEthAddress} S1 Test content #adtech #promotion #solana`;
      const result = await processOrder(invalidChainTweet);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('E001');
    });

    it('rejects Solana address on Ethereum chain', async () => {
      const invalidChainTweet = `#aiads ${validSolAddress} S1 Test content #adtech #promotion #eth`;
      const result = await processOrder(invalidChainTweet);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('E001');
    });

    it('handles payment verification failure correctly', async () => {
      // Using valid addresses but with no balance
      const tweet = `#aiads ${validEthAddress} S3 Test content #adtech #promotion`;
      const result = await processOrder(tweet);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('E002');
    });
  });
});
