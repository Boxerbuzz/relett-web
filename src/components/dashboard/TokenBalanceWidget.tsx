"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { TokenBalanceCard } from "@/components/wallet/TokenBalanceCard";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { CoinsIcon, RefreshCwIcon } from "@phosphor-icons/react";

export function TokenBalanceWidget() {
  const { wallet, refreshBalances } = useHederaWallet();

  if (!wallet?.isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CoinsIcon className="w-5 h-5" />
            Token Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">
              Connect your Hedera wallet to view your token portfolio and balances
            </p>
            <WalletConnectButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CoinsIcon className="w-5 h-5" />
            Wallet Status
          </CardTitle>
          <Badge className="bg-green-100 text-green-800">Connected</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{wallet.name}</p>
              <p className="text-sm text-muted-foreground">
                {wallet.id.slice(0, 8)}...{wallet.id.slice(-4)}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshBalances}
              className="flex items-center gap-1"
            >
              <RefreshCwIcon className="w-3 h-3" />
              Refresh
            </Button>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">HBAR Balance: </span>
            <span className="font-mono">{wallet.balance || "0 HBAR"}</span>
          </div>
        </CardContent>
      </Card>
      
      <TokenBalanceCard />
    </div>
  );
}