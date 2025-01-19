import { OPA } from './services/opa.js';
import { CPA } from './services/cpa.js';
import { TwitterAPI } from './mocks/twitterMock.js';
import { EthereumPaymentProvider } from './mocks/ethereumPaymentProvider.js';
import { TaapError } from './models/errors.js';

// Initialize services
const twitterAPI = new TwitterAPI();
const paymentContract = new EthereumPaymentProvider();
const opa = new OPA();
const cpa = new CPA(opa); // Pass OPA instance for state management

async function processOrder(tweetText) {
  let order;
  
  try {
    // Step 1: Parse order command
    console.log('Processing tweet:', tweetText);
    order = opa.parseOrderCommand(tweetText);
    console.log('Order created:', order.id);

    // Step 2: Verify payment using appropriate provider
    console.log('Verifying payment...');
    const provider = order.chain === 'solana' ? new SolanaPaymentProvider() : new EthereumPaymentProvider();
    const paymentVerified = await provider.verifyPayment(
      order.contractAddress,
      order.serviceCode
    );

    if (!paymentVerified) {
      throw new TaapError('E002', 'Payment verification failed');
    }

    await opa.verifyPayment(order.id);
    console.log('Payment verified');

    // Step 3: Generate content
    console.log('Generating content...');
    const content = await cpa.generateContent(order);
    console.log('Content generated');

    // Step 4: Review content
    console.log('Reviewing content...');
    await cpa.reviewContent(order);
    console.log('Content approved');

    // Step 5: Publish content
    console.log('Publishing content...');
    await cpa.publishContent(order);
    console.log('Content published successfully');

    // Return final status
    return {
      success: true,
      orderId: order.id,
      status: opa.formatStatusUpdate(order.id)
    };

  } catch (error) {
    console.error('Error processing order:', error);
    
    // Update order status to ERROR if order was created
    if (order?.id) {
      try {
        await opa.updateStatus(order.id, 'ERROR');
        
        // Attempt refund if payment was made
        if (order.contractAddress) {
          await paymentContract.refund(order.contractAddress, order.id);
          console.log('Payment refunded');
        }
      } catch (updateError) {
        console.error('Error updating status:', updateError);
      }
    }

    return {
      success: false,
      error: error instanceof TaapError ? error : new TaapError('E001', error.message),
      orderId: order?.id
    };
  }
}

// Example usage and testing
async function runExample() {
  const exampleTweet = '#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Create an engaging promotional tweet about AI technology #adtech #promotion';
  
  try {
    const result = await processOrder(exampleTweet);
    console.log('Final result:', result);
  } catch (error) {
    console.error('Example run failed:', error);
  }
}

// Export for module usage
export { processOrder, runExample };

// Run example if this is the main module
if (import.meta.url === new URL(import.meta.url).href) {
  runExample().catch(console.error);
}
