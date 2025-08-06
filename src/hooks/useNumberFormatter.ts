import { useMemo, useState } from "react";

export const useFormattedNumber = (initialValue = "") => {
  const [rawValue, setRawValue] = useState(initialValue);

  const formattedValue = useMemo(() => {
    if (!rawValue) return "";
    return rawValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [rawValue]);

  const setValue = (value: string) => {
    const numericValue = value.replace(/,/g, "");
    if (/^\d*$/.test(numericValue)) {
      setRawValue(numericValue);
    }
  };

  return { formattedValue, rawValue, setValue };
};
