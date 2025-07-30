"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenBalanceCard } from "@/components/wallet/TokenBalanceCard";
import { RealTokenMarketplace } from "@/components/trading/RealTokenMarketplace";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { 
  CoinsIcon, 
  TrendUp, 
  ClockCounterClockwise,
  ShoppingCartIcon 
} from "@phosphor-icons/react";

const TokenManagement = () => {
  const { wallet } = useHederaWallet();

  if (!wallet?.isConnected) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Token Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your tokenized real estate portfolio with real Hedera tokens
            </p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <CoinsIcon className="w-5 h-5" />
                Wallet Required
              </CardTitle>
              <CardDescription className="text-center">
                Connect your Hedera wallet to access token management features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <WalletConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Token Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tokenized real estate portfolio and trade on the marketplace
          </p>
        </div>
        <WalletConnectButton />
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <CoinsIcon className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingCartIcon className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClockCounterClockwise className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <TokenBalanceCard />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <RealTokenMarketplace />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockCounterClockwise className="w-5 h-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View your token transaction history on the Hedera network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ClockCounterClockwise className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Transaction history coming soon</p>
                <p className="text-sm">This will show your Hedera mirror node transaction data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenManagement;