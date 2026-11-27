import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminThingsToDo from './AdminThingsToDo';

jest.mock('../../../shared/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'USER' }, isLoading: false, token: null })
}));

test('admin things-to-do denies a non-admin', () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, text: async () => '[]' }));
  render(
    <MemoryRouter>
      <AdminThingsToDo />
    </MemoryRouter>
  );
  expect(screen.getByText('Access Denied')).toBeInTheDocument();
});
