import React, { useState } from 'react';
import FilterBar, { Chip } from '../components/FilterBar';
import ThingsTabs from '../components/ThingsTabs';
import ActivityThingCard from '../components/ActivityThingCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';
import { useQueryFilters } from '../hooks/useQueryFilters';
import { listActivities, listThingsDestinations } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import { ACTIVITY_CATEGORIES, DIFFICULTIES, pretty } from '../utils/labels';
import { currentMonthColombo, monthName } from '../utils/season';

const KEYS = ['q', 'destination', 'category', 'inSeason', 'month', 'difficulty', 'sort', 'page'];

export function countFilters(values, ignore = []) {
  return KEYS.filter((key) => !ignore.includes(key) && key !== 'page' && key !== 'sort' && values[key] && values[key] !== 'false').length;
}

const ActivitiesList = ({ lockedCategory, heading, canonical }) => {
  const [open, setOpen] = useState(false);
  const { values, setFilters } = useQueryFilters(KEYS);
  const month = values.month || String(currentMonthColombo());
  const page = Number(values.page || 0);
  const category = lockedCategory || values.category || '';
  const selectedDestinations = Array.isArray(values.destination)
    ? values.destination
    : (values.destination ? [values.destination] : []);

  const { data, loading, error, reload } = useAsync((signal) => listActivities({
    q: values.q,
    destination: selectedDestinations,
    category,
    inSeason: values.inSeason === 'true' ? true : undefined,
    month,
    difficulty: values.difficulty,
    sort: values.sort || 'inSeason',
    page,
    size: 12
  }, signal), [values.q, selectedDestinations.join(','), category, values.inSeason, month, values.difficulty, values.sort, page]);

  const places = useAsync((signal) => listThingsDestinations(signal), []);
  const destinations = places.data || [];

  usePageMeta({
    title: heading || 'Activities in Sri Lanka | Sea & Tea',
    description: 'Season, spots and local guides for things to do in Sri Lanka.',
    canonical: canonical || '/things-to-do/activities'
  });

  const total = data?.totalElements || 0;
  const items = data?.content || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ThingsTabs />
      <h1 className="mb-6 text-3xl font-bold text-gray-900">{heading || 'Activities'}</h1>
      <div className="lg:flex lg:gap-8">
        <FilterBar
          activeCount={countFilters(values, lockedCategory ? ['category'] : [])}
          open={open}
          onOpenChange={setOpen}
          onClear={() => setFilters({ q: '', destination: [], category: lockedCategory || '', inSeason: '', difficulty: '', sort: '' })}
        >
          <label className="block text-sm font-medium text-gray-900" htmlFor="activity-q">
            Search
            <input id="activity-q" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.q} onChange={(event) => setFilters({ q: event.target.value })} />
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-gray-900">Destination</legend>
            <div className="mt-2 flex flex-col gap-1">
              {destinations.map((place) => (
                <label key={place.slug} className="flex min-h-[44px] items-center gap-2 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedDestinations.includes(place.slug)}
                    onChange={() => {
                      const next = selectedDestinations.includes(place.slug)
                        ? selectedDestinations.filter((slug) => slug !== place.slug)
                        : [...selectedDestinations, place.slug];
                      setFilters({ destination: next });
                    }}
                  />
                  {place.name}
                </label>
              ))}
            </div>
          </fieldset>
          {!lockedCategory && (
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_CATEGORIES.map((item) => (
                <Chip
                  key={item.value}
                  pressed={category === item.value}
                  onClick={() => setFilters({ category: category === item.value ? '' : item.value })}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          )}
          <Chip pressed={values.inSeason === 'true'} onClick={() => setFilters({ inSeason: values.inSeason === 'true' ? '' : 'true' })}>
            In season now
          </Chip>
          <label className="block text-sm font-medium text-gray-900" htmlFor="activity-month">
            Month
            <select id="activity-month" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={month} onChange={(event) => setFilters({ month: event.target.value })}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>{monthName(index + 1)}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-900" htmlFor="activity-difficulty">
            Difficulty
            <select id="activity-difficulty" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.difficulty} onChange={(event) => setFilters({ difficulty: event.target.value })}>
              <option value="">Any</option>
              {DIFFICULTIES.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-900" htmlFor="activity-sort">
            Sort
            <select id="activity-sort" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.sort || 'inSeason'} onChange={(event) => setFilters({ sort: event.target.value })}>
              <option value="inSeason">In season first</option>
              <option value="title">Title</option>
            </select>
          </label>
        </FilterBar>
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-gray-800" aria-live="polite">{loading ? 'Loading activities' : `${total} activities`}</p>
          {loading && <SkeletonGrid />}
          {error && <ErrorState onRetry={reload} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              title="No activities match these filters"
              action={<button type="button" className="btn-outline" onClick={() => setFilters({ q: '', destination: [], category: '', inSeason: '', difficulty: '' })}>Clear filters</button>}
            />
          )}
          {!loading && !error && items.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((activity) => <ActivityThingCard key={activity.slug} activity={activity} />)}
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

export default ActivitiesList;
