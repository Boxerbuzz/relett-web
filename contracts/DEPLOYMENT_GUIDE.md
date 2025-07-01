
# Property Tokenization Contract Deployment Guide

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Hedera credentials
   ```

2. **Install and Test**
   ```bash
   npm run setup
   ```

3. **Deploy Contracts**
   ```bash
   npm run deploy
   ```

## Detailed Steps

### 1. Environment Configuration

Create a `.env` file with your Hedera credentials:

```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_NETWORK=testnet
```

**Important Notes:**
- Private key should be a 64-character hex string (no '0x' prefix)
- Account ID should be in format: 0.0.12345
- Use testnet for development, mainnet for production

### 2. Account Requirements

- **Minimum Balance**: 10 HBAR recommended for contract deployment
- **Account Type**: Standard Hedera account with sufficient permissions
- **Network**: Ensure you're using the correct network (testnet/mainnet)

### 3. Pre-Deployment Checks

Run the connection test to verify everything is properly configured:

```bash
npm run test-connection
```

This will check:
- ✅ Environment variables are set
- ✅ Private key format is correct
- ✅ Network connectivity is working
- ✅ Account balance is sufficient
- ✅ Network performance is acceptable

### 4. Contract Compilation

Compile the smart contracts:

```bash
npm run compile
```

This creates the necessary artifacts in the `artifacts/` directory.

### 5. Contract Deployment

Deploy to testnet:
```bash
npm run deploy
```

Deploy to mainnet:
```bash
npm run deploy:mainnet
```

### 6. Post-Deployment

After successful deployment:

1. **Save Contract Addresses**: Copy the contract IDs from the deployment output
2. **Update Frontend**: Add contract addresses to your frontend `.env` file
3. **Verify Contracts**: Check contracts on HashScan explorer
4. **Test Integration**: Test contract interactions in your application

## Contract Architecture

The deployment includes three main contracts:

1. **PropertyRegistry** - Central registry for all tokenized properties
2. **PropertyMarketplace** - Trading platform for property tokens  
3. **RevenueDistributor** - Automated revenue distribution system

## Troubleshooting

### Common Issues

**"2 UNKNOWN" Error**
- Usually indicates network connectivity issues
- Try running `npm run test-connection` first
- Check your internet connection and Hedera network status

**"Insufficient Balance" Error**
- Your account needs more HBAR
- Fund your account at https://portal.hedera.com/

**"Invalid Private Key" Error**
- Verify your private key is 64 characters (hex)
- Remove any '0x' prefix
- Try both ECDSA and ED25519 formats

**Compilation Errors**
- Run `npm run clean` then `npm run compile`
- Check for syntax errors in Solidity files
- Ensure OpenZeppelin contracts are installed

### Getting Help

- 📖 [Hedera Documentation](https://docs.hedera.com/)
- 🌐 [Network Status](https://status.hedera.com/)
- 🔍 [HashScan Explorer](https://hashscan.io/)
- 💬 [Hedera Discord](https://discord.com/invite/hedera)

## Network Information

### Testnet
- **Endpoint**: https://testnet.hashio.io/api
- **Chain ID**: 296
- **Explorer**: https://hashscan.io/testnet
- **Faucet**: https://portal.hedera.com/

### Mainnet
- **Endpoint**: https://mainnet.hashio.io/api  
- **Chain ID**: 295
- **Explorer**: https://hashscan.io/mainnet

## Security Considerations

- 🔒 Never commit private keys to version control
- 🔐 Use environment variables for sensitive data
- 🛡️ Test thoroughly on testnet before mainnet deployment
- 📊 Monitor contract interactions and gas usage
- 🔍 Verify contract addresses after deployment

## Development Workflow

1. **Local Development**
   ```bash
   npm run compile
   npm run test
   ```

2. **Testnet Deployment**
   ```bash
   npm run test-connection
   npm run deploy:testnet
   ```

3. **Integration Testing**
   - Test contract interactions
   - Verify frontend integration
   - Check revenue distribution

4. **Mainnet Deployment**
   ```bash
   HEDERA_NETWORK=mainnet npm run deploy
   ```

## Contract Addresses

After deployment, update your frontend environment:

```env
VITE_PROPERTY_REGISTRY_CONTRACT=0.0.12345
VITE_PROPERTY_MARKETPLACE_CONTRACT=0.0.12346  
VITE_REVENUE_DISTRIBUTOR_CONTRACT=0.0.12347
```

Replace with your actual deployed contract IDs.
