// Sitemap generator utility for Sea & Tea Tours
// This generates a dynamic sitemap based on your routes and content

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://seaandtea.com';

// Static routes that should always be included
const STATIC_ROUTES = [
  {
    url: '/',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/tours',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/guides',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/tea',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/seas',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/login',
    changefreq: 'monthly',
    priority: '0.3',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/register',
    changefreq: 'monthly',
    priority: '0.4',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

// Function to generate XML sitemap
export const generateSitemap = (tours = [], guides = []) => {
  const routes = [...STATIC_ROUTES];
  
  // Add dynamic tour routes
  tours.forEach(tour => {
    routes.push({
      url: `/tour/${tour.id}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: tour.updatedAt ? new Date(tour.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  });
  
  // Add dynamic guide routes
  guides.forEach(guide => {
    routes.push({
      url: `/guide/${guide.id}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: guide.updatedAt ? new Date(guide.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  });
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
};

// Function to generate sitemap index (for multiple sitemaps)
export const generateSitemapIndex = (sitemaps = []) => {
  const defaultSitemaps = [
    {
      loc: `${BASE_URL}/sitemap.xml`,
      lastmod: new Date().toISOString().split('T')[0]
    }
  ];
  
  const allSitemaps = [...defaultSitemaps, ...sitemaps];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  return xml;
};

// Function to create and download sitemap
export const createSitemap = async () => {
  try {
    // In a real application, you would fetch tours and guides from your API
    // For now, we'll create a basic sitemap with static routes
    const sitemap = generateSitemap();
    
    // Create a blob and download
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return sitemap;
  } catch (error) {
    console.error('Error creating sitemap:', error);
    throw error;
  }
};

// Function to validate sitemap XML
export const validateSitemap = (xml) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    
    if (parseError) {
      throw new Error('Invalid XML: ' + parseError.textContent);
    }
    
    return true;
  } catch (error) {
    console.error('Sitemap validation error:', error);
    return false;
  }
};

export default {
  generateSitemap,
  generateSitemapIndex,
  createSitemap,
  validateSitemap
};
