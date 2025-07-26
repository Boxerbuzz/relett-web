
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SecureEncryption } from '@/lib/security/encryption';
import { 
  Wallet, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface HederaWalletManagerProps {
  userId: string;
  onWalletConfigured?: (accountId: string) => void;
}

export function HederaWalletManager({ userId, onWalletConfigured }: HederaWalletManagerProps) {
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  const validateHederaAccount = (accountId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(accountId);
  };

  const validatePrivateKey = (key: string) => {
    // Basic validation for ECDSA private key format
    return key.length > 50 && key.includes('302e020100300506032b657004220420');
  };

  const handleConfigureWallet = async () => {
    if (!validateHederaAccount(accountId)) {
      toast({
        title: 'Invalid Account ID',
        description: 'Please enter a valid Hedera account ID (format: 0.0.123456)',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePrivateKey(privateKey)) {
      toast({
        title: 'Invalid Private Key',
        description: 'Please enter a valid ECDSA private key',
        variant: 'destructive'
      });
      return;
    }

    setIsConfiguring(true);

    try {
      // Generate a secure encryption password
      const encryptionPassword = SecureEncryption.generateSecurePassword();
      
      // Encrypt the private key before storing
      const encryptedPrivateKey = await SecureEncryption.encryptPrivateKey(privateKey, encryptionPassword);
      
      // Store wallet configuration securely
      const { error } = await supabase
        .from('wallets')
        .upsert({
          user_id: userId,
          address: accountId,
          encrypted_private_key: encryptedPrivateKey,
          wallet_type: 'hedera',
          is_primary: true,
          is_verified: false,
          metadata: {
            network: 'testnet',
            configured_at: new Date().toISOString(),
            encryption_hint: encryptionPassword.substring(0, 4) + '****' // Store hint for recovery
          }
        });

      if (error) throw error;

      setIsConfigured(true);
      onWalletConfigured?.(accountId);

      toast({
        title: 'Wallet Configured',
        description: 'Your Hedera wallet has been configured successfully',
      });

    } catch (error) {
      console.error('Error configuring wallet:', error);
      toast({
        title: 'Configuration Failed',
        description: 'Failed to configure Hedera wallet',
        variant: 'destructive'
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  if (isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Hedera Wallet Configured
          </CardTitle>
          <CardDescription>
            Your wallet is ready for token operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-xs text-gray-600">{accountId}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(accountId, 'Account ID')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Ready for token operations
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Configure Hedera Wallet
        </CardTitle>
        <CardDescription>
          Set up your Hedera account for token operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            You need a Hedera account to participate in tokenized property investments.
            Get free testnet credentials from the Hedera Portal.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="account-id">Hedera Account ID</Label>
          <Input
            id="account-id"
            placeholder="0.0.123456"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Format: 0.0.123456 (shard.realm.account)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="private-key">Private Key</Label>
          <div className="relative">
            <Input
              id="private-key"
              type={showPrivateKey ? 'text' : 'password'}
              placeholder="302e020100300506032b657004220420..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            ECDSA private key from your Hedera account
          </p>
        </div>

        <Button 
          onClick={handleConfigureWallet}
          disabled={isConfiguring || !accountId || !privateKey}
          className="w-full"
        >
          {isConfiguring ? 'Configuring...' : 'Configure Wallet'}
        </Button>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Need a Hedera Account?
          </h4>
          <div className="space-y-2 text-xs text-gray-600">
            <p>1. Visit the Hedera Portal</p>
            <p>2. Create a testnet account (free)</p>
            <p>3. Copy your Account ID and Private Key</p>
            <p>4. Paste them above to configure your wallet</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
