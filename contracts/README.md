
# Property Tokenization Smart Contracts

This directory contains Solidity smart contracts for property tokenization on the Hedera network.

## Contracts

1. **PropertyRegistry.sol** - Central registry for all tokenized properties
2. **PropertyToken.sol** - ERC20 token representing fractional ownership
3. **PropertyMarketplace.sol** - Marketplace for trading property tokens
4. **RevenueDistributor.sol** - Automated revenue distribution system

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   ```

3. Configure your Hedera credentials in `.env`:
   ```
   HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   HEDERA_NETWORK=testnet
   ```

## Usage

### Compile Contracts
```bash
npm run compile
```

### Deploy to Testnet
```bash
npm run deploy
```

### Deploy to Mainnet
```bash
npm run deploy:mainnet
```

## Getting Hedera Credentials

1. Visit [Hedera Portal](https://portal.hedera.com/)
2. Create an account (testnet is free)
3. Generate account ID and private key
4. Add to your `.env` file

## Contract Architecture

- **PropertyRegistry**: Manages property registration and verification
- **PropertyToken**: Individual tokens for each property with revenue distribution
- **PropertyMarketplace**: Trading platform with offers and listings
- **RevenueDistributor**: Handles automated profit sharing

## Security Features

- Ownership controls
- KYC verification requirements
- Pausable contracts
- Reentrancy protection
- Role-based access control
