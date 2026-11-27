import React from 'react';
import { currentMonthColombo, describeSeason, monthLetter, monthName } from '../utils/season';

const SeasonBar = ({ seasonMonths = [], peakMonths = [], yearRound = false, month }) => {
  const current = month || currentMonthColombo();
  const label = describeSeason(seasonMonths, peakMonths, yearRound);
  const inSeason = new Set(yearRound ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : seasonMonths.map(Number));
  const peak = new Set((peakMonths || []).map(Number));

  return (
    <div role="img" aria-label={label} className="flex gap-0.5">
      {Array.from({ length: 12 }, (_, index) => {
        const value = index + 1;
        const isPeak = peak.has(value);
        const active = inSeason.has(value);
        const tone = isPeak
          ? 'bg-accent-500 text-white'
          : active
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-800';
        return (
          <span
            key={value}
            data-month={value}
            data-peak={isPeak ? 'true' : 'false'}
            data-current={value === current ? 'true' : 'false'}
            title={monthName(value)}
            className={`relative flex h-7 flex-1 items-center justify-center rounded-sm text-[10px] font-semibold ${tone} ${
              value === current ? 'ring-2 ring-gray-900' : ''
            }`}
          >
            <span className="hidden md:inline">{monthLetter(value)}</span>
            {isPeak && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />}
          </span>
        );
      })}
    </div>
  );
};

export default SeasonBar;
