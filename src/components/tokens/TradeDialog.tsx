'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign, Coins, AlertTriangle, Loader2, Wallet, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { TradingService } from '@/lib/services/TradingService';
import { useHederaWallet } from '@/hooks/useHederaWallet';
import { WalletConnectDialog } from '@/components/wallet/WalletConnectDialog';
import { HederaWalletManager } from '@/components/hedera/HederaWalletManager';
import { TokenPurchaseManager } from '@/components/hedera/TokenPurchaseManager';
import { MarketDepth } from './MarketDepth';
import { supabase } from '@/integrations/supabase/client';

interface NormalizedProperty {
  id: string;
  title: string;
  tokenPrice: number;
  currentValue: number;
  ownedTokens: number;
  totalTokens: number;
  roi: number;
  tokenName?: string;
  tokenSymbol?: string;
  hederaTokenId?: string;
  minimumInvestment?: number;
  availableTokens?: number;
}

interface TradeDialogProps {
  // Support both prop styles for backward compatibility
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  
  // Legacy property format
  property?: {
    id: string;
    title?: string;
    tokenPrice?: number;
    currentValue?: number;
    ownedTokens?: number;
    totalTokens?: number;
    roi?: number;
  };
  
  // New tokenized property format
  tokenizedProperty?: {
    id: string;
    token_name: string;
    token_symbol: string;
    token_price: number;
    hedera_token_id: string;
    minimum_investment: number;
    available_tokens?: number;
  };
  
  onTradeComplete?: () => void;
}

export function TradeDialog(props: TradeDialogProps) {
  // Normalize props for backward compatibility
  const isOpen = props.isOpen || props.open || false;
  const onClose = props.onClose || (() => props.onOpenChange?.(false));
  
  // Normalize property data
  const normalizedProperty: NormalizedProperty | null = (() => {
    if (props.property) {
      return {
        id: props.property.id,
        title: props.property.title || 'Unknown Property',
        tokenPrice: props.property.tokenPrice || 0,
        currentValue: props.property.currentValue || 0,
        ownedTokens: props.property.ownedTokens || 0,
        totalTokens: props.property.totalTokens || 0,
        roi: props.property.roi || 0,
      };
    }
    
    if (props.tokenizedProperty) {
      return {
        id: props.tokenizedProperty.id,
        title: props.tokenizedProperty.token_name,
        tokenPrice: props.tokenizedProperty.token_price,
        currentValue: props.tokenizedProperty.token_price,
        ownedTokens: 0, // Will be fetched
        totalTokens: props.tokenizedProperty.available_tokens || 0,
        roi: 0,
        tokenName: props.tokenizedProperty.token_name,
        tokenSymbol: props.tokenizedProperty.token_symbol,
        hederaTokenId: props.tokenizedProperty.hedera_token_id,
        minimumInvestment: props.tokenizedProperty.minimum_investment,
        availableTokens: props.tokenizedProperty.available_tokens,
      };
    }
    
    return null;
  })();

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tokenAmount, setTokenAmount] = useState('');
  const [pricePerToken, setPricePerToken] = useState(normalizedProperty?.currentValue?.toString() || '0');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [isProcessing, setIsProcessing] = useState(false);
  const [marketPrice, setMarketPrice] = useState(normalizedProperty?.currentValue || 0);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('trade');
  const [userWallet, setUserWallet] = useState<any>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const { wallet, isLoading: walletLoading, refreshBalance } = useHederaWallet();
  const tradingService = new TradingService();

  const totalCost = parseFloat(tokenAmount || '0') * parseFloat(pricePerToken || '0');
  const platformFee = totalCost * 0.025; // 2.5% platform fee
  const gasFee = 5; // Estimated gas fee
  const totalWithFees = totalCost + platformFee + gasFee;

  useEffect(() => {
    if (isOpen && normalizedProperty) {
      fetchMarketPrice();
      fetchUserWallet();
      setValidationError('');
    }
  }, [isOpen, normalizedProperty?.id]);

  useEffect(() => {
    if (orderType === 'market') {
      setPricePerToken(marketPrice.toString());
    }
  }, [orderType, marketPrice]);

  useEffect(() => {
    validateTradeAmount();
  }, [tokenAmount, tradeType, normalizedProperty?.ownedTokens, wallet]);

  const fetchMarketPrice = async () => {
    if (!normalizedProperty) return;
    
    try {
      const price = await tradingService.getMarketPrice(normalizedProperty.id);
      setMarketPrice(price);
      if (orderType === 'market') {
        setPricePerToken(price.toString());
      }
    } catch (error) {
      console.error('Error fetching market price:', error);
    }
  };

  const fetchUserWallet = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const validateTradeAmount = () => {
    if (!normalizedProperty || !tokenAmount || parseFloat(tokenAmount) <= 0) {
      setValidationError('');
      return;
    }

    if (tradeType === 'sell' && parseFloat(tokenAmount) > normalizedProperty.ownedTokens) {
      setValidationError(`You can only sell up to ${normalizedProperty.ownedTokens} tokens`);
      return;
    }

    setValidationError('');
  };

  const handleWalletConfigured = (accountId: string) => {
    setUserWallet({ address: accountId, encrypted_private_key: 'configured' });
    setActiveTab('trade');
  };

  const handlePurchaseComplete = () => {
    toast({
      title: 'Purchase Successful',
      description: 'Your token purchase has been completed successfully',
    });
    props.onTradeComplete?.();
    onClose();
  };

  const handleTrade = async () => {
    if (!user || !normalizedProperty) {
      toast({
        title: 'Error',
        description: 'Missing required data for trade.',
        variant: 'destructive'
      });
      return;
    }

    if (!wallet && !userWallet) {
      setShowWalletConnect(true);
      return;
    }

    if (validationError) {
      toast({
        title: 'Invalid Trade',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await tradingService.executeTrade({
        tokenizedPropertyId: normalizedProperty.id,
        tokenAmount: parseFloat(tokenAmount),
        pricePerToken: parseFloat(pricePerToken),
        tradeType,
        userId: user.id,
        orderType
      });

      if (result.success) {
        toast({
          title: 'Trade Successful',
          description: `Successfully ${tradeType === 'buy' ? 'purchased' : 'sold'} ${tokenAmount} tokens.`,
        });
        
        // Refresh wallet balance if available
        if (refreshBalance) {
          await refreshBalance();
        }
        
        props.onTradeComplete?.();
        onClose();
        setTokenAmount('');
      } else {
        throw new Error(result.error || 'Trade failed');
      }
    } catch (error) {
      console.error('Trade error:', error);
      toast({
        title: 'Trade Failed',
        description: error instanceof Error ? error.message : 'An error occurred while processing your trade.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!normalizedProperty) {
    return null;
  }

  const canTrade = (wallet || userWallet) && !walletLoading && tokenAmount && parseFloat(tokenAmount) > 0 && !validationError;

  // Show token purchase interface for new tokenized properties
  if (props.tokenizedProperty && (!wallet && !userWallet)) {
    return (
      <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ResponsiveDialogContent size="lg" className="max-h-[80vh]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              Invest in {props.tokenizedProperty.token_name}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Purchase {props.tokenizedProperty.token_symbol} tokens to own a fraction of this property
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wallet">1. Setup Wallet</TabsTrigger>
                <TabsTrigger value="purchase" disabled={!userWallet}>2. Purchase Tokens</TabsTrigger>
              </TabsList>

              <TabsContent value="wallet" className="space-y-4">
                <HederaWalletManager 
                  userId={user?.id || ''}
                  onWalletConfigured={handleWalletConfigured}
                />
              </TabsContent>

              <TabsContent value="purchase" className="space-y-4">
                {userWallet && (
                  <TokenPurchaseManager
                    tokenizedProperty={props.tokenizedProperty}
                    userWallet={userWallet}
                    onPurchaseComplete={handlePurchaseComplete}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <>
      <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ResponsiveDialogContent size="full" className="max-h-[90vh]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Trade Tokens</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {normalizedProperty.title}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto px-4 md:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Form */}
              <div className="space-y-6">
                {/* Wallet Status */}
                {!wallet && !userWallet && !walletLoading && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800">Wallet Required</p>
                          <p className="text-xs text-amber-700">Connect your Hedera wallet to start trading</p>
                        </div>
                        <Button size="sm" onClick={() => setShowWalletConnect(true)}>
                          Connect Wallet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(wallet || userWallet) && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                          <p className="text-xs text-green-700 font-mono">
                            {wallet?.address || userWallet?.address} • {wallet?.balance_hbar?.toFixed(2) || '0.00'} HBAR
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Sell
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 space-y-4">
                    {/* Order Type */}
                    <div>
                      <Label htmlFor="orderType">Order Type</Label>
                      <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="market">Market</TabsTrigger>
                          <TabsTrigger value="limit">Limit</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Token Amount */}
                    <div>
                      <Label htmlFor="tokenAmount">Token Amount</Label>
                      <Input
                        id="tokenAmount"
                        type="number"
                        placeholder="Enter number of tokens"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        max={tradeType === 'sell' ? normalizedProperty.ownedTokens : undefined}
                      />
                      {tradeType === 'sell' && (
                        <p className="text-xs text-gray-600 mt-1">
                          Available: {normalizedProperty.ownedTokens} tokens
                        </p>
                      )}
                      {validationError && (
                        <p className="text-xs text-red-600 mt-1">{validationError}</p>
                      )}
                    </div>

                    {/* Price per Token */}
                    <div>
                      <Label htmlFor="pricePerToken">Price per Token ($)</Label>
                      <Input
                        id="pricePerToken"
                        type="number"
                        step="0.01"
                        placeholder="Price per token"
                        value={pricePerToken}
                        onChange={(e) => setPricePerToken(e.target.value)}
                        disabled={orderType === 'market'}
                      />
                      {orderType === 'market' && (
                        <p className="text-xs text-gray-600 mt-1">
                          Market price will be used
                        </p>
                      )}
                    </div>

                    {/* Trade Summary */}
                    {tokenAmount && parseFloat(tokenAmount) > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Trade Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span>Tokens:</span>
                            <span>{tokenAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price per token:</span>
                            <span>${parseFloat(pricePerToken || '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${totalCost.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Platform fee (2.5%):</span>
                            <span>${platformFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Gas fee:</span>
                            <span>${gasFee.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${totalWithFees.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </Tabs>
              </div>

              {/* Market Information */}
              <div className="space-y-6">
                {/* Current Price */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Current Market Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">${marketPrice.toFixed(2)}</span>
                      <Badge variant={normalizedProperty.roi >= 0 ? 'default' : 'destructive'}>
                        {normalizedProperty.roi >= 0 ? '+' : ''}{normalizedProperty.roi.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Holdings Info */}
                {tradeType === 'sell' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Your Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tokens Owned:</span>
                          <span className="font-medium">{normalizedProperty.ownedTokens}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Value:</span>
                          <span className="font-medium">${(normalizedProperty.ownedTokens * marketPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Depth */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Market Depth</h3>
                  <MarketDepth 
                    tokenizedPropertyId={normalizedProperty.id} 
                    currentPrice={marketPrice}
                  />
                </div>
              </div>
            </div>
          </div>

          <ResponsiveDialogFooter>
            <ResponsiveDialogCloseButton />
            <Button 
              onClick={handleTrade} 
              disabled={!canTrade || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `${tradeType === 'buy' ? 'Buy' : 'Sell'} Tokens`
              )}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <WalletConnectDialog
        isOpen={showWalletConnect}
        onClose={() => setShowWalletConnect(false)}
      />
    </>
  );
}