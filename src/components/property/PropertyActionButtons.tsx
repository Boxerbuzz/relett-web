
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  Heart,
  ShareNetwork,
  Calendar,
  House,
  Eye,
  CurrencyDollar
} from '@phosphor-icons/react';

interface PropertyActionButtonsProps {
  property: {
    id: string;
    title?: string;
    user_id: string;
    is_tokenized?: boolean;
    tokenized_property_id?: string;
    price?: any;
  };
  onInvestClick?: () => void;
}

export function PropertyActionButtons({ property, onInvestClick }: PropertyActionButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRequestInspection = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to request an inspection',
        variant: 'destructive'
      });
      return;
    }

    setLoading('inspection');
    try {
      const { error } = await supabase
        .from('inspections')
        .insert({
          property_id: property.id,
          user_id: user.id,
          agent_id: property.user_id, // Property owner as default agent
          status: 'pending',
          mode: 'physical',
          notes: 'Inspection requested from property details'
        });

      if (error) throw error;

      toast({
        title: 'Inspection Requested',
        description: 'Your inspection request has been submitted successfully'
      });
    } catch (error) {
      console.error('Error requesting inspection:', error);
      toast({
        title: 'Error',
        description: 'Failed to request inspection. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRequestRental = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to request a rental',
        variant: 'destructive'
      });
      return;
    }

    setLoading('rental');
    try {
      const { error } = await supabase
        .from('rentals')
        .insert({
          property_id: property.id,
          user_id: user.id,
          agent_id: property.user_id,
          status: 'pending',
          payment_plan: 'monthly',
          payment_status: 'pending',
          message: 'Rental request from property details'
        });

      if (error) throw error;

      toast({
        title: 'Rental Request Submitted',
        description: 'Your rental request has been submitted successfully'
      });
    } catch (error) {
      console.error('Error requesting rental:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rental request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMakeReservation = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make a reservation',
        variant: 'destructive'
      });
      return;
    }

    setLoading('reservation');
    try {
      const { error } = await supabase
        .from('reservations')
        .insert({
          property_id: property.id,
          user_id: user.id,
          agent_id: property.user_id,
          status: 'pending',
          adults: 2,
          children: 0,
          infants: 0,
          nights: 1,
          note: 'Reservation made from property details'
        });

      if (error) throw error;

      toast({
        title: 'Reservation Submitted',
        description: 'Your reservation request has been submitted successfully'
      });
    } catch (error) {
      console.error('Error making reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to make reservation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save properties',
        variant: 'destructive'
      });
      return;
    }

    setLoading('favorite');
    try {
      const { error } = await supabase
        .from('property_favorites')
        .insert({
          property_id: property.id,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: 'Property Saved',
        description: 'Property added to your favorites'
      });
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: 'Error',
        description: 'Failed to save property. It may already be in your favorites.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title || 'Property on Relett',
          text: 'Check out this property on Relett',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Property link copied to clipboard'
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Investment Section */}
        {property.is_tokenized && property.tokenized_property_id && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Investment Opportunity</h3>
              <Badge className="bg-blue-500">Tokenized</Badge>
            </div>
            <Button 
              onClick={onInvestClick}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading === 'invest'}
            >
              <CurrencyDollar className="h-4 w-4 mr-2" />
              {loading === 'invest' ? 'Processing...' : 'Invest Now'}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleRequestInspection}
              disabled={loading === 'inspection'}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              {loading === 'inspection' ? 'Requesting...' : 'Request Inspection'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRequestRental}
              disabled={loading === 'rental'}
              className="w-full"
            >
              <House className="h-4 w-4 mr-2" />
              {loading === 'rental' ? 'Requesting...' : 'Request Rental'}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleMakeReservation}
            disabled={loading === 'reservation'}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {loading === 'reservation' ? 'Booking...' : 'Make Reservation'}
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            disabled={loading === 'favorite'}
            className="flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            {loading === 'favorite' ? 'Saving...' : 'Save'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <ShareNetwork className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
