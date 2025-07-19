import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  EyeIcon,
  HouseIcon,
  BuildingsIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookingDetails,
  BookingType,
} from "@/components/bookings/BookingDetails";
import { BookingCard } from "@/components/bookings/BookingCard";
import {
  useUserInspections,
  useUserRentals,
  useUserReservations,
  useUpdateBookingStatus,
} from "@/hooks/useUserBookings";

export default function UserBookings() {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedBookingType, setSelectedBookingType] =
    useState<BookingType>("inspection");

  // Data hooks
  const {
    data: inspections = [],
    isLoading: inspectionsLoading,
    error: _,
  } = useUserInspections(user?.id || "");

  const {
    data: rentals = [],
    isLoading: rentalsLoading,
    error: __,
  } = useUserRentals(user?.id || "");

  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    error: ___,
  } = useUserReservations(user?.id || "");

  const updateStatusMutation = useUpdateBookingStatus();

  const handleBookingClick = (booking: any, type: BookingType) => {
    const userMetadata = (user as any)?.user_metadata || {};
    const bookingWithUser = {
      ...booking,
      user: {
        first_name: userMetadata.first_name || user?.email?.split("@")[0] || "",
        last_name: userMetadata.last_name || "",
        email: user?.email || "",
        phone_number: userMetadata.phone_number || "",
      },
    };
    setSelectedBooking(bookingWithUser);
    setSelectedBookingType(type);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        status,
        type: selectedBookingType,
      });
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const BookingSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, title, description }: any) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-center">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Bookings & Requests
        </h1>
        <p className="text-gray-600">
          Manage all your property-related requests and bookings
        </p>
      </div>

      <Tabs defaultValue="inspections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto gap-1">
          <TabsTrigger
            value="inspections"
            className="flex items-center gap-2 py-2"
          >
            <EyeIcon size={20} className="w-5 h-5" />
            <span className="text-xs hidden sm:inline">
              Inspections ({inspections.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="rentals"
            className="flex items-center gap-2 py-2"
          >
            <HouseIcon className="w-5 h-5" />
            <span className="text-xs hidden sm:inline">
              Rentals ({rentals.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="reservations"
            className="flex items-center gap-2 py-2"
          >
            <BuildingsIcon className="w-5 h-5" />
            <span className="text-xs hidden sm:inline">
              Reservations ({reservations.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="flex items-center gap-2 py-2"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="text-xs hidden sm:inline">Purchases (0)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          {inspectionsLoading ? (
            <div className="gap-4">
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
            </div>
          ) : inspections.length === 0 ? (
            <EmptyState
              icon={EyeIcon}
              title="No inspections yet"
              description="You haven't requested any property inspections yet."
            />
          ) : (
            inspections.map((inspection) => (
              <BookingCard
                key={inspection.id}
                booking={inspection}
                type="inspection"
                onViewDetails={handleBookingClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rentals" className="space-y-4">
          {rentalsLoading ? (
            <div className="gap-4">
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
            </div>
          ) : rentals.length === 0 ? (
            <EmptyState
              icon={HouseIcon}
              title="No rental requests"
              description="You haven't submitted any rental requests yet."
            />
          ) : (
            rentals.map((rental) => (
              <BookingCard
                key={rental.id}
                booking={rental}
                type="rental"
                onViewDetails={handleBookingClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          {reservationsLoading ? (
            <div className="gap-4">
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
            </div>
          ) : reservations.length === 0 ? (
            <EmptyState
              icon={BuildingsIcon}
              title="No reservations"
              description="You haven't made any property reservations yet."
            />
          ) : (
            reservations.map((reservation) => (
              <BookingCard
                key={reservation.id}
                booking={reservation}
                type="reservation"
                onViewDetails={handleBookingClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <EmptyState
            icon={ShoppingCartIcon}
            title="Purchase history coming soon"
            description="Property purchase tracking will be available in future updates."
          />
        </TabsContent>
      </Tabs>

      <BookingDetails
        isOpen={!!selectedBooking}
        onClose={handleCloseDetails}
        bookingType={selectedBookingType}
        bookingData={selectedBooking}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
