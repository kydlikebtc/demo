# TAAP Protocol Implementation

This repository implements the TAAP (Dual-Agent Advertisement Protocol) for automated advertisement services on Twitter. The implementation includes both Order Processing Agent (OPA) and Content Publishing Agent (CPA) with mocked integrations for Twitter API and multi-chain smart contract support.

## Core Features

- Multi-Chain Payment Support
  - Ethereum and Solana integration
  - Chain-specific address validation
  - Automatic price conversion
  - Payment verification and refunds
- Analytics and Reporting
  - Real-time engagement tracking (#ADS_{orderId}_stats)
  - Hourly/daily/weekly reports
  - Performance trend analysis
  - Demographic insights
- Security Features
  - Inter-agent message signing
  - Rate limiting per address
  - Exponential backoff retry
  - Chain-specific validation
- Content Management
  - IPFS-based storage
  - Partial completion support
  - Progress tracking
  - AI-powered generation
- Twitter API Integration (mocked)
  - Tweet posting and scheduling
  - Engagement tracking
  - Rate limit handling
  - Thread optimization

## Multi-Chain Compatibility

### Chain Selection
Specify the blockchain network using hashtags in your order tweet:
- Ethereum (default): `#eth`
- Solana: `#solana`

Example tweets:
```
#aiads 0x742d35Cc6634C0532925a3b844Bc454e4438f44e S1 Create promotional content #adtech #promotion #eth
#aiads 7RCz8wb6WXxUhAigZXF4kNxNgAKTi9sF5Z4FxXYq7czM S2 Launch campaign #adtech #promotion #solana
```

### Address Format Requirements
- Ethereum addresses:
  - Start with '0x'
  - 42 characters long (including '0x')
  - Hexadecimal format (0-9, a-f, A-F)
- Solana addresses:
  - 32-44 characters long
  - Base58 format (A-Z, a-z, 0-9, excluding 0, O, I, l)

### Chain-Specific Characteristics
- Ethereum:
  - Confirmation time: ~15 seconds (mocked)
  - Standard gas fees apply
  - Full EVM compatibility
- Solana:
  - Confirmation time: ~1 second (mocked)
  - Lower transaction fees
  - High throughput support

## State Management
- 8-state machine implementation
- Clear transition rules
- Error recovery procedures
- Partial completion support

## Error Handling
  - Standardized error codes
  - Automatic retries with backoff
  - Recovery procedures

## Service Types

### S1: Single Post
- Price: 0.1 ETH/SOL
- Features:
  - Single promotional tweet
  - Real-time analytics (#ADS_{orderId}_stats)
  - IPFS content storage
  - Basic engagement tracking

### S2: Series
- Price: 0.25 ETH/SOL
- Features:
  - Three related promotional tweets
  - Thread optimization
  - Partial completion support
  - Enhanced engagement metrics
  - Progress tracking per post

### S3: Campaign
- Price: 0.5 ETH/SOL
- Features:
  - Five scheduled promotional posts
  - Advanced analytics dashboard
  - Trend analysis
  - Automated recommendations
  - Full campaign reporting

## State Machine

### Order States
1. RECEIVED - Initial order parsing
2. PAYMENT_VERIFIED - Multi-chain payment verification
3. CONTENT_GENERATION - AI content creation
4. CONTENT_REVIEW - Content validation
5. PUBLISHING - Twitter integration
6. COMPLETED - Successful completion
7. PARTIAL_COMPLETION - Partial success state
8. ERROR - Error handling state

### State Progress Tracking
Each state maintains detailed progress:
```javascript
StateProgress = {
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
}
```

### State Transition Rules
- Forward progression with partial completion support
- Automatic retry with exponential backoff
- Configurable timeouts per state
- Progress tracking for multi-post services
- Recovery procedures for interrupted states

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

## Analytics & Reporting

Real-time analytics tracking with the #ADS_{orderId}_stats tag:

```javascript
{
  "metrics": {
    "impressions": 1000,
    "engagementRate": 0.08,
    "clickThroughRate": 0.05,
    "demographics": {
      "regions": {},
      "ageGroups": {},
      "interests": {}
    }
  }
}
```

### Report Types
- Hourly: Active orders and real-time metrics
- Daily: Service type breakdown and aggregated stats
- Weekly: Trend analysis and recommendations

## Security Features

### Message Signing
All inter-agent communication is cryptographically signed:

```javascript
const message = new AgentMessage(
  MessageTypes.NEW_ORDER,
  orderId,
  { status: 'RECEIVED' }
);
signMessage('OPA', message);
```

### Rate Limiting
- Per-address request tracking
- Configurable time windows
- Automatic throttling

## Timeout & Retry Configuration

```javascript
const ProcessTimeouts = {
  ORDER_PARSE: { timeout: 30s, retries: 0 },
  PAYMENT_VERIFICATION: { timeout: 5m, retries: 2 },
  CONTENT_GENERATION: { timeout: 15m, retries: 1 },
  CONTENT_REVIEW: { timeout: 10m, retries: 1 },
  PUBLISHING: { timeout: 5m, retries: 2 }
};
```

### Exponential Backoff
- Base delay: 1 second
- Maximum delay: 30 seconds
- Automatic retry handling

## Recovery Procedures

### Partial Completion
The system supports recovery from interruptions:

```javascript
{
  orderId: "ADS_123",
  currentState: "PARTIAL_COMPLETION",
  completedSteps: ["CONTENT_GENERATION", "CONTENT_REVIEW"],
  contentHash: "Qm...",
  canResume: true
}
```

### Recovery Options
- Automatic state resumption
- Progress preservation
- Manual intervention support

## IPFS Storage

Content is permanently stored on IPFS before publishing:

```javascript
const contentHash = await uploadContentToIPFS(content);
// Returns: Base64 CID (46 characters)
```

### Storage Features
- Content immutability
- Hash verification
- Permanent storage
- Size tracking

## Error Codes

- E001: Invalid format (Reject order)
- E002: Payment failed (Request new payment)
- E003: Content generation failed (Retry with backoff)
- E004: Publishing failed (Retry twice)
- E005: Rate limit exceeded (Queue order)

## License

MIT
