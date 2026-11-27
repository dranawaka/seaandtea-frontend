export const ACTIVITY_CATEGORIES = [
  { value: 'SURFING', slug: 'surfing', label: 'Surfing' },
  { value: 'WHALE_WATCHING', slug: 'whale-watching', label: 'Whale watching' },
  { value: 'SAFARI', slug: 'safari', label: 'Safari' },
  { value: 'HIKING', slug: 'hiking', label: 'Hiking' },
  { value: 'DIVING', slug: 'diving', label: 'Diving' },
  { value: 'SNORKELLING', slug: 'snorkelling', label: 'Snorkelling' },
  { value: 'TEA', slug: 'tea', label: 'Tea' },
  { value: 'KITESURFING', slug: 'kitesurfing', label: 'Kitesurfing' },
  { value: 'TRAIN', slug: 'train', label: 'Train' },
  { value: 'OTHER', slug: 'other', label: 'Other' }
];

export const ACTIVITY_REGIONS = [
  ['SOUTH_WEST_COAST', 'South and west coast'],
  ['EAST_COAST', 'East coast'],
  ['NORTH_WEST_COAST', 'North-west coast'],
  ['HILL_COUNTRY', 'Hill country'],
  ['CULTURAL_TRIANGLE', 'Cultural triangle'],
  ['SOUTH_EAST_PARKS', 'South-east parks'],
  ['NORTH_WEST_PARKS', 'North-west parks'],
  ['ISLAND_WIDE', 'Island-wide']
];

export const DIFFICULTIES = ['EASY', 'MODERATE', 'CHALLENGING', 'ALL_LEVELS'];

export const EVENT_TYPES = ['RELIGIOUS_FESTIVAL', 'CULTURAL', 'LITERARY', 'MUSIC', 'SPORT', 'FOOD', 'OTHER'];

export const TRADITIONS = ['BUDDHIST', 'HINDU', 'MUSLIM', 'CHRISTIAN', 'SECULAR', 'MIXED'];

export const RECURRENCE = ['FIXED_DATE', 'LUNAR_POYA', 'LUNAR_OTHER', 'TYPICAL_MONTH', 'ONE_OFF'];

export const CUISINES = [
  'SRI_LANKAN', 'SEAFOOD', 'SOUTH_INDIAN_VEG', 'WESTERN', 'ITALIAN',
  'JAPANESE_FUSION', 'CAFE', 'STREET_FOOD', 'BAR', 'OTHER'
];

export const DIETARY = [
  ['VEGETARIAN', 'Vegetarian'],
  ['VEGAN_OPTIONS', 'Vegan options'],
  ['HALAL', 'Halal'],
  ['GLUTEN_FREE_OPTIONS', 'Gluten-free options']
];

export const PRICE_TIERS = [
  { value: 'BUDGET', marks: '$', label: 'budget' },
  { value: 'MID', marks: '$$', label: 'mid-range' },
  { value: 'UPSCALE', marks: '$$$', label: 'upscale' }
];

export const DATE_STATUSES = ['CONFIRMED', 'EXPECTED', 'TO_BE_ANNOUNCED', 'CANCELLED', 'RESCHEDULED'];

export function pretty(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function categoryBySlug(slug) {
  return ACTIVITY_CATEGORIES.find((item) => item.slug === slug) || null;
}

export function categoryLabel(value) {
  return ACTIVITY_CATEGORIES.find((item) => item.value === value)?.label || pretty(value);
}

export function tierOf(value) {
  return PRICE_TIERS.find((item) => item.value === value) || null;
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}
