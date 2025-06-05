
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Coins, 
  Send, 
  History, 
  TrendingUp,
  ChevronRight,
  Copy,
  ExternalLink
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
}

interface HederaTokenManagerProps {
  tokenizedProperty: TokenizedProperty;
  userTokens?: number;
  onTokenTransfer?: () => void;
}

export function HederaTokenManager({ 
  tokenizedProperty, 
  userTokens = 0,
  onTokenTransfer 
}: HederaTokenManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const { toast } = useToast();

  const handleCreateToken = async () => {
    setIsCreatingToken(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-hedera-token', {
        body: {
          tokenizedPropertyId: tokenizedProperty.id,
          tokenName: tokenizedProperty.token_name,
          tokenSymbol: tokenizedProperty.token_symbol,
          totalSupply: tokenizedProperty.total_supply
        }
      });

      if (error) throw error;

      toast({
        title: 'Token Creation Initiated',
        description: `Hedera token ${tokenizedProperty.token_symbol} is being created`,
      });

    } catch (error) {
      console.error('Token creation error:', error);
      toast({
        title: 'Token Creation Failed',
        description: 'Failed to create Hedera token',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleTransferTokens = async () => {
    if (!transferAmount || !recipientAddress) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both transfer amount and recipient address',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(transferAmount) > userTokens) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough tokens for this transfer',
        variant: 'destructive'
      });
      return;
    }

    setIsTransferring(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-token-transaction', {
        body: {
          tokenized_property_id: tokenizedProperty.id,
          transaction_type: 'transfer',
          to_holder: recipientAddress,
          token_amount: transferAmount,
          price_per_token: tokenizedProperty.token_price
        }
      });

      if (error) throw error;

      toast({
        title: 'Transfer Successful',
        description: `${transferAmount} ${tokenizedProperty.token_symbol} tokens transferred`,
      });

      setTransferAmount('');
      setRecipientAddress('');
      onTokenTransfer?.();

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: 'Failed to transfer tokens',
        variant: 'destructive'
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const copyTokenId = () => {
    if (tokenizedProperty.hedera_token_id) {
      navigator.clipboard.writeText(tokenizedProperty.hedera_token_id);
      toast({
        title: 'Copied',
        description: 'Token ID copied to clipboard',
      });
    }
  };

  const getStatusBadge = () => {
    switch (tokenizedProperty.status) {
      case 'minted':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{tokenizedProperty.status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Token Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  {tokenizedProperty.token_name} ({tokenizedProperty.token_symbol})
                </CardTitle>
                <CardDescription>
                  Hedera Token Management
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-2xl font-bold text-blue-600">{userTokens}</p>
              <p className="text-xs text-gray-500">{tokenizedProperty.token_symbol}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Token Price</p>
              <p className="text-2xl font-bold text-green-600">${tokenizedProperty.token_price}</p>
              <p className="text-xs text-gray-500">per token</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Supply</p>
              <p className="text-2xl font-bold text-purple-600">{parseInt(tokenizedProperty.total_supply).toLocaleString()}</p>
              <p className="text-xs text-gray-500">tokens</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Market Value</p>
              <p className="text-2xl font-bold text-orange-600">${tokenizedProperty.total_value_usd.toLocaleString()}</p>
              <p className="text-xs text-gray-500">USD</p>
            </div>
          </div>

          {tokenizedProperty.hedera_token_id && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Hedera Token ID</p>
                <p className="text-sm text-gray-600 font-mono">{tokenizedProperty.hedera_token_id}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyTokenId}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`https://hashscan.io/testnet/token/${tokenizedProperty.hedera_token_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Token Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!tokenizedProperty.hedera_token_id ? (
                <div className="text-center py-8">
                  <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Token Not Created</h3>
                  <p className="text-gray-600 mb-4">
                    This property token hasn't been created on Hedera yet.
                  </p>
                  <Button onClick={handleCreateToken} disabled={isCreatingToken}>
                    {isCreatingToken ? 'Creating...' : 'Create Hedera Token'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Token Active</p>
                      <p className="text-sm text-green-600">Ready for transfers and trading</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Transfer Tokens
              </CardTitle>
              <CardDescription>
                Send {tokenizedProperty.token_symbol} tokens to another address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  max={userTokens}
                />
                <p className="text-sm text-gray-500">
                  Available balance: {userTokens} {tokenizedProperty.token_symbol}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0.0.12345 or user ID"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleTransferTokens}
                disabled={isTransferring || !tokenizedProperty.hedera_token_id}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isTransferring ? 'Transferring...' : 'Transfer Tokens'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Token transfers will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
