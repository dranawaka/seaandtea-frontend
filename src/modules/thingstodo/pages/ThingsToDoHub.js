import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DESTINATIONS, THINGS_TO_DO_CATEGORIES } from '../../../shared/data/destinations';
import { getThingsToDoSummary, listThingsDestinations } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import ActivityThingCard from '../components/ActivityThingCard';
import EventCard from '../components/EventCard';
import RestaurantCard from '../components/RestaurantCard';
import { ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';
import { currentMonthColombo, monthName } from '../utils/season';
import { categoryBySlug } from '../utils/labels';

const ThingsToDoHub = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState(String(currentMonthColombo()));
  const summary = useAsync((signal) => getThingsToDoSummary({ month }, signal), [month]);
  const places = useAsync((signal) => listThingsDestinations(signal), []);
  usePageMeta({
    title: 'Things to do in Sri Lanka | Sea & Tea',
    description: 'Activities, events and restaurants in Sri Lanka, with the season and a local guide.',
    canonical: '/things-to-do'
  });

  const destinations = places.data && places.data.length ? places.data : DESTINATIONS;

  return (
    <div>
      <section className="bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Things to do in Sri Lanka</h1>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); navigate(`/things-to-do/activities?q=${encodeURIComponent(query)}`); }}>
            <label className="sr-only" htmlFor="hub-search">Search activities</label>
            <input id="hub-search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-[44px] flex-1 rounded-md px-3 text-gray-900" placeholder="Search activities" />
            <label className="sr-only" htmlFor="hub-month">Month</label>
            <select id="hub-month" value={month} onChange={(event) => setMonth(event.target.value)} className="min-h-[44px] rounded-md px-3 text-gray-900">
              {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{monthName(index + 1)}</option>)}
            </select>
            <button type="submit" className="btn-primary min-h-[44px]">Search</button>
          </form>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {summary.error && <ErrorState onRetry={summary.reload} />}
        {summary.loading && <SkeletonGrid />}
        {summary.data && (
          <>
            <section>
              <h2 className="text-2xl font-bold text-gray-900">In season in {monthName(summary.data.month || month)}</h2>
              <p className="mt-2 text-gray-800">
                South and west coast season: Nov–Apr. East coast season: May–Sep.{' '}
                <Link className="underline" to="/things-to-do/activities/category/surfing">Surfing</Link>
                {' · '}
                <Link className="underline" to="/things-to-do/activities/category/whale-watching">Whale watching</Link>
              </p>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {(summary.data.inSeasonActivities || []).map((activity) => (
                  <div key={activity.slug} className="w-72 shrink-0">
                    <ActivityThingCard activity={activity} />
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Coming up</h2>
              <div className="space-y-4">
                {(summary.data.upcomingEvents || []).map((event) => <EventCard key={event.slug} event={event} />)}
              </div>
            </section>
          </>
        )}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {THINGS_TO_DO_CATEGORIES.map((item) => (
              <Link key={item.slug} to={`/things-to-do/activities/category/${item.slug}`} className="min-h-[44px] rounded-full bg-white px-4 py-2 font-semibold text-gray-900 ring-1 ring-gray-300">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
        {summary.data && (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Eat well</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(summary.data.featuredRestaurants || []).slice(0, 4).map((restaurant) => (
                <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Places</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((place) => (
              <Link key={place.slug} to={`/things-to-do/in/${place.slug}`} className="rounded-xl border border-gray-200 bg-white p-4 font-semibold text-gray-900">
                {place.name}
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-primary-900 px-6 py-10 text-white">
          <h2 className="text-2xl font-bold">Not sure? Message a local guide</h2>
          <Link to="/guides" className="btn-primary mt-4 inline-flex min-h-[44px] bg-white text-primary-900">Browse guides</Link>
        </section>
      </div>
    </div>
  );
};

export function categoryHeading(slug) {
  return categoryBySlug(slug);
}

export default ThingsToDoHub;
