import { HederaClient, hederaUtils } from "./hedera";
import { supabase } from "@/integrations/supabase/client";

interface TokenizationParams {
  landTitleId: string;
  propertyId?: string;
  tokenName: string;
  totalValue: number;
  totalSupply: number;
  minimumInvestment: number;
  expectedROI: number;
  lockUpPeriodMonths: number;
  revenueDistributionFrequency: string;
  investmentTerms: "fixed" | "variable" | "hybrid";
}

interface HederaTokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  treasury: string;
  adminKey: string | undefined;
  supplyKey: string | undefined;
  isDeleted: boolean;
  tokenType: string | undefined;
}

interface TokenCreationResult {
  tokenizedPropertyId: string;
  hederaTokenId?: string;
  transactionId?: string;
  tokenSymbol: string;
  success: boolean;
  error?: string;
}

export class PropertyTokenizationService {
  private hederaClient: HederaClient;

  constructor() {
    this.hederaClient = new HederaClient();
  }

  async tokenizeProperty(
    params: TokenizationParams
  ): Promise<TokenCreationResult> {
    try {
      console.log("Starting property tokenization process...", params);

      // Step 1: Validate input parameters
      if (!params.landTitleId || !params.tokenName || params.totalValue <= 0) {
        throw new Error("Invalid tokenization parameters");
      }

      // Step 2: Generate unique token symbol
      const tokenSymbol = hederaUtils.generateTokenSymbol(
        params.tokenName,
        params.landTitleId
      );
      console.log("Generated token symbol:", tokenSymbol);

      // Step 3: Calculate token price
      const tokenPrice = params.totalValue / params.totalSupply;
      console.log("Calculated token price:", tokenPrice);

      // Step 4: Create tokenization record in database with pending_approval status
      console.log("Creating tokenization record with pending approval status...");

      const serializedParams = {
        landTitleId: params.landTitleId,
        propertyId: params.propertyId || null,
        tokenName: params.tokenName,
        totalValue: params.totalValue,
        totalSupply: params.totalSupply,
        minimumInvestment: params.minimumInvestment,
        expectedROI: params.expectedROI,
        lockUpPeriodMonths: params.lockUpPeriodMonths,
        revenueDistributionFrequency: params.revenueDistributionFrequency,
        investmentTerms: params.investmentTerms,
      };

      const { data: tokenizedProperty, error: dbError } = await supabase
        .from("tokenized_properties")
        .insert({
          land_title_id: params.landTitleId,
          property_id: params.propertyId,
          token_symbol: tokenSymbol,
          token_name: params.tokenName,
          token_type: "hts_fungible",
          total_supply: params.totalSupply.toString(),
          total_value_usd: params.totalValue,
          minimum_investment: params.minimumInvestment,
          token_price: tokenPrice,
          status: "pending_approval",
          blockchain_network: "hedera",
          investment_terms: params.investmentTerms,
          expected_roi: params.expectedROI,
          revenue_distribution_frequency: params.revenueDistributionFrequency,
          lock_up_period_months: params.lockUpPeriodMonths,
          metadata: {
            decimals: 8,
            created_at: new Date().toISOString(),
            tokenization_parameters: serializedParams,
            awaiting_approval: true,
          },
          legal_structure: {
            ownership_type: "fractional",
            jurisdiction: "Nigeria",
            compliance_status: "pending",
          },
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(
          `Failed to store tokenization record: ${dbError.message}`
        );
      }

      console.log("Tokenization request submitted for approval:", tokenizedProperty);

      // Step 5: Initialize analytics tracking (without Hedera token creation)
      await this.initializeAnalytics(tokenizedProperty.id, params);

      return {
        tokenizedPropertyId: tokenizedProperty.id,
        tokenSymbol,
        success: true,
      };
    } catch (error) {
      console.error("Tokenization failed:", error);
      return {
        tokenizedPropertyId: "",
        tokenSymbol: "",
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async createHederaTokenAfterApproval(
    tokenizedPropertyId: string
  ): Promise<{ success: boolean; hederaTokenId?: string; transactionId?: string; error?: string }> {
    try {
      // Get tokenized property details
      const { data: property, error: propertyError } = await supabase
        .from("tokenized_properties")
        .select("*")
        .eq("id", tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
        throw new Error("Tokenized property not found");
      }

      if (property.status !== "approved") {
        throw new Error("Token must be approved before Hedera creation");
      }

      // Create token on Hedera network
      console.log("Creating approved token on Hedera network...");
      const tokenResult = await this.hederaClient.createPropertyToken(
        property.token_name,
        property.token_symbol,
        parseInt(property.total_supply)
      );

      if (!tokenResult.tokenId) {
        throw new Error("Failed to create token on Hedera network");
      }

      // Create investment group for this token before minting
      try {
        const { error: groupError } = await supabase.functions.invoke('create-investment-group', {
          body: {
            tokenizedPropertyId,
            salesWindowDays: 30 // Default 30-day sales window
          }
        });
        
        if (groupError) {
          console.warn('Failed to create investment group:', groupError);
        }
      } catch (groupError) {
        console.warn('Failed to create investment group:', groupError);
      }

      // Update tokenized property with Hedera token details but keep as approved for sales window
      const { error: updateError } = await supabase
        .from("tokenized_properties")
        .update({
          hedera_token_id: tokenResult.tokenId,
          status: "approved", // Keep as approved during sales window
          metadata: {
            ...((property.metadata as object) || {}),
            creation_transaction: tokenResult.transactionId,
            hedera_created_at: new Date().toISOString(),
            awaiting_approval: false,
            sales_window_active: true,
          },
        })
        .eq("id", tokenizedPropertyId);

      if (updateError) {
        console.error("Failed to update property with Hedera details:", updateError);
        throw new Error("Failed to update property with Hedera details");
      }

      return {
        success: true,
        hederaTokenId: tokenResult.tokenId,
        transactionId: tokenResult.transactionId,
      };
    } catch (error) {
      console.error("Hedera token creation after approval failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async purchaseTokens(params: {
    tokenizedPropertyId: string;
    investorId: string;
    tokenAmount: number;
    investorAccountId: string;
    investorPrivateKey: string;
  }) {
    try {
      console.log("Starting token purchase process...", params);

      // Step 1: Get tokenized property details
      const { data: property, error: propertyError } = await supabase
        .from("tokenized_properties")
        .select("*")
        .eq("id", params.tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
        throw new Error("Tokenized property not found");
      }

      console.log("Retrieved property details:", property);

      // Step 2: Validate purchase amount
      if (params.tokenAmount <= 0) {
        throw new Error("Invalid token amount");
      }

      const totalInvestment = params.tokenAmount * property.token_price;
      if (totalInvestment < property.minimum_investment) {
        throw new Error(`Minimum investment is ${property.minimum_investment}`);
      }

      // Step 3: Associate investor account with token (if not already done)
      if (property.hedera_token_id) {
        console.log("Associating investor account with token...");
        await this.hederaClient.associateToken(
          params.investorAccountId,
          property.hedera_token_id,
          params.investorPrivateKey
        );
      }

      // Step 4: Transfer tokens from treasury to investor
      if (property.hedera_token_id) {
        console.log("Transferring tokens to investor...");
        const treasuryAccountId =
          import.meta.env.VITE_HEDERA_ACCOUNT_ID ||
          import.meta.env.VITE_HEDERA_TESTNET_ACCOUNT_ID;
        const treasuryPrivateKey =
          import.meta.env.VITE_HEDERA_PRIVATE_KEY ||
          import.meta.env.VITE_HEDERA_TESTNET_PRIVATE_KEY;

        if (!treasuryAccountId || !treasuryPrivateKey) {
          console.warn(
            "Hedera treasury credentials not configured, using mock transfer"
          );
        } else {
          const transferResult = await this.hederaClient.transferTokens({
            tokenId: property.hedera_token_id,
            fromAccountId: treasuryAccountId,
            toAccountId: params.investorAccountId,
            amount: params.tokenAmount,
            fromPrivateKey: treasuryPrivateKey,
          });
          console.log("Token transfer completed:", transferResult);
        }
      }

      // Step 5: Record the token holding
      console.log("Recording token holding...");
      const { data: holding, error: holdingError } = await supabase
        .from("token_holdings")
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          holder_id: params.investorId,
          tokens_owned: params.tokenAmount.toString(),
          purchase_price_per_token: property.token_price,
          total_investment: totalInvestment,
          acquisition_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (holdingError) {
        throw new Error(
          `Failed to record token holding: ${holdingError.message}`
        );
      }

      // Step 6: Record the transaction
      console.log("Recording transaction...");
      await supabase.from("token_transactions").insert({
        tokenized_property_id: params.tokenizedPropertyId,
        to_holder: params.investorId,
        token_amount: params.tokenAmount.toString(),
        price_per_token: property.token_price,
        total_value: totalInvestment,
        transaction_type: "transfer",
        status: "confirmed",
        metadata: {
          transfer_type: "purchase",
          investor_account: params.investorAccountId,
        },
      });

      // Step 7: Initialize investment tracking
      await supabase.rpc("create_investment_tracking", {
        p_user_id: params.investorId,
        p_tokenized_property_id: params.tokenizedPropertyId,
        p_tokens_owned: params.tokenAmount,
        p_investment_amount: totalInvestment,
        p_purchase_price_per_token: property.token_price,
      });

      console.log("Token purchase completed successfully");

      return {
        success: true,
        holdingId: holding.id,
        totalInvestment,
      };
    } catch (error) {
      console.error("Token purchase failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async initializeAnalytics(
    tokenizedPropertyId: string,
    params: TokenizationParams
  ) {
    try {
      // Create initial analytics entries
      const analyticsData = [
        {
          tokenized_property_id: tokenizedPropertyId,
          user_id: (await supabase.auth.getUser()).data.user?.id || "", // System-level analytics
          metric_type: "initial_valuation",
          metric_value: params.totalValue,
          calculation_date: new Date().toISOString().split("T")[0],
          period_start: new Date().toISOString().split("T")[0],
          period_end: new Date().toISOString().split("T")[0],
          metadata: {
            total_supply: params.totalSupply,
            token_price: params.totalValue / params.totalSupply,
            expected_roi: params.expectedROI,
            status: "pending_approval",
          },
        },
      ];

      const { error } = await supabase
        .from("investment_analytics")
        .insert(analyticsData);

      if (error) {
        console.error("Failed to initialize analytics:", error);
      }
    } catch (error) {
      console.error("Analytics initialization error:", error);
    }
  }

  async distributeRevenue(params: {
    tokenizedPropertyId: string;
    totalRevenue: number;
    distributionType: string;
    sourceDescription: string;
  }) {
    try {
      // Step 1: Get all token holders for this property
      const { data: holdings, error: holdingsError } = await supabase
        .from("token_holdings")
        .select("*")
        .eq("tokenized_property_id", params.tokenizedPropertyId);

      if (holdingsError || !holdings || holdings.length === 0) {
        throw new Error("No token holders found");
      }

      // Step 2: Get tokenized property details
      const { data: property, error: propertyError } = await supabase
        .from("tokenized_properties")
        .select("*")
        .eq("id", params.tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
        throw new Error("Tokenized property not found");
      }

      // Step 3: Calculate revenue per token
      const totalSupply = parseInt(property.total_supply);
      const revenuePerToken = params.totalRevenue / totalSupply;

      // Step 4: Distribute revenue to each holder (this would typically involve actual payments)
      const distributions = holdings.map((holding) => ({
        holderId: holding.holder_id,
        tokensOwned: parseInt(holding.tokens_owned),
        revenueShare: parseInt(holding.tokens_owned) * revenuePerToken,
      }));

      // Step 5: Record the distribution
      const { data: distribution, error: distributionError } = await supabase
        .from("revenue_distributions")
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          distribution_date: new Date().toISOString(),
          total_revenue: params.totalRevenue,
          revenue_per_token: revenuePerToken,
          distribution_type: params.distributionType,
          source_description: params.sourceDescription,
          metadata: {
            distributions,
            total_holders: holdings.length,
          },
        })
        .select()
        .single();

      if (distributionError) {
        throw new Error(
          `Failed to record revenue distribution: ${distributionError.message}`
        );
      }

      return {
        success: true,
        distributionId: distribution.id,
        revenuePerToken,
        totalHolders: holdings.length,
        distributions,
      };
    } catch (error) {
      console.error("Revenue distribution failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getTokenizedPropertyInfo(tokenizedPropertyId: string) {
    try {
      const { data: property, error } = await supabase
        .from("tokenized_properties")
        .select(
          `
          *,
          land_title:land_titles(*),
          token_holdings(*),
          revenue_distributions(*),
          token_transactions(*)
        `
        )
        .eq("id", tokenizedPropertyId)
        .single();

      if (error) {
        throw new Error(`Failed to get property info: ${error.message}`);
      }

      // Get Hedera token info
      let hederaInfo: HederaTokenInfo | null = null;
      if (property.hedera_token_id) {
        try {
          hederaInfo = await this.hederaClient.getTokenInfo(
            property.hedera_token_id
          );
        } catch (hederaError) {
          console.warn("Failed to get Hedera token info:", hederaError);
        }
      }

      return {
        success: true,
        property: {
          ...property,
          hedera_info: hederaInfo,
        },
      };
    } catch (error) {
      console.error("Failed to get tokenized property info:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  close() {
    this.hederaClient.close();
  }
}

// Export utility functions
export { hederaUtils };
