
import React, { useEffect, useState } from 'react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ label, value, onChange }) => {
  // Parse the current YYYY-MM-DD string or default to empty
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { day: '', month: '', year: '' };
    const [y, m, d] = dateStr.split('-');
    return { day: d, month: m, year: y };
  };

  const [localDate, setLocalDate] = useState(parseDate(value));

  // Update local state if parent value changes
  useEffect(() => {
    setLocalDate(parseDate(value));
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years
  const months = [
    { val: '01', label: 'Jan / 1月' }, { val: '02', label: 'Feb / 2月' },
    { val: '03', label: 'Mar / 3月' }, { val: '04', label: 'Apr / 4月' },
    { val: '05', label: 'May / 5月' }, { val: '06', label: 'Jun / 6月' },
    { val: '07', label: 'Jul / 7月' }, { val: '08', label: 'Aug / 8月' },
    { val: '09', label: 'Sep / 9月' }, { val: '10', label: 'Oct / 10月' },
    { val: '11', label: 'Nov / 11月' }, { val: '12', label: 'Dec / 12月' },
  ];

  // Dynamic days based on selected month/year
  const getDaysInMonth = (y: string, m: string) => {
    if (!y || !m) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const daysInMonth = getDaysInMonth(localDate.year, localDate.month);
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const handleChange = (field: 'day' | 'month' | 'year', val: string) => {
    const newState = { ...localDate, [field]: val };
    setLocalDate(newState);

    // Only trigger onChange if all fields are selected
    if (newState.year && newState.month && newState.day) {
        // Ensure day is valid for new month (e.g. changing from Jan 31 to Feb)
        const maxDay = getDaysInMonth(newState.year, newState.month);
        let validDay = newState.day;
        if (parseInt(newState.day) > maxDay) {
            validDay = maxDay.toString().padStart(2, '0');
            // Update local state immediately for the day correction to avoid UI glitch
            setLocalDate({ ...newState, day: validDay });
        }
        onChange(`${newState.year}-${newState.month}-${validDay}`);
    }
  };

  const selectClass = "block w-full rounded-xl border-slate-200 bg-white/50 py-3 px-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm appearance-none text-center font-medium";

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {/* Day Select */}
        <div className="relative">
             <select
                value={localDate.day}
                onChange={(e) => handleChange('day', e.target.value)}
                className={selectClass}
             >
                <option value="" disabled>Day 日</option>
                {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
             </select>
        </div>

        {/* Month Select */}
         <div className="relative">
             <select
                value={localDate.month}
                onChange={(e) => handleChange('month', e.target.value)}
                className={selectClass}
             >
                <option value="" disabled>Month 月</option>
                {months.map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                ))}
             </select>
        </div>

        {/* Year Select */}
         <div className="relative">
             <select
                value={localDate.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className={selectClass}
             >
                <option value="" disabled>Year 年</option>
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
             </select>
        </div>
      </div>
    </div>
  );
};
