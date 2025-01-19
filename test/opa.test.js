import { OPA } from '../src/services/opa.js';
import { OrderStates } from '../src/models/orderState.js';
import { TaapError } from '../src/models/errors.js';

describe('OPA Tests', () => {
  let opa;

  beforeEach(() => {
    opa = new OPA();
  });

  describe('parseOrderCommand', () => {
    it('parses valid order tweets correctly', () => {
      const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Create an engaging promotional tweet #adtech #promotion';
      const order = opa.parseOrderCommand(tweet);
      
      expect(order.serviceCode).toBe('S1');
      expect(order.contractAddress).toBe('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      expect(order.requirement).toContain('Create an engaging promotional tweet');
      expect(order.state).toBe(OrderStates.RECEIVED);
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
