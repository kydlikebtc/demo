import { OrderStates, isValidTransition } from '../models/orderState.js';
import { TaapError } from '../models/errors.js';
import { validateServiceCode, getServicePrice } from '../models/serviceTypes.js';

export class OPA {
  constructor() {
    this.orders = new Map(); // In-memory store for orders
  }

  parseOrderCommand(tweetData) {
    // Parse tweet format: #aiads {contract_address} {service_code} {requirement}
    const regex = /^#aiads\s+(0x[a-fA-F0-9]{40})\s+(S[1-3])\s+(.+?)(?:\s+#adtech\s+#promotion)?$/;
    const match = tweetData.trim().match(regex);

    if (!match) {
      throw new TaapError('E001', 'Tweet format does not match required pattern');
    }

    const [, contractAddress, serviceCode, requirement] = match;

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
      // Mock payment verification - in real implementation, this would call the smart contract
      const verified = true; // Mocked to always succeed as per plan
      
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
      throw new TaapError('E002', 'Payment verification error');
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
