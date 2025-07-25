
'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Copy, Plus, Wallet as WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useWallet, Wallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

interface WalletComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

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

export function WalletCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Select wallet address...",
  className 
}: WalletComboboxProps) {
  const [open, setOpen] = useState(false);
  const { wallets, connectedWallet } = useWallet();
  
  const selectedWallet = wallets.find(wallet => wallet.address === value);

  const copyToClipboard = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
  };

  const handleSelect = (wallet: Wallet) => {
    onValueChange?.(wallet.address);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedWallet ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{getWalletIcon(selectedWallet.type)}</span>
              <div className="flex flex-col items-start">
                <span className="font-mono text-sm">{truncateAddress(selectedWallet.address)}</span>
                <span className="text-xs text-gray-500">{selectedWallet.name}</span>
              </div>
              {selectedWallet.isConnected && (
                <Badge className="bg-green-100 text-green-800 ml-auto">Connected</Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <WalletIcon size={16} />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search wallets..." />
          <CommandList>
            <CommandEmpty>No wallet found.</CommandEmpty>
            
            {connectedWallet && (
              <CommandGroup heading="Connected">
                <CommandItem
                  value={connectedWallet.address}
                  onSelect={() => handleSelect(connectedWallet)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{getWalletIcon(connectedWallet.type)}</span>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{truncateAddress(connectedWallet.address)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => copyToClipboard(connectedWallet.address, e)}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <span className="text-xs text-gray-500">{connectedWallet.name}</span>
                      {connectedWallet.balance && (
                        <span className="text-xs text-blue-600">{connectedWallet.balance}</span>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === connectedWallet.address ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Available Wallets">
              {wallets.filter(wallet => !wallet.isConnected).map((wallet) => (
                <CommandItem
                  key={wallet.id}
                  value={wallet.address}
                  onSelect={() => handleSelect(wallet)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{getWalletIcon(wallet.type)}</span>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{truncateAddress(wallet.address)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => copyToClipboard(wallet.address, e)}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <span className="text-xs text-gray-500">{wallet.name}</span>
                      {wallet.balance && (
                        <span className="text-xs text-blue-600">{wallet.balance}</span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === wallet.address ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup>
              <CommandItem className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                <span>Add new wallet</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
