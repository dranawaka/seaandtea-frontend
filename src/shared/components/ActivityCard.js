import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, MapPin, Users } from 'lucide-react';
import { categoryLabel, formatDuration, formatLkr, formatUsd, tourBadges } from '../data/destinations';
import { preferSriLankanPhoto } from '../utils/imageUtils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=900&q=80';

const ActivityCard = ({ tour, date, saved = false, onToggleSave }) => {
  const image = preferSriLankanPhoto(tour.primaryImageUrl || tour.image || tour.imageUrl || FALLBACK_IMAGE);
  const rating = Number(tour.averageRating ?? tour.rating ?? 0);
  const reviews = tour.totalReviews ?? tour.reviews ?? 0;
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const href = `/tour/${tour.id}${params.toString() ? `?${params}` : ''}`;
  const price = tour.pricePerPerson ?? tour.price;
  const badges = tourBadges(tour);

  return (
    <article className="card-modern overflow-hidden group min-w-[260px] w-full h-full flex flex-col">
      <div className="relative">
        <Link to={href}>
          <img
            src={image}
            alt={tour.title}
            className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </Link>
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[75%]">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                {badge}
              </span>
            ))}
          </div>
        )}
        <button
          type="button"
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={() => onToggleSave && onToggleSave(tour.id)}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 text-ink shadow flex items-center justify-center hover:text-accent-600"
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-accent-500 text-accent-500' : ''}`} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-bold tracking-wide text-primary-600 mb-1">
          {categoryLabel(tour.category)}
        </p>
        <Link to={href} className="block font-bold text-ink line-clamp-2 hover:text-primary-700">
          {tour.title}
        </Link>
        <div className="mt-2 flex items-center text-sm text-ink/80">
          <Star className="h-4 w-4 text-accent-500 fill-accent-500 mr-1" />
          <span className="font-bold text-ink">{rating.toFixed(1)}</span>
          <span className="ml-1">({reviews})</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/70">
          {tour.destination && (
            <span className="inline-flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" />{tour.destination}</span>
          )}
          {(tour.durationHours || tour.duration) && (
            <span className="inline-flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{formatDuration(tour.durationHours || tour.duration)}</span>
          )}
          {tour.maxGroupSize ? (
            <span className="inline-flex items-center"><Users className="h-3.5 w-3.5 mr-1" />Up to {tour.maxGroupSize}</span>
          ) : null}
        </div>
        <p className="mt-auto pt-3 text-sm text-ink">
          From <span className="text-base font-extrabold">{formatLkr(price)}</span>
          <span className="block text-xs text-ink/60">{formatUsd(price)} per person</span>
        </p>
      </div>
    </article>
  );
};

export default ActivityCard;
