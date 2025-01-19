import { processOrder } from '../src/index.js';
import { OrderStates } from '../src/models/orderState.js';

describe('TAAP Integration Tests', () => {
  it('processes valid order successfully through all states', async () => {
    const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Create an engaging promotional tweet about AI technology #adtech #promotion';
    
    const result = await processOrder(tweet);
    
    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
    expect(result.status).toContain(OrderStates.COMPLETED);
  });

  it('handles invalid tweet format correctly', async () => {
    const invalidTweet = 'invalid tweet format';
    
    const result = await processOrder(invalidTweet);
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('E001');
  });

  it('processes S2 service type correctly', async () => {
    const tweetS2 = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S2 Create a series about blockchain technology #adtech #promotion';
    
    const result = await processOrder(tweetS2);
    
    expect(result.success).toBe(true);
    expect(result.status).toContain(OrderStates.COMPLETED);
  });

  it('processes S3 service type correctly', async () => {
    const tweetS3 = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S3 Launch campaign for new AI product #adtech #promotion';
    
    const result = await processOrder(tweetS3);
    
    expect(result.success).toBe(true);
    expect(result.status).toContain(OrderStates.COMPLETED);
  });
});
