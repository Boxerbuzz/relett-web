"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Datepicker from "react-tailwindcss-datepicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RangeDatePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function RangeDatePicker({
  dateRange,
  onDateRangeChange,
  disabled,
  placeholder = "Pick your dates",
  isLoading = false,
  className,
}: RangeDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
          disabled={isLoading}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 min-w-[600px]" align="start">
        <div className="p-3">
          <Datepicker
            value={
              dateRange?.from && dateRange?.to
                ? {
                    startDate: dateRange.from,
                    endDate: dateRange.to,
                  }
                : null
            }
            onChange={(newValue) => {
              onDateRangeChange(
                newValue?.startDate && newValue?.endDate
                  ? {
                      from: new Date(newValue.startDate),
                      to: new Date(newValue.endDate),
                    }
                  : undefined
              );
            }}
            useRange={true}
            asSingle={false}
            displayFormat="MMM DD, YYYY"
            showShortcuts={false}
            showFooter={false}
            primaryColor="blue"
            configs={{
              shortcuts: {},
            }}
            classNames={{
              container: () => "relative",
              input: () => "hidden",
              toggleButton: () => "hidden",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}