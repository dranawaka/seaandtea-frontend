import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useQueryFilters } from './useQueryFilters';

function Probe() {
  const { values, setFilters } = useQueryFilters(['q', 'category']);
  const location = useLocation();
  return (
    <div>
      <span data-testid="q">{values.q}</span>
      <span data-testid="search">{location.search}</span>
      <button type="button" onClick={() => setFilters({ q: 'surf', category: 'SURFING' })}>Apply filters</button>
    </div>
  );
}

test('useQueryFilters writes and reads the URL', async () => {
  render(
    <MemoryRouter initialEntries={['/things-to-do/activities?q=tea']}>
      <Probe />
    </MemoryRouter>
  );
  expect(screen.getByTestId('q')).toHaveTextContent('tea');
  await userEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  expect(screen.getByTestId('q')).toHaveTextContent('surf');
  expect(screen.getByTestId('search').textContent).toContain('category=SURFING');
  expect(screen.getByTestId('search').textContent).toContain('q=surf');
});
