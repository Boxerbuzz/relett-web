import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface CounterInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  [key: string]: any;
}

export default function CounterInput({
  value = 0,
  onChange,
  min = 0,
  max = 50,
  placeholder = "0",
  ...props
}: CounterInputProps) {
  const [displayValue, setDisplayValue] = useState(value?.toString() || "");

  // Update display value when form value changes
  useEffect(() => {
    setDisplayValue(value?.toString() || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Only allow numbers
    const numericValue = inputValue.replace(/[^\d]/g, "");

    if (numericValue === "") {
      onChange(undefined);
      return;
    }

    const parsedValue = parseInt(numericValue);
    if (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max) {
      onChange(parsedValue);
    }
  };

  const handleIncrement = () => {
    const newValue = (value || 0) + 1;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = (value || 0) - 1;
    if (newValue >= min) {
      onChange(newValue === 0 ? undefined : newValue);
    }
  };

  const handleBlur = () => {
    if (value && value > 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue("");
    }
  };

  return (
    <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-1">
      <div className="flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="text-center border-0 ring-0 focus:ring-0 focus:border-0 shadow-none"
          {...props}
        />
      </div>
      <div className="flex items-center space-x-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={(value || 0) <= min}
          className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 hover:text-white"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={(value || 0) >= max}
          className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 hover:text-white"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
