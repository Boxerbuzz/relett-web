import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, TrendingUp } from 'lucide-react';
import { useSentryMonitoring } from '@/hooks/useSentryMonitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: 'trading' | 'governance' | 'analytics' | 'portfolio';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class TradingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Enhanced logging for trading context
    console.error(`Trading Error in ${this.props.context || 'unknown'} context:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context,
      timestamp: new Date().toISOString()
    });

    // Report to monitoring service with context
    if (typeof window !== 'undefined') {
      const monitoring = useSentryMonitoring();
      monitoring.captureError(error, {
        context: this.props.context || 'trading',
        componentStack: errorInfo.componentStack,
        boundary: 'TradingErrorBoundary'
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleGoToTrading = () => {
    window.location.href = '/trading';
  };

  getContextSpecificMessage() {
    const { context } = this.props;
    
    switch (context) {
      case 'trading':
        return {
          title: 'Trading System Error',
          description: 'There was an issue with the trading interface. Your funds and positions are safe.',
          icon: TrendingUp,
          actions: [
            { label: 'Retry Trading', onClick: this.handleReset, variant: 'default' as const },
            { label: 'Go to Dashboard', onClick: this.handleGoHome, variant: 'outline' as const }
          ]
        };
      case 'governance':
        return {
          title: 'Governance Error',
          description: 'There was an issue with the governance interface. Your voting rights are preserved.',
          icon: AlertTriangle,
          actions: [
            { label: 'Retry', onClick: this.handleReset, variant: 'default' as const },
            { label: 'View Portfolio', onClick: () => window.location.href = '/investment', variant: 'outline' as const }
          ]
        };
      case 'analytics':
        return {
          title: 'Analytics Error',
          description: 'There was an issue loading your analytics data.',
          icon: AlertTriangle,
          actions: [
            { label: 'Refresh Analytics', onClick: this.handleReset, variant: 'default' as const },
            { label: 'Go to Trading', onClick: this.handleGoToTrading, variant: 'outline' as const }
          ]
        };
      case 'portfolio':
        return {
          title: 'Portfolio Error',
          description: 'There was an issue loading your portfolio data.',
          icon: AlertTriangle,
          actions: [
            { label: 'Refresh Portfolio', onClick: this.handleReset, variant: 'default' as const },
            { label: 'Go Home', onClick: this.handleGoHome, variant: 'outline' as const }
          ]
        };
      default:
        return {
          title: 'Application Error',
          description: 'Something unexpected happened. Please try again.',
          icon: AlertTriangle,
          actions: [
            { label: 'Try Again', onClick: this.handleReset, variant: 'default' as const },
            { label: 'Go Home', onClick: this.handleGoHome, variant: 'outline' as const }
          ]
        };
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const contextInfo = this.getContextSpecificMessage();
      const IconComponent = contextInfo.icon;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md border-destructive/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <IconComponent className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">{contextInfo.title}</CardTitle>
              <CardDescription>
                {contextInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                  <p className="text-sm font-medium text-destructive mb-2">Error Details:</p>
                  <p className="text-xs text-destructive/80 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-destructive/80 cursor-pointer">Component Stack</summary>
                      <pre className="text-xs text-destructive/80 mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {contextInfo.actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant}
                    className="flex-1"
                  >
                    {index === 0 && <RefreshCw className="h-4 w-4 mr-2" />}
                    {index === 1 && <Home className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}