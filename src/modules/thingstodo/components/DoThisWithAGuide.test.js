import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../shared/context/AuthContext';
import DoThisWithAGuide from './DoThisWithAGuide';

function respond(body) {
  return Promise.resolve({ ok: true, status: 200, text: async () => JSON.stringify(body) });
}

function renderGuide() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DoThisWithAGuide kind="activities" slug="arugam-bay-surfing" destinationName="Arugam Bay" />
      </AuthProvider>
    </MemoryRouter>
  );
}

test('DoThisWithAGuide explains when no guide offers the activity', async () => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes('/tours')) return respond({ tours: [], guides: [] });
    return respond([]);
  });
  renderGuide();
  expect(await screen.findByText('No Sea & Tea guides offer this in Arugam Bay yet.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Browse guides' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tell us what you need' })).toBeInTheDocument();
});

test('DoThisWithAGuide shows tours and a view-tours link', async () => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes('/tours')) {
      return respond({
        tours: [{ id: 4, title: 'East coast surf', pricePerPerson: 80, destination: 'Arugam Bay' }],
        guides: [{ id: 9, firstName: 'Nimal', isVerified: true, averageRating: 4.8 }]
      });
    }
    return respond([]);
  });
  renderGuide();
  expect(await screen.findByText('East coast surf')).toBeInTheDocument();
  expect(screen.getByText('Nimal')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View tours' })).toBeInTheDocument();
  expect(screen.queryByText(/No Sea & Tea guides offer this/)).not.toBeInTheDocument();
});
