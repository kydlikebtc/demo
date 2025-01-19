import { EthereumPaymentProvider } from '../src/mocks/ethereumPaymentProvider.js';

describe('EthereumPaymentProvider', () => {
  let provider;
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const invalidAddress = 'invalid-address';

  beforeEach(() => {
    provider = new EthereumPaymentProvider();
  });

  describe('validateAddress', () => {
    it('validates correct Ethereum addresses', () => {
      expect(provider.validateAddress(validAddress)).toBe(true);
    });

    it('rejects invalid addresses', () => {
      expect(provider.validateAddress(invalidAddress)).toBe(false);
    });
  });

  describe('verifyPayment', () => {
    beforeEach(async () => {
      await provider.mockDeposit(validAddress, 1.0);
    });

    it('verifies payment with sufficient balance', async () => {
      const result = await provider.verifyPayment(validAddress, 'S1');
      expect(result).toBe(true);
    });

    it('rejects payment with insufficient balance', async () => {
      const result = await provider.verifyPayment(validAddress, 'S3');
      expect(result).toBe(false);
    });

    it('throws error for invalid address', async () => {
      await expect(provider.verifyPayment(invalidAddress, 'S1'))
        .rejects.toThrow('Invalid Ethereum address');
    });
  });

  describe('refund', () => {
    beforeEach(async () => {
      await provider.mockDeposit(validAddress, 1.0);
      await provider.verifyPayment(validAddress, 'S1');
    });

    it('processes refund successfully', async () => {
      const initialBalance = provider.getBalance(validAddress);
      await provider.refund(validAddress, 'S1');
      const finalBalance = provider.getBalance(validAddress);
      expect(finalBalance).toBeGreaterThan(initialBalance);
    });
  });

  it('returns correct chain ID', () => {
    expect(provider.getChainId()).toBe('ethereum');
  });
});
