"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WalletIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { toast } from "@/hooks/use-toast";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: "hashpack",
    name: "HashPack",
    icon: "🔵",
    description: "The leading Hedera wallet",
    isAvailable: true,
  },
  {
    id: "kabila",
    name: "Kabila",
    icon: "🟢",
    description: "Multi-chain wallet with Hedera support",
    isAvailable: true,
  },
  {
    id: "blade",
    name: "Blade Wallet",
    icon: "⚫",
    description: "Secure Hedera wallet",
    isAvailable: true,
  },
];

export function WalletConnectButton() {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { connectWallet, disconnectWallet, wallet, isConnecting, isAvailable } = useHederaWallet();

  const handleWalletConnect = async (walletType: string) => {
    try {
      setLoading(true);
      await connectWallet(walletType);
      setIsOpen(false);
      toast({
        title: "Wallet connected successfully!",
        description: `Connected to ${walletType} wallet`,
      });
    } catch (error: any) {
      toast({
        title: "Wallet connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          disabled={!isAvailable}
        >
          {isConnecting ? (
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
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Hedera Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the platform and start investing in tokenized real estate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleWalletConnect(wallet.id)}
              disabled={loading || !wallet.isAvailable}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {wallet.description}
                  </div>
                </div>
                {!wallet.isAvailable && (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center">
          By connecting a wallet, you agree to the platform's Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
}