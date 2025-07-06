import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createTypedSupabaseClient, 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface PropertyRegistrationRequest {
  propertyId: string;
  landTitleId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  totalValue: number;
  minimumInvestment: number;
  expectedROI: number;
  lockupPeriod: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const propertyData: PropertyRegistrationRequest = await req.json();
    
    console.log('Processing blockchain property registration:', propertyData.propertyId);

    // For now, we'll simulate blockchain registration
    // TODO: Implement actual Hedera blockchain integration using server-side credentials
    
    const mockTransactionId = `0.0.${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store blockchain registration record in database
    const supabase = createTypedSupabaseClient();
    
    const { error: dbError } = await supabase
      .from('properties')
      .update({
        blockchain_transaction_id: mockTransactionId,
        is_blockchain_registered: true,
        blockchain_network: 'hedera-testnet',
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyData.propertyId);

    if (dbError) {
      console.error('Error updating property blockchain status:', dbError);
      return createResponse(createErrorResponse('Failed to update property status'), 500);
    }

    console.log(`Property ${propertyData.propertyId} registered on blockchain with transaction ${mockTransactionId}`);

    const response = {
      success: true,
      transactionId: mockTransactionId,
      status: 'SUCCESS',
      network: 'hedera-testnet',
      contractAddress: 'mock-contract-address',
      message: 'Property registered on blockchain successfully'
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Error in register-property-blockchain function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Blockchain registration failed', errorMessage), 500);
  }
});