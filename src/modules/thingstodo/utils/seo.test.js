const seo = require('./seo');

test('buildEventJsonLd is null until a confirmed start date exists', () => {
  const event = { name: 'Perahera', slug: 'perahera', destination: { name: 'Kandy' }, venueName: 'Temple' };
  expect(seo.buildEventJsonLd(event, { dateStatus: 'EXPECTED', startDate: null })).toBeNull();
  const json = seo.buildEventJsonLd(event, { dateStatus: 'CONFIRMED', startDate: '2027-08-10', ticketUrl: 'https://example.com/tickets' });
  expect(json['@type']).toBe('Event');
  expect(json.startDate).toBe('2027-08-10');
  expect(json.location.address.addressCountry).toBe('LK');
  expect(json.offers.url).toBe('https://example.com/tickets');
  expect(JSON.stringify(json)).not.toContain('aggregateRating');
});

test('restaurant JSON-LD never includes a rating', () => {
  const json = seo.buildRestaurantJsonLd({
    name: 'Crab',
    slug: 'crab',
    priceTier: 'UPSCALE',
    cuisines: ['SEAFOOD'],
    destination: { name: 'Colombo' },
    addressLine: 'Fort'
  });
  expect(json['@type']).toBe('Restaurant');
  expect(json.priceRange).toBe('$$$');
  expect(json.aggregateRating).toBeUndefined();
});
