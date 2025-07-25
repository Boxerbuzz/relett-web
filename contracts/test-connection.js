
// Fixed script to test Hedera network connectivity with correct SDK v2.x methods
const { Client, AccountId, PrivateKey, AccountBalanceQuery } = require("@hashgraph/sdk");
require('dotenv').config();

async function detectPrivateKeyType(privateKeyString) {
  const cleanKey = privateKeyString.trim();
  
  // Remove 0x prefix if present
  const hexKey = cleanKey.startsWith('0x') ? cleanKey.slice(2) : cleanKey;
  
  if (/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    try {
      return { key: PrivateKey.fromStringECDSA(hexKey), type: 'ECDSA' };
    } catch (ecdsaError) {
      try {
        return { key: PrivateKey.fromStringED25519(hexKey), type: 'ED25519' };
      } catch (ed25519Error) {
        throw new Error(`Unable to parse private key: ${ecdsaError.message}`);
      }
    }
  }
  
  if (/^[0-9a-fA-F]{96,}$/.test(hexKey)) {
    try {
      return { key: PrivateKey.fromStringDer(hexKey), type: 'DER' };
    } catch (derError) {
      throw new Error(`Unable to parse DER-encoded private key: ${derError.message}`);
    }
  }
  
  throw new Error(`Invalid private key format. Expected 64-character hex string, got ${hexKey.length} characters`);
}

async function testConnection() {
  console.log("🔍 Hedera Network Connection Test");
  console.log("==================================");

  // Check environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.error("❌ Missing environment variables:");
    console.error("   HEDERA_ACCOUNT_ID:", process.env.HEDERA_ACCOUNT_ID ? "✅ Set" : "❌ Missing");
    console.error("   HEDERA_PRIVATE_KEY:", process.env.HEDERA_PRIVATE_KEY ? "✅ Set (hidden)" : "❌ Missing");
    console.log("\n📝 Please check your .env file in the contracts directory");
    return false;
  }

  console.log("✅ Environment variables found");
  console.log(`   Account ID: ${process.env.HEDERA_ACCOUNT_ID}`);
  console.log(`   Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);

  let client;
  try {
    console.log("\n🔑 Testing private key format...");
    const keyInfo = await detectPrivateKeyType(process.env.HEDERA_PRIVATE_KEY);
    console.log(`✅ Private key format: ${keyInfo.type}`);
    
    // Initialize client with correct SDK v2.x methods
    const network = process.env.HEDERA_NETWORK || 'testnet';
    client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = keyInfo.key;
    
    client.setOperator(operatorId, operatorKey);
    
    console.log(`\n🔗 Connecting to Hedera ${network}...`);
    
    // Test connection using AccountBalanceQuery (correct SDK v2.x method)
    const startTime = Date.now();
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(operatorId);
    
    const balance = await balanceQuery.execute(client);
    const responseTime = Date.now() - startTime;
    
    console.log("✅ Connection successful!");
    console.log(`   Response time: ${responseTime}ms`);
    console.log(`   Account Balance: ${balance.hbars.toString()}`);
    
    // Convert to numeric value for analysis
    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
    
    console.log("\n💰 Balance Analysis:");
    if (hbarBalance >= 50) {
      console.log("🟢 Excellent balance - Ready for contract deployment");
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
        const testQuery = new AccountBalanceQuery().setAccountId(operatorId);
        await testQuery.execute(client);
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
    console.log("\n🔧 Troubleshooting:");
    
    if (error.message.includes('INVALID_ACCOUNT_ID')) {
      console.log("• Account ID format issue - should be: 0.0.12345");
    }
    
    if (error.message.includes('private key') || error.message.includes('key')) {
      console.log("• Private Key issues - should be 64-character hex (no 0x prefix)");
    }
    
    if (error.message.includes('network') || error.message.includes('connection')) {
      console.log("• Network connectivity issues - check internet connection");
    }
    
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
      console.log("   Next: npm run compile && npm run deploy");
    } else {
      console.log("\n❌ Please fix the issues above before deploying");
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  });
