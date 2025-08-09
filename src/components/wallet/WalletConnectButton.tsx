"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { toast } from "@/hooks/use-toast";

export function WalletConnectButton() {
  const [loading, setLoading] = useState(false);
  const { connectWallet, disconnectWallet, wallet, isConnecting, isAvailable } = useHederaWallet();

  const handleWalletConnect = async () => {
    try {
      setLoading(true);
      await connectWallet('walletconnect');
      toast({
        title: "Wallet connected successfully!",
        description: "Connected to WalletConnect",
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      const errorMessage = error.message || "Failed to connect wallet. Please try again.";
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error: any) {
      toast({
        title: "Disconnection failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  if (wallet?.isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <WalletIcon className="mr-1 h-3 w-3" />
          {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Connected
        </Badge>
        <div className="text-sm text-muted-foreground">
          {wallet.id.slice(0, 8)}...{wallet.id.slice(-4)}
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      disabled={!isAvailable}
      onClick={handleWalletConnect}
    >
      {loading || isConnecting ? (
        <>
          <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <WalletIcon className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}