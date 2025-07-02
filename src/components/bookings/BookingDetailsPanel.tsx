
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, User, Phone, Mail, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { RentalDetailsContent } from './RentalDetailsContent';
import { ReservationDetailsContent } from './ReservationDetailsContent';
import { InspectionDetailsContent } from './InspectionDetailsContent';

export type BookingType = 'rental' | 'reservation' | 'inspection';

interface BookingDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: BookingType;
  bookingData: any;
  onStatusUpdate?: (id: string, status: string) => void;
}

export function BookingDetailsPanel({
  isOpen,
  onClose,
  bookingType,
  bookingData,
  onStatusUpdate
}: BookingDetailsPanelProps) {
  const { user } = useAuth();
  if (!bookingData) return null;

  // Determine if current user is the agent or customer
  const isAgent = user?.id === bookingData.agent_id;
  const isCustomer = user?.id === bookingData.user_id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'rejected': case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPropertyImage = () => {
    const primaryImage = bookingData.property?.property_images?.find((img: any) => img.is_primary);
    return primaryImage?.url || bookingData.property?.property_images?.[0]?.url || '/placeholder.svg';
  };

  const renderContent = () => {
    switch (bookingType) {
      case 'rental':
        return (
          <RentalDetailsContent 
            rental={bookingData} 
            onStatusUpdate={onStatusUpdate}
          />
        );
      case 'reservation':
        return (
          <ReservationDetailsContent 
            reservation={bookingData} 
            onStatusUpdate={onStatusUpdate}
          />
        );
      case 'inspection':
        return (
          <InspectionDetailsContent 
            inspection={bookingData} 
            onStatusUpdate={onStatusUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold">
                {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Details
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(bookingData.status)}>
                  {bookingData.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {formatDate(bookingData.created_at)}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Property Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={getPropertyImage()}
                  alt={bookingData.property?.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {bookingData.property?.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {bookingData.property?.location?.address || 'Location not specified'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {bookingData.id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information - Show agent info to customer, customer info to agent */}
          {isAgent && bookingData.user && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {bookingData.user.first_name} {bookingData.user.last_name}
                  </span>
                </div>
                {bookingData.user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bookingData.user.email}</span>
                  </div>
                )}
                {bookingData.user.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bookingData.user.phone_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isCustomer && bookingData.agent && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {bookingData.agent.first_name} {bookingData.agent.last_name}
                  </span>
                </div>
                {bookingData.agent.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bookingData.agent.email}</span>
                  </div>
                )}
                {bookingData.agent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bookingData.agent.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </SheetHeader>

        <div className="mt-6">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
