/**
 * Interface for blockchain payment providers
 * Implementations must handle chain-specific address validation and payment verification
 */
export class IPaymentProvider {
  /**
   * Verify payment for a service
   * @param {string} userAddress - Blockchain address of the user
   * @param {string} serviceCode - Service type code (S1, S2, S3)
   * @returns {Promise<boolean>} - True if payment is verified
   */
  async verifyPayment(userAddress, serviceCode) {
    throw new Error('Not implemented');
  }

  /**
   * Get service price in chain's native currency
   * @param {string} serviceCode - Service type code (S1, S2, S3)
   * @returns {Promise<number>} - Price in chain's native currency
   */
  async getServicePrice(serviceCode) {
    throw new Error('Not implemented');
  }

  /**
   * Refund payment for an order
   * @param {string} userAddress - Blockchain address to refund to
   * @param {string} orderId - Order ID to refund
   * @returns {Promise<boolean>} - True if refund is successful
   */
  async refund(userAddress, orderId) {
    throw new Error('Not implemented');
  }

  /**
   * Validate blockchain address format
   * @param {string} address - Address to validate
   * @returns {boolean} - True if address format is valid
   */
  validateAddress(address) {
    throw new Error('Not implemented');
  }

  /**
   * Get chain identifier
   * @returns {string} - Chain identifier (e.g., 'ethereum', 'solana')
   */
  getChainId() {
    throw new Error('Not implemented');
  }

  /**
   * Mock deposit for testing
   * @param {string} address - Address to deposit to
   * @param {number} amount - Amount to deposit
   * @returns {Promise<boolean>} - True if deposit is successful
   */
  async mockDeposit(address, amount) {
    throw new Error('Not implemented');
  }
}
