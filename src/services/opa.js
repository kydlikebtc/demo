import { OrderStates, isValidTransition } from '../models/orderState.js';
import { TaapError } from '../models/errors.js';
import { validateServiceCode, getServicePrice } from '../models/serviceTypes.js';
import { EthereumPaymentProvider } from '../mocks/ethereumPaymentProvider.js';
import { SolanaPaymentProvider } from '../mocks/solanaPaymentProvider.js';

export class OPA {
  constructor() {
    this.orders = new Map(); // In-memory store for orders
    this.ethereumProvider = new EthereumPaymentProvider();
    this.solanaProvider = new SolanaPaymentProvider();
  }

  parseOrderCommand(tweetData) {
    // Parse tweet format: #aiads {contract_address} {service_code} {requirement} [#eth|#solana]
    const regex = /^#aiads\s+([A-Za-z0-9]{32,44})\s+(S[1-3])\s+(.+?)(?:\s+#adtech\s+#promotion)?(?:\s+#(eth|solana))?$/;
    const match = tweetData.trim().match(regex);

    if (!match) {
      throw new TaapError('E001', 'Tweet format does not match required pattern');
    }

    const [, contractAddress, serviceCode, requirement, chain = 'eth'] = match;
    
    // Validate address format based on chain
    const provider = chain === 'solana' ? this.solanaProvider : this.ethereumProvider;
    if (!provider.validateAddress(contractAddress)) {
      throw new TaapError('E001', `Invalid ${chain} address format`);
    }

    // Validate service code
    if (!validateServiceCode(serviceCode)) {
      throw new TaapError('E001', `Invalid service code: ${serviceCode}`);
    }

    // Validate requirement length (max 200 chars per spec)
    if (requirement.length > 200) {
      throw new TaapError('E001', 'Requirement text exceeds 200 characters');
    }

    const orderId = `ADS_${Date.now()}`; // Generate unique order ID
    const order = {
      id: orderId,
      contractAddress,
      serviceCode,
      requirement,
      chain,
      state: OrderStates.RECEIVED,
      price: getServicePrice(serviceCode),
      createdAt: new Date(),
      updates: [{
        state: OrderStates.RECEIVED,
        timestamp: new Date()
      }]
    };

    this.orders.set(orderId, order);
    return order;
  }

  async verifyPayment(orderId) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new TaapError('E001', `Order not found: ${orderId}`);
    }

    try {
      // Get appropriate provider based on chain
      const provider = order.chain === 'solana' ? this.solanaProvider : this.ethereumProvider;
      
      // Verify payment using chain-specific provider
      const verified = await provider.verifyPayment(
        order.contractAddress,
        order.serviceCode
      );
      
      if (verified) {
        await this.updateStatus(orderId, OrderStates.PAYMENT_VERIFIED);
        return true;
      } else {
        throw new TaapError('E002', 'Payment verification failed');
      }
    } catch (error) {
      if (error instanceof TaapError) {
        throw error;
      }
      throw new TaapError('E002', error.message || 'Payment verification error');
    }
  }

  async updateStatus(orderId, newState) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new TaapError('E001', `Order not found: ${orderId}`);
    }

    if (!isValidTransition(order.state, newState)) {
      throw new TaapError('E001', `Invalid state transition from ${order.state} to ${newState}`);
    }

    order.state = newState;
    order.updates.push({
      state: newState,
      timestamp: new Date()
    });

    this.orders.set(orderId, order);
    return order;
  }

  getOrder(orderId) {
    return this.orders.get(orderId);
  }

  formatStatusUpdate(orderId) {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new TaapError('E001', `Order not found: ${orderId}`);
    }

    // Format as per spec section 2.2
    const updates = order.updates.map(update => {
      const symbol = update.state === order.state ? '►' : '✓';
      return `${symbol} ${update.state}`;
    });

    return `Order:${orderId}\n${updates.join('\n')}`;
  }
}
