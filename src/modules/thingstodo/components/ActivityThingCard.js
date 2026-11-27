import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import SeasonBar from './SeasonBar';
import { categoryLabel, pretty } from '../utils/labels';

const ActivityThingCard = ({ activity }) => {
  const alternative = activity.seasonalAlternative;
  return (
    <article className="flex h-full min-w-[260px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Link to={`/things-to-do/activities/${activity.slug}`} className="block focus-visible:ring-2 focus-visible:ring-primary-500">
        {activity.heroImageUrl ? (
          <OptimizedImage
            src={activity.heroImageUrl}
            alt=""
            width={640}
            height={360}
            className="h-44 w-full object-cover motion-safe:transition-transform motion-safe:hover:scale-105"
          />
        ) : (
          <div className="h-44 w-full bg-gray-200" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">{categoryLabel(activity.category)}</p>
        <h3 className="text-lg font-semibold text-gray-900">
          <Link to={`/things-to-do/activities/${activity.slug}`} className="focus-visible:ring-2 focus-visible:ring-primary-500">
            {activity.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-800">{activity.destination?.name}</p>
        {activity.difficulty && (
          <span className="w-fit rounded-full border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-800">
            {pretty(activity.difficulty)}
          </span>
        )}
        <SeasonBar
          seasonMonths={activity.seasonMonths}
          peakMonths={activity.peakMonths}
          yearRound={activity.yearRound}
        />
        {activity.inSeasonNow ? (
          <span className="w-fit rounded-full border border-green-700 bg-white px-2 py-0.5 text-xs font-semibold text-green-800">
            In season now
          </span>
        ) : (
          <p className="text-sm text-gray-900">
            <span className="rounded-full border border-gray-400 px-2 py-0.5 text-xs font-semibold">Out of season</span>
            {alternative?.slug && (
              <>
                {' '}
                <Link className="font-semibold text-primary-800 underline" to={`/things-to-do/activities/${alternative.slug}`}>
                  Try {alternative.title || alternative.name}
                </Link>
              </>
            )}
          </p>
        )}
        <p className="mt-auto text-sm text-gray-800">
          {activity.linkedTourCount > 0 && <span>{activity.linkedTourCount} tours</span>}
          {Number(activity.fromPriceUsd) > 0 && (
            <span>{activity.linkedTourCount > 0 ? ' · ' : ''}From USD {Number(activity.fromPriceUsd)}</span>
          )}
        </p>
      </div>
    </article>
  );
};

export default ActivityThingCard;
