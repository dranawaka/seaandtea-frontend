const HOST = 'https://www.seaandtea.com';

const STATUS = {
  CONFIRMED: 'https://schema.org/EventScheduled',
  CANCELLED: 'https://schema.org/EventCancelled',
  RESCHEDULED: 'https://schema.org/EventRescheduled'
};

const PRICE = { BUDGET: '$', MID: '$$', UPSCALE: '$$$' };

function compact(value) {
  if (!value || typeof value !== 'object') return value;
  const next = Array.isArray(value) ? [] : {};
  Object.keys(value).forEach((key) => {
    const item = value[key];
    if (item === undefined || item === null || item === '') return;
    next[key] = compact(item);
  });
  return next;
}

function buildEventJsonLd(event, occurrence) {
  if (!occurrence || occurrence.dateStatus !== 'CONFIRMED' || !occurrence.startDate) return null;
  const start = occurrence.startTime
    ? `${occurrence.startDate}T${occurrence.startTime}+05:30`
    : occurrence.startDate;
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: start,
    endDate: occurrence.endDate || undefined,
    eventStatus: STATUS[occurrence.dateStatus] || STATUS.CONFIRMED,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venueName || (event.destination && event.destination.name) || 'Sri Lanka',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.destination && event.destination.name,
        addressCountry: 'LK'
      }
    },
    description: event.description || event.summary,
    image: event.heroImageUrl,
    url: `${HOST}/things-to-do/events/${event.slug}`,
    offers: occurrence.ticketUrl ? { '@type': 'Offer', url: occurrence.ticketUrl } : undefined
  });
}

function buildAttractionJsonLd(activity) {
  if (!activity) return null;
  return compact({
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'Place'],
    name: activity.title,
    description: activity.summary,
    image: activity.heroImageUrl,
    url: `${HOST}/things-to-do/activities/${activity.slug}`,
    geo: activity.latitude != null ? {
      '@type': 'GeoCoordinates',
      latitude: activity.latitude,
      longitude: activity.longitude
    } : undefined,
    containedInPlace: activity.destination ? { '@type': 'Place', name: activity.destination.name } : undefined,
    touristType: activity.category
  });
}

function buildRestaurantJsonLd(restaurant) {
  if (!restaurant) return null;
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    image: restaurant.heroImageUrl,
    url: `${HOST}/things-to-do/restaurants/${restaurant.slug}`,
    telephone: restaurant.phone,
    servesCuisine: restaurant.cuisines,
    priceRange: PRICE[restaurant.priceTier],
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.addressLine,
      addressLocality: restaurant.destination && restaurant.destination.name,
      addressCountry: 'LK'
    },
    geo: restaurant.latitude != null ? {
      '@type': 'GeoCoordinates',
      latitude: restaurant.latitude,
      longitude: restaurant.longitude
    } : undefined
  });
}

function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: (items || []).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${HOST}${item.path}`
    }))
  };
}

function buildItemListJsonLd(name, path, entries) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: (entries || []).map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${HOST}${path}/${entry.slug}`,
      name: entry.title || entry.name
    }))
  };
}

module.exports = {
  buildEventJsonLd,
  buildAttractionJsonLd,
  buildRestaurantJsonLd,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd
};
