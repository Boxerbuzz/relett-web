
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TokenStatusBadge } from "./TokenStatusBadge";
import { TokenDetailsReview } from "./TokenDetailsReview";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import {
  CoinsIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollar,
} from "@phosphor-icons/react";

interface PendingToken {
  id: string;
  token_name: string;
  token_symbol: string;
  total_value_usd: number;
  total_supply: string;
  status: string;
  created_at: string;
  property_title: string;
  property_location: any;
  owner_name: string;
  owner_email: string;
}

export function TokenApprovalManagement() {
  const [pendingTokens, setPendingTokens] = useState<PendingToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { fetchPendingApprovals } = useTokenApproval();

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const tokens = await fetchPendingApprovals();
      setPendingTokens(tokens);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewToken = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    setShowReviewDialog(true);
  };

  const handleStatusChanged = () => {
    loadPendingApprovals(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusCount = (status: string) => {
    return pendingTokens.filter(token => token.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">
              {getStatusCount('pending_approval')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount('pending_approval')}</div>
            <p className="text-xs text-muted-foreground">
              Tokens awaiting admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Tokens</CardTitle>
            <Badge className="bg-gray-100 text-gray-800">
              {getStatusCount('draft')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount('draft')}</div>
            <p className="text-xs text-muted-foreground">
              Tokens requiring changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">
              {pendingTokens.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTokens.length}</div>
            <p className="text-xs text-muted-foreground">
              All tokens in review process
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tokens Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CoinsIcon className="w-5 h-5" />
            Token Approval Queue
          </CardTitle>
          <CardDescription>
            Review and manage tokenization requests from property owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CoinsIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No tokens pending approval</p>
              <p className="text-sm">New tokenization requests will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token Details</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{token.token_name}</p>
                        <p className="text-sm text-gray-500">{token.token_symbol}</p>
                        <p className="text-sm text-gray-500">
                          {parseInt(token.total_supply).toLocaleString()} tokens
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {token.property_title || 'Property'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {typeof token.property_location === 'string' 
                            ? token.property_location 
                            : 'Location not specified'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{token.owner_name}</p>
                        <p className="text-sm text-gray-500">{token.owner_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CurrencyDollar className="w-4 h-4" />
                        <span className="font-medium">
                          {token.total_value_usd.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TokenStatusBadge status={token.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(token.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewToken(token.id)}
                        className="flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedTokenId && (
        <TokenDetailsReview
          tokenId={selectedTokenId}
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  );
}
