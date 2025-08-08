
import { format, isWithinInterval, parseISO, eachDayOfInterval, startOfDay } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface BookedDateRange {
  from_date: string | null;
  to_date: string | null;
  id: string;
}

/**
 * Generate all dates within booked date ranges to disable in calendar
 */
export function generateDisabledDates(bookedRanges: BookedDateRange[]): Date[] {
  const disabledDates: Date[] = [];

  bookedRanges.forEach((range) => {
    try {
      // Skip ranges with null dates
      if (!range.from_date || !range.to_date) return;
      
      const fromDate = parseISO(range.from_date);
      const toDate = parseISO(range.to_date);
      
      // Generate all dates in the range (inclusive)
      const datesInRange = eachDayOfInterval({
        start: fromDate,
        end: toDate,
      });
      
      // Normalize all dates to start of day for consistent comparison
      const normalizedDates = datesInRange.map(date => startOfDay(date));
      
      disabledDates.push(...normalizedDates);
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
      // Skip bookings with null dates
      if (!booking.from_date || !booking.to_date) continue;
      
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

/**
 * Validate sale start date for token sales
 */
export function validateSaleStartDate(dateString: string): string | null {
  if (!dateString.trim()) {
    return "Sale start date is required";
  }

  try {
    const date = new Date(dateString);
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (isNaN(date.getTime())) {
      return "Invalid date format";
    }

    if (date < minDate) {
      return "Sale start date must be at least 24 hours from now";
    }

    return null;
  } catch {
    return "Invalid date format";
  }
}

/**
 * Validate sale end date for token sales
 */
export function validateSaleEndDate(startDateString: string, endDateString: string): string | null {
  if (!endDateString.trim()) {
    return "Sale end date is required";
  }

  if (!startDateString.trim()) {
    return "Please set a valid start date first";
  }

  try {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date format";
    }

    const minEndDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after start
    const maxEndDate = new Date(startDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years after start

    if (endDate <= startDate) {
      return "Sale end date must be after the start date";
    }

    if (endDate < minEndDate) {
      return "Sale end date must be at least 7 days after the start date";
    }

    if (endDate > maxEndDate) {
      return "Sale end date cannot be more than 2 years after the start date";
    }

    return null;
  } catch {
    return "Invalid date format";
  }
}

/**
 * Validate complete sale date range
 */
export function validateSaleDateRange(startDateString: string, endDateString: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const startError = validateSaleStartDate(startDateString);
  if (startError) errors.push(startError);
  
  const endError = validateSaleEndDate(startDateString, endDateString);
  if (endError) errors.push(endError);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get disabled dates for date picker (past dates and before minimum start date)
 */
export function getDisabledDatesForSaleStart(): (date: Date) => boolean {
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 24); // 24 hours from now
  
  return (date: Date) => {
    return date < startOfDay(minDate);
  };
}

/**
 * Get disabled dates for end date picker based on start date
 */
export function getDisabledDatesForSaleEnd(startDateString: string): (date: Date) => boolean {
  if (!startDateString) {
    return () => true; // Disable all dates if no start date
  }
  
  try {
    const startDate = new Date(startDateString);
    const minEndDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after start
    const maxEndDate = new Date(startDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years after start
    
    return (date: Date) => {
      return date < startOfDay(minEndDate) || date > startOfDay(maxEndDate);
    };
  } catch {
    return () => true; // Disable all dates if invalid start date
  }
}
