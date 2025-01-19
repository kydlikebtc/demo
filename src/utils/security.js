import crypto from 'crypto';

// Mock key pairs for agents
const mockKeyPairs = {
  OPA: {
    publicKey: 'opa-mock-public-key',
    privateKey: 'opa-mock-private-key'
  },
  CPA: {
    publicKey: 'cpa-mock-public-key',
    privateKey: 'cpa-mock-private-key'
  }
};

// Rate limiting configuration
const rateLimits = {
  DEFAULT: {
    maxRequests: 100,
    windowMs: 3600000 // 1 hour
  }
};

class RateLimiter {
  constructor() {
    this.requests = new Map(); // address -> [{timestamp}]
  }

  isRateLimited(address) {
    const now = Date.now();
    const windowMs = rateLimits.DEFAULT.windowMs;
    const maxRequests = rateLimits.DEFAULT.maxRequests;

    // Get requests within the current window
    const requests = this.requests.get(address) || [];
    const windowRequests = requests.filter(req => 
      req.timestamp > now - windowMs
    );

    // Update requests list
    this.requests.set(address, windowRequests);

    return windowRequests.length >= maxRequests;
  }

  addRequest(address) {
    if (this.isRateLimited(address)) {
      throw new Error('Rate limit exceeded');
    }

    const requests = this.requests.get(address) || [];
    requests.push({ timestamp: Date.now() });
    this.requests.set(address, requests);
  }
}

// Mock signing function
export function signMessage(agentType, message) {
  const privateKey = mockKeyPairs[agentType].privateKey;
  const signableString = message.toSignableString();
  
  // Mock signature generation using a hash
  const signature = crypto
    .createHash('sha256')
    .update(privateKey + signableString)
    .digest('hex');
  
  message.signature = signature;
  return message;
}

// Mock verification function
export function verifyMessage(agentType, message) {
  if (!message.signature) {
    throw new Error('Message is not signed');
  }

  const publicKey = mockKeyPairs[agentType].publicKey;
  const signableString = message.toSignableString();
  
  // Mock signature verification using the same hash
  const expectedSignature = crypto
    .createHash('sha256')
    .update(mockKeyPairs[agentType].privateKey + signableString)
    .digest('hex');
  
  return message.signature === expectedSignature;
}

// Export rate limiter instance
export const rateLimiter = new RateLimiter();

// Export mock keys for testing
export const mockKeys = mockKeyPairs;
