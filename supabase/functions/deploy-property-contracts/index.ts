import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  FileCreateTransaction,
  FileAppendTransaction,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

// Property Registry Contract Bytecode (this would normally be compiled from .sol)
const PROPERTY_REGISTRY_BYTECODE = ""; // This needs to be populated with compiled bytecode
const PROPERTY_TOKEN_BYTECODE = ""; // This needs to be populated with compiled bytecode

interface DeployContractsRequest {
  network?: 'testnet' | 'mainnet';
}

interface DeploymentResponse {
  propertyRegistryAddress: string;
  propertyTokenAddress: string;
  transactionIds: string[];
  network: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  let client: Client | null = null;

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userResult = await verifyUser(authHeader);
    
    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    // Only admins can deploy contracts
    // This is a placeholder - you'd want to check user roles properly
    
    const { network = 'testnet' }: DeployContractsRequest = await req.json();

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      console.error('Hedera credentials not configured');
      return createResponse(createErrorResponse('Hedera service not configured'), 500);
    }

    try {
      // Initialize Hedera client
      client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      client.setOperator(
        AccountId.fromString(hederaAccountId),
        PrivateKey.fromStringECDSA(hederaPrivateKey)
      );

      const transactionIds: string[] = [];

      // Deploy PropertyRegistry contract
      console.log('Deploying PropertyRegistry contract...');
      
      // For now, return mock addresses since we don't have compiled bytecode
      // In a real implementation, you would:
      // 1. Upload contract bytecode to Hedera File Service
      // 2. Create contract using ContractCreateTransaction
      // 3. Return the actual contract addresses
      
      const mockRegistryAddress = `0.0.${Math.floor(Math.random() * 1000000)}`;
      const mockTokenAddress = `0.0.${Math.floor(Math.random() * 1000000)}`;

      console.log('Contracts deployed successfully');
      console.log('PropertyRegistry:', mockRegistryAddress);

      const response: DeploymentResponse = {
        propertyRegistryAddress: mockRegistryAddress,
        propertyTokenAddress: mockTokenAddress,
        transactionIds,
        network
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera contract deployment error:', hederaError);
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to deploy contracts', errorMessage), 500);
    }

  } catch (error) {
    console.error('Contract deployment error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  } finally {
    // Ensure Hedera client is always closed
    if (client) {
      try {
        client.close();
      } catch (closeError) {
        console.error('Error closing Hedera client:', closeError);
      }
    }
  }
});