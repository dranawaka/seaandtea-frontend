import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import { getActivity, getDestinationBundle } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import DoThisWithAGuide from '../components/DoThisWithAGuide';
import Paragraphs from '../components/Paragraphs';
import SeasonBar from '../components/SeasonBar';
import SourcesList from '../components/SourcesList';
import { ErrorState, SkeletonGrid } from '../components/StateBlocks';
import ActivityThingCard from '../components/ActivityThingCard';
import { useAsync } from '../hooks/useAsync';
import { categoryLabel, pretty } from '../utils/labels';
import { monthName } from '../utils/season';
import seo from '../utils/seo';

const notes = [
  ['responsibleTravelNote', 'Good to know'],
  ['feesNote', 'Fees']
];

const ActivityDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync((signal) => getActivity(slug, {}, signal), [slug]);
  const nearby = useAsync(
    (signal) => (data?.destination?.slug ? getDestinationBundle(data.destination.slug, signal) : Promise.resolve(null)),
    [data?.destination?.slug]
  );
  const missing = !loading && !error && !data;
  const title = data?.seoTitle || (data ? `${data.title} — season, spots and local guides | Sea & Tea` : 'Activity not found');
  usePageMeta({
    title,
    description: data?.seoDescription || data?.summary || 'This activity is not on Sea & Tea.',
    canonical: `/things-to-do/activities/${slug}`,
    image: data?.heroImageUrl,
    noindex: missing,
    jsonLd: data ? [seo.buildAttractionJsonLd(data), seo.buildBreadcrumbJsonLd([
      { name: 'Things to do', path: '/things-to-do' },
      { name: 'Activities', path: '/things-to-do/activities' },
      { name: data.title, path: `/things-to-do/activities/${data.slug}` }
    ])] : null
  });

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10"><SkeletonGrid /></div>;
  }
  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState onRetry={reload} /></div>;
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Activity not found</h1>
        <Link to="/things-to-do/activities" className="btn-primary mt-6 inline-flex">Back to activities</Link>
      </div>
    );
  }

  const others = (nearby.data?.activities || []).filter((item) => item.slug !== data.slug).slice(0, 3);

  return (
    <article className="pb-24 md:pb-10">
      <div className="relative h-72">
        {data.heroImageUrl && (
          <OptimizedImage src={data.heroImageUrl} alt="" priority className="h-full w-full object-cover" width={1600} height={720} />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 text-white sm:px-6 lg:px-8">
            <Breadcrumbs tone="light" items={[
              { label: 'Things to do', to: '/things-to-do' },
              { label: 'Activities', to: '/things-to-do/activities' },
              { label: data.title }
            ]} />
            <h1 className="mt-3 text-4xl font-bold">{data.title}</h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">At a glance</h2>
          <ul className="mt-3 space-y-1 text-gray-900">
            <li>{categoryLabel(data.category)} · {pretty(data.region)}</li>
            <li>{data.destination?.name}</li>
            {data.difficulty && <li>{pretty(data.difficulty)}</li>}
            {data.typicalDurationMinutes && <li>{data.typicalDurationMinutes} minutes</li>}
            {data.bestTimeOfDay && <li>{data.bestTimeOfDay}</li>}
          </ul>
          <div className="mt-4">
            <SeasonBar seasonMonths={data.seasonMonths} peakMonths={data.peakMonths} yearRound={data.yearRound} />
            <p className="mt-2 text-sm text-gray-800">
              {(data.seasonMonths || []).map((month) => monthName(month)).join(', ')}
              {data.yearRound ? ' Year round.' : ''}
            </p>
            {data.seasonNote && <p className="mt-2 text-sm text-gray-800">{data.seasonNote}</p>}
          </div>
        </section>
        <div className="mt-8">
          <Paragraphs text={data.description || data.summary} />
        </div>
        {notes.map(([key, label]) => data[key] && (
          <section key={key} className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
            <p className="mt-2 text-gray-900">{data[key]}</p>
          </section>
        ))}
        {data.seasonalAlternative?.slug && (
          <p className="mt-6 text-gray-900">
            Opposite season:{' '}
            <Link className="font-semibold underline" to={`/things-to-do/activities/${data.seasonalAlternative.slug}`}>
              {data.seasonalAlternative.title || data.seasonalAlternative.name}
            </Link>
          </p>
        )}
        <DoThisWithAGuide
          kind="activities"
          slug={data.slug}
          destinationName={data.destination?.name}
          tourCategory={data.category === 'SAFARI' ? 'WILDLIFE_TOURS' : undefined}
        />
        {others.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Nearby</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => <ActivityThingCard key={item.slug} activity={item} />)}
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

export default ActivityDetail;
