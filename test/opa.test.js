import { OPA } from '../src/services/opa.js';
import { OrderStates } from '../src/models/orderState.js';
import { TaapError } from '../src/models/errors.js';

describe('OPA Tests', () => {
  let opa;

  beforeEach(() => {
    opa = new OPA();
  });

  describe('parseOrderCommand', () => {
    const validEthAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const validSolAddress = '7RCz8wb6WXxUhAigZXF4kNxNgAKTi9sF5Z4FxXYq7czM';

    it('parses valid Ethereum order tweets correctly', () => {
      const tweet = `#aiads ${validEthAddress} S1 Create an engaging promotional tweet #adtech #promotion #eth`;
      const order = opa.parseOrderCommand(tweet);
      
      expect(order.serviceCode).toBe('S1');
      expect(order.contractAddress).toBe(validEthAddress);
      expect(order.requirement).toContain('Create an engaging promotional tweet');
      expect(order.state).toBe(OrderStates.RECEIVED);
      expect(order.chain).toBe('eth');
    });

    it('parses valid Solana order tweets correctly', () => {
      const tweet = `#aiads ${validSolAddress} S1 Create an engaging promotional tweet #adtech #promotion #solana`;
      const order = opa.parseOrderCommand(tweet);
      
      expect(order.serviceCode).toBe('S1');
      expect(order.contractAddress).toBe(validSolAddress);
      expect(order.requirement).toContain('Create an engaging promotional tweet');
      expect(order.state).toBe(OrderStates.RECEIVED);
      expect(order.chain).toBe('solana');
    });

    it('defaults to Ethereum chain when no chain tag is provided', () => {
      const tweet = `#aiads ${validEthAddress} S1 Create an engaging promotional tweet #adtech #promotion`;
      const order = opa.parseOrderCommand(tweet);
      expect(order.chain).toBe('eth');
    });

    it('throws E001 for invalid tweet format', () => {
      const invalidTweets = [
        'not a valid tweet',
        '#aiads invalid_address S1 requirement',
        '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S4 requirement',
        '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1'
      ];

      invalidTweets.forEach(tweet => {
        expect(() => opa.parseOrderCommand(tweet)).toThrow(TaapError);
      });
    });

    it('throws E001 for invalid chain-specific address formats', () => {
      // Ethereum address for Solana chain
      const invalidSolTweet = `#aiads ${validEthAddress} S1 requirement #adtech #promotion #solana`;
      expect(() => opa.parseOrderCommand(invalidSolTweet))
        .toThrow(new TaapError('E001', 'Invalid solana address format'));

      // Solana address for Ethereum chain
      const invalidEthTweet = `#aiads ${validSolAddress} S1 requirement #adtech #promotion #eth`;
      expect(() => opa.parseOrderCommand(invalidEthTweet))
        .toThrow(new TaapError('E001', 'Invalid eth address format'));
    });
  });

  describe('verifyPayment', () => {
    it('transitions state to PAYMENT_VERIFIED on success', async () => {
      const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Test requirement #adtech #promotion';
      const order = opa.parseOrderCommand(tweet);
      
      await opa.verifyPayment(order.id);
      const updatedOrder = opa.getOrder(order.id);
      
      expect(updatedOrder.state).toBe(OrderStates.PAYMENT_VERIFIED);
    });
  });

  describe('updateStatus', () => {
    it('updates order status with valid transitions', async () => {
      const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Test requirement #adtech #promotion';
      const order = opa.parseOrderCommand(tweet);
      
      await opa.updateStatus(order.id, OrderStates.PAYMENT_VERIFIED);
      let updatedOrder = opa.getOrder(order.id);
      expect(updatedOrder.state).toBe(OrderStates.PAYMENT_VERIFIED);
      
      await opa.updateStatus(order.id, OrderStates.CONTENT_GENERATION);
      updatedOrder = opa.getOrder(order.id);
      expect(updatedOrder.state).toBe(OrderStates.CONTENT_GENERATION);
    });

    it('throws error for invalid transitions', async () => {
      const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Test requirement #adtech #promotion';
      const order = opa.parseOrderCommand(tweet);
      
      await expect(opa.updateStatus(order.id, OrderStates.COMPLETED))
        .rejects.toThrow(TaapError);
    });
  });
});
