import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";
import { useState, useEffect } from "react";

// Custom Currency Input Component
function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  min = 0,
  max = 1000000000,
  ...props
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  [key: string]: any;
}) {
  const [displayValue, setDisplayValue] = useState("");

  // Update display value when form value changes
  useEffect(() => {
    if (value && value > 0) {
      setDisplayValue(formatNumber(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Remove all non-digit characters except decimal point
    const numericValue = inputValue.replace(/[^\d.]/g, "");

    if (numericValue === "" || numericValue === ".") {
      onChange(undefined);
      return;
    }

    const parsedValue = parseFloat(numericValue);
    if (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max) {
      onChange(parsedValue);
    }
  };

  const handleBlur = () => {
    if (value && value > 0) {
      setDisplayValue(formatNumber(value));
    }
  };

  const handleFocus = () => {
    if (value && value > 0) {
      setDisplayValue(value.toString());
    }
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...props}
    />
  );
}

export default CurrencyInput;
