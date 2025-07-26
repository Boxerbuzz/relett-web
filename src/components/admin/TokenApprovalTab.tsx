import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TokenStatusBadge } from "./TokenStatusBadge";
import {
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";

export function TokenApprovalTab() {
  const [processingTokens, setProcessingTokens] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  // Mock data for now - replace with actual data fetching when backend is ready
  const pendingTokens = [
    {
      id: "1",
      name: "Victoria Island Property Token",
      symbol: "VIPT",
      value: 150000000,
      supply: 1000,
      status: "pending_approval",
      created_at: "2024-01-15T10:30:00Z",
      property: {
        title: "Luxury Apartment Complex - Victoria Island",
        location: "Victoria Island, Lagos",
      },
      owner: {
        name: "John Doe",
        email: "john@example.com",
      },
    },
    {
      id: "2",
      name: "Lekki Gardens Token",
      symbol: "LEGT",
      value: 85000000,
      supply: 500,
      status: "draft",
      created_at: "2024-01-14T14:20:00Z",
      property: {
        title: "Commercial Plaza - Lekki",
        location: "Lekki Phase 1, Lagos",
      },
      owner: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
    },
  ];

  const handleApproveToken = async (tokenId: string) => {
    setProcessingTokens((prev) => new Set(prev).add(tokenId));

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Token approved successfully",
      });
      setProcessingTokens((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tokenId);
        return newSet;
      });
    }, 1500);
  };

  const handleRejectToken = async (tokenId: string) => {
    setProcessingTokens((prev) => new Set(prev).add(tokenId));

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Token rejected and returned to draft status",
      });
      setProcessingTokens((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tokenId);
        return newSet;
      });
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                pendingTokens.filter((t) => t.status === "pending_approval")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Draft Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTokens.filter((t) => t.status === "draft").length}
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
                      <h3 className="text-lg font-semibold">{token.name}</h3>
                      <Badge variant="outline">{token.symbol}</Badge>
                      <TokenStatusBadge status={token.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {token.property?.title || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{token.owner?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatCurrency(token.value)} •{" "}
                          {token.supply.toLocaleString()} tokens
                        </span>
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
