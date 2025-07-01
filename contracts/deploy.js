
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
  Status
} = require("@hashgraph/sdk");
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function validateConnection(client) {
  try {
    console.log("🔍 Testing Hedera network connection...");
    const balance = await client.getAccountBalance(client.operatorAccountId);
    console.log(`✅ Connected! Account balance: ${balance.hbars.toString()}`);
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    return false;
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

  // Initialize Hedera client with retry logic
  const network = process.env.HEDERA_NETWORK || 'testnet';
  let client;
  
  try {
    if (network === 'mainnet') {
      client = Client.forMainnet();
    } else {
      client = Client.forTestnet();
    }
    
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    
    client.setOperator(operatorId, operatorKey);
    
    // Set longer timeouts for deployment
    client.setRequestTimeout(300000); // 5 minutes
    client.setGrpcDeadline(300000);
    
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
    console.log("3. Ensure your account has sufficient HBAR balance");
    console.log("4. Try again in a few minutes (network might be temporarily unavailable)");
    throw error;
  }

  try {
    // Check if artifacts exist
    const artifactsPath = path.join(__dirname, 'artifacts');
    if (!fs.existsSync(artifactsPath)) {
      throw new Error('Artifacts not found. Please run "npm run compile" first.');
    }

    console.log("📦 Artifacts found, proceeding with deployment...");

    // Helper function to deploy a contract with retry logic
    async function deployContract(contractName, constructorParams = null, maxRetries = 3) {
      console.log(`\n📋 Deploying ${contractName}...`);
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const artifact = require(`./artifacts/contracts/${contractName}.sol/${contractName}.json`);
          
          console.log(`   Attempt ${attempt}/${maxRetries}`);
          console.log(`   📄 Creating file for ${contractName}...`);
          
          // Create file transaction
          const fileCreateTx = new FileCreateTransaction()
            .setContents(artifact.bytecode)
            .setKeys([client.operatorPublicKey])
            .setMaxTransactionFee(20);

          const fileCreateResponse = await fileCreateTx.execute(client);
          const fileCreateReceipt = await fileCreateResponse.getReceipt(client);
          
          if (fileCreateReceipt.status !== Status.Success) {
            throw new Error(`File creation failed with status: ${fileCreateReceipt.status}`);
          }
          
          const fileId = fileCreateReceipt.fileId;
          console.log(`   ✅ File created: ${fileId}`);

          // Create contract transaction
          console.log(`   🔨 Creating contract...`);
          let contractCreateTx = new ContractCreateTransaction()
            .setGas(2000000)
            .setBytecodeFileId(fileId)
            .setMaxTransactionFee(50);

          if (constructorParams) {
            contractCreateTx = contractCreateTx.setConstructorParameters(constructorParams);
          }

          const contractCreateResponse = await contractCreateTx.execute(client);
          const contractCreateReceipt = await contractCreateResponse.getReceipt(client);
          
          if (contractCreateReceipt.status !== Status.Success) {
            throw new Error(`Contract creation failed with status: ${contractCreateReceipt.status}`);
          }

          const contractId = contractCreateReceipt.contractId;
          console.log(`   ✅ ${contractName} deployed: ${contractId}`);

          return {
            contractId: contractId.toString(),
            solidityAddress: contractId.toSolidityAddress(),
            fileId: fileId.toString()
          };

        } catch (error) {
          console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt === maxRetries) {
            throw new Error(`Failed to deploy ${contractName} after ${maxRetries} attempts: ${error.message}`);
          }
          
          // Wait before retry
          console.log(`   ⏳ Waiting 5 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // Deploy contracts in sequence
    const contracts = {};

    // 1. Deploy PropertyRegistry
    contracts.PropertyRegistry = await deployContract('PropertyRegistry');

    // 2. Deploy PropertyMarketplace with PropertyRegistry address
    const marketplaceParams = new ContractFunctionParameters()
      .addAddress(contracts.PropertyRegistry.solidityAddress);
    contracts.PropertyMarketplace = await deployContract('PropertyMarketplace', marketplaceParams);

    // 3. Deploy RevenueDistributor
    contracts.RevenueDistributor = await deployContract('RevenueDistributor');

    // Save deployment info
    const deploymentInfo = {
      network: `hedera-${network}`,
      deployedAt: new Date().toISOString(),
      deployerAccount: process.env.HEDERA_ACCOUNT_ID,
      contracts: contracts
    };

    const deploymentPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 All contracts deployed successfully!");
    console.log(`📄 Deployment info saved to: ${deploymentPath}`);
    console.log("\n📋 Contract Addresses:");
    Object.entries(contracts).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.contractId}`);
    });
    
    console.log("\n🔄 Next Steps:");
    console.log("1. Update your frontend .env file with these contract addresses:");
    Object.entries(contracts).forEach(([name, info]) => {
      const envVar = `VITE_${name.toUpperCase().replace(/([A-Z])/g, '_$1')}_CONTRACT`;
      console.log(`   ${envVar}=${info.contractId}`);
    });
    
    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.log("\n🔧 Troubleshooting Tips:");
    console.log("1. Ensure your account has sufficient HBAR balance (minimum 10 HBAR recommended)");
    console.log("2. Check if the Hedera testnet is experiencing issues");
    console.log("3. Verify your private key has the correct format");
    console.log("4. Try deploying during off-peak hours");
    
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
    .then(() => {
      console.log("\n✅ Deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deployment terminated with errors");
      process.exit(1);
    });
}

module.exports = { deployContracts };
