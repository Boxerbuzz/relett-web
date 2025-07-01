
#!/bin/bash

echo "🚀 Setting up Property Tokenization Smart Contracts"

# Navigate to contracts directory
cd contracts

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Hedera credentials before proceeding"
    echo "💡 Get credentials from: https://portal.hedera.com/"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile contracts
echo "⚙️  Compiling contracts..."
npm run compile

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update contracts/.env with your Hedera credentials"
echo "2. Run: cd contracts && npm run deploy"
echo "3. Update frontend .env with deployed contract addresses"
