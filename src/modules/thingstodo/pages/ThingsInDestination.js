import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDestinationBundle } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import ActivityThingCard from '../components/ActivityThingCard';
import EventCard from '../components/EventCard';
import RestaurantCard from '../components/RestaurantCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';

const ThingsInDestination = () => {
  const { destinationSlug } = useParams();
  const { data, loading, error, reload } = useAsync((signal) => getDestinationBundle(destinationSlug, signal), [destinationSlug]);
  const missing = !loading && !error && !data;
  usePageMeta({
    title: data ? `Things to do in ${data.destination?.name} | Sea & Tea` : 'Place not found',
    description: data ? `Activities, events and restaurants in ${data.destination?.name}.` : 'This place is not in the catalogue.',
    canonical: `/things-to-do/in/${destinationSlug}`,
    noindex: missing
  });

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10"><SkeletonGrid /></div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState onRetry={reload} /></div>;
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Place not found</h1>
        <Link to="/things-to-do" className="btn-primary mt-6 inline-flex">Things to do</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">Things to do in {data.destination?.name}</h1>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Activities</h2>
        {data.activities?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.activities.map((item) => <ActivityThingCard key={item.slug} activity={item} />)}
          </div>
        ) : <EmptyState title="No activities in this place yet" />}
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Events</h2>
        {data.events?.length ? <div className="space-y-4">{data.events.map((item) => <EventCard key={item.slug} event={item} />)}</div> : <EmptyState title="No upcoming confirmed events. Typical-month festivals appear when they are published." />}
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Restaurants</h2>
        {data.restaurants?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.restaurants.map((item) => <RestaurantCard key={item.slug} restaurant={item} />)}
          </div>
        ) : <EmptyState title="No restaurants in this place yet" />}
      </section>
    </div>
  );
};

export default ThingsInDestination;
