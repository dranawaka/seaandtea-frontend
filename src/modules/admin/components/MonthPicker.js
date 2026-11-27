import React from 'react';
import { monthName } from '../../thingstodo/utils/season';

const MonthPicker = ({ seasonMonths, peakMonths, onChange }) => {
  const toggle = (month, peak) => {
    const season = new Set(seasonMonths);
    const peaks = new Set(peakMonths);
    if (peak) {
      if (peaks.has(month)) peaks.delete(month);
      else peaks.add(month);
    } else if (season.has(month)) season.delete(month);
    else season.add(month);
    onChange({ seasonMonths: [...season].sort((a, b) => a - b), peakMonths: [...peaks].sort((a, b) => a - b) });
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900">Season months</legend>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => {
          const month = index + 1;
          const inSeason = seasonMonths.includes(month);
          const peak = peakMonths.includes(month);
          return (
            <div key={month} className="flex flex-col gap-1">
              <button
                type="button"
                aria-pressed={inSeason}
                className={`min-h-[44px] rounded-md text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary-500 ${inSeason ? 'bg-primary-800 text-white' : 'bg-white text-gray-900 ring-1 ring-gray-300'}`}
                onClick={() => toggle(month, false)}
              >
                {monthName(month).slice(0, 3)}
              </button>
              <button type="button" aria-pressed={peak} className="min-h-[44px] text-xs underline" onClick={() => toggle(month, true)}>
                {peak ? 'Peak' : 'Set peak'}
              </button>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default MonthPicker;
