const fs = require('fs');
const path = require('path');
const seo = require('../src/modules/thingstodo/utils/seo');

const HOST = 'https://www.seaandtea.com';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pagePath(type, slug) {
  const folder = type === 'ACTIVITY' ? 'activities' : type === 'EVENT' ? 'events' : 'restaurants';
  return `/things-to-do/${folder}/${slug}`;
}

function absoluteUrl(type, slug) {
  return `${HOST}${pagePath(type, slug)}`;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function withMeta(template, { title, description, canonical, jsonLd, fallback }) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  const block = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    jsonLd ? `<script type="application/ld+json">${escapeHtml(JSON.stringify(jsonLd))}</script>` : ''
  ].join('');
  html = html.replace('</head>', `${block}</head>`);
  return html.replace('<div id="root">', `<div id="root">${fallback}`);
}

function fallbackFor(item, kind) {
  const name = item.title || item.name || 'Things to do';
  const facts = [item.summary, item.destination && item.destination.name, item.venueName].filter(Boolean);
  return `<main><h1>${escapeHtml(name)}</h1><p>${escapeHtml(item.summary || '')}</p><ul>${facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul><p><a href="${escapeHtml(kind)}">More things to do</a></p></main>`;
}

async function mapPool(items, limit, worker) {
  const queue = items.slice();
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const api = process.env.REACT_APP_API_BASE_URL;
  if (!api) {
    console.warn('REACT_APP_API_BASE_URL is not set; skipping Things to do prerender.');
    return;
  }
  const buildDir = path.join(__dirname, '..', 'build');
  const indexFile = path.join(buildDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    console.warn('build/index.html is missing; skipping Things to do prerender.');
    return;
  }
  const base = api.replace(/\/$/, '');
  let entries;
  try {
    entries = await fetchJson(`${base}/things-to-do/sitemap`);
  } catch (error) {
    console.warn(`Things to do prerender skipped: ${error.message}`);
    return;
  }
  const template = fs.readFileSync(indexFile, 'utf8');
  const details = [];
  await mapPool(entries, 5, async (entry) => {
    const type = String(entry.type || '').toUpperCase();
    const folder = type === 'ACTIVITY' ? 'activities' : type === 'EVENT' ? 'events' : 'restaurants';
    try {
      const item = await fetchJson(`${base}/${folder}/${entry.slug}`);
      details.push({ type, item });
    } catch (error) {
      console.warn(`Skipped ${entry.slug}: ${error.message}`);
    }
  });

  const pages = [
    { file: 'things-to-do', title: 'Things to do in Sri Lanka | Sea & Tea', description: 'Activities, events and restaurants in Sri Lanka.', path: '/things-to-do' }
  ];
  ['activities', 'events', 'restaurants'].forEach((folder) => {
    pages.push({
      file: `things-to-do/${folder}`,
      title: `${folder[0].toUpperCase()}${folder.slice(1)} in Sri Lanka | Sea & Tea`,
      description: `${folder} in Sri Lanka with local guides.`,
      path: `/things-to-do/${folder}`
    });
  });

  pages.forEach((page) => {
    const html = withMeta(template, {
      title: page.title,
      description: page.description,
      canonical: `${HOST}${page.path}`,
      fallback: `<main><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></main>`
    });
    const dir = path.join(buildDir, page.file);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  });

  details.forEach(({ type, item }) => {
    const url = absoluteUrl(type, item.slug);
    const jsonLd = type === 'EVENT'
      ? seo.buildEventJsonLd(item, (item.occurrences || []).find((row) => row.dateStatus === 'CONFIRMED' && row.startDate))
      : type === 'RESTAURANT'
        ? seo.buildRestaurantJsonLd(item)
        : seo.buildAttractionJsonLd(item);
    const html = withMeta(template, {
      title: (item.seoTitle || item.title || item.name || 'Things to do').slice(0, 60),
      description: (item.seoDescription || item.summary || '').slice(0, 155),
      canonical: url,
      jsonLd,
      fallback: fallbackFor(item, pagePath(type, item.slug))
    });
    const dir = path.join(buildDir, pagePath(type, item.slug).replace(/^\//, ''));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  });

  const urls = [
    `${HOST}/things-to-do`,
    `${HOST}/things-to-do/activities`,
    `${HOST}/things-to-do/events`,
    `${HOST}/things-to-do/restaurants`,
    ...details.map(({ type, item }) => absoluteUrl(type, item.slug))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((loc) => `  <url><loc>${escapeHtml(loc)}</loc></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(buildDir, 'sitemap-things-to-do.xml'), xml);
}

if (require.main === module) {
  main().catch((error) => {
    console.warn(error.message || error);
  });
}

module.exports = { escapeHtml, pagePath, absoluteUrl };
