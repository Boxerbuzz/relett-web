'use client';

import { useState } from 'react';
import React from 'react';
import { useHashPack } from '@/contexts/HashPackContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WalletIcon, CheckCircleIcon, SpinnerIcon} from '@phosphor-icons/react';

interface HashPackConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HashPackConnectDialog({ isOpen, onClose }: HashPackConnectDialogProps) {
  const { connectWallet, isConnecting, isAvailable, pairingString } = useHashPack();
  const { toast } = useToast();
  const [step, setStep] = useState<'connect' | 'pairing' | 'success'>('connect');

  const handleConnect = async () => {
    if (!isAvailable) {
      toast({
        title: 'HashPack Not Available',
        description: 'HashConnect service is not available.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setStep('pairing');
      const pairingString = await connectWallet();
      console.log("Generated pairing string:", pairingString);
    } catch (error) {
      setStep('connect');
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to start pairing',
        variant: 'destructive'
      });
    }
  };

  const openHashPack = () => {
    if (pairingString) {
      const deepLink = `https://wallet.hashpack.app/pairing?data=${encodeURIComponent(pairingString)}`;
      window.open(deepLink, '_blank');
    }
  };

  // Listen for successful connection
  const { wallet } = useHashPack();
  React.useEffect(() => {
    if (wallet && step === 'pairing') {
      setStep('success');
      toast({
        title: 'Wallet Connected',
        description: 'Your HashPack wallet has been successfully connected.',
      });

      setTimeout(() => {
        onClose();
        setStep('connect');
      }, 2000);
    }
  }, [wallet, step, onClose, toast]);

  const handleClose = () => {
    if (!isConnecting) {
      onClose();
      setStep('connect');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WalletIcon size={24} />
            Connect HashPack Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your HashPack wallet to access blockchain features
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {step === 'connect' && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <WalletIcon size={32} className={isAvailable ? "text-blue-600" : "text-gray-400"} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">
                  {isAvailable ? 'Ready to Connect' : 'HashPack Not Detected'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isAvailable 
                    ? 'Click below to connect your HashPack wallet and start using blockchain features.'
                    : 'We\'re looking for your HashPack extension. Please wait or follow the steps below.'
                  }
                </p>
              </div>
              
              {!isAvailable && (
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-yellow-800 font-medium">Troubleshooting Steps:</p>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Install HashPack from the Chrome Web Store</li>
                    <li>Enable the extension in your browser</li>
                    <li>Refresh this page</li>
                    <li>Disable other wallet extensions temporarily</li>
                  </ol>
                  <div className="pt-2 border-t border-yellow-200">
                    <a 
                      href="https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Install HashPack Extension →
                    </a>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleConnect}
                className="w-full"
                disabled={!isAvailable}
              >
                {isAvailable ? 'Connect HashPack' : 'Waiting for HashPack...'}
              </Button>
              
              {!isAvailable && (
                <p className="text-xs text-center text-muted-foreground">
                  Check browser console for detection logs
                </p>
              )}
            </>
          )}

          {step === 'pairing' && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <SpinnerIcon size={32} className="text-blue-600 animate-spin" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-medium">Open HashPack</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to open HashPack and approve the connection.
                </p>
                {pairingString && (
                  <Button onClick={openHashPack} className="w-full">
                    Open HashPack Wallet
                  </Button>
                )}
                <p className="text-xs text-gray-500">
                  Connection will complete automatically once approved in HashPack.
                </p>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={32} className="text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-green-600">Connected!</h3>
                <p className="text-sm text-gray-600">
                  Your HashPack wallet is now connected.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}