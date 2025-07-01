// Fixed deployment script for Hedera network using correct SDK v2.x methods
const { 
  Client, 
  ContractCreateFlow, 
  ContractFunctionParameters,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
  Hbar
} = require("@hashgraph/sdk");
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function validateConnection(client, operatorId) {
  try {
    console.log("🔍 Testing Hedera network connection...");
    const balanceQuery = new AccountBalanceQuery().setAccountId(operatorId);
    const balance = await balanceQuery.execute(client);
    console.log(`✅ Connected! Account balance: ${balance.hbars.toString()}`);
    
    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
    if (hbarBalance < 10) {
      console.log("⚠️  Warning: Low HBAR balance. Recommended minimum: 10 HBAR");
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
  const cleanKey = privateKeyString.trim();
  const hexKey = cleanKey.startsWith('0x') ? cleanKey.slice(2) : cleanKey;
  
  if (/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    try {
      return PrivateKey.fromStringECDSA(hexKey);
    } catch (ecdsaError) {
      try {
        return PrivateKey.fromStringED25519(hexKey);
      } catch (ed25519Error) {
        throw new Error(`Unable to parse private key: ${ecdsaError.message}`);
      }
    }
  }
  
  if (/^[0-9a-fA-F]{96,}$/.test(hexKey)) {
    try {
      return PrivateKey.fromStringDer(hexKey);
    } catch (derError) {
      throw new Error(`Unable to parse DER-encoded private key: ${derError.message}`);
    }
  }
  
  throw new Error(`Invalid private key format. Expected 64-character hex string, got ${hexKey.length} characters`);
}

async function deployContracts() {
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env file');
  }

  console.log("🚀 Property Tokenization Smart Contract Deployment");
  console.log(`   Account ID: ${process.env.HEDERA_ACCOUNT_ID}`);
  console.log(`   Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);

  const network = process.env.HEDERA_NETWORK || 'testnet';
  let client;
  
  try {
    client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = await detectPrivateKeyType(process.env.HEDERA_PRIVATE_KEY);
    
    client.setOperator(operatorId, operatorKey);
    
    // Set default max transaction fee for all transactions
    client.setDefaultMaxTransactionFee(new Hbar(20));
    
    console.log(`🔗 Connecting to Hedera ${network}...`);
    
    const isConnected = await validateConnection(client, operatorId);
    if (!isConnected) {
      throw new Error("Failed to establish connection to Hedera network");
    }

  } catch (error) {
    console.error("❌ Failed to initialize Hedera client:", error.message);
    throw error;
  }

  try {
    // Check if artifacts exist
    const artifactsPath = path.join(__dirname, 'artifacts');
    if (!fs.existsSync(artifactsPath)) {
      throw new Error('Artifacts not found. Please run "npm run compile" first.');
    }

    console.log("📦 Artifacts found, proceeding with deployment...");

    async function deployContract(contractName, constructorParams = null, maxRetries = 3) {
      console.log(`\n📋 Deploying ${contractName}...`);
      
      // Adaptive gas limits based on contract size and complexity
      const gasStrategies = [
        { gas: 8000000, label: "Conservative (8M)" },
        { gas: 12000000, label: "Moderate (12M)" },
        { gas: 15000000, label: "High (15M)" }
      ];
      
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
          
          const contractSize = artifact.bytecode.length / 2 - 1;
          console.log(`   Attempt ${attempt}/${maxRetries}`);
          console.log(`   📄 Contract size: ${contractSize} bytes`);
          
          // Use escalating gas strategy for retries
          const gasStrategy = gasStrategies[Math.min(attempt - 1, gasStrategies.length - 1)];
          console.log(`   ⛽ Gas strategy: ${gasStrategy.label}`);
          
          // Create ContractCreateFlow with escalating gas limit
          let contractCreateFlow = new ContractCreateFlow()
            .setGas(gasStrategy.gas)
            .setBytecode(artifact.bytecode);

          if (constructorParams) {
            contractCreateFlow = contractCreateFlow.setConstructorParameters(constructorParams);
          }

          console.log(`   🔨 Creating contract...`);
          const contractCreateResponse = await contractCreateFlow.execute(client);
          const contractCreateReceipt = await contractCreateResponse.getReceipt(client);
          
          const contractId = contractCreateReceipt.contractId;
          console.log(`   ✅ ${contractName} deployed: ${contractId}`);
          console.log(`   💰 Gas used: ~${gasStrategy.gas.toLocaleString()}`);

          return {
            contractId: contractId.toString(),
            solidityAddress: contractId.toSolidityAddress(),
            transactionId: contractCreateResponse.transactionId.toString(),
            gasUsed: gasStrategy.gas
          };

        } catch (error) {
          console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
          
          if (error.message.includes('INSUFFICIENT_GAS')) {
            console.log(`   🔥 Gas insufficient, will try higher limit on next attempt`);
          }
          
          if (attempt === maxRetries) {
            throw new Error(`Failed to deploy ${contractName} after ${maxRetries} attempts: ${error.message}`);
          }
          
          const waitTime = Math.pow(2, attempt) * 2000;
          console.log(`   ⏳ Waiting ${waitTime/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    const contracts = {};

    console.log("\n🏠 Deploying PropertyRegistry...");
    contracts.PropertyRegistry = await deployContract('PropertyRegistry');

    console.log("\n🏪 Deploying PropertyMarketplace...");
    const marketplaceParams = new ContractFunctionParameters()
      .addAddress(contracts.PropertyRegistry.solidityAddress);
    contracts.PropertyMarketplace = await deployContract('PropertyMarketplace', marketplaceParams);

    console.log("\n💰 Deploying RevenueDistributor...");
    contracts.RevenueDistributor = await deployContract('RevenueDistributor');

    const deploymentInfo = {
      network: `hedera-${network}`,
      deployedAt: new Date().toISOString(),
      deployerAccount: process.env.HEDERA_ACCOUNT_ID,
      contracts: contracts
    };

    const deploymentPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    Object.entries(contracts).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.contractId}`);
    });
    
    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

if (require.main === module) {
  deployContracts()
    .then(() => {
      console.log("\n✅ Deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deployment failed:", error.message);
      process.exit(1);
    });
}

module.exports = { deployContracts };
