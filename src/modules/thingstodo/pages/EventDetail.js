import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import { getDestinationBundle, getEvent } from '../../../shared/config/api';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import DoThisWithAGuide from '../components/DoThisWithAGuide';
import EventCard from '../components/EventCard';
import Paragraphs from '../components/Paragraphs';
import SourcesList from '../components/SourcesList';
import { ErrorState, SkeletonGrid } from '../components/StateBlocks';
import { useAsync } from '../hooks/useAsync';
import { pretty } from '../utils/labels';
import { monthName } from '../utils/season';
import seo from '../utils/seo';

const STATUS = {
  CONFIRMED: 'Confirmed',
  EXPECTED: 'Expected',
  TO_BE_ANNOUNCED: 'To be announced',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled'
};

const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync((signal) => getEvent(slug, signal), [slug]);
  const nearby = useAsync(
    (signal) => (data?.destination?.slug ? getDestinationBundle(data.destination.slug, signal) : Promise.resolve(null)),
    [data?.destination?.slug]
  );
  const missing = !loading && !error && !data;
  const confirmed = (data?.occurrences || []).find((item) => item.dateStatus === 'CONFIRMED' && item.startDate);
  usePageMeta({
    title: data?.seoTitle || (data ? `${data.name} — season, spots and local guides | Sea & Tea` : 'Event not found'),
    description: data?.seoDescription || data?.summary || 'This event is not on Sea & Tea.',
    canonical: `/things-to-do/events/${slug}`,
    image: data?.heroImageUrl,
    noindex: missing,
    jsonLd: data ? [seo.buildEventJsonLd(data, confirmed || data.nextOccurrence), seo.buildBreadcrumbJsonLd([
      { name: 'Things to do', path: '/things-to-do' },
      { name: 'Events', path: '/things-to-do/events' },
      { name: data.name, path: `/things-to-do/events/${data.slug}` }
    ])].filter(Boolean) : null
  });

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10"><SkeletonGrid /></div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState onRetry={reload} /></div>;
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Event not found</h1>
        <Link to="/things-to-do/events" className="btn-primary mt-6 inline-flex">Back to events</Link>
      </div>
    );
  }

  const others = (nearby.data?.events || []).filter((item) => item.slug !== data.slug).slice(0, 3);
  const usual = [data.typicalStartMonth, data.typicalEndMonth].filter(Boolean).map(monthName).join(' to ');

  return (
    <article className="pb-24 md:pb-10">
      <div className="relative h-72 bg-gray-800">
        {data.heroImageUrl && <OptimizedImage src={data.heroImageUrl} alt="" priority className="h-full w-full object-cover" width={1600} height={720} />}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 text-white sm:px-6 lg:px-8">
            <Breadcrumbs tone="light" items={[
              { label: 'Things to do', to: '/things-to-do' },
              { label: 'Events', to: '/things-to-do/events' },
              { label: data.name }
            ]} />
            <h1 className="mt-3 text-4xl font-bold">{data.name}</h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">At a glance</h2>
          <p className="mt-2 text-gray-900">{pretty(data.type)} · {data.destination?.name}</p>
          {data.venueName && <p className="text-gray-900">{data.venueName}</p>}
          {data.nextOccurrence?.dateStatus === 'CONFIRMED' && data.nextOccurrence.startDate ? (
            <p className="mt-2 font-semibold text-gray-900">Next: {data.nextOccurrence.startDate}{data.nextOccurrence.endDate ? ` to ${data.nextOccurrence.endDate}` : ''}</p>
          ) : (
            <p className="mt-2 text-gray-900">Dates not announced yet. Usually in {usual || 'the months listed by the organiser'}.</p>
          )}
        </section>
        <div className="mt-8"><Paragraphs text={data.description || data.summary} /></div>
        {data.etiquetteNote && <section className="mt-8"><h2 className="text-xl font-semibold">Good to know</h2><p className="mt-2 text-gray-900">{data.etiquetteNote}</p></section>}
        {data.crowdNote && <section className="mt-8"><h2 className="text-xl font-semibold">Crowds</h2><p className="mt-2 text-gray-900">{data.crowdNote}</p></section>}
        <section className="mt-8 overflow-x-auto">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Dates</h2>
          <table className="w-full text-left text-sm text-gray-900">
            <thead>
              <tr><th className="py-2">Year</th><th>Dates</th><th>Status</th><th>Source</th></tr>
            </thead>
            <tbody>
              {(data.occurrences || []).map((item) => (
                <tr key={item.id || item.year} className="border-t border-gray-200">
                  <td className="py-2">{item.year}</td>
                  <td>{item.dateStatus === 'CONFIRMED' && item.startDate ? `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ''}` : '—'}</td>
                  <td>{STATUS[item.dateStatus] || pretty(item.dateStatus)}</td>
                  <td>{item.statusSourceUrl && <a className="underline" href={item.statusSourceUrl} target="_blank" rel="noopener noreferrer">Source</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <DoThisWithAGuide kind="events" slug={data.slug} destinationName={data.destination?.name} tourCategory="CULTURAL_TOURS" />
        {others.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Nearby</h2>
            {others.map((item) => <EventCard key={item.slug} event={item} />)}
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

export default EventDetail;
