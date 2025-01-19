import { ServiceTypes } from '../models/serviceTypes.js';

// Mock Ethereum smart contract implementation
export class AdsPaymentContract {
  constructor() {
    this.balances = new Map();
    this.payments = new Map();
    this.confirmations = new Map();
  }

  // Implementation of IAdsPayment.verifyPayment
  async verifyPayment(userAddress, serviceCode) {
    // Validate inputs
    if (!this._isValidAddress(userAddress)) {
      throw new Error('Invalid Ethereum address');
    }
    
    if (!ServiceTypes[serviceCode]) {
      throw new Error('Invalid service code');
    }

    // Get service price
    const price = this.getServicePrice(serviceCode);
    
    // Check user balance
    const balance = this.balances.get(userAddress) || 0;
    if (balance < price) {
      return false;
    }

    // Mock transaction confirmation (minimum 3 blocks)
    await this._mockBlockConfirmations();

    // Lock payment amount
    this.balances.set(userAddress, balance - price);
    this.payments.set(userAddress + '_' + serviceCode, {
      amount: price,
      timestamp: Date.now(),
      confirmed: true
    });

    return true;
  }

  // Implementation of IAdsPayment.getServicePrice
  getServicePrice(serviceCode) {
    const service = ServiceTypes[serviceCode];
    if (!service) {
      throw new Error('Invalid service code');
    }
    return service.price;
  }

  // Implementation of IAdsPayment.refund
  async refund(userAddress, orderId) {
    const paymentKey = userAddress + '_' + orderId;
    const payment = this.payments.get(paymentKey);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.confirmed) {
      throw new Error('Payment not confirmed');
    }

    // Return funds to user balance
    const currentBalance = this.balances.get(userAddress) || 0;
    this.balances.set(userAddress, currentBalance + payment.amount);
    
    // Clear payment record
    this.payments.delete(paymentKey);

    return true;
  }

  // Mock methods for testing
  async mockDeposit(address, amount) {
    if (!this._isValidAddress(address)) {
      throw new Error('Invalid address');
    }
    const current = this.balances.get(address) || 0;
    this.balances.set(address, current + amount);
    return true;
  }

  // Private helper methods
  _isValidAddress(address) {
    return typeof address === 'string' && 
           address.startsWith('0x') && 
           address.length === 42 &&
           /^0x[0-9a-fA-F]{40}$/.test(address);
  }

  async _mockBlockConfirmations() {
    // Simulate waiting for 3 block confirmations
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  // For testing: get current balance
  getBalance(address) {
    return this.balances.get(address) || 0;
  }
}
