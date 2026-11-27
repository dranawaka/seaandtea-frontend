import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActivitiesList from './ActivitiesList';

function respond(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body)
  });
}

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/things-to-do/activities']}>
      <ActivitiesList />
    </MemoryRouter>
  );
}

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes('/destinations')) return respond([]);
    return respond({ content: [], totalElements: 0 });
  });
});

test('ActivitiesList shows a skeleton, then an empty state', async () => {
  renderList();
  expect(screen.getByText('Loading activities')).toBeInTheDocument();
  expect(await screen.findByText('No activities match these filters')).toBeInTheDocument();
});

test('ActivitiesList shows an error with retry', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('down')));
  renderList();
  expect(await screen.findByText('We could not load this page')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
});

test('ActivitiesList shows a published activity', async () => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes('/destinations')) return respond([]);
    return respond({
      content: [{
        slug: 'arugam-bay-surfing',
        title: 'Arugam Bay surfing',
        category: 'SURFING',
        destination: { slug: 'arugam-bay', name: 'Arugam Bay' },
        seasonMonths: [5, 6, 7, 8, 9],
        peakMonths: [6, 7],
        inSeasonNow: true,
        linkedTourCount: 0,
        fromPriceUsd: null
      }],
      totalElements: 1
    });
  });
  renderList();
  expect(await screen.findByRole('link', { name: 'Arugam Bay surfing' })).toBeInTheDocument();
  expect(screen.getAllByText('In season now').length).toBeGreaterThan(0);
});
