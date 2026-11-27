import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import { getDestinationBundle, getRestaurant } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import DoThisWithAGuide from '../components/DoThisWithAGuide';
import Paragraphs from '../components/Paragraphs';
import RestaurantCard from '../components/RestaurantCard';
import SourcesList from '../components/SourcesList';
import { ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';
import { pretty, tierOf } from '../utils/labels';
import seo from '../utils/seo';

function mapsHref(restaurant) {
  const query = encodeURIComponent([restaurant.name, restaurant.addressLine, restaurant.destination?.name].filter(Boolean).join(' '));
  const place = restaurant.googlePlaceId ? `&query_place_id=${encodeURIComponent(restaurant.googlePlaceId)}` : '';
  return `https://www.google.com/maps/search/?api=1&query=${query}${place}`;
}

const RestaurantDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync((signal) => getRestaurant(slug, signal), [slug]);
  const nearby = useAsync(
    (signal) => (data?.destination?.slug ? getDestinationBundle(data.destination.slug, signal) : Promise.resolve(null)),
    [data?.destination?.slug]
  );
  const missing = !loading && !error && !data;
  usePageMeta({
    title: data ? `${data.name} — season, spots and local guides | Sea & Tea` : 'Restaurant not found',
    description: data?.summary || 'This restaurant is not on Sea & Tea.',
    canonical: `/things-to-do/restaurants/${slug}`,
    image: data?.heroImageUrl,
    noindex: missing,
    jsonLd: data ? [seo.buildRestaurantJsonLd(data), seo.buildBreadcrumbJsonLd([
      { name: 'Things to do', path: '/things-to-do' },
      { name: 'Restaurants', path: '/things-to-do/restaurants' },
      { name: data.name, path: `/things-to-do/restaurants/${data.slug}` }
    ])] : null
  });

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10"><SkeletonGrid /></div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState onRetry={reload} /></div>;
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant not found</h1>
        <Link to="/things-to-do/restaurants" className="btn-primary mt-6 inline-flex">Back to restaurants</Link>
      </div>
    );
  }

  const tier = tierOf(data.priceTier);
  const others = (nearby.data?.restaurants || []).filter((item) => item.slug !== data.slug).slice(0, 3);

  return (
    <article className="pb-24 md:pb-10">
      <div className="relative h-72 bg-gray-800">
        {data.heroImageUrl && <OptimizedImage src={data.heroImageUrl} alt="" priority className="h-full w-full object-cover" width={1600} height={720} />}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 text-white sm:px-6 lg:px-8">
            <Breadcrumbs tone="light" items={[
              { label: 'Things to do', to: '/things-to-do' },
              { label: 'Restaurants', to: '/things-to-do/restaurants' },
              { label: data.name }
            ]} />
            <h1 className="mt-3 text-4xl font-bold">{data.name}</h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-gray-200 bg-white p-5 text-gray-900">
          <h2 className="text-lg font-semibold">At a glance</h2>
          <p className="mt-2">{(data.cuisines || []).map(pretty).join(', ')}</p>
          {tier && <p><span aria-hidden="true">{tier.marks}</span><span className="sr-only">{tier.label}</span></p>}
          <p>{[data.destination?.name, data.neighbourhood, data.addressLine].filter(Boolean).join(' · ')}</p>
          {data.openingHoursText && <p>{data.openingHoursText}</p>}
          {data.phone && <p><a className="underline" href={`tel:${data.phone}`}>{data.phone}</a></p>}
          {data.closedOnPoya && <p>Closed on Poya days.</p>}
          <a className="mt-3 inline-flex min-h-[44px] items-center font-semibold underline" href={mapsHref(data)} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </section>
        <div className="mt-8"><Paragraphs text={data.description || data.summary} /></div>
        {data.guideTip && <section className="mt-8"><h2 className="text-xl font-semibold">Good to know</h2><p className="mt-2 text-gray-900">{data.guideTip}</p></section>}
        <DoThisWithAGuide kind="restaurants" slug={data.slug} destinationName={data.destination?.name} tourCategory="FOOD_TOURS" />
        {others.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Nearby</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => <RestaurantCard key={item.slug} restaurant={item} />)}
            </div>
          </section>
        )}
        <SourcesList sources={data.sources} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-3 md:hidden">
        <button type="button" className="btn-primary min-h-[44px] w-full" onClick={() => navigate('/guides')}>Message a guide</button>
      </div>
    </article>
  );
};

export default RestaurantDetail;
