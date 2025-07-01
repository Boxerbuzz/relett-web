
// Simple script to test Hedera network connectivity
const { Client, AccountId, PrivateKey } = require("@hashgraph/sdk");
require('dotenv').config();

async function testConnection() {
  console.log("🔍 Testing Hedera Network Connection");
  console.log("=====================================");

  // Check environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.error("❌ Missing environment variables:");
    console.error("   HEDERA_ACCOUNT_ID:", process.env.HEDERA_ACCOUNT_ID ? "✅ Set" : "❌ Missing");
    console.error("   HEDERA_PRIVATE_KEY:", process.env.HEDERA_PRIVATE_KEY ? "✅ Set" : "❌ Missing");
    console.log("\n📝 Please check your .env file in the contracts directory");
    return false;
  }

  console.log("✅ Environment variables found");
  console.log(`   Account ID: ${process.env.HEDERA_ACCOUNT_ID}`);
  console.log(`   Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);

  let client;
  try {
    // Initialize client
    const network = process.env.HEDERA_NETWORK || 'testnet';
    client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    
    client.setOperator(operatorId, operatorKey);
    client.setRequestTimeout(30000); // 30 seconds timeout
    
    console.log("🔗 Connecting to Hedera network...");
    
    // Test connection by getting account balance
    const balance = await client.getAccountBalance(operatorId);
    
    console.log("✅ Connection successful!");
    console.log(`   Account Balance: ${balance.hbars.toString()}`);
    
    // Check if balance is sufficient for deployment
    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000; // Convert to HBAR
    if (hbarBalance < 10) {
      console.log("⚠️  Warning: Low HBAR balance. Recommended minimum: 10 HBAR for contract deployment");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n🔧 Possible Solutions:");
    console.log("1. Check your internet connection");
    console.log("2. Verify account ID format (should be like 0.0.12345)");
    console.log("3. Verify private key format (should be 64-character hex string)");
    console.log("4. Ensure your account exists and is funded");
    console.log("5. Try again in a few minutes");
    
    return false;
    
  } finally {
    if (client) {
      client.close();
    }
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log("\n🎉 Ready for contract deployment!");
      console.log("   Run: npm run deploy");
    } else {
      console.log("\n❌ Please fix the issues above before deploying");
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
  });
