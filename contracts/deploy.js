
// Deployment script for Hedera network
const { 
  Client, 
  ContractCreateFlow, 
  ContractFunctionParameters,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  Status,
  Hbar
} = require("@hashgraph/sdk");
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function validateConnection(client) {
  try {
    console.log("🔍 Testing Hedera network connection...");
    const balance = await client.getAccountBalance(client.operatorAccountId);
    console.log(`✅ Connected! Account balance: ${balance.hbars.toString()}`);
    
    // Check if balance is sufficient for deployment
    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
    if (hbarBalance < 10) {
      console.log("⚠️  Warning: Low HBAR balance. Recommended minimum: 10 HBAR for contract deployment");
      console.log(`   Current balance: ${hbarBalance.toFixed(4)} HBAR`);
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    return false;
  }
}

async function detectPrivateKeyType(privateKeyString) {
  // Remove any whitespace
  const cleanKey = privateKeyString.trim();
  
  // Check if it's a raw hex string (64 characters for ECDSA, 64 for ED25519)
  if (/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    // Try ECDSA first, then ED25519 if that fails
    try {
      return PrivateKey.fromStringECDSA(cleanKey);
    } catch (ecdsaError) {
      try {
        return PrivateKey.fromStringED25519(cleanKey);
      } catch (ed25519Error) {
        throw new Error(`Unable to parse private key as ECDSA or ED25519: ${ecdsaError.message}`);
      }
    }
  }
  
  // Check if it's a DER-encoded key (longer hex string)
  if (/^[0-9a-fA-F]{96,}$/.test(cleanKey)) {
    try {
      return PrivateKey.fromStringDer(cleanKey);
    } catch (derError) {
      throw new Error(`Unable to parse DER-encoded private key: ${derError.message}`);
    }
  }
  
  // If all else fails, try the generic method (deprecated but might work)
  try {
    return PrivateKey.fromString(cleanKey);
  } catch (genericError) {
    throw new Error(`Unable to parse private key with any method. Key format: ${cleanKey.length} characters. Error: ${genericError.message}`);
  }
}

async function deployContracts() {
  // Validate environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env file');
  }

  console.log("🚀 Starting Property Tokenization Smart Contract Deployment");
  console.log("📋 Environment Check:");
  console.log(`   Account ID: ${process.env.HEDERA_ACCOUNT_ID}`);
  console.log(`   Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);

  // Initialize Hedera client with proper error handling
  const network = process.env.HEDERA_NETWORK || 'testnet';
  let client;
  
  try {
    if (network === 'mainnet') {
      client = Client.forMainnet();
    } else {
      client = Client.forTestnet();
    }
    
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    
    // Use improved private key detection
    console.log("🔑 Parsing private key...");
    const operatorKey = await detectPrivateKeyType(process.env.HEDERA_PRIVATE_KEY);
    console.log("✅ Private key parsed successfully");
    
    client.setOperator(operatorId, operatorKey);
    
    // Set timeouts properly (removed setGrpcDeadline)
    client.setRequestTimeout(300000); // 5 minutes
    
    console.log(`🔗 Connecting to Hedera ${network}...`);
    
    // Validate connection before proceeding
    const isConnected = await validateConnection(client);
    if (!isConnected) {
      throw new Error("Failed to establish connection to Hedera network");
    }

  } catch (error) {
    console.error("❌ Failed to initialize Hedera client:", error.message);
    console.log("\n🔧 Troubleshooting Steps:");
    console.log("1. Check your internet connection");
    console.log("2. Verify your Hedera account credentials");
    console.log("3. Ensure your account has sufficient HBAR balance (minimum 10 HBAR)");
    console.log("4. Verify private key format:");
    console.log("   - ECDSA: 64-character hex string");
    console.log("   - ED25519: 64-character hex string");
    console.log("   - DER: Longer hex string with DER encoding");
    console.log("5. Try again in a few minutes (network might be temporarily unavailable)");
    throw error;
  }

  try {
    // Check if artifacts exist
    const artifactsPath = path.join(__dirname, 'artifacts');
    if (!fs.existsSync(artifactsPath)) {
      throw new Error('Artifacts not found. Please run "npm run compile" first.');
    }

    console.log("📦 Artifacts found, proceeding with deployment...");

    // Helper function to deploy a contract with improved retry logic
    async function deployContract(contractName, constructorParams = null, maxRetries = 3) {
      console.log(`\n📋 Deploying ${contractName}...`);
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
          
          if (!fs.existsSync(artifactPath)) {
            throw new Error(`Artifact not found: ${artifactPath}`);
          }
          
          const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          
          if (!artifact.bytecode || artifact.bytecode === '0x') {
            throw new Error(`No bytecode found in artifact for ${contractName}`);
          }
          
          console.log(`   Attempt ${attempt}/${maxRetries}`);
          console.log(`   📄 Contract size: ${artifact.bytecode.length / 2 - 1} bytes`);
          
          // Use ContractCreateFlow for better reliability
          let contractCreateFlow = new ContractCreateFlow()
            .setGas(2000000)
            .setBytecode(artifact.bytecode)
            .setMaxTransactionFee(Hbar.from(20));

          if (constructorParams) {
            contractCreateFlow = contractCreateFlow.setConstructorParameters(constructorParams);
          }

          console.log(`   🔨 Creating contract using ContractCreateFlow...`);
          const contractCreateResponse = await contractCreateFlow.execute(client);
          const contractCreateReceipt = await contractCreateResponse.getReceipt(client);
          
          if (contractCreateReceipt.status !== Status.Success) {
            throw new Error(`Contract creation failed with status: ${contractCreateReceipt.status}`);
          }

          const contractId = contractCreateReceipt.contractId;
          console.log(`   ✅ ${contractName} deployed: ${contractId}`);

          return {
            contractId: contractId.toString(),
            solidityAddress: contractId.toSolidityAddress(),
            transactionId: contractCreateResponse.transactionId.toString()
          };

        } catch (error) {
          console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt === maxRetries) {
            throw new Error(`Failed to deploy ${contractName} after ${maxRetries} attempts: ${error.message}`);
          }
          
          // Exponential backoff
          const waitTime = Math.pow(2, attempt) * 2000; // 4s, 8s, 16s
          console.log(`   ⏳ Waiting ${waitTime/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // Deploy contracts in sequence
    const contracts = {};

    // 1. Deploy PropertyRegistry
    console.log("\n🏠 Deploying PropertyRegistry...");
    contracts.PropertyRegistry = await deployContract('PropertyRegistry');

    // 2. Deploy PropertyMarketplace with PropertyRegistry address
    console.log("\n🏪 Deploying PropertyMarketplace...");
    const marketplaceParams = new ContractFunctionParameters()
      .addAddress(contracts.PropertyRegistry.solidityAddress);
    contracts.PropertyMarketplace = await deployContract('PropertyMarketplace', marketplaceParams);

    // 3. Deploy RevenueDistributor
    console.log("\n💰 Deploying RevenueDistributor...");
    contracts.RevenueDistributor = await deployContract('RevenueDistributor');

    // Save deployment info
    const deploymentInfo = {
      network: `hedera-${network}`,
      deployedAt: new Date().toISOString(),
      deployerAccount: process.env.HEDERA_ACCOUNT_ID,
      contracts: contracts,
      gasUsed: {
        PropertyRegistry: "~2M gas",
        PropertyMarketplace: "~2M gas", 
        RevenueDistributor: "~2M gas"
      }
    };

    const deploymentPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 All contracts deployed successfully!");
    console.log(`📄 Deployment info saved to: ${deploymentPath}`);
    console.log("\n📋 Contract Addresses:");
    Object.entries(contracts).forEach(([name, info]) => {
      console.log(`   ${name}:`);
      console.log(`     Contract ID: ${info.contractId}`);
      console.log(`     Solidity Address: ${info.solidityAddress}`);
    });
    
    console.log("\n🔄 Next Steps:");
    console.log("1. Update your frontend .env file with these contract addresses:");
    Object.entries(contracts).forEach(([name, info]) => {
      const envVar = `VITE_${name.toUpperCase().replace(/([A-Z])/g, '_$1')}_CONTRACT`.replace('__', '_');
      console.log(`   ${envVar}=${info.contractId}`);
    });
    console.log("\n2. Test the contracts using the provided test scripts");
    console.log("3. Verify the deployment on HashScan:");
    console.log(`   https://hashscan.io/${network}/contract/${contracts.PropertyRegistry.contractId}`);
    
    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.log("\n🔧 Troubleshooting Tips:");
    console.log("1. Ensure your account has sufficient HBAR balance (minimum 10 HBAR recommended)");
    console.log("2. Check if the Hedera testnet is experiencing issues");
    console.log("3. Verify your private key has the correct format");
    console.log("4. Make sure contracts compile successfully first");
    console.log("5. Try deploying during off-peak hours");
    console.log("6. Check HashScan for network status: https://hashscan.io/testnet");
    
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

// Run deployment
if (require.main === module) {
  deployContracts()
    .then((info) => {
      console.log("\n✅ Deployment completed successfully!");
      console.log("🎯 Ready to integrate with your frontend application!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deployment terminated with errors");
      console.error("Debug info:", error.stack || error.message);
      process.exit(1);
    });
}

module.exports = { deployContracts };
