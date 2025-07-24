"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Datepicker from "react-tailwindcss-datepicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SingleDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SingleDatePicker({
  date,
  onDateChange,
  disabled,
  placeholder = "Pick a date",
  isLoading = false,
  className,
}: SingleDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={isLoading}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Datepicker
            value={
              date
                ? {
                    startDate: date,
                    endDate: date,
                  }
                : null
            }
            onChange={(newValue) => {
              onDateChange(
                newValue?.startDate ? new Date(newValue.startDate) : undefined
              );
            }}
            asSingle={true}
            useRange={false}
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