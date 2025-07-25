import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, TrendingUp, BarChart3, Settings, Wallet } from 'lucide-react';

interface FallbackProps {
  onRetry?: () => void;
  onGoBack?: () => void;
  error?: string;
}

export const TradingFallback = ({ onRetry, onGoBack, error }: FallbackProps) => (
  <Card className="w-full max-w-md mx-auto border-warning/20">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <TrendingUp className="h-8 w-8 text-warning" />
      </div>
      <CardTitle className="text-warning">Trading Temporarily Unavailable</CardTitle>
      <CardDescription>
        The trading interface is experiencing issues. Your positions are safe.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && (
        <div className="bg-warning/10 border border-warning/20 rounded p-3">
          <p className="text-sm text-warning">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button onClick={onGoBack} variant="outline" className="flex-1">
          Go Back
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsFallback = ({ onRetry, onGoBack, error }: FallbackProps) => (
  <Card className="w-full max-w-md mx-auto border-info/20">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <BarChart3 className="h-8 w-8 text-info" />
      </div>
      <CardTitle className="text-info">Analytics Loading Failed</CardTitle>
      <CardDescription>
        Unable to load portfolio analytics at the moment.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && (
        <div className="bg-info/10 border border-info/20 rounded p-3">
          <p className="text-sm text-info">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload Data
        </Button>
        <Button onClick={onGoBack} variant="outline" className="flex-1">
          Go Back
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const GovernanceFallback = ({ onRetry, onGoBack, error }: FallbackProps) => (
  <Card className="w-full max-w-md mx-auto border-secondary/20">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <Settings className="h-8 w-8 text-secondary" />
      </div>
      <CardTitle className="text-secondary">Governance Unavailable</CardTitle>
      <CardDescription>
        The governance interface is temporarily unavailable.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && (
        <div className="bg-secondary/10 border border-secondary/20 rounded p-3">
          <p className="text-sm text-secondary">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button onClick={onGoBack} variant="outline" className="flex-1">
          Go Back
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const WalletFallback = ({ onRetry, onGoBack, error }: FallbackProps) => (
  <Card className="w-full max-w-md mx-auto border-destructive/20">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <Wallet className="h-8 w-8 text-destructive" />
      </div>
      <CardTitle className="text-destructive">Wallet Connection Issue</CardTitle>
      <CardDescription>
        Unable to connect to your wallet. Please check your connection.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reconnect
        </Button>
        <Button onClick={onGoBack} variant="outline" className="flex-1">
          Go Back
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const GenericFallback = ({ onRetry, onGoBack, error }: FallbackProps) => (
  <Card className="w-full max-w-md mx-auto">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      </div>
      <CardTitle>Something went wrong</CardTitle>
      <CardDescription>
        An unexpected error occurred. Please try again.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && (
        <div className="bg-muted border rounded p-3">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button onClick={onGoBack} variant="outline" className="flex-1">
          Go Back
        </Button>
      </div>
    </CardContent>
  </Card>
);