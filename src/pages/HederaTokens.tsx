
'use client';

import { useState, useEffect } from 'react';
import { HederaTokenManager } from '@/components/hedera/HederaTokenManager';
import { TokenTransactionTracker } from '@/components/hedera/TokenTransactionTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Coins, 
  Plus, 
  TrendingUp, 
  Wallet,
  ArrowLeft
} from 'lucide-react';

interface TokenizedProperty {
  id: string;
  token_name: string;
  token_symbol: string;
  token_price: number;
  total_supply: string;
  hedera_token_id: string | null;
  status: string;
  total_value_usd: number;
  property_id: string | null;
  properties?: {
    title: string;
    type: string;
  };
}

interface TokenHolding {
  id: string;
  tokens_owned: string;
  total_investment: number;
  tokenized_property_id: string;
}

const HederaTokens = () => {
  const [tokenizedProperties, setTokenizedProperties] = useState<TokenizedProperty[]>([]);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<TokenizedProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTokenizedProperties();
      fetchTokenHoldings();
    }
  }, [user]);

  const fetchTokenizedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select(`
          *,
          properties(
            title,
            type
          )
        `)
        .eq('status', 'minted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokenizedProperties(data || []);
    } catch (error) {
      console.error('Error fetching tokenized properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tokenized properties',
        variant: 'destructive'
      });
    }
  };

  const fetchTokenHoldings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('token_holdings')
        .select('*')
        .eq('holder_id', user.id);

      if (error) throw error;
      setTokenHoldings(data || []);
    } catch (error) {
      console.error('Error fetching token holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTokens = (propertyId: string) => {
    const holding = tokenHoldings.find(h => h.tokenized_property_id === propertyId);
    return holding ? parseFloat(holding.tokens_owned) : 0;
  };

  const getTotalPortfolioValue = () => {
    return tokenHoldings.reduce((total, holding) => total + holding.total_investment, 0);
  };

  const getActiveTokensCount = () => {
    return tokenHoldings.filter(h => parseFloat(h.tokens_owned) > 0).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (selectedProperty) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedProperty(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
          <h1 className="text-2xl font-bold">Token Management</h1>
        </div>

        <HederaTokenManager
          tokenizedProperty={selectedProperty}
          userTokens={getUserTokens(selectedProperty.id)}
          onTokenTransfer={() => {
            fetchTokenHoldings();
            toast({
              title: 'Portfolio Updated',
              description: 'Your token balance has been refreshed',
            });
          }}
        />

        <TokenTransactionTracker
          tokenizedPropertyId={selectedProperty.id}
          userId={user?.id}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hedera Token Portfolio</h1>
          <p className="text-gray-600">Manage your tokenized property investments on Hedera</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tokenize Property
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">${getTotalPortfolioValue().toFixed(2)}</p>
                <p className="text-sm text-gray-500">USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getActiveTokensCount()}</p>
                <p className="text-sm text-gray-500">Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{tokenizedProperties.length}</p>
                <p className="text-sm text-gray-500">To Invest</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Portfolio */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="marketplace">Token Marketplace</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Token Holdings</CardTitle>
              <CardDescription>
                Manage your tokenized property investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tokenHoldings.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Token Holdings</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't invested in any tokenized properties yet.
                  </p>
                  <Button>Explore Marketplace</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tokenHoldings.map((holding) => {
                    const property = tokenizedProperties.find(p => p.id === holding.tokenized_property_id);
                    if (!property) return null;

                    return (
                      <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                           onClick={() => setSelectedProperty(property)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Coins className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{property.token_name}</h3>
                            <p className="text-sm text-gray-600">
                              {parseFloat(holding.tokens_owned)} {property.token_symbol} tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${holding.total_investment.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Investment Value</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tokens</CardTitle>
              <CardDescription>
                Invest in tokenized real estate properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tokenizedProperties.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Available Tokens</h3>
                  <p className="text-gray-600">
                    No tokenized properties are currently available for investment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tokenizedProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedProperty(property)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Coins className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{property.token_name}</h3>
                          <p className="text-sm text-gray-600">
                            {property.properties?.title || 'Property Investment Token'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${property.token_price}</p>
                          <p className="text-sm text-gray-500">per token</p>
                        </div>
                        <Badge variant="outline">{property.token_symbol}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <TokenTransactionTracker userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HederaTokens;
