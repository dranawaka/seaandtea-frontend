import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import { pretty, tierOf } from '../utils/labels';

const RestaurantCard = ({ restaurant }) => {
  const tier = tierOf(restaurant.priceTier);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Link to={`/things-to-do/restaurants/${restaurant.slug}`}>
        {restaurant.heroImageUrl ? (
          <OptimizedImage src={restaurant.heroImageUrl} alt="" width={640} height={360} className="h-44 w-full object-cover" />
        ) : (
          <div className="h-44 w-full bg-gray-200" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link to={`/things-to-do/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
        </h3>
        <p className="text-sm text-gray-800">{(restaurant.cuisines || []).map(pretty).join(', ')}</p>
        {tier && (
          <p className="text-sm font-semibold text-gray-900">
            <span aria-hidden="true">{tier.marks}</span>
            <span className="sr-only">{tier.label}</span>
          </p>
        )}
        <p className="text-sm text-gray-800">
          {[restaurant.destination?.name, restaurant.neighbourhood].filter(Boolean).join(' · ')}
        </p>
        {restaurant.openingHoursText && (
          <p className="line-clamp-1 text-sm text-gray-800">{restaurant.openingHoursText}</p>
        )}
        <ul className="flex flex-wrap gap-2">
          {(restaurant.dietary || []).map((item) => (
            <li key={item} className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-800">
              {pretty(item)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default RestaurantCard;
