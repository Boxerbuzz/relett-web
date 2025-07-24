'use client';

import { useState } from 'react';
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
import { Wallet, CheckCircle } from 'phosphor-react';
import { Loader } from 'lucide-react';

interface HashPackConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HashPackConnectDialog({ isOpen, onClose }: HashPackConnectDialogProps) {
  const { connectWallet, isConnecting, isAvailable } = useHashPack();
  const { toast } = useToast();
  const [step, setStep] = useState<'connect' | 'connecting' | 'success'>('connect');

  const handleConnect = async () => {
    if (!isAvailable) {
      toast({
        title: 'HashPack Not Available',
        description: 'Please install the HashPack browser extension to continue.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setStep('connecting');
      await connectWallet();
      setStep('success');
      
      toast({
        title: 'Wallet Connected',
        description: 'Your HashPack wallet has been successfully connected.',
      });

      setTimeout(() => {
        onClose();
        setStep('connect');
      }, 2000);
    } catch (error) {
      setStep('connect');
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive'
      });
    }
  };

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
            <Wallet size={24} />
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
                <Wallet size={32} className="text-blue-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">Ready to Connect</h3>
                <p className="text-sm text-gray-600">
                  Click below to connect your HashPack wallet and start using blockchain features.
                </p>
              </div>
              <Button 
                onClick={handleConnect}
                className="w-full"
                disabled={!isAvailable}
              >
                {isAvailable ? 'Connect HashPack' : 'HashPack Not Available'}
              </Button>
              {!isAvailable && (
                <p className="text-xs text-amber-600 text-center">
                  Please install the HashPack browser extension first
                </p>
              )}
            </>
          )}

          {step === 'connecting' && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Loader size={32} className="text-blue-600 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">Connecting...</h3>
                <p className="text-sm text-gray-600">
                  Please approve the connection in your HashPack wallet.
                </p>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
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