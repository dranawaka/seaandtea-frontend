/** Stored tour prices are USD. LKR on cards uses this display rate. */
export const USD_TO_LKR = 300;

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

/** Galle Face promenade and the Colombo skyline. Sigiriya's rock photo was reused here by mistake. */
const COLOMBO_IMAGE = 'https://images.pexels.com/photos/20711999/pexels-photo-20711999.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&q=80';

export const DESTINATIONS = [
  { slug: 'colombo', name: 'Colombo', image: COLOMBO_IMAGE },
  { slug: 'kandy', name: 'Kandy', image: photo('photo-1546708973-b339540b5162') },
  { slug: 'sigiriya', name: 'Sigiriya', image: photo('photo-1588598198321-9735fd52455b') },
  { slug: 'ella', name: 'Ella', image: photo('photo-1566296314736-6eaac1ca0cb9') },
  { slug: 'nuwara-eliya', name: 'Nuwara Eliya', image: photo('photo-1477587458883-47145ed94245') },
  { slug: 'galle', name: 'Galle', image: photo('photo-1544551763-46a013bb70d5') },
  { slug: 'mirissa', name: 'Mirissa', image: photo('photo-1507525428034-b723cf961d3e') },
  { slug: 'bentota', name: 'Bentota', image: photo('photo-1519046904884-53103b34b206') },
  { slug: 'yala', name: 'Yala', image: photo('photo-1549366021-9f761d450615') },
  { slug: 'wilpattu', name: 'Wilpattu', image: photo('photo-1516426122078-c23e76319801') },
  { slug: 'trincomalee', name: 'Trincomalee', image: photo('photo-1559827260-dc66d52bef19') },
  { slug: 'negombo', name: 'Negombo', image: photo('photo-1500375592092-40eb2168fd21') }
];

export const REGIONS = [
  { slug: 'colombo', name: 'Colombo', image: COLOMBO_IMAGE, destinations: ['Colombo'] },
  { slug: 'kandy', name: 'Kandy', image: photo('photo-1546708973-b339540b5162'), destinations: ['Kandy'] },
  { slug: 'ella-tea-country', name: 'Ella & Tea Country', image: photo('photo-1566296314736-6eaac1ca0cb9'), destinations: ['Ella', 'Nuwara Eliya'] },
  { slug: 'galle-south-coast', name: 'Galle & South Coast', image: photo('photo-1544551763-46a013bb70d5'), destinations: ['Galle', 'Mirissa', 'Bentota'] },
  { slug: 'sigiriya-cultural-triangle', name: 'Sigiriya & Cultural Triangle', image: photo('photo-1588598198321-9735fd52455b'), destinations: ['Sigiriya'] },
  { slug: 'yala-wilpattu', name: 'Yala / Wilpattu', image: photo('photo-1549366021-9f761d450615'), destinations: ['Yala', 'Wilpattu'] },
  { slug: 'trincomalee-east-coast', name: 'Trincomalee / East Coast', image: photo('photo-1559827260-dc66d52bef19'), destinations: ['Trincomalee'] },
  { slug: 'negombo', name: 'Negombo', image: photo('photo-1500375592092-40eb2168fd21'), destinations: ['Negombo'] },
  { slug: 'nuwara-eliya', name: 'Nuwara Eliya', image: photo('photo-1477587458883-47145ed94245'), destinations: ['Nuwara Eliya'] }
];

export const TOUR_CATEGORIES = [
  { value: 'TEA_TOURS', label: 'Tea & Nature' },
  { value: 'BEACH_TOURS', label: 'Beach & Water' },
  { value: 'WILDLIFE_TOURS', label: 'Wildlife' },
  { value: 'CULTURAL_TOURS', label: 'Culture & Temples' },
  { value: 'FOOD_TOURS', label: 'Food & Cooking' },
  { value: 'SCENIC_TOURS', label: 'Trains & Scenic' },
  { value: 'ADVENTURE_TOURS', label: 'Adventure' },
  { value: 'FAMILY_TOURS', label: 'Family' }
];

export function destinationBySlug(slug) {
  return REGIONS.find((item) => item.slug === slug)
    || DESTINATIONS.find((item) => item.slug === slug)
    || null;
}

export function categoryLabel(value) {
  return TOUR_CATEGORIES.find((item) => item.value === value)?.label || String(value || '').replace(/_/g, ' ');
}

export function formatDuration(hours) {
  const value = Number(hours);
  if (!value) return '';
  if (value % 24 === 0) {
    const days = value / 24;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return `${value} ${value === 1 ? 'hour' : 'hours'}`;
}

export function formatPrice(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '';
  return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export function formatUsd(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '';
  return `USD ${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export function formatLkr(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '';
  const lkr = Math.round(value * USD_TO_LKR);
  return `LKR ${lkr.toLocaleString('en-US')}`;
}

export function tourBadges(tour) {
  const badges = [];
  if (tour.category === 'TEA_TOURS') badges.push('Tea experience');
  if (tour.category === 'BEACH_TOURS') badges.push('Beach');
  const text = `${tour.meetingPoint || ''} ${tour.highlightsPreview || ''} ${(tour.includedItems || []).join(' ')}`.toLowerCase();
  if (tour.pickupAvailable === true || /pick-?\s?up|hotel transfer/.test(text)) {
    badges.push('Pickup available');
  }
  const size = Number(tour.maxGroupSize);
  if (size > 0 && size <= 8) badges.push('Small group');
  if (tour.guideIsVerified) badges.push('Verified');
  return badges.slice(0, 3);
}
