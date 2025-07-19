import type {
  Inspection,
  Rental,
  Reservation,
  PropertyItem,
} from "@/hooks/useUserBookings";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  HouseIcon,
  BuildingsIcon,
  UsersIcon,
  MoonIcon,
} from "@phosphor-icons/react";
import { BookingType } from "./BookingDetails";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils";

type BookingCardProps = {
  booking: Inspection | Rental | Reservation;
  type: "inspection" | "rental" | "reservation";
  onViewDetails: (
    b: Inspection | Rental | Reservation,
    t: "inspection" | "rental" | "reservation"
  ) => void;
};

export function BookingCard(props: BookingCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inspection":
        return <EyeIcon className="w-4 h-4" />;
      case "rental":
        return <HouseIcon className="w-4 h-4" />;
      case "reservation":
        return <BuildingsIcon className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getPropertyImage = (property: PropertyItem | null) => {
    const primaryImage = property?.property_images?.find(
      (img: any) => img.is_primary
    );
    return primaryImage?.url || property?.backdrop || "/placeholder.svg";
  };

  const getLocation = (location: any) => {
    if (!location) return "Location not specified";
    return `${location.city}, ${location.state}`;
  };

  function renderBookingDetails(
    booking: Inspection | Rental | Reservation,
    type: BookingType
  ) {
    switch (type) {
      case "inspection":
        return (
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-700">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {formatDateTime((booking as Inspection).when || "")}
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {(booking as Inspection).mode}
            </div>
          </div>
        );
      case "rental":
        return (
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-700">
            <span>Payment: {(booking as Rental).payment_plan}</span>
            <span>
              Move-in: {formatDate((booking as Rental).move_in_date || "")}
            </span>
          </div>
        );
      case "reservation":
        return (
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
            <span className="flex gap-x-1">
              <div className="flex gap-x-1">
                <CalendarIcon />
              </div>
              {formatDate((booking as Reservation).from_date || "")}
            </span>
            <span className="flex gap-x-1">
              <div className="flex gap-x-1">
                <CalendarIcon />
              </div>
              {formatDate((booking as Reservation).to_date || "")}
            </span>
            <span className="flex gap-x-1">
              <UsersIcon />
              {(booking as Reservation).adults} Adults
              {(booking as Reservation).children
                ? `, ${(booking as Reservation).children} children`
                : ""}
            </span>
            <span className="flex gap-x-1">
              <div className="flex gap-x-1">
                <MoonIcon />
              </div>
              {(booking as Reservation).nights || 0} nights
            </span>
          </div>
        );
      default:
        return null;
    }
  }

  const getNotes = (
    booking: Inspection | Rental | Reservation,
    type: BookingType
  ) => {
    if (type === "inspection") return (booking as Inspection).notes;
    if (type === "rental") return (booking as Rental).message;
    if (type === "reservation") return (booking as Reservation).note;
    return null;
  };

  // Card body click handler
  const handleCardClick = () => {
    props.onViewDetails(props.booking, props.type);
  };

  // Responsive horizontal card
  return (
    <div
      className="rounded-xl overflow-hidden shadow-md cursor-pointer group flex flex-col sm:flex-row bg-white"
      onClick={handleCardClick}
    >
      {/* Image section */}
      <div className="flex-shrink-0 w-full sm:w-48 h-40 sm:h-auto relative rounded-medium p-3 sm:p-4">
        <img
          src={getPropertyImage(props.booking.property || null)}
          alt={props.booking.property?.title}
          className="object-cover w-full h-full rounded-md"
        />
        <span className="absolute top-5 left-5 bg-white/80 rounded-full p-1 shadow-sm">
          {getTypeIcon(props.type)}
        </span>
      </div>
      {/* Details section */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {props.booking.property?.title}
          </h3>
          <div className="flex items-center text-gray-500 mb-2">
            <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {getLocation(props.booking.property?.location)}
            </span>
          </div>
          {renderBookingDetails(props.booking, props.type)}
          {getNotes(props.booking, props.type) && (
            <p className="text-xs sm:text-sm text-gray-700 mt-2 line-clamp-2">
              {getNotes(props.booking, props.type)}
            </p>
          )}
          {props.type === "reservation" &&
            (props.booking as Reservation).total && (
              <p className="text-base sm:text-lg font-semibold text-primary mt-2">
                ₦{(props.booking as Reservation).total?.toLocaleString()}
              </p>
            )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <BookingStatusBadge status={props.booking.status} />
          {props.type === "rental" &&
            (props.booking as Rental).payment_status && (
              <span className={`px-2 py-1 rounded text-xs font-medium`}>
                {(props.booking as Rental).payment_status}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
