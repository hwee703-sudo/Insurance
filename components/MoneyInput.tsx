import React, { useState, useEffect } from 'react';

interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({ label, value, onChange, placeholder = "0" }) => {
  // Use local state to handle the input display string.
  // This allows the user to type "10." without it being forced back to "10" immediately by the parent state.
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : value.toString());

  // Sync local state if the parent value changes externally (e.g., Reset button)
  useEffect(() => {
    const parsedLocal = parseFloat(displayValue);
    const effectiveLocal = isNaN(parsedLocal) ? 0 : parsedLocal;

    // Only update local state if the numeric value actually changed from the outside.
    // This prevents cursor jumping or formatting issues while the user is typing.
    if (value !== effectiveLocal) {
      setDisplayValue(value === 0 ? '' : value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Regex Explanation:
    // ^      : Start of string
    // \d*    : Zero or more digits
    // \.?    : Optional single decimal point
    // \d*    : Zero or more digits
    // $      : End of string
    // This strictly matches only "123", "123.45", ".45", or empty string.
    const isValidNumber = /^\d*\.?\d*$/.test(inputValue);

    if (isValidNumber) {
      setDisplayValue(inputValue);
      
      // Update parent state
      if (inputValue === '' || inputValue === '.') {
        onChange(0);
      } else {
        onChange(parseFloat(inputValue));
      }
    }
    // If not valid (e.g., user typed 'a' or a second '.'), 
    // we simply ignore the event, so the invalid character never appears.
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <div className="relative rounded-xl shadow-sm group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-slate-400 font-medium">RM</span>
        </div>
        <input
          type="text" 
          inputMode="decimal"
          className="block w-full rounded-xl border-slate-200 bg-white/50 pl-12 py-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 sm:text-base font-medium shadow-sm"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};