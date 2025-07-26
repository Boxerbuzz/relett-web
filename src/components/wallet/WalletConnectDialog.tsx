
'use client';

import { useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WarningCircleIcon, WalletIcon, ShieldIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useHederaWallet } from '@/hooks/useHederaWallet';

interface WalletConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectDialog({ isOpen, onClose }: WalletConnectDialogProps) {
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [step, setStep] = useState<'connect' | 'verify' | 'success'>('connect');
  const { connectWallet, isConnecting } = useHederaWallet();

  const handleConnect = async () => {
    setStep('verify');
    const success = await connectWallet(accountId, privateKey);
    
    if (success) {
      setStep('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } else {
      setStep('connect');
    }
  };

  const resetForm = () => {
    setAccountId('');
    setPrivateKey('');
    setStep('connect');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={handleClose}>
      <ResponsiveDialogContent size="md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5" />
            Connect Hedera Wallet
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="px-4 md:px-0">
          {step === 'connect' && (
            <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4 text-blue-600" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700">
                Your private key is encrypted and stored securely. We never share your credentials.
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accountId">Hedera Account ID</Label>
                <Input
                  id="accountId"
                  placeholder="0.0.123456"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Format: 0.0.xxxxxx (e.g., 0.0.123456)
                </p>
              </div>

              <div>
                <Label htmlFor="privateKey">Private Key</Label>
                <Input
                  id="privateKey"
                  type="password"
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Your ECDSA private key in hex format
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <WarningCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Important:</p>
                <p>Make sure you're using a testnet account for demo purposes. Never share your mainnet private keys.</p>
              </div>
            </div>

            </div>
          )}

        {step === 'verify' && (
          <div className="space-y-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <h3 className="font-medium">Verifying Wallet</h3>
              <p className="text-sm text-gray-600 mt-1">
                Please wait while we verify your wallet credentials...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h3 className="font-medium text-green-700">Wallet Connected!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your Hedera wallet has been successfully connected.
              </p>
            </div>
          </div>
        )}
        </div>

        {step === 'connect' && (
          <ResponsiveDialogFooter>
            <ResponsiveDialogCloseButton />
            <Button 
              onClick={handleConnect}
              disabled={!accountId || !privateKey || isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </ResponsiveDialogFooter>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
