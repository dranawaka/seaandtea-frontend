import { render } from '@testing-library/react';
import { usePageMeta } from './usePageMeta';

function Page({ title }) {
  usePageMeta({
    title,
    description: 'Season and local guides.',
    canonical: '/things-to-do',
    jsonLd: { '@type': 'Thing', name: 'Sea & Tea' }
  });
  return null;
}

test('usePageMeta sets tags and removes them on unmount', () => {
  const view = render(<Page title="Things to do in Sri Lanka" />);
  expect(document.title).toBe('Things to do in Sri Lanka');
  expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Season and local guides.');
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.seaandtea.com/things-to-do');
  expect(document.querySelector('script[data-ttd]').textContent).toContain('Thing');
  view.unmount();
  expect(document.querySelector('[data-ttd-meta]')).toBeNull();
  expect(document.querySelector('script[data-ttd]')).toBeNull();
});
