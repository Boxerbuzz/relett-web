
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TokenStatusBadge } from "./TokenStatusBadge";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { supabase } from "@/integrations/supabase/client";
import {
  CoinsIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollar,
  TrendUp,
  CheckCircle,
  XCircle,
  Clock
} from "@phosphor-icons/react";

interface TokenDetailsReviewProps {
  tokenId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged: () => void;
}

export function TokenDetailsReview({
  tokenId,
  open,
  onOpenChange,
  onStatusChanged,
}: TokenDetailsReviewProps) {
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const { approveToken, rejectToken, requestChanges, isLoading } = useTokenApproval();

  useEffect(() => {
    if (open && tokenId) {
      fetchTokenDetails();
    }
  }, [open, tokenId]);

  const fetchTokenDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select(`
          *,
          properties (
            id,
            title,
            description,
            location,
            property_images (url, is_primary)
          ),
          land_titles (
            title_number,
            location_address,
            area_sqm,
            land_use
          )
        `)
        .eq('id', tokenId)
        .single();

      if (error) throw error;
      setTokenDetails(data);
    } catch (error) {
      console.error('Error fetching token details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const success = await approveToken(tokenId, adminNotes);
    if (success) {
      onStatusChanged();
      onOpenChange(false);
      setAdminNotes('');
    }
  };

  const handleReject = async () => {
    const success = await rejectToken(tokenId, adminNotes);
    if (success) {
      onStatusChanged();
      onOpenChange(false);
      setAdminNotes('');
    }
  };

  const handleRequestChanges = async () => {
    const success = await requestChanges(tokenId, adminNotes);
    if (success) {
      onStatusChanged();
      onOpenChange(false);
      setAdminNotes('');
    }
  };

  const getPrimaryImage = () => {
    const images = tokenDetails?.properties?.property_images || [];
    return images.find((img: any) => img.is_primary)?.url || 
           images[0]?.url || 
           "/placeholder.svg";
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!tokenDetails) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Token Review: {tokenDetails.token_name}</DialogTitle>
            <TokenStatusBadge status={tokenDetails.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={getPrimaryImage()}
                    alt={tokenDetails.token_name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Property Title</p>
                    <p className="text-gray-600">
                      {tokenDetails.properties?.title || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">
                      {tokenDetails.land_titles?.location_address || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Area</p>
                    <p className="text-gray-600">
                      {tokenDetails.land_titles?.area_sqm 
                        ? `${tokenDetails.land_titles.area_sqm} sqm` 
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Land Use</p>
                    <p className="text-gray-600">
                      {tokenDetails.land_titles?.land_use || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CoinsIcon className="w-5 h-5" />
                Token Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Token Symbol</p>
                  <p className="font-semibold">{tokenDetails.token_symbol}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Supply</p>
                  <p className="font-semibold">{tokenDetails.total_supply} tokens</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Token Price</p>
                  <p className="font-semibold">${tokenDetails.token_price}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="font-semibold">${tokenDetails.total_value_usd.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Min Investment</p>
                  <p className="font-semibold">${tokenDetails.minimum_investment}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Expected ROI</p>
                  <p className="font-semibold text-green-600">{tokenDetails.expected_roi}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Lock Period</p>
                  <p className="font-semibold">{tokenDetails.lock_up_period_months} months</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Dividends</p>
                  <p className="font-semibold">{tokenDetails.revenue_distribution_frequency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Review Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add your review notes here..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleRequestChanges}
              disabled={isLoading}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Clock className="w-4 h-4 mr-2" />
              Request Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Token
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
