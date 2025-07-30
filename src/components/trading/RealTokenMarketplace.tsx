"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { useHederaTokenManagement } from "@/hooks/useHederaTokenManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  CoinsIcon, 
  ArrowRightIcon, 
  SpinnerIcon,
  ShieldIcon,
  CheckCircleIcon 
} from "@phosphor-icons/react";

interface MarketplaceListing {
  id: string;
  tokenized_property_id: string;
  seller_id: string;
  token_amount: number;
  price_per_token: number;
  total_price: number;
  status: string;
  created_at: string;
  tokenized_property: {
    token_name: string;
    token_symbol: string;
    token_price: number;
    hedera_tokens: Array<{
      hedera_token_id: string;
    }>;
  };
}

export function RealTokenMarketplace() {
  const { wallet } = useHederaWallet();
  const { transferTokens, checkTokenAssociation, associateToken, isLoading } = useHederaTokenManagement();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [associationStatus, setAssociationStatus] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    fetchMarketplaceListings();
  }, []);

  useEffect(() => {
    if (wallet?.id && listings.length > 0) {
      checkAllTokenAssociations();
    }
  }, [wallet?.id, listings]);

  const fetchMarketplaceListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          tokenized_properties!inner(
            token_name,
            token_symbol,
            token_price,
            hedera_tokens!inner(hedera_token_id)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setListings(data.map(listing => ({
          ...listing,
          tokenized_property: listing.tokenized_properties
        })) as MarketplaceListing[]);
      }
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch marketplace listings",
        variant: "destructive",
      });
    }
  };

  const checkAllTokenAssociations = async () => {
    if (!wallet?.id) return;

    const newAssociationStatus = new Map<string, boolean>();

    for (const listing of listings) {
      const tokenId = listing.tokenized_property.hedera_tokens[0]?.hedera_token_id;
      if (tokenId) {
        try {
          const isAssociated = await checkTokenAssociation(tokenId, wallet.id);
          newAssociationStatus.set(tokenId, isAssociated);
        } catch (error) {
          console.warn(`Failed to check association for token ${tokenId}:`, error);
          newAssociationStatus.set(tokenId, false);
        }
      }
    }

    setAssociationStatus(newAssociationStatus);
  };

  const handleAssociateToken = async (tokenId: string) => {
    if (!wallet?.id) return;

    try {
      const result = await associateToken(tokenId, wallet.id);
      if (result.success) {
        setAssociationStatus(prev => new Map(prev.set(tokenId, true)));
        toast({
          title: "Token Associated",
          description: "Token has been associated with your wallet",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Token association error:', error);
      toast({
        title: "Association Failed",
        description: error instanceof Error ? error.message : "Failed to associate token",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async (listing: MarketplaceListing) => {
    if (!wallet?.id) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to make purchases",
        variant: "destructive",
      });
      return;
    }

    const tokenId = listing.tokenized_property.hedera_tokens[0]?.hedera_token_id;
    if (!tokenId) {
      toast({
        title: "Error",
        description: "Token ID not found for this listing",
        variant: "destructive",
      });
      return;
    }

    // Check if token is associated
    const isAssociated = associationStatus.get(tokenId);
    if (!isAssociated) {
      toast({
        title: "Token Not Associated",
        description: "Please associate the token with your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    try {
      // Call the buy marketplace tokens function
      const { data, error } = await supabase.functions.invoke('buy-marketplace-tokens', {
        body: { 
          listingId: listing.id,
          buyerAccountId: wallet.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Purchase Successful",
          description: `Successfully purchased ${listing.token_amount} ${listing.tokenized_property.token_symbol} tokens`,
        });
        
        // Refresh listings and wallet balances
        await fetchMarketplaceListings();
        // Refresh wallet balances could be called here if available
        
      } else {
        throw new Error(data?.error || "Purchase failed");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to complete purchase",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getTokenAssociationButton = (listing: MarketplaceListing) => {
    const tokenId = listing.tokenized_property.hedera_tokens[0]?.hedera_token_id;
    if (!tokenId || !wallet?.id) return null;

    const isAssociated = associationStatus.get(tokenId);

    if (isAssociated) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Associated
        </Badge>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAssociateToken(tokenId)}
        disabled={isLoading}
        className="border-orange-300 text-orange-800 hover:bg-orange-50"
      >
        <ShieldIcon className="w-4 h-4 mr-1" />
        Associate Token
      </Button>
    );
  };

  if (!wallet?.isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <CoinsIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Connect your wallet to access the token marketplace</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Token Marketplace</h2>
          <p className="text-muted-foreground">
            Trade tokenized property shares with real Hedera token transfers
          </p>
        </div>
        <Badge variant="outline">
          {listings.length} Active Listings
        </Badge>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <CoinsIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No marketplace listings available</p>
              <p className="text-sm">Check back later for trading opportunities</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {listing.tokenized_property.token_name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {listing.tokenized_property.token_symbol}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Token Association Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Token Status:</span>
                  {getTokenAssociationButton(listing)}
                </div>

                {/* Listing Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{listing.token_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price per Token</p>
                    <p className="font-semibold">${listing.price_per_token}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Price</p>
                    <p className="font-semibold text-primary">${listing.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Market Price</p>
                    <p className="font-semibold">${listing.tokenized_property.token_price}</p>
                  </div>
                </div>

                {/* Price Comparison */}
                {listing.price_per_token < listing.tokenized_property.token_price && (
                  <div className="flex items-center justify-center p-2 bg-green-50 rounded-md">
                    <Badge className="bg-green-100 text-green-800">
                      {(((listing.tokenized_property.token_price - listing.price_per_token) / listing.tokenized_property.token_price) * 100).toFixed(1)}% Discount
                    </Badge>
                  </div>
                )}

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(listing)}
                  disabled={
                    isPurchasing || 
                    isLoading || 
                    listing.seller_id === wallet?.id ||
                    !associationStatus.get(listing.tokenized_property.hedera_tokens[0]?.hedera_token_id)
                  }
                  className="w-full"
                >
                  {isPurchasing ? (
                    <>
                      <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : listing.seller_id === wallet?.id ? (
                    "Your Listing"
                  ) : !associationStatus.get(listing.tokenized_property.hedera_tokens[0]?.hedera_token_id) ? (
                    "Associate Token First"
                  ) : (
                    <>
                      Buy Now
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Seller Info */}
                <div className="text-xs text-muted-foreground text-center border-t pt-2">
                  Seller: {listing.seller_id.slice(0, 8)}...{listing.seller_id.slice(-4)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}