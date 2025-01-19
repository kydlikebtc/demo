import { IPaymentProvider } from '../src/models/paymentProvider.js';

describe('IPaymentProvider Interface', () => {
  let provider;

  beforeEach(() => {
    provider = new IPaymentProvider();
  });

  it('should throw on verifyPayment', async () => {
    await expect(provider.verifyPayment('address', 'S1'))
      .rejects.toThrow('Not implemented');
  });

  it('should throw on getServicePrice', async () => {
    await expect(provider.getServicePrice('S1'))
      .rejects.toThrow('Not implemented');
  });

  it('should throw on refund', async () => {
    await expect(provider.refund('address', 'orderId'))
      .rejects.toThrow('Not implemented');
  });

  it('should throw on validateAddress', () => {
    expect(() => provider.validateAddress('address'))
      .toThrow('Not implemented');
  });

  it('should throw on getChainId', () => {
    expect(() => provider.getChainId())
      .toThrow('Not implemented');
  });

  it('should throw on mockDeposit', async () => {
    await expect(provider.mockDeposit('address', 1.0))
      .rejects.toThrow('Not implemented');
  });
});
