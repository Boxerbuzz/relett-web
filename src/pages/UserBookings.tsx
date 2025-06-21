
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Eye, Home, Hotel, ShoppingCart } from 'lucide-react';

interface BookingItem {
  id: string;
  property_id: string;
  status: string;
  created_at: string;
  property?: {
    title: string;
    location: any;
    property_images: Array<{ url: string; is_primary: boolean }>;
  };
}

interface Inspection extends BookingItem {
  mode: string;
  when: string;
  notes?: string;
}

interface Rental extends BookingItem {
  payment_plan: string;
  move_in_date: string;
  message?: string;
  payment_status: string;
}

interface Reservation extends BookingItem {
  from_date: string;
  to_date: string;
  adults: number;
  children?: number;
  infants?: number;
  nights?: number;
  total?: number;
}

export default function UserBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);

      // Fetch inspections
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('inspections')
        .select(`
          *,
          properties (
            title,
            location,
            property_images (url, is_primary)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (inspectionsError) throw inspectionsError;

      // Fetch rentals
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          *,
          properties (
            title,
            location,
            property_images (url, is_primary)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (rentalsError) throw rentalsError;

      // Fetch reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          properties (
            title,
            location,
            property_images (url, is_primary)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (reservationsError) throw reservationsError;

      setInspections(inspectionsData || []);
      setRentals(rentalsData || []);
      setReservations(reservationsData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const getPropertyImage = (property: any) => {
    const primaryImage = property?.property_images?.find((img: any) => img.is_primary);
    return primaryImage?.url || property?.property_images?.[0]?.url || '/placeholder.svg';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings & Requests</h1>
        <p className="text-gray-600">Manage all your property-related requests and bookings</p>
      </div>

      <Tabs defaultValue="inspections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Inspections ({inspections.length})
          </TabsTrigger>
          <TabsTrigger value="rentals" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Rentals ({rentals.length})
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            Reservations ({reservations.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Purchases (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          {inspections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspections yet</h3>
                <p className="text-gray-600 text-center">
                  You haven't requested any property inspections yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            inspections.map((inspection) => (
              <Card key={inspection.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={getPropertyImage(inspection.property)}
                      alt={inspection.property?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {inspection.property?.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {inspection.property?.location?.address || 'Location not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateTime(inspection.when)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {inspection.mode}
                            </div>
                          </div>
                          {inspection.notes && (
                            <p className="text-sm text-gray-600 mt-2">{inspection.notes}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rentals" className="space-y-4">
          {rentals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No rental requests</h3>
                <p className="text-gray-600 text-center">
                  You haven't submitted any rental requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            rentals.map((rental) => (
              <Card key={rental.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={getPropertyImage(rental.property)}
                      alt={rental.property?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {rental.property?.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {rental.property?.location?.address || 'Location not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Payment: {rental.payment_plan}</span>
                            <span>Move-in: {formatDate(rental.move_in_date)}</span>
                          </div>
                          {rental.message && (
                            <p className="text-sm text-gray-600 mt-2">{rental.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(rental.status)}>
                            {rental.status}
                          </Badge>
                          <Badge className={getStatusColor(rental.payment_status)}>
                            {rental.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Hotel className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations</h3>
                <p className="text-gray-600 text-center">
                  You haven't made any property reservations yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={getPropertyImage(reservation.property)}
                      alt={reservation.property?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {reservation.property?.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {reservation.property?.location?.address || 'Location not specified'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <span>Check-in: {formatDate(reservation.from_date)}</span>
                            <span>Check-out: {formatDate(reservation.to_date)}</span>
                            <span>Guests: {reservation.adults} adults{reservation.children ? `, ${reservation.children} children` : ''}</span>
                            <span>Nights: {reservation.nights || 0}</span>
                          </div>
                          {reservation.total && (
                            <p className="text-lg font-semibold text-primary mt-2">
                              Total: ₦{reservation.total.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase history coming soon</h3>
              <p className="text-gray-600 text-center">
                Property purchase tracking will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
