
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HederaWalletManager } from '@/components/hedera/HederaWalletManager';
import { TokenPurchaseManager } from '@/components/hedera/TokenPurchaseManager';
import { ContractStatusIndicator } from '@/components/hedera/ContractStatusIndicator';
import { useAuth } from '@/lib/auth';
import { useHederaWallet } from '@/hooks/useHederaWallet';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  Settings,
  BarChart3
} from 'lucide-react';

const HederaTokens = () => {
  const { user } = useAuth();
  const { wallet, isLoading } = useHederaWallet();
  const [selectedTab, setSelectedTab] = useState('overview');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please sign in to access Hedera token management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hedera Token Management</h1>
          <p className="text-gray-600">Manage your property tokens on Hedera network</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          <Coins className="w-4 h-4 mr-1" />
          Hedera Network
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContractStatusIndicator />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Portfolio Summary
                </CardTitle>
                <CardDescription>
                  Your Hedera token portfolio overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tokens found</p>
                    <p className="text-sm">Purchase tokens to see your portfolio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <HederaWalletManager 
            userId={user.id}
            onWalletConfigured={(accountId) => {
              console.log('Wallet configured:', accountId);
            }}
          />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          {wallet ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Tokens</CardTitle>
                  <CardDescription>
                    Property tokens available for purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tokenized properties available</p>
                    <p className="text-sm">Check back later for new opportunities</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Holdings</CardTitle>
                  <CardDescription>
                    Property tokens you own
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tokens owned</p>
                    <p className="text-sm">Purchase tokens to build your portfolio</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Wallet not configured</p>
                  <p className="text-sm">Please set up your Hedera wallet first</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContractStatusIndicator />
            
            <Card>
              <CardHeader>
                <CardTitle>Network Configuration</CardTitle>
                <CardDescription>
                  Hedera network and contract settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <Badge variant="outline">Testnet</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas Limit:</span>
                    <span className="font-mono">1,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Fee:</span>
                    <span className="font-mono">20 HBAR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HederaTokens;
