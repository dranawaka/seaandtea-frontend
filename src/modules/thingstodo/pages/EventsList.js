import React, { useState } from 'react';
import FilterBar, { Chip } from '../components/FilterBar';
import ThingsTabs from '../components/ThingsTabs';
import EventCard from '../components/EventCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';
import { useQueryFilters } from '../hooks/useQueryFilters';
import { listEvents, listThingsDestinations } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import { EVENT_TYPES, pretty } from '../utils/labels';
import { currentMonthColombo, monthName } from '../utils/season';

const KEYS = ['q', 'destination', 'type', 'month', 'confirmedOnly', 'page'];

const EventsList = () => {
  const [open, setOpen] = useState(false);
  const { values, setFilters } = useQueryFilters(KEYS);
  const month = values.month || String(currentMonthColombo());
  const page = Number(values.page || 0);
  const places = useAsync((signal) => listThingsDestinations(signal), []);
  const { data, loading, error, reload } = useAsync((signal) => listEvents({
    q: values.q,
    destination: values.destination,
    type: values.type,
    month,
    confirmedOnly: values.confirmedOnly === 'true' ? true : undefined,
    page,
    size: 12
  }, signal), [values.q, values.destination, values.type, month, values.confirmedOnly, page]);

  usePageMeta({
    title: 'Events in Sri Lanka | Sea & Tea',
    description: 'Festivals and events in Sri Lanka, with confirmed dates kept separate from typical months.',
    canonical: '/things-to-do/events'
  });

  const items = data?.content || [];
  const total = data?.totalElements || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ThingsTabs />
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Events</h1>
      <div className="lg:flex lg:gap-8">
        <FilterBar
          activeCount={['q', 'destination', 'type', 'confirmedOnly'].filter((key) => values[key] && values[key] !== 'false').length}
          open={open}
          onOpenChange={setOpen}
          onClear={() => setFilters({ q: '', destination: '', type: '', confirmedOnly: '' })}
        >
          <label className="block text-sm font-medium text-gray-900" htmlFor="event-q">
            Search
            <input id="event-q" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.q} onChange={(event) => setFilters({ q: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-gray-900" htmlFor="event-destination">
            Destination
            <select id="event-destination" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.destination} onChange={(event) => setFilters({ destination: event.target.value })}>
              <option value="">Anywhere</option>
              {(places.data || []).map((place) => <option key={place.slug} value={place.slug}>{place.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-900" htmlFor="event-month">
            Month
            <select id="event-month" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={month} onChange={(event) => setFilters({ month: event.target.value })}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>{monthName(index + 1)}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <Chip key={type} pressed={values.type === type} onClick={() => setFilters({ type: values.type === type ? '' : type })}>
                {pretty(type)}
              </Chip>
            ))}
          </div>
          <Chip pressed={values.confirmedOnly === 'true'} onClick={() => setFilters({ confirmedOnly: values.confirmedOnly === 'true' ? '' : 'true' })}>
            Dates confirmed only
          </Chip>
        </FilterBar>
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-gray-800" aria-live="polite">{loading ? 'Loading events' : `${total} events`}</p>
          {loading && <SkeletonGrid />}
          {error && <ErrorState onRetry={reload} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState title="No events match these filters" action={<button type="button" className="btn-outline" onClick={() => setFilters({ q: '', destination: '', type: '', confirmedOnly: '' })}>Clear filters</button>} />
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {items.map((event) => <EventCard key={event.slug} event={event} />)}
            </div>
          )}
          {total > 12 && (
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn-outline" disabled={page === 0} onClick={() => setFilters({ page: String(page - 1) })}>Previous</button>
              <button type="button" className="btn-outline" disabled={(page + 1) * 12 >= total} onClick={() => setFilters({ page: String(page + 1) })}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsList;
