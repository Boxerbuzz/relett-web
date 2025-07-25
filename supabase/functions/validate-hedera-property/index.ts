
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  TokenInfoQuery,
  TokenId,
  FileContentsQuery,
  FileId,
} from "https://esm.sh/@hashgraph/sdk@2.65.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  tokenId: string;
  propertyId: string;
  landTitleHash?: string;
}

interface ValidationResponse {
  valid: boolean;
  tokenExists: boolean;
  tokenDetails?: {
    tokenId: string;
    name: string;
    symbol: string;
    totalSupply: string;
    treasury: string;
    decimals: number;
  };
  propertyHash?: string;
  lastUpdated?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokenId, propertyId, landTitleHash }: ValidationRequest = await req.json();

    if (!tokenId) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          tokenExists: false, 
          error: 'Token ID is required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      console.error('Hedera credentials not configured');
      
      const errorResponse: ValidationResponse = {
        valid: false,
        tokenExists: false,
        error: 'Hedera property validation service not configured'
      };

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Initialize Hedera client
      const client = Client.forTestnet();

      // Validate token exists and get details
      const tokenQuery = new TokenInfoQuery()
        .setTokenId(TokenId.fromString(tokenId));

      const tokenInfo = await tokenQuery.execute(client);

      const response: ValidationResponse = {
        valid: true,
        tokenExists: true,
        tokenDetails: {
          tokenId: tokenInfo.tokenId.toString(),
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          totalSupply: tokenInfo.totalSupply.toString(),
          treasury: tokenInfo.treasuryAccountId?.toString() || '',
          decimals: tokenInfo.decimals
        },
        lastUpdated: new Date().toISOString(),
      };

      // If land title hash is provided, try to validate it
      if (landTitleHash) {
        try {
          // Attempt to query file contents if hash represents a file ID
          const fileQuery = new FileContentsQuery()
            .setFileId(FileId.fromString(landTitleHash));
          
          const fileContents = await fileQuery.execute(client);
          response.propertyHash = landTitleHash;
          response.valid = true;
        } catch (fileError) {
          console.log('File validation failed, but token is valid:', fileError);
          // Token is still valid even if file validation fails
          response.propertyHash = landTitleHash;
        }
      }

      client.close();

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (hederaError) {
      console.error('Hedera validation error:', hederaError);

      let errorMessage = 'Unknown Hedera network error';
      if (hederaError instanceof Error) {
        errorMessage = hederaError.message;
      }

      const errorResponse: ValidationResponse = {
        valid: false,
        tokenExists: false,
        error: `Hedera validation failed: ${errorMessage}`,
      };

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Property validation error:', error);
    
    const errorResponse: ValidationResponse = {
      valid: false,
      tokenExists: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
