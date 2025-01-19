// Order states as defined in TAAP protocol specification
export const OrderStates = {
  RECEIVED: 'RECEIVED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  CONTENT_GENERATION: 'CONTENT_GENERATION',
  CONTENT_REVIEW: 'CONTENT_REVIEW',
  PUBLISHING: 'PUBLISHING',
  COMPLETED: 'COMPLETED',
  PARTIAL_COMPLETION: 'PARTIAL_COMPLETION',
  ERROR: 'ERROR'
};

// Track progress within each state
export const StateProgress = {
  CONTENT_GENERATION: {
    STARTED: 'started',
    AI_PROCESSING: 'ai_processing',
    COMPLETED: 'completed'
  },
  PUBLISHING: {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
  }
};

// Valid state transitions as per TAAP specification section 4.2
export const StateTransitions = {
  [OrderStates.RECEIVED]: [OrderStates.PAYMENT_VERIFIED, OrderStates.ERROR],
  [OrderStates.PAYMENT_VERIFIED]: [OrderStates.CONTENT_GENERATION, OrderStates.ERROR],
  [OrderStates.CONTENT_GENERATION]: [OrderStates.CONTENT_REVIEW, OrderStates.ERROR, OrderStates.PARTIAL_COMPLETION],
  [OrderStates.CONTENT_REVIEW]: [OrderStates.PUBLISHING, OrderStates.ERROR, OrderStates.PARTIAL_COMPLETION],
  [OrderStates.PUBLISHING]: [OrderStates.COMPLETED, OrderStates.ERROR, OrderStates.PARTIAL_COMPLETION],
  [OrderStates.COMPLETED]: [OrderStates.ERROR], // Can still transition to error if needed
  [OrderStates.PARTIAL_COMPLETION]: [OrderStates.PUBLISHING, OrderStates.ERROR], // Can resume from partial completion
  [OrderStates.ERROR]: [] // Terminal state, no transitions out
};

// Validate if a state transition is allowed
export function isValidTransition(fromState, toState) {
  const allowedTransitions = StateTransitions[fromState] || [];
  return allowedTransitions.includes(toState);
}
