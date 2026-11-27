import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import FilterBar, { Chip } from './FilterBar';
import { useQueryFilters } from '../hooks/useQueryFilters';

function Harness() {
  const { values, setFilters } = useQueryFilters(['category']);
  const location = useLocation();
  return (
    <>
      <FilterBar open activeCount={values.category ? 1 : 0} onOpenChange={() => {}} onClear={() => setFilters({ category: '' })}>
        <Chip pressed={values.category === 'SURFING'} onClick={() => setFilters({ category: 'SURFING' })}>Surfing</Chip>
      </FilterBar>
      <span data-testid="search">{location.search}</span>
    </>
  );
}

test('FilterBar writes the selected chip into the URL', async () => {
  render(
    <MemoryRouter initialEntries={['/things-to-do/activities']}>
      <Harness />
    </MemoryRouter>
  );
  await userEvent.click(screen.getAllByRole('button', { name: 'Surfing' })[0]);
  expect(screen.getByTestId('search').textContent).toContain('category=SURFING');
});
