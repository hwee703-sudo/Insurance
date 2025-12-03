import React from 'react';

interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({ label, value, onChange, placeholder = "0" }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty string to let user clear input, otherwise parse
    if (e.target.value === '') {
      onChange(0);
      return;
    }
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <div className="relative rounded-xl shadow-sm group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-slate-400 font-medium">RM</span>
        </div>
        <input
          type="number"
          min="0"
          className="block w-full rounded-xl border-slate-200 bg-white/50 pl-12 py-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 sm:text-base font-medium shadow-sm"
          placeholder={placeholder}
          value={value === 0 ? '' : value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};