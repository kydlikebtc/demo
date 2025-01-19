import { OPA } from '../src/services/opa.js';
import { CPA } from '../src/services/cpa.js';
import { OrderStates } from '../src/models/orderState.js';
import { TaapError } from '../src/models/errors.js';

describe('CPA Tests', () => {
  let opa;
  let cpa;
  let order;

  beforeEach(async () => {
    opa = new OPA();
    cpa = new CPA(opa);
    
    // Create and verify a test order
    const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Test requirement #adtech #promotion';
    order = opa.parseOrderCommand(tweet);
    await opa.verifyPayment(order.id);
  });

  describe('generateContent', () => {
    it('generates content and transitions through states correctly', async () => {
      await cpa.generateContent(order);
      const updatedOrder = opa.getOrder(order.id);
      
      expect(updatedOrder.state).toBe(OrderStates.CONTENT_REVIEW);
      expect(cpa.contentCache.has(order.id)).toBe(true);
      
      const content = cpa.contentCache.get(order.id);
      expect(content).toHaveProperty('text');
      expect(content.text).toMatch(/#\w+/); // Has hashtags
    });

    it('validates content requirements', async () => {
      await cpa.generateContent(order);
      const content = cpa.contentCache.get(order.id);
      
      // Text length between 180-240 characters
      expect(content.text.length).toBeGreaterThanOrEqual(180);
      expect(content.text.length).toBeLessThanOrEqual(240);
      
      // 2-5 hashtags
      const hashtags = content.text.match(/#\w+/g) || [];
      expect(hashtags.length).toBeGreaterThanOrEqual(2);
      expect(hashtags.length).toBeLessThanOrEqual(5);
    });
  });

  describe('reviewContent', () => {
    it('transitions to PUBLISHING state after successful review', async () => {
      await cpa.generateContent(order);
      await cpa.reviewContent(order);
      
      const updatedOrder = opa.getOrder(order.id);
      expect(updatedOrder.state).toBe(OrderStates.PUBLISHING);
    });
  });

  describe('publishContent', () => {
    it('transitions to COMPLETED state after successful publishing', async () => {
      await cpa.generateContent(order);
      await cpa.reviewContent(order);
      await cpa.publishContent(order);
      
      const updatedOrder = opa.getOrder(order.id);
      expect(updatedOrder.state).toBe(OrderStates.COMPLETED);
    });

    it('stores content in IPFS before publishing', async () => {
      await cpa.generateContent(order);
      await cpa.reviewContent(order);
      await cpa.publishContent(order);
      
      const contentHash = cpa.ipfsHashes.get(order.id);
      expect(contentHash).toBeDefined();
      expect(typeof contentHash).toBe('string');
      expect(contentHash.length).toBe(46); // Standard IPFS CID length
    });

    it('includes IPFS hash in analytics', async () => {
      const analyticsSpy = jest.spyOn(cpa.analytics, 'recordPublish');
      
      await cpa.generateContent(order);
      await cpa.reviewContent(order);
      await cpa.publishContent(order);
      
      expect(analyticsSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(String),
        expect.stringMatching(/^[A-Za-z0-9+/]{46}$/) // Base64 CID format
      );
    });
  });
});
