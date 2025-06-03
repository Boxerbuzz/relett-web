
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

require('dotenv').config();

async function deployContracts() {
  // Initialize Hedera client
  const client = Client.forTestnet();
  
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  
  client.setOperator(operatorId, operatorKey);

  console.log("Deploying Property Tokenization Smart Contracts to Hedera...");

  try {
    // 1. Deploy PropertyRegistry Contract
    console.log("1. Deploying PropertyRegistry...");
    const registryBytecode = require('./artifacts/PropertyRegistry.sol/PropertyRegistry.json').bytecode;
    
    const registryFileCreate = new FileCreateTransaction()
      .setContents(registryBytecode)
      .setKeys([operatorKey])
      .setMaxTransactionFee(2);

    const registryFileSubmit = await registryFileCreate.execute(client);
    const registryFileReceipt = await registryFileSubmit.getReceipt(client);
    const registryFileId = registryFileReceipt.fileId;

    const registryContractCreate = new ContractCreateTransaction()
      .setGas(1000000)
      .setBytecodeFileId(registryFileId)
      .setConstructorParameters(new ContractFunctionParameters());

    const registryContractSubmit = await registryContractCreate.execute(client);
    const registryContractReceipt = await registryContractSubmit.getReceipt(client);
    const registryContractId = registryContractReceipt.contractId;

    console.log(`PropertyRegistry deployed: ${registryContractId}`);

    // 2. Deploy PropertyMarketplace Contract
    console.log("2. Deploying PropertyMarketplace...");
    const marketplaceBytecode = require('./artifacts/PropertyMarketplace.sol/PropertyMarketplace.json').bytecode;
    
    const marketplaceFileCreate = new FileCreateTransaction()
      .setContents(marketplaceBytecode)
      .setKeys([operatorKey])
      .setMaxTransactionFee(2);

    const marketplaceFileSubmit = await marketplaceFileCreate.execute(client);
    const marketplaceFileReceipt = await marketplaceFileSubmit.getReceipt(client);
    const marketplaceFileId = marketplaceFileReceipt.fileId;

    const marketplaceContractCreate = new ContractCreateTransaction()
      .setGas(1000000)
      .setBytecodeFileId(marketplaceFileId)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addAddress(registryContractId.toSolidityAddress())
      );

    const marketplaceContractSubmit = await marketplaceContractCreate.execute(client);
    const marketplaceContractReceipt = await marketplaceContractSubmit.getReceipt(client);
    const marketplaceContractId = marketplaceContractReceipt.contractId;

    console.log(`PropertyMarketplace deployed: ${marketplaceContractId}`);

    // 3. Deploy RevenueDistributor Contract
    console.log("3. Deploying RevenueDistributor...");
    const distributorBytecode = require('./artifacts/RevenueDistributor.sol/RevenueDistributor.json').bytecode;
    
    const distributorFileCreate = new FileCreateTransaction()
      .setContents(distributorBytecode)
      .setKeys([operatorKey])
      .setMaxTransactionFee(2);

    const distributorFileSubmit = await distributorFileCreate.execute(client);
    const distributorFileReceipt = await distributorFileSubmit.getReceipt(client);
    const distributorFileId = distributorFileReceipt.fileId;

    const distributorContractCreate = new ContractCreateTransaction()
      .setGas(1000000)
      .setBytecodeFileId(distributorFileId)
      .setConstructorParameters(new ContractFunctionParameters());

    const distributorContractSubmit = await distributorContractCreate.execute(client);
    const distributorContractReceipt = await distributorContractSubmit.getReceipt(client);
    const distributorContractId = distributorContractReceipt.contractId;

    console.log(`RevenueDistributor deployed: ${distributorContractId}`);

    // Save contract addresses
    const deploymentInfo = {
      network: "hedera-testnet",
      deployedAt: new Date().toISOString(),
      contracts: {
        PropertyRegistry: {
          contractId: registryContractId.toString(),
          solidityAddress: registryContractId.toSolidityAddress()
        },
        PropertyMarketplace: {
          contractId: marketplaceContractId.toString(),
          solidityAddress: marketplaceContractId.toSolidityAddress()
        },
        RevenueDistributor: {
          contractId: distributorContractId.toString(),
          solidityAddress: distributorContractId.toSolidityAddress()
        }
      }
    };

    require('fs').writeFileSync(
      './deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✅ All contracts deployed successfully!");
    console.log("Deployment info saved to deployment-info.json");
    
    return deploymentInfo;

  } catch (error) {
    console.error("Deployment failed:", error);
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
