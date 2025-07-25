import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { 
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery
} from "npm:@hashgraph/sdk@^2.65.1"
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createResponse,
  createCorsResponse,
  verifyUser 
} from "../shared/supabase-client.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BalanceRequest {
  accountId: string
}

interface TokenBalance {
  tokenId: string
  balance: string
}

interface BalanceResponse {
  accountId: string
  hbarBalance: string
  tokenBalances: TokenBalance[]
}

serve(async (req) => {
  console.log('Get Hedera Balance function called')
  
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

    console.log('User authenticated successfully')

    // Parse request body
    const body: BalanceRequest = await req.json()
    const { accountId } = body

    if (!accountId) {
      return createResponse(createErrorResponse('Account ID is required'), 400)
    }

    console.log('Fetching balance for account:', accountId)

    // Get Hedera credentials from environment
    const hederaNetwork = Deno.env.get('HEDERA_NETWORK') || 'testnet'
    const operatorAccountId = Deno.env.get('HEDERA_ACCOUNT_ID')
    const operatorPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY')

    if (!operatorAccountId || !operatorPrivateKey) {
      return createResponse(createErrorResponse('Hedera credentials not configured'), 500)
    }

    // Initialize Hedera client
    let client: Client
    try {
      client = hederaNetwork === 'mainnet' ? Client.forMainnet() : Client.forTestnet()
      client.setOperator(
        AccountId.fromString(operatorAccountId),
        PrivateKey.fromStringECDSA(operatorPrivateKey)
      )
      console.log('Hedera client initialized')
    } catch (error) {
      console.error('Failed to initialize Hedera client:', error)
      return createResponse(createErrorResponse('Failed to initialize Hedera client'), 500)
    }

    try {
      // Query account balance
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))

      const balance = await balanceQuery.execute(client)
      
      console.log('Balance query completed')

      // Format HBAR balance
      const hbarBalance = balance.hbars.toString()

      // Format token balances
      const tokenBalances: TokenBalance[] = []
      if (balance.tokens) {
        for (const [tokenId, amount] of balance.tokens.entries()) {
          tokenBalances.push({
            tokenId: tokenId.toString(),
            balance: amount.toString()
          })
        }
      }

      const response: BalanceResponse = {
        accountId,
        hbarBalance,
        tokenBalances
      }

      console.log('Balance response:', response)

      return createResponse(createSuccessResponse(response, 'Balance retrieved successfully'))

    } catch (error) {
      console.error('Balance query failed:', error)
      return createResponse(createErrorResponse(`Failed to get account balance: ${error.message}`), 500)
    } finally {
      if (client) {
        client.close()
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return createResponse(createErrorResponse('Internal server error'), 500)
  }
})