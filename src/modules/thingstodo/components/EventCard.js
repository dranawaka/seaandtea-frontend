import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { pretty } from '../utils/labels';
import { monthName } from '../utils/season';

const STATUS_LABEL = {
  CONFIRMED: 'Confirmed',
  EXPECTED: 'Expected',
  TO_BE_ANNOUNCED: 'To be announced',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled'
};

export function eventWhen(event) {
  const next = event.nextOccurrence;
  const confirmed = next && next.dateStatus === 'CONFIRMED' && next.startDate;
  if (confirmed) {
    const date = new Date(`${next.startDate}T00:00:00`);
    return {
      day: String(date.getDate()),
      month: monthName(date.getMonth() + 1).slice(0, 3),
      chip: STATUS_LABEL[next.dateStatus] || 'Confirmed'
    };
  }
  const month = event.typicalStartMonth;
  return {
    typical: month ? `Typically ${monthName(month)}` : 'Typically later in the year',
    chip: STATUS_LABEL[next?.dateStatus] || 'To be announced'
  };
}

const EventCard = ({ event }) => {
  const when = eventWhen(event);
  const yearly = event.recurrenceType && event.recurrenceType !== 'ONE_OFF';
  return (
    <article className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-800 text-white">
        {when.day ? (
          <>
            <span className="text-lg font-bold leading-none">{when.day}</span>
            <span className="text-xs">{when.month}</span>
          </>
        ) : (
          <span className="px-1 text-center text-[11px] font-semibold leading-tight">{when.typical}</span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link to={`/things-to-do/events/${event.slug}`} className="focus-visible:ring-2 focus-visible:ring-primary-500">
            {event.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-800">
          {[event.venueName, event.destination?.name].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-900">
          <span className="rounded-full border border-gray-400 px-2 py-0.5">{when.chip}</span>
          <span className="font-medium text-gray-700">{pretty(event.type)}</span>
          {yearly && (
            <span className="inline-flex items-center gap-1" title="Happens every year">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">Happens every year</span>
            </span>
          )}
        </p>
      </div>
    </article>
  );
};

export default EventCard;
