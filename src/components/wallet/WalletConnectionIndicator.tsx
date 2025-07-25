
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Wallet as WalletIcon, Copy, Power, Plus } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

const getWalletIcon = (type: string) => {
  switch (type) {
    case 'metamask':
      return '🦊';
    case 'coinbase':
      return '🔵';
    case 'walletconnect':
      return '🔗';
    case 'phantom':
      return '👻';
    default:
      return '💼';
  }
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function WalletConnectionIndicator() {
  const { connectedWallet, disconnectWallet, wallets, connectWallet, isConnecting } = useWallet();

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  if (!connectedWallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <WalletIcon size={16} />
            <span className="hidden sm:inline">Connect Wallet</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {wallets.map((wallet) => (
            <DropdownMenuItem 
              key={wallet.id}
              onClick={() => connectWallet(wallet)}
              disabled={isConnecting}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-lg">{getWalletIcon(wallet.type)}</span>
                <div className="flex flex-col flex-1">
                  <span className="text-sm">{wallet.name}</span>
                  <span className="text-xs text-gray-500 font-mono">{truncateAddress(wallet.address)}</span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Plus size={16} className="mr-2" />
            Add New Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <span className="text-lg">{getWalletIcon(connectedWallet.type)}</span>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-mono">{truncateAddress(connectedWallet.address)}</span>
            {connectedWallet.balance && (
              <span className="text-xs text-green-600">{connectedWallet.balance}</span>
            )}
          </div>
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-xs p-0">
            ●
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getWalletIcon(connectedWallet.type)}</span>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium">{connectedWallet.name}</span>
              <span className="text-xs text-gray-500 font-mono">{connectedWallet.address}</span>
              {connectedWallet.balance && (
                <span className="text-xs text-green-600">{connectedWallet.balance}</span>
              )}
              {connectedWallet.network && (
                <span className="text-xs text-blue-600">{connectedWallet.network}</span>
              )}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => copyToClipboard(connectedWallet.address)}
          className="cursor-pointer"
        >
          <Copy size={16} className="mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {wallets.filter(w => !w.isConnected).map((wallet) => (
          <DropdownMenuItem 
            key={wallet.id}
            onClick={() => connectWallet(wallet)}
            className="cursor-pointer"
          >
            <span className="text-lg mr-2">{getWalletIcon(wallet.type)}</span>
            Switch to {wallet.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={disconnectWallet}
          className="cursor-pointer text-red-600"
        >
          <Power size={16} className="mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
