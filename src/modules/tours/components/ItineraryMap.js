import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const SKIP_PLACES = new Set([
  'tasting',
  'tastings',
  'guide',
  'water',
  'lunch',
  'breakfast',
  'dinner',
  'tracker',
  'park entry',
  'swim time',
  'beach time',
  'coastal views',
  'hill views',
  'lake view',
  'snacks',
  'refreshments'
]);

function isMappablePlace(label) {
  const text = String(label || '').trim().toLowerCase();
  if (text.length < 3) return false;
  if (SKIP_PLACES.has(text)) return false;
  return true;
}

function placeQuery(name, destination) {
  const clean = String(name || '').trim();
  const parts = [clean];
  if (destination && !clean.toLowerCase().includes(String(destination).toLowerCase())) {
    parts.push(destination);
  }
  if (!/sri lanka/i.test(clean)) parts.push('Sri Lanka');
  return parts.join(', ');
}

export function buildItineraryStops(tour) {
  const destination = tour.destination || tour.location || '';
  const stops = [];
  const seen = new Set();

  const push = (label) => {
    const name = String(label || '').trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key) || !isMappablePlace(name)) return;
    if (destination && key === String(destination).toLowerCase() && stops.length > 0) return;
    if (tour.title && key === String(tour.title).toLowerCase()) return;
    seen.add(key);
    stops.push({ label: name, query: placeQuery(name, destination) });
  };

  if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
    push(tour.meetingPoint);
    tour.itinerary.forEach((day) => {
      const activities = Array.isArray(day.activities) && day.activities.length ? day.activities : [day.title];
      activities.forEach(push);
    });
  } else {
    push(tour.meetingPoint);
    (tour.highlights || []).forEach(push);
  }

  if (stops.length === 0) push(destination || tour.location || 'Sri Lanka');
  return stops;
}

export function itineraryUsesWalking(tour) {
  return tour.category === 'FOOD_TOURS';
}

function embedUrl(stops, walking, focusIndex) {
  const focused = focusIndex != null ? stops[focusIndex] : null;
  if (focused || stops.length < 2) {
    const query = encodeURIComponent((focused || stops[0]).query);
    return `https://maps.google.com/maps?q=${query}&z=15&hl=en&output=embed`;
  }
  const origin = encodeURIComponent(stops[0].query);
  const chain = stops.slice(1).map((stop) => encodeURIComponent(stop.query)).join('+to:');
  return `https://maps.google.com/maps?saddr=${origin}&daddr=${chain}&dirflg=${walking ? 'w' : 'd'}&hl=en&output=embed`;
}

function directionsUrl(stops, walking) {
  if (stops.length < 2) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0].query)}`;
  }
  const params = new URLSearchParams({
    api: '1',
    origin: stops[0].query,
    destination: stops[stops.length - 1].query,
    travelmode: walking ? 'walking' : 'driving'
  });
  const waypoints = stops.slice(1, -1).map((stop) => stop.query).join('|');
  if (waypoints) params.set('waypoints', waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function ItineraryMap({ stops, walking }) {
  const [focus, setFocus] = useState(null);
  if (!stops.length) return null;

  const active = focus != null && focus < stops.length ? focus : null;
  const routeLabel = walking ? 'Walking route' : 'Driving route';

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-primary-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-100 px-4 py-3">
        <div>
          <p className="font-bold text-ink">Itinerary on Google Maps</p>
          <p className="text-xs text-ink/60">{active != null ? stops[active].label : stops.length > 1 ? routeLabel : 'Meeting area'}</p>
        </div>
        <a
          href={directionsUrl(stops, walking)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-700"
        >
          Open in Google Maps
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <iframe
        title="Itinerary on Google Maps"
        src={embedUrl(stops, walking, active)}
        className="h-80 w-full bg-sand md:h-[420px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {stops.length > 1 && (
        <div className="flex flex-wrap gap-2 border-t border-primary-100 p-3">
          <button
            type="button"
            onClick={() => setFocus(null)}
            aria-pressed={active == null}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${active == null ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-100 bg-sand text-ink hover:border-primary-400'}`}
          >
            Full route
          </button>
          {stops.map((stop, index) => (
            <button
              key={`${stop.label}-${index}`}
              type="button"
              onClick={() => setFocus(index)}
              aria-pressed={active === index}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${active === index ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-100 bg-sand text-ink hover:border-primary-400'}`}
            >
              {index + 1}. {stop.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItineraryMap;
