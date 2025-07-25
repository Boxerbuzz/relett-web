
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePropertyContracts } from '@/contexts/PropertyContractContext';
import { config } from '@/lib/config';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export function ContractStatusIndicator() {
  const { isConnected, isLoading, error, reconnect } = usePropertyContracts();

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isConnected) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (error) return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-orange-600" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (error) return 'Connection Failed';
    return 'Not Connected';
  };

  const getStatusColor = () => {
    if (isLoading) return 'secondary';
    if (isConnected) return 'default';
    if (error) return 'destructive';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {getStatusIcon()}
          Hedera Contract Status
        </CardTitle>
        <CardDescription>
          Connection status to deployed smart contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status:</span>
          <Badge variant={getStatusColor() as any}>
            {getStatusText()}
          </Badge>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {isConnected && (
          <div className="space-y-2">
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium">{config.hedera.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registry:</span>
                <span className="font-mono text-xs">{config.hedera.contracts.propertyRegistry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marketplace:</span>
                <span className="font-mono text-xs">{config.hedera.contracts.propertyMarketplace}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-mono text-xs">{config.hedera.contracts.revenueDistributor}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {(!isConnected || error) && (
            <Button 
              onClick={reconnect} 
              size="sm" 
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reconnect
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open('https://hashscan.io/testnet', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            HashScan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
