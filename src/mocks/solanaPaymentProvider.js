import { IPaymentProvider } from '../models/paymentProvider.js';
import { ServiceTypes } from '../models/serviceTypes.js';

export class SolanaPaymentProvider extends IPaymentProvider {
  constructor() {
    super();
    this.balances = new Map();
    this.payments = new Map();
  }

  async verifyPayment(userAddress, serviceCode) {
    if (!this.validateAddress(userAddress)) {
      throw new Error('Invalid Solana address');
    }
    
    if (!ServiceTypes[serviceCode]) {
      throw new Error('Invalid service code');
    }

    const price = await this.getServicePrice(serviceCode);
    const balance = this.balances.get(userAddress) || 0;
    
    if (balance < price) {
      return false;
    }

    // Solana has faster confirmations (< 1s) compared to Ethereum
    await this._mockBlockConfirmations();

    this.balances.set(userAddress, balance - price);
    this.payments.set(userAddress + '_' + serviceCode, {
      amount: price,
      timestamp: Date.now(),
      confirmed: true
    });

    return true;
  }

  async getServicePrice(serviceCode) {
    const service = ServiceTypes[serviceCode];
    if (!service) {
      throw new Error('Invalid service code');
    }
    // For now, use same price model as Ethereum
    // In production, would use price oracle for SOL conversion
    return service.price;
  }

  async refund(userAddress, orderId) {
    if (!this.validateAddress(userAddress)) {
      throw new Error('Invalid Solana address');
    }

    const paymentKey = userAddress + '_' + orderId;
    const payment = this.payments.get(paymentKey);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.confirmed) {
      throw new Error('Payment not confirmed');
    }

    const currentBalance = this.balances.get(userAddress) || 0;
    this.balances.set(userAddress, currentBalance + payment.amount);
    this.payments.delete(paymentKey);

    return true;
  }

  validateAddress(address) {
    // Solana addresses:
    // - Are base58 encoded
    // - 32-44 characters long
    // - Contain only base58 characters (A-Z, a-z, 0-9)
    return typeof address === 'string' &&
           address.length >= 32 &&
           address.length <= 44 &&
           /^[A-HJ-NP-Za-km-z1-9]*$/.test(address);
  }

  getChainId() {
    return 'solana';
  }

  async mockDeposit(address, amount) {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid address');
    }
    const current = this.balances.get(address) || 0;
    this.balances.set(address, current + amount);
    return true;
  }

  async _mockBlockConfirmations() {
    // Solana confirmations are much faster than Ethereum
    await new Promise(resolve => setTimeout(resolve, 20));
    return true;
  }

  getBalance(address) {
    return this.balances.get(address) || 0;
  }
}
