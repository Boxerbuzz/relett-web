import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { BinocularsIcon, CalendarBlankIcon } from "@phosphor-icons/react";

interface ActiveBookingsSidebarProps {
  activeRentals: any[];
  activeReservations: any[];
  activeInspections: any[];
  onBookingClick: (
    type: "rental" | "reservation" | "inspection",
    booking: any
  ) => void;
}

export function ActiveBookingsSidebar({
  activeRentals,
  activeReservations,
  activeInspections,
  onBookingClick,
}: ActiveBookingsSidebarProps) {
  if (
    activeRentals.length === 0 &&
    activeReservations.length === 0 &&
    activeInspections.length === 0
  ) {
    return null;
  }
  return (
    <div className="space-y-2">
      <div className="font-semibold text-base mb-1">Your Active Bookings</div>
      {activeRentals.map((rental) => (
        <div
          key={rental.id}
          className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
          onClick={() => onBookingClick("rental", rental)}
        >
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <svg
              width="18"
              height="18"
              fill="currentColor"
              className="text-primary"
            >
              <use href="#icon-house" />
            </svg>
          </span>
          <div>
            <span className="text-sm font-medium">Rental</span>
            <BookingStatusBadge status={rental.status} size="sm" />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {rental.move_in_date ? formatDate(rental.move_in_date) : "-"}
          </span>
        </div>
      ))}
      {activeReservations.map((reservation) => (
        <div
          key={reservation.id}
          className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
          onClick={() => onBookingClick("reservation", reservation)}
        >
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <CalendarBlankIcon size={24} />
          </span>
          <div>
            <span className="text-sm font-medium">Reservation</span>
            <BookingStatusBadge status={reservation.status} size="sm" />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {reservation.from_date ? formatDate(reservation.from_date) : "-"}
          </span>
        </div>
      ))}
      {activeInspections.map((inspection) => (
        <div
          key={inspection.id}
          className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
          onClick={() => onBookingClick("inspection", inspection)}
        >
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <BinocularsIcon size={24} />
          </span>
          <div>
            <span className="text-sm font-medium">Inspection</span>
            <BookingStatusBadge status={inspection.status} size="sm" />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {inspection.when ? formatDateTime(inspection.when) : "-"}
          </span>
        </div>
      ))}
    </div>
  );
}
