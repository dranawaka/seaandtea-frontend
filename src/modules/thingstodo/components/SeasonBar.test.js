import { render, screen } from '@testing-library/react';
import { describeSeason } from '../utils/season';
import SeasonBar from './SeasonBar';

test('describeSeason groups a wrap-around season and its peak', () => {
  expect(describeSeason([11, 12, 1, 2, 3, 4], [12, 1, 2, 3])).toBe(
    'In season: November to April. Best: December to March.'
  );
});

test('SeasonBar exposes the season in text and marks the current and peak months', () => {
  render(<SeasonBar seasonMonths={[11, 12, 1, 2, 3, 4]} peakMonths={[12, 1]} month={7} />);
  expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'In season: November to April. Best: December to January.');
  expect(document.querySelector('[data-month="7"]')).toHaveAttribute('data-current', 'true');
  expect(document.querySelector('[data-month="12"]')).toHaveAttribute('data-peak', 'true');
  expect(document.querySelector('[data-month="12"]').querySelector('span')).toBeTruthy();
});
