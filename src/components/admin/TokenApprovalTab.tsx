import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TokenStatusBadge } from "./TokenStatusBadge";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { 
  BuildingsIcon, 
  UserIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  SpinnerIcon 
} from "@phosphor-icons/react";

export function TokenApprovalTab() {
  const [processingTokens, setProcessingTokens] = useState<Set<string>>(new Set());
  const [pendingTokens, setPendingTokens] = useState<any[]>([]);
  const { toast } = useToast();
  const { fetchPendingApprovals, approveToken, rejectToken, isLoading } = useTokenApproval();

  useEffect(() => {
    loadPendingTokens();
  }, []);

  const loadPendingTokens = async () => {
    try {
      const tokens = await fetchPendingApprovals();
      setPendingTokens(tokens);
    } catch (error) {
      console.error('Failed to load pending tokens:', error);
    }
  };

  const handleApproveToken = async (tokenId: string) => {
    setProcessingTokens(prev => new Set(prev).add(tokenId));
    
    try {
      const success = await approveToken(tokenId);
      if (success) {
        toast({
          title: "Success",
          description: "Token approved successfully",
        });
        await loadPendingTokens(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve token",
        variant: "destructive",
      });
    } finally {
      setProcessingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(tokenId);
        return newSet;
      });
    }
  };

  const handleRejectToken = async (tokenId: string) => {
    setProcessingTokens(prev => new Set(prev).add(tokenId));
    
    try {
      const success = await rejectToken(tokenId);
      if (success) {
        toast({
          title: "Success",
          description: "Token rejected and returned to draft status",
        });
        await loadPendingTokens(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to reject token",
        variant: "destructive",
      });
    } finally {
      setProcessingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(tokenId);
        return newSet;
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Token Approval Management</h2>
        <p className="text-muted-foreground">
          Review and approve property tokenization requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTokens.filter(t => t.status === 'pending_approval').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Draft Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTokens.filter(t => t.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTokens.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tokens List */}
      {pendingTokens.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No tokens pending approval</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingTokens.map((token) => (
            <Card key={token.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{token.token_name}</h3>
                      <Badge variant="outline">{token.token_symbol}</Badge>
                      <TokenStatusBadge status={token.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <BuildingsIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{token.property_title || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{token.owner_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(token.total_value_usd)} • {parseInt(token.total_supply).toLocaleString()} tokens</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Submitted {formatDate(token.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={() => handleApproveToken(token.id)}
                      disabled={processingTokens.has(token.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingTokens.has(token.id) ? (
                        <SpinnerIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectToken(token.id)}
                      disabled={processingTokens.has(token.id)}
                    >
                      {processingTokens.has(token.id) ? (
                        <SpinnerIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}