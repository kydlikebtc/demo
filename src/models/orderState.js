// Order states as defined in TAAP protocol specification
export const OrderStates = {
  RECEIVED: 'RECEIVED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  CONTENT_GENERATION: 'CONTENT_GENERATION',
  CONTENT_REVIEW: 'CONTENT_REVIEW',
  PUBLISHING: 'PUBLISHING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

// Valid state transitions as per TAAP specification section 4.2
export const StateTransitions = {
  [OrderStates.RECEIVED]: [OrderStates.PAYMENT_VERIFIED, OrderStates.ERROR],
  [OrderStates.PAYMENT_VERIFIED]: [OrderStates.CONTENT_GENERATION, OrderStates.ERROR],
  [OrderStates.CONTENT_GENERATION]: [OrderStates.CONTENT_REVIEW, OrderStates.ERROR],
  [OrderStates.CONTENT_REVIEW]: [OrderStates.PUBLISHING, OrderStates.ERROR],
  [OrderStates.PUBLISHING]: [OrderStates.COMPLETED, OrderStates.ERROR],
  [OrderStates.COMPLETED]: [OrderStates.ERROR], // Can still transition to error if needed
  [OrderStates.ERROR]: [] // Terminal state, no transitions out
};

// Validate if a state transition is allowed
export function isValidTransition(fromState, toState) {
  const allowedTransitions = StateTransitions[fromState] || [];
  return allowedTransitions.includes(toState);
}
