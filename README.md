# TAAP Protocol Implementation

This repository implements the TAAP (Dual-Agent Advertisement Protocol) for automated advertisement services on Twitter. The implementation includes both Order Processing Agent (OPA) and Content Publishing Agent (CPA) with mocked integrations for Twitter API and Ethereum smart contracts.

## Core Features

- Twitter API v2 Integration (mocked)
  - Tweet posting and scheduling
  - Engagement tracking
  - Rate limit handling
- Smart Contract Integration (mocked)
  - Payment verification
  - Service pricing
  - Refund handling
- Content Generation and Review
  - AI-powered content creation
  - Content validation rules
  - Review workflow
- State Management
  - 7-state machine implementation
  - Clear transition rules
  - Error recovery
- Error Handling
  - Standardized error codes
  - Automatic retries
  - Refund processing

## Service Types

- S1 (Single Post): 0.1 ETH
  - Single promotional tweet
  - Basic engagement tracking
  - Content validation
- S2 (Series): 0.25 ETH
  - Three related promotional tweets
  - Thread optimization
  - Enhanced engagement metrics
- S3 (Campaign): 0.5 ETH
  - Full promotional campaign
  - Scheduled posting
  - Advanced analytics

## State Machine

Orders progress through the following states:
1. RECEIVED - Initial order parsing
2. PAYMENT_VERIFIED - Smart contract verification complete
3. CONTENT_GENERATION - AI content creation
4. CONTENT_REVIEW - Manual/automated review
5. PUBLISHING - Twitter API integration
6. COMPLETED - Successful completion
7. ERROR - Error handling state

### State Transition Rules
- Forward progression only (except for ERROR)
- Each state has defined entry/exit conditions
- Automatic error recovery where possible
- Payment verification required before content generation
- Content review mandatory before publishing

## Installation

```bash
npm install
```

## Usage

### Order Command Format
```
#aiads {contract_address} {service_code} {requirement} #adtech #promotion
```

Example:
```
#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Create an engaging promotional tweet about AI technology #adtech #promotion
```

## Testing

```bash
npm test
```

## Error Codes

- E001: Invalid format (Reject order)
- E002: Payment failed (Request new payment)
- E003: Content generation failed (Retry once)
- E004: Publishing failed (Retry twice)
- E005: Rate limit exceeded (Queue order)

## License

MIT
