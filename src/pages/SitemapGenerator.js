import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSitemap, createSitemap, validateSitemap } from '../utils/sitemapGenerator';
import { getPublicVerifiedToursPaginated, getVerifiedGuidesPaginated } from '../config/api';

const SitemapGenerator = () => {
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sitemapXml, setSitemapXml] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load tours and guides data
      const [toursResponse, guidesResponse] = await Promise.all([
        getPublicVerifiedToursPaginated(0, 1000, {}), // Get all tours
        getVerifiedGuidesPaginated(0, 1000) // Get all guides
      ]);

      const toursData = Array.isArray(toursResponse) ? toursResponse : (toursResponse.content || []);
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse.content || []);

      setTours(toursData);
      setGuides(guidesData);

      // Generate sitemap with real data
      const sitemap = generateSitemap(toursData, guidesData);
      setSitemapXml(sitemap);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load tours and guides data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSitemap = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const sitemap = generateSitemap(tours, guides);
      
      // Validate the generated sitemap
      if (validateSitemap(sitemap)) {
        setSitemapXml(sitemap);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Generated sitemap is invalid');
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setError('Failed to generate sitemap');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSitemap = async () => {
    try {
      await createSitemap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error downloading sitemap:', error);
      setError('Failed to download sitemap');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sitemap Generator
            </h1>
            <p className="text-lg text-gray-600">
              Generate and download XML sitemaps for search engine optimization
            </p>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tours</h3>
                  <p className="text-2xl font-bold text-blue-600">{tours.length}</p>
                  <p className="text-sm text-gray-600">Available tours</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Guides</h3>
                  <p className="text-2xl font-bold text-green-600">{guides.length}</p>
                  <p className="text-sm text-gray-600">Verified guides</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-outline flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>

            <button
              onClick={handleGenerateSitemap}
              disabled={loading || tours.length === 0}
              className="btn-primary flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              Generate Sitemap
            </button>

            <button
              onClick={handleDownloadSitemap}
              disabled={!sitemapXml}
              className="btn-secondary flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download XML
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-green-800">Sitemap generated and downloaded successfully!</p>
              </div>
            </div>
          )}

          {/* Sitemap Preview */}
          {sitemapXml && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Sitemap Preview</h3>
              <div className="bg-white rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {sitemapXml.substring(0, 1000)}
                  {sitemapXml.length > 1000 && '\n... (truncated, full sitemap available for download)'}
                </pre>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Total URLs: {sitemapXml.split('<url>').length - 1}</p>
                <p>File size: {(sitemapXml.length / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>1. <strong>Refresh Data:</strong> Load the latest tours and guides from your database</p>
              <p>2. <strong>Generate Sitemap:</strong> Create an XML sitemap with all your content</p>
              <p>3. <strong>Download XML:</strong> Save the sitemap file to your computer</p>
              <p>4. <strong>Upload:</strong> Place the sitemap.xml file in your website's root directory</p>
              <p>5. <strong>Submit:</strong> Submit your sitemap to Google Search Console and other search engines</p>
            </div>
          </div>

          {/* SEO Tips */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Tips</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• Update your sitemap regularly when you add new tours or guides</p>
              <p>• Submit your sitemap to Google Search Console for better indexing</p>
              <p>• Use the robots.txt file to guide search engine crawlers</p>
              <p>• Consider creating separate sitemaps for different content types</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapGenerator;
