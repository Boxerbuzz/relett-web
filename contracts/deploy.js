
// Deployment script for Hedera network
const { 
  Client, 
  ContractCreateFlow, 
  ContractFunctionParameters,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction
} = require("@hashgraph/sdk");
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function deployContracts() {
  // Validate environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env file');
  }

  // Initialize Hedera client
  const network = process.env.HEDERA_NETWORK || 'testnet';
  const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
  
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  
  client.setOperator(operatorId, operatorKey);

  console.log(`Deploying Property Tokenization Smart Contracts to Hedera ${network}...`);
  console.log(`Operator Account: ${operatorId}`);

  try {
    // Check if artifacts exist
    const artifactsPath = path.join(__dirname, 'artifacts');
    if (!fs.existsSync(artifactsPath)) {
      throw new Error('Artifacts not found. Please run "npm run compile" first.');
    }

    // 1. Deploy PropertyRegistry Contract
    console.log("1. Deploying PropertyRegistry...");
    const registryArtifact = require('./artifacts/contracts/PropertyRegistry.sol/PropertyRegistry.json');
    
    const registryFileCreate = new FileCreateTransaction()
      .setContents(registryArtifact.bytecode)
      .setKeys([operatorKey])
      .setMaxTransactionFee(20);

    const registryFileSubmit = await registryFileCreate.execute(client);
    const registryFileReceipt = await registryFileSubmit.getReceipt(client);
    const registryFileId = registryFileReceipt.fileId;

    const registryContractCreate = new ContractCreateTransaction()
      .setGas(2000000)
      .setBytecodeFileId(registryFileId)
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxTransactionFee(50);

    const registryContractSubmit = await registryContractCreate.execute(client);
    const registryContractReceipt = await registryContractSubmit.getReceipt(client);
    const registryContractId = registryContractReceipt.contractId;

    console.log(`✅ PropertyRegistry deployed: ${registryContractId}`);

    // 2. Deploy PropertyMarketplace Contract
    console.log("2. Deploying PropertyMarketplace...");
    const marketplaceArtifact = require('./artifacts/contracts/PropertyMarketplace.sol/PropertyMarketplace.json');
    
    const marketplaceFileCreate = new FileCreateTransaction()
      .setContents(marketplaceArtifact.bytecode)
      .setKeys([operatorKey])
      .setMaxTransactionFee(20);

    const marketplaceFileSubmit = await marketplaceFileCreate.execute(client);
    const marketplaceFileReceipt = await marketplaceFileSubmit.getReceipt(client);
    const marketplaceFileId = marketplaceFileReceipt.fileId;

    const marketplaceContractCreate = new ContractCreateTransaction()
      .setGas(2000000)
      .setBytecodeFileId(marketplaceFileId)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addAddress(registryContractId.toSolidityAddress())
      )
      .setMaxTransactionFee(50);

    const marketplaceContractSubmit = await marketplaceContractCreate.execute(client);
    const marketplaceContractReceipt = await marketplaceContractSubmit.getReceipt(client);
    const marketplaceContractId = marketplaceContractReceipt.contractId;

    console.log(`✅ PropertyMarketplace deployed: ${marketplaceContractId}`);

    // 3. Deploy RevenueDistributor Contract
    console.log("3. Deploying RevenueDistributor...");
    const distributorArtifact = require('./artifacts/contracts/RevenueDistributor.sol/RevenueDistributor.json');
    
    const distributorFileCreate = new FileCreateTransaction()
      .setContents(distributorArtifact.bytecode)
      .setKeys([operatorKey])
      .setMaxTransactionFee(20);

    const distributorFileSubmit = await distributorFileCreate.execute(client);
    const distributorFileReceipt = await distributorFileSubmit.getReceipt(client);
    const distributorFileId = distributorFileReceipt.fileId;

    const distributorContractCreate = new ContractCreateTransaction()
      .setGas(2000000)
      .setBytecodeFileId(distributorFileId)
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxTransactionFee(50);

    const distributorContractSubmit = await distributorContractCreate.execute(client);
    const distributorContractReceipt = await distributorContractSubmit.getReceipt(client);
    const distributorContractId = distributorContractReceipt.contractId;

    console.log(`✅ RevenueDistributor deployed: ${distributorContractId}`);

    // Save contract addresses
    const deploymentInfo = {
      network: `hedera-${network}`,
      deployedAt: new Date().toISOString(),
      deployerAccount: operatorId.toString(),
      contracts: {
        PropertyRegistry: {
          contractId: registryContractId.toString(),
          solidityAddress: registryContractId.toSolidityAddress(),
          fileId: registryFileId.toString()
        },
        PropertyMarketplace: {
          contractId: marketplaceContractId.toString(),
          solidityAddress: marketplaceContractId.toSolidityAddress(),
          fileId: marketplaceFileId.toString()
        },
        RevenueDistributor: {
          contractId: distributorContractId.toString(),
          solidityAddress: distributorContractId.toSolidityAddress(),
          fileId: distributorFileId.toString()
        }
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'deployment-info.json'), 
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("📄 Deployment info saved to deployment-info.json");
    console.log("\n📋 Contract Addresses:");
    console.log(`PropertyRegistry: ${registryContractId}`);
    console.log(`PropertyMarketplace: ${marketplaceContractId}`);
    console.log(`RevenueDistributor: ${distributorContractId}`);
    
    return deploymentInfo;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  } finally {
    client.close();
  }
}

// Run deployment
if (require.main === module) {
  deployContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployContracts };
