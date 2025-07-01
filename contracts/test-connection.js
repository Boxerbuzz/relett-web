
// Enhanced script to test Hedera network connectivity and account setup
const { Client, AccountId, PrivateKey } = require("@hashgraph/sdk");
require('dotenv').config();

async function detectPrivateKeyType(privateKeyString) {
  const cleanKey = privateKeyString.trim();
  
  if (/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    try {
      return { key: PrivateKey.fromStringECDSA(cleanKey), type: 'ECDSA' };
    } catch (ecdsaError) {
      try {
        return { key: PrivateKey.fromStringED25519(cleanKey), type: 'ED25519' };
      } catch (ed25519Error) {
        throw new Error(`Unable to parse private key: ${ecdsaError.message}`);
      }
    }
  }
  
  if (/^[0-9a-fA-F]{96,}$/.test(cleanKey)) {
    try {
      return { key: PrivateKey.fromStringDer(cleanKey), type: 'DER' };
    } catch (derError) {
      throw new Error(`Unable to parse DER-encoded private key: ${derError.message}`);
    }
  }
  
  try {
    return { key: PrivateKey.fromString(cleanKey), type: 'Generic' };
  } catch (genericError) {
    throw new Error(`Unable to parse private key with any method: ${genericError.message}`);
  }
}

async function testConnection() {
  console.log("🔍 Enhanced Hedera Network Connection Test");
  console.log("==========================================");

  // Check environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.error("❌ Missing environment variables:");
    console.error("   HEDERA_ACCOUNT_ID:", process.env.HEDERA_ACCOUNT_ID ? "✅ Set" : "❌ Missing");
    console.error("   HEDERA_PRIVATE_KEY:", process.env.HEDERA_PRIVATE_KEY ? "✅ Set (hidden)" : "❌ Missing");
    console.log("\n📝 Please check your .env file in the contracts directory");
    console.log("💡 Example .env format:");
    console.log("   HEDERA_ACCOUNT_ID=0.0.12345");
    console.log("   HEDERA_PRIVATE_KEY=your_64_character_hex_private_key");
    console.log("   HEDERA_NETWORK=testnet");
    return false;
  }

  console.log("✅ Environment variables found");
  console.log(`   Account ID: ${process.env.HEDERA_ACCOUNT_ID}`);
  console.log(`   Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
  console.log(`   Private Key: ${process.env.HEDERA_PRIVATE_KEY.substring(0, 8)}... (${process.env.HEDERA_PRIVATE_KEY.length} chars)`);

  let client;
  try {
    console.log("\n🔑 Testing private key format...");
    const keyInfo = await detectPrivateKeyType(process.env.HEDERA_PRIVATE_KEY);
    console.log(`✅ Private key format: ${keyInfo.type}`);
    
    // Initialize client
    const network = process.env.HEDERA_NETWORK || 'testnet';
    client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = keyInfo.key;
    
    client.setOperator(operatorId, operatorKey);
    client.setRequestTimeout(30000); // 30 seconds timeout
    
    console.log(`\n🔗 Connecting to Hedera ${network}...`);
    
    // Test connection by getting account balance
    const startTime = Date.now();
    const balance = await client.getAccountBalance(operatorId);
    const responseTime = Date.now() - startTime;
    
    console.log("✅ Connection successful!");
    console.log(`   Response time: ${responseTime}ms`);
    console.log(`   Account Balance: ${balance.hbars.toString()}`);
    
    // Convert to numeric value for analysis
    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
    
    // Balance analysis
    console.log("\n💰 Balance Analysis:");
    if (hbarBalance >= 50) {
      console.log("🟢 Excellent balance - Ready for extensive contract deployment");
    } else if (hbarBalance >= 10) {
      console.log("🟡 Good balance - Sufficient for contract deployment");
    } else if (hbarBalance >= 1) {
      console.log("🟠 Low balance - May be insufficient for large deployments");
    } else {
      console.log("🔴 Very low balance - Likely insufficient for deployment");
      console.log("   💡 Fund your account at: https://portal.hedera.com/");
    }
    
    // Network performance test
    console.log("\n⚡ Network Performance Test:");
    const perfTests = [];
    for (let i = 0; i < 3; i++) {
      try {
        const testStart = Date.now();
        await client.getAccountBalance(operatorId);
        const testTime = Date.now() - testStart;
        perfTests.push(testTime);
        console.log(`   Test ${i + 1}: ${testTime}ms`);
      } catch (error) {
        console.log(`   Test ${i + 1}: Failed (${error.message})`);
      }
    }
    
    if (perfTests.length > 0) {
      const avgTime = perfTests.reduce((a, b) => a + b, 0) / perfTests.length;
      console.log(`   Average response time: ${avgTime.toFixed(0)}ms`);
      
      if (avgTime < 1000) {
        console.log("🟢 Excellent network performance");
      } else if (avgTime < 3000) {
        console.log("🟡 Good network performance");
      } else {
        console.log("🟠 Slow network performance - deployment may take longer");
      }
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n🔧 Detailed Troubleshooting:");
    
    if (error.message.includes('INVALID_ACCOUNT_ID')) {
      console.log("• Account ID format issue:");
      console.log("  - Should be in format: 0.0.12345");
      console.log("  - Verify your account exists on the network");
    }
    
    if (error.message.includes('private key') || error.message.includes('key')) {
      console.log("• Private Key issues:");
      console.log("  - Should be 64-character hex string for ECDSA/ED25519");
      console.log("  - Should not include '0x' prefix");
      console.log("  - Check for extra spaces or characters");
    }
    
    if (error.message.includes('network') || error.message.includes('connection')) {
      console.log("• Network connectivity issues:");
      console.log("  - Check your internet connection");
      console.log("  - Try switching networks (wifi/cellular)");
      console.log("  - Check if Hedera network is operational");
    }
    
    console.log("\n🔗 Helpful Links:");
    console.log("• Create testnet account: https://portal.hedera.com/");
    console.log("• Network status: https://status.hedera.com/");
    console.log("• Documentation: https://docs.hedera.com/");
    
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
      console.log("   Next steps:");
      console.log("   1. Run: npm run compile");
      console.log("   2. Run: npm run deploy");
      console.log("\n✨ All systems go! 🚀");
    } else {
      console.log("\n❌ Please fix the issues above before deploying");
      console.log("💡 Need help? Check the troubleshooting guide above");
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("❌ Test failed with unexpected error:", error);
    process.exit(1);
  });
