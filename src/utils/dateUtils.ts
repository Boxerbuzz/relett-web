
import { format, isWithinInterval, parseISO, eachDayOfInterval } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface BookedDateRange {
  from_date: string;
  to_date: string;
  id: string;
}

/**
 * Generate all dates within booked date ranges to disable in calendar
 */
export function generateDisabledDates(bookedRanges: BookedDateRange[]): Date[] {
  const disabledDates: Date[] = [];

  bookedRanges.forEach((range) => {
    try {
      const fromDate = parseISO(range.from_date);
      const toDate = parseISO(range.to_date);
      
      // Generate all dates in the range (inclusive)
      const datesInRange = eachDayOfInterval({
        start: fromDate,
        end: toDate,
      });
      
      disabledDates.push(...datesInRange);
    } catch (error) {
      console.error("Error parsing date range:", range, error);
    }
  });

  return disabledDates;
}

/**
 * Check if a selected date range conflicts with existing bookings
 */
export function checkDateAvailability(
  selectedRange: DateRange,
  bookedRanges: BookedDateRange[]
): { isAvailable: boolean; conflictingBooking?: BookedDateRange } {
  for (const booking of bookedRanges) {
    try {
      const bookingStart = parseISO(booking.from_date);
      const bookingEnd = parseISO(booking.to_date);

      // Check if any part of the selected range overlaps with existing booking
      const selectedStart = selectedRange.from;
      const selectedEnd = selectedRange.to;

      // Check for overlap: selected range intersects with booked range
      const overlaps = 
        (selectedStart <= bookingEnd && selectedEnd >= bookingStart);

      if (overlaps) {
        return {
          isAvailable: false,
          conflictingBooking: booking,
        };
      }
    } catch (error) {
      console.error("Error checking date availability:", booking, error);
    }
  }

  return { isAvailable: true };
}

/**
 * Format date range for display
 */
export function formatDateRange(from: Date, to: Date): string {
  return `${format(from, "MMM dd")} - ${format(to, "MMM dd, yyyy")}`;
}
