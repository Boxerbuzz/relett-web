import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createResponse,
  createCorsResponse,
  verifyUser,
  createTypedSupabaseClient
} from "../shared/supabase-client.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateListingRequest {
  tokenizedPropertyId: string
  tokenAmount: number
  pricePerToken: number
  listingType?: string
  expiresAt?: string
}

serve(async (req) => {
  console.log('Create Marketplace Listing function called')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createResponse(createErrorResponse('Authorization header missing'), 401)
    }

    const userResult = await verifyUser(authHeader)
    if ('error' in userResult) {
      return createResponse(userResult, 401)
    }

    const user = userResult.data
    console.log('Authenticated user:', user.id)

    // Parse request body
    const body: CreateListingRequest = await req.json()
    const { 
      tokenizedPropertyId, 
      tokenAmount, 
      pricePerToken, 
      listingType = 'fixed_price',
      expiresAt
    } = body

    // Validate required fields
    if (!tokenizedPropertyId || !tokenAmount || !pricePerToken) {
      return createResponse(createErrorResponse('Missing required fields: tokenizedPropertyId, tokenAmount, pricePerToken'), 400)
    }

    if (tokenAmount <= 0 || pricePerToken <= 0) {
      return createResponse(createErrorResponse('Token amount and price must be positive'), 400)
    }

    console.log('Creating listing:', { tokenizedPropertyId, tokenAmount, pricePerToken })

    const supabase = createTypedSupabaseClient()

    // Check if user has enough tokens to sell
    const { data: tokenHoldings, error: holdingsError } = await supabase
      .from('token_holdings')
      .select('tokens_owned')
      .eq('holder_id', user.id)
      .eq('tokenized_property_id', tokenizedPropertyId)
      .maybeSingle()

    if (holdingsError) {
      console.error('Error checking token holdings:', holdingsError)
      return createResponse(createErrorResponse('Failed to verify token holdings'), 500)
    }

    if (!tokenHoldings || parseFloat(tokenHoldings.tokens_owned) < tokenAmount) {
      return createResponse(createErrorResponse('Insufficient token balance'), 400)
    }

    // Create marketplace listing
    const totalPrice = tokenAmount * pricePerToken
    const expirationDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default

    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .insert({
        seller_id: user.id,
        tokenized_property_id: tokenizedPropertyId,
        token_amount: tokenAmount.toString(),
        price_per_token: pricePerToken,
        total_price: totalPrice,
        listing_type: listingType,
        status: 'active',
        expires_at: expirationDate.toISOString(),
        metadata: {
          created_by_function: true,
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      })
      .select()
      .single()

    if (listingError) {
      console.error('Error creating marketplace listing:', listingError)
      return createResponse(createErrorResponse('Failed to create marketplace listing'), 500)
    }

    console.log('Marketplace listing created successfully:', listing.id)

    // Optionally reserve the tokens (mark them as pending sale)
    const { error: reserveError } = await supabase
      .from('token_holdings')
      .update({
        tokens_reserved: (parseFloat(tokenHoldings.tokens_owned) - tokenAmount).toString(),
        updated_at: new Date().toISOString()
      })
      .eq('holder_id', user.id)
      .eq('tokenized_property_id', tokenizedPropertyId)

    if (reserveError) {
      console.error('Warning: Failed to reserve tokens:', reserveError)
      // Don't fail the entire operation for this
    }

    return createResponse(createSuccessResponse({
      listingId: listing.id,
      tokenizedPropertyId,
      tokenAmount,
      pricePerToken,
      totalPrice,
      status: 'active',
      expiresAt: expirationDate.toISOString()
    }, 'Marketplace listing created successfully'))

  } catch (error) {
    console.error('Unexpected error:', error)
    return createResponse(createErrorResponse('Internal server error'), 500)
  }
})