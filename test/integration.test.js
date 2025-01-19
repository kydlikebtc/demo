import { processOrder } from '../src/index.js';
import { OrderStates } from '../src/models/orderState.js';
import { uploadContentToIPFS, getContentFromIPFS } from '../src/services/ipfsStorage.js';

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

  it('handles Solana addresses correctly', async () => {
    const tweetSolana = '#aiads 7RCz8wb6WXxUhAigZXF4kNxNgAKTi9sF5Z4FxXYq7czM S1 Create a Solana-focused promotional tweet #adtech #promotion';
    
    const result = await processOrder(tweetSolana);
    
    expect(result.success).toBe(true);
    expect(result.status).toContain(OrderStates.COMPLETED);
  });

  it('supports partial completion for S2 service', async () => {
    // Mock network error during publishing
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
    const mockError = new Error('Network error during publishing');
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);

    const tweetS2 = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S2 Create a series about blockchain #adtech #promotion';
    const result = await processOrder(tweetS2);
    
    expect(result.status).toContain(OrderStates.PARTIAL_COMPLETION);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('verifies IPFS content storage', async () => {
    const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Test IPFS storage #adtech #promotion';
    const result = await processOrder(tweet);
    
    // Extract content hash from status
    const hashMatch = result.status.match(/contentHash: "([^"]+)"/);
    expect(hashMatch).toBeTruthy();
    
    const contentHash = hashMatch[1];
    const content = await getContentFromIPFS(contentHash);
    expect(content).toBeDefined();
    expect(content.text).toContain('Test IPFS storage');
  });

  it('recovers from partial completion state', async () => {
    // First attempt - force partial completion
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
    const mockError = new Error('Network error during publishing');
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);

    const tweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S2 Test recovery #adtech #promotion';
    let result = await processOrder(tweet);
    
    expect(result.status).toContain(OrderStates.PARTIAL_COMPLETION);

    // Second attempt - should resume and complete
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true });
    result = await processOrder(tweet);
    
    expect(result.status).toContain(OrderStates.COMPLETED);
    expect(result.success).toBe(true);
  });
});
