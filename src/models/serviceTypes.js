// Service types as defined in TAAP protocol specification
export const ServiceTypes = {
  S1: {
    code: 'S1',
    type: 'Single Post',
    price: 0.1,
    description: 'Single promotional tweet'
  },
  S2: {
    code: 'S2',
    type: 'Series',
    price: 0.25,
    description: 'Three related promotional tweets'
  },
  S3: {
    code: 'S3',
    type: 'Campaign',
    price: 0.5,
    description: 'Full promotional campaign'
  }
};

export function validateServiceCode(code) {
  return ServiceTypes[code] !== undefined;
}

export function getServicePrice(code) {
  return ServiceTypes[code]?.price || 0;
}
