"use client";

import * as React from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | { from: Date; to: Date } | { from?: Date; to?: Date } | null;
  onSelect?: (value: any) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  numberOfMonths?: number;
  initialFocus?: boolean;
  autoFocus?: boolean;
  defaultMonth?: Date;
  modifiers?: any;
  modifiersStyles?: any;
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  numberOfMonths = 1,
  modifiers,
  modifiersStyles,
  ...props
}: CalendarProps) {
  const handleValueChange = (newValue: any) => {
    if (mode === "single") {
      onSelect?.(newValue?.startDate ? new Date(newValue.startDate) : null);
    } else {
      onSelect?.(
        newValue?.startDate && newValue?.endDate
          ? {
              from: new Date(newValue.startDate),
              to: new Date(newValue.endDate),
            }
          : null
      );
    }
  };

  const formatValue = () => {
    if (mode === "single") {
      return selected && selected instanceof Date
        ? {
            startDate: selected,
            endDate: selected,
          }
        : null;
    } else {
      const range = selected as { from?: Date; to?: Date } | null;
      return range?.from && range?.to
        ? {
            startDate: range.from,
            endDate: range.to,
          }
        : null;
    }
  };

  return (
    <div className={cn("pointer-events-auto", className)}>
      <Datepicker
        value={formatValue()}
        onChange={handleValueChange}
        useRange={mode === "range"}
        asSingle={mode === "single"}
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
        {...props}
      />
    </div>
  );
}

export { Calendar };
