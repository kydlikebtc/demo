/**
 * Interface for inter-agent communication messages
 * All messages between agents must follow this format and be signed
 */
export class AgentMessage {
  constructor(type, orderId, data) {
    this.type = type;
    this.orderId = orderId;
    this.data = data;
    this.timestamp = Date.now();
    this.signature = null;
  }

  static validateType(type) {
    return ['NEW_ORDER', 'STATUS_UPDATE', 'ERROR', 'COMPLETION'].includes(type);
  }

  validate() {
    if (!AgentMessage.validateType(this.type)) {
      throw new Error(`Invalid message type: ${this.type}`);
    }
    if (!this.orderId) {
      throw new Error('Order ID is required');
    }
    if (!this.timestamp) {
      throw new Error('Timestamp is required');
    }
    return true;
  }

  toSignableString() {
    return JSON.stringify({
      type: this.type,
      orderId: this.orderId,
      data: this.data,
      timestamp: this.timestamp
    });
  }
}

// Message type constants
export const MessageTypes = {
  NEW_ORDER: 'NEW_ORDER',
  STATUS_UPDATE: 'STATUS_UPDATE',
  ERROR: 'ERROR',
  COMPLETION: 'COMPLETION'
};
