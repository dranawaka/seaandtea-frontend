import React, { useState } from 'react';
import FilterBar, { Chip } from '../components/FilterBar';
import ThingsTabs from '../components/ThingsTabs';
import RestaurantCard from '../components/RestaurantCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';
import { useQueryFilters } from '../hooks/useQueryFilters';
import { listRestaurants, listThingsDestinations } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import { CUISINES, DIETARY, PRICE_TIERS, pretty } from '../utils/labels';

const KEYS = ['q', 'destination', 'cuisine', 'priceTier', 'dietary', 'sort', 'page'];

const RestaurantsList = () => {
  const [open, setOpen] = useState(false);
  const { values, setFilters } = useQueryFilters(KEYS);
  const page = Number(values.page || 0);
  const places = useAsync((signal) => listThingsDestinations(signal), []);
  const { data, loading, error, reload } = useAsync((signal) => listRestaurants({
    q: values.q,
    destination: values.destination,
    cuisine: values.cuisine,
    priceTier: values.priceTier,
    dietary: values.dietary,
    sort: values.sort || 'name',
    page,
    size: 12
  }, signal), [values.q, values.destination, values.cuisine, values.priceTier, values.dietary, values.sort, page]);

  usePageMeta({
    title: 'Restaurants in Sri Lanka | Sea & Tea',
    description: 'Places to eat in Sri Lanka, with cuisine, price tier and dietary notes.',
    canonical: '/things-to-do/restaurants'
  });

  const items = data?.content || [];
  const total = data?.totalElements || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ThingsTabs />
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Restaurants</h1>
      <div className="lg:flex lg:gap-8">
        <FilterBar
          activeCount={['q', 'destination', 'cuisine', 'priceTier', 'dietary'].filter((key) => values[key]).length}
          open={open}
          onOpenChange={setOpen}
          onClear={() => setFilters({ q: '', destination: '', cuisine: '', priceTier: '', dietary: '', sort: '' })}
        >
          <label className="block text-sm font-medium text-gray-900" htmlFor="restaurant-q">
            Search
            <input id="restaurant-q" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.q} onChange={(event) => setFilters({ q: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-gray-900" htmlFor="restaurant-destination">
            Destination
            <select id="restaurant-destination" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.destination} onChange={(event) => setFilters({ destination: event.target.value })}>
              <option value="">Anywhere</option>
              {(places.data || []).map((place) => <option key={place.slug} value={place.slug}>{place.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <Chip key={cuisine} pressed={values.cuisine === cuisine} onClick={() => setFilters({ cuisine: values.cuisine === cuisine ? '' : cuisine })}>
                {pretty(cuisine)}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            {PRICE_TIERS.map((tier) => (
              <Chip key={tier.value} pressed={values.priceTier === tier.value} onClick={() => setFilters({ priceTier: values.priceTier === tier.value ? '' : tier.value })}>
                <span aria-hidden="true">{tier.marks}</span>
                <span className="sr-only">{tier.label}</span>
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map(([value, label]) => (
              <Chip key={value} pressed={values.dietary === value} onClick={() => setFilters({ dietary: values.dietary === value ? '' : value })}>
                {label}
              </Chip>
            ))}
          </div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="restaurant-sort">
            Sort
            <select id="restaurant-sort" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={values.sort || 'name'} onChange={(event) => setFilters({ sort: event.target.value })}>
              <option value="name">Name</option>
              <option value="tier">Price tier</option>
            </select>
          </label>
        </FilterBar>
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-gray-800" aria-live="polite">{loading ? 'Loading restaurants' : `${total} restaurants`}</p>
          {loading && <SkeletonGrid />}
          {error && <ErrorState onRetry={reload} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState title="No restaurants match these filters" action={<button type="button" className="btn-outline" onClick={() => setFilters({ q: '', destination: '', cuisine: '', priceTier: '', dietary: '' })}>Clear filters</button>} />
          )}
          {!loading && !error && items.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((restaurant) => <RestaurantCard key={restaurant.slug} restaurant={restaurant} />)}
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

export default RestaurantsList;
