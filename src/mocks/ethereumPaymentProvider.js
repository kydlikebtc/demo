import { IPaymentProvider } from '../models/paymentProvider.js';
import { ServiceTypes } from '../models/serviceTypes.js';

export class EthereumPaymentProvider extends IPaymentProvider {
  constructor() {
    super();
    this.balances = new Map();
    this.payments = new Map();
    this.confirmations = new Map();
  }

  async verifyPayment(userAddress, serviceCode) {
    if (!this.validateAddress(userAddress)) {
      throw new Error('Invalid Ethereum address');
    }
    
    if (!ServiceTypes[serviceCode]) {
      throw new Error('Invalid service code');
    }

    const price = await this.getServicePrice(serviceCode);
    const balance = this.balances.get(userAddress) || 0;
    
    if (balance < price) {
      return false;
    }

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
    return service.price;
  }

  async refund(userAddress, orderId) {
    if (!this.validateAddress(userAddress)) {
      throw new Error('Invalid Ethereum address');
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
    return typeof address === 'string' && 
           address.startsWith('0x') && 
           address.length === 42 &&
           /^0x[0-9a-fA-F]{40}$/.test(address);
  }

  getChainId() {
    return 'ethereum';
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
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  getBalance(address) {
    return this.balances.get(address) || 0;
  }
}
