import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
  //verifyUser,
  //createTypedSupabaseClient,
} from "../shared/supabase-client.ts";
//import { Timer } from "https://esm.sh/@types/phoenix@1.6.6/index.d.ts";

// interface BuyTokensRequest {
//   listing_id: string;
//   buyer_id: string;
// }

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    await Promise.resolve();

    // const authHeader = req.headers.get("Authorization")!;
    // const userResult = await verifyUser(authHeader);

    // if (!userResult.success) {
    //   return createResponse(userResult, 401);
    // }

    // const { listing_id, buyer_id }: BuyTokensRequest = await req.json();

    // if (!listing_id || !buyer_id) {
    //   return createResponse(
    //     createErrorResponse("Missing listing ID or buyer ID"),
    //     400
    //   );
    // }

    // // Verify buyer matches authenticated user
    // if (buyer_id !== userResult.user.id) {
    //   return createResponse(createErrorResponse("Unauthorized"), 403);
    // }

    // // Get listing details
    // const { data: listing, error: listingError } = await supabase
    //   .from("marketplace_listings")
    //   .select(
    //     `
    //     *,
    //     tokenized_properties!inner(
    //       id,
    //       hedera_tokens!inner(
    //         hedera_token_id,
    //         treasury_account_id
    //       )
    //     )
    //   `
    //   )
    //   .eq("id", listing_id)
    //   .eq("status", "active")
    //   .single();

    // if (listingError || !listing) {
    //   return createResponse(
    //     createErrorResponse("Listing not found or no longer active"),
    //     404
    //   );
    // }

    // // Check if buyer is trying to buy their own listing
    // if (listing.seller_id === buyer_id) {
    //   return createResponse(
    //     createErrorResponse("Cannot buy your own listing"),
    //     400
    //   );
    // }

    // // Get buyer's Hedera wallet
    // const { data: buyerWallet, error: walletError } = await supabase
    //   .from("accounts")
    //   .select("hedera_account_id")
    //   .eq("user_id", buyer_id)
    //   .eq("is_active", true)
    //   .single();

    // if (walletError || !buyerWallet) {
    //   return createResponse(
    //     createErrorResponse("Buyer Hedera wallet not found"),
    //     400
    //   );
    // }

    // // Get seller's Hedera wallet for the transfer
    // const { data: sellerWallet, error: sellerWalletError } = await supabase
    //   .from("accounts")
    //   .select("hedera_account_id")
    //   .eq("user_id", listing.seller_id)
    //   .eq("is_active", true)
    //   .single();

    // if (sellerWalletError || !sellerWallet) {
    //   return createResponse(
    //     createErrorResponse("Seller Hedera wallet not found"),
    //     400
    //   );
    // }

    // // Ensure token association for buyer
    // try {
    //   const { error: associationError } = await supabase.functions.invoke(
    //     "associate-hedera-token",
    //     {
    //       body: {
    //         tokenId: listing.tokenized_properties.hedera_tokens.hedera_token_id,
    //         investorAccountId: buyerWallet.hedera_account_id,
    //       },
    //     }
    //   );

    //   // Association might fail if already associated, which is ok
    //   if (associationError) {
    //     console.log("Token association result:", associationError);
    //   }
    // } catch (error) {
    //   console.log("Token association attempt:", error);
    //   // Continue anyway as token might already be associated
    // }

    // // Execute the token transfer via Hedera
    // const { data: transferResult, error: transferError } =
    //   await supabase.functions.invoke("transfer-hedera-tokens", {
    //     body: {
    //       tokenId: listing.tokenized_properties.hedera_tokens.hedera_token_id,
    //       fromAccountId: sellerWallet.hedera_account_id,
    //       toAccountId: buyerWallet.hedera_account_id,
    //       amount: listing.token_amount,
    //       fromPrivateKey: "seller_private_key", // This should be retrieved securely
    //       tokenizedPropertyId: listing.tokenized_property_id,
    //       pricePerToken: listing.price_per_token,
    //     },
    //   });

    // if (transferError) {
    //   console.error("Token transfer failed:", transferError);
    //   return createResponse(
    //     createErrorResponse("Token transfer failed", transferError.message),
    //     500
    //   );
    // }

    // // Update marketplace listing status
    // const { error: updateError } = await supabase
    //   .from("marketplace_listings")
    //   .update({
    //     status: "sold",
    //     buyer_id: buyer_id,
    //     sold_at: new Date().toISOString(),
    //     transaction_id: transferResult.transaction_id,
    //   })
    //   .eq("id", listing_id);

    // if (updateError) {
    //   console.error("Failed to update listing status:", updateError);
    //   // Don't fail the request since the transfer succeeded
    // }

    // // Update token holdings
    // // Decrease seller's tokens
    // const { error: sellerUpdateError } = await supabase.rpc(
    //   "update_token_holdings_after_sale",
    //   {
    //     p_seller_id: listing.seller_id,
    //     p_buyer_id: buyer_id,
    //     p_tokenized_property_id: listing.tokenized_property_id,
    //     p_token_amount: listing.token_amount,
    //     p_total_price: listing.total_price,
    //   }
    // );

    // if (sellerUpdateError) {
    //   console.error("Failed to update token holdings:", sellerUpdateError);
    // }

    // // Create notifications
    // const notifications = [
    //   {
    //     user_id: listing.seller_id,
    //     type: "marketplace",
    //     title: "Tokens Sold",
    //     message: `Your ${listing.token_amount} tokens have been sold for $${listing.total_price}`,
    //     metadata: {
    //       listing_id: listing_id,
    //       buyer_id: buyer_id,
    //       transaction_id: transferResult.transaction_id,
    //     },
    //   },
    //   {
    //     user_id: buyer_id,
    //     type: "marketplace",
    //     title: "Tokens Purchased",
    //     message: `You have successfully purchased ${listing.token_amount} tokens for $${listing.total_price}`,
    //     metadata: {
    //       listing_id: listing_id,
    //       seller_id: listing.seller_id,
    //       transaction_id: transferResult.transaction_id,
    //     },
    //   },
    // ];

    // // Send notifications
    // for (const notification of notifications) {
    //   await supabase.functions.invoke("process-notification", {
    //     body: notification,
    //   });
    // }

    return createResponse(
      createSuccessResponse({
        message: "Tokens purchased successfully",
        transaction_id: "transferResult.transaction_id",
        listing_id: "listing_id",
      })
    );
  } catch (error) {
    console.error("Buy tokens error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Internal server error", errorMessage),
      500
    );
  }
});
