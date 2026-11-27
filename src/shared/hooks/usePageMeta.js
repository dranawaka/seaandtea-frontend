import { useEffect } from 'react';

export const CANONICAL_HOST = (process.env.REACT_APP_BASE_URL || 'https://www.seaandtea.com').replace(/\/$/, '');

export function clampText(value, max) {
  const text = String(value || '');
  return text.length > max ? text.slice(0, max) : text;
}

function tagged(selector, create) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = create();
    node.setAttribute('data-ttd-meta', '1');
    document.head.appendChild(node);
  }
  return node;
}

export function usePageMeta({ title, description, canonical, image, noindex, jsonLd }) {
  const json = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const previousTitle = document.title;
    const nextTitle = clampText(title, 60);
    const nextDescription = clampText(description, 155);
    document.title = nextTitle;

    const descriptionNode = tagged('meta[name="description"][data-ttd-meta]', () => {
      const node = document.createElement('meta');
      node.setAttribute('name', 'description');
      return node;
    });
    descriptionNode.setAttribute('content', nextDescription);

    const path = canonical || window.location.pathname;
    const href = path.startsWith('http') ? path : `${CANONICAL_HOST}${path.startsWith('/') ? path : `/${path}`}`;
    const canonicalNode = tagged('link[rel="canonical"][data-ttd-meta]', () => {
      const node = document.createElement('link');
      node.setAttribute('rel', 'canonical');
      return node;
    });
    canonicalNode.setAttribute('href', href);

    const setMeta = (attribute, key, content) => {
      const node = tagged(`meta[${attribute}="${key}"][data-ttd-meta]`, () => {
        const created = document.createElement('meta');
        created.setAttribute(attribute, key);
        return created;
      });
      node.setAttribute('content', content || '');
    };
    setMeta('property', 'og:title', nextTitle);
    setMeta('property', 'og:description', nextDescription);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', href);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', nextTitle);
    setMeta('name', 'twitter:description', nextDescription);
    setMeta('name', 'twitter:image', image);

    const robots = tagged('meta[name="robots"][data-ttd-meta]', () => {
      const node = document.createElement('meta');
      node.setAttribute('name', 'robots');
      return node;
    });
    robots.setAttribute('content', noindex ? 'noindex' : 'index,follow');

    const existing = document.head.querySelector('script[type="application/ld+json"][data-ttd]');
    if (json) {
      const script = existing || document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-ttd', '');
      script.textContent = json;
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }

    return () => {
      document.title = previousTitle;
      document.head.querySelectorAll('[data-ttd-meta]').forEach((node) => node.remove());
      document.head.querySelectorAll('script[data-ttd]').forEach((node) => node.remove());
    };
  }, [title, description, canonical, image, noindex, json]);
}
