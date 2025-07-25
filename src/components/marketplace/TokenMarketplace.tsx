import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, ShoppingCart, Tag } from "lucide-react";

interface MarketplaceListing {
  id: string;
  tokenized_property_id: string;
  seller_id: string;
  token_amount: number;
  price_per_token: number;
  total_price: number;
  status: string;
  created_at: string;
  property: {
    title: string;
    location: string;
    total_value: number;
  };
  seller: {
    email: string;
  };
}

interface UserListing {
  id: string;
  token_amount: number;
  price_per_token: number;
  status: string;
  created_at: string;
  property: {
    title: string;
    location: string;
  };
}

export default function TokenMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeListings, setActiveListings] = useState<MarketplaceListing[]>([]);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [userHoldings, setUserHoldings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchMarketplaceData();
      fetchUserHoldings();
    }
  }, [user]);

  const fetchMarketplaceData = async () => {
    try {
      // Fetch active marketplace listings
      const { data: listings, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          tokenized_properties!inner(
            id,
            total_value,
            properties!inner(
              title,
              location
            )
          ),
          profiles!seller_id(
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      const formattedListings = listings?.map(listing => ({
        id: listing.id,
        tokenized_property_id: listing.tokenized_property_id,
        seller_id: listing.seller_id,
        token_amount: listing.token_amount,
        price_per_token: listing.price_per_token,
        total_price: listing.total_price,
        status: listing.status,
        created_at: listing.created_at,
        property: {
          title: listing.tokenized_properties.properties.title,
          location: listing.tokenized_properties.properties.location,
          total_value: listing.tokenized_properties.total_value
        },
        seller: {
          email: listing.profiles?.email || 'Anonymous'
        }
      })) || [];

      setActiveListings(formattedListings);

      // Fetch user's listings if authenticated
      if (user) {
        const { data: userListings, error: userError } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            tokenized_properties!inner(
              properties!inner(
                title,
                location
              )
            )
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (userError) throw userError;

        const formattedUserListings = userListings?.map(listing => ({
          id: listing.id,
          token_amount: listing.token_amount,
          price_per_token: listing.price_per_token,
          status: listing.status,
          created_at: listing.created_at,
          property: {
            title: listing.tokenized_properties.properties.title,
            location: listing.tokenized_properties.properties.location
          }
        })) || [];

        setUserListings(formattedUserListings);
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHoldings = async () => {
    if (!user) return;

    try {
      const { data: holdings, error } = await supabase
        .from('token_holdings')
        .select(`
          *,
          tokenized_properties!inner(
            id,
            total_supply,
            properties!inner(
              title,
              location
            )
          )
        `)
        .eq('holder_id', user.id)
        .gt('tokens_owned', 0);

      if (error) throw error;

      setUserHoldings(holdings || []);
    } catch (error) {
      console.error('Error fetching user holdings:', error);
    }
  };

  const handleCreateListing = async () => {
    if (!user || !selectedProperty || !sellAmount || !sellPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(sellAmount);
    const price = parseFloat(sellPrice);

    if (amount <= 0 || price <= 0) {
      toast({
        title: "Error",
        description: "Amount and price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          tokenized_property_id: selectedProperty,
          seller_id: user.id,
          token_amount: amount,
          price_per_token: price,
          total_price: amount * price,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing created successfully",
      });

      // Reset form
      setSellAmount("");
      setSellPrice("");
      setSelectedProperty("");

      // Refresh data
      fetchMarketplaceData();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
    }
  };

  const handleBuyTokens = async (listingId: string, totalPrice: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to buy tokens",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the buy tokens function
      const { data, error } = await supabase.functions.invoke('buy-marketplace-tokens', {
        body: {
          listing_id: listingId,
          buyer_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tokens purchased successfully",
      });

      // Refresh marketplace data
      fetchMarketplaceData();
      fetchUserHoldings();
    } catch (error) {
      console.error('Error buying tokens:', error);
      toast({
        title: "Error",
        description: "Failed to purchase tokens",
        variant: "destructive",
      });
    }
  };

  const cancelListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'cancelled' })
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing cancelled successfully",
      });

      fetchMarketplaceData();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast({
        title: "Error",
        description: "Failed to cancel listing",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading marketplace...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Token Marketplace</h1>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList>
          <TabsTrigger value="browse">Browse Listings</TabsTrigger>
          <TabsTrigger value="sell">Sell Tokens</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4">
            {activeListings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active listings available</p>
                </CardContent>
              </Card>
            ) : (
              activeListings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{listing.property.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{listing.property.location}</p>
                      </div>
                      <Badge variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        For Sale
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Tokens</p>
                        <p className="text-lg">{listing.token_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Price per Token</p>
                        <p className="text-lg">${listing.price_per_token.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Price</p>
                        <p className="text-lg font-bold">${listing.total_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Seller</p>
                        <p className="text-sm text-muted-foreground">{listing.seller.email}</p>
                      </div>
                    </div>
                    
                    {user && listing.seller_id !== user.id && (
                      <Button 
                        onClick={() => handleBuyTokens(listing.id, listing.total_price)}
                        className="w-full"
                      >
                        Buy Tokens
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Property</label>
                <select 
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a property...</option>
                  {userHoldings.map((holding) => (
                    <option key={holding.tokenized_property_id} value={holding.tokenized_property_id}>
                      {holding.tokenized_properties.properties.title} 
                      ({holding.tokens_owned} tokens available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Amount to Sell</label>
                <Input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="Number of tokens"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price per Token ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Price per token in USD"
                />
              </div>

              {sellAmount && sellPrice && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    Total Value: ${(parseFloat(sellAmount) * parseFloat(sellPrice)).toFixed(2)}
                  </p>
                </div>
              )}

              <Button onClick={handleCreateListing} className="w-full">
                Create Listing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-listings" className="space-y-4">
          <div className="grid gap-4">
            {userListings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">You have no active listings</p>
                </CardContent>
              </Card>
            ) : (
              userListings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{listing.property.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{listing.property.location}</p>
                      </div>
                      <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Tokens</p>
                        <p className="text-lg">{listing.token_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Price per Token</p>
                        <p className="text-lg">${listing.price_per_token.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Listed</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {listing.status === 'active' && (
                      <Button 
                        variant="outline" 
                        onClick={() => cancelListing(listing.id)}
                        className="w-full"
                      >
                        Cancel Listing
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}