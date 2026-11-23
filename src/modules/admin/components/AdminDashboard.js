import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye, UserCheck, CheckCircle, AlertCircle, Trash2, Edit2, ShoppingBag, Calendar, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Newspaper, Image as ImageIcon } from 'lucide-react';
import { deleteProductApi, listAllNewsAdminApi, deleteNewsPostApi, getHomepageSliderApi, uploadHomepageSliderImageApi, deleteHomepageSliderImageApi, validateUploadFile, getAdminStatistics } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchProductsFromApi } from '../../shop/data/shopProducts';
import AdminShell from './AdminShell';
import GuideApprovalQueue from './GuideApprovalQueue';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsVersion, setStatsVersion] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [allNews, setAllNews] = useState([]);
  const [newsPage, setNewsPage] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [deletingNewsId, setDeletingNewsId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderLoading, setSliderLoading] = useState(false);
  const [sliderUploading, setSliderUploading] = useState(false);
  const [deletingSliderId, setDeletingSliderId] = useState(null);
  const [sliderFile, setSliderFile] = useState(null);
  const [sliderAltText, setSliderAltText] = useState('');
  const [sliderSortOrder, setSliderSortOrder] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminStatistics(token);
        if (!cancelled) {
          setStats(data);
          setStatsError(null);
        }
      } catch (err) {
        if (!cancelled) setStatsError(err.message || 'Failed to load statistics.');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, token, statsVersion]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAllProducts();
      loadAllNews(0, 10);
      loadSliderImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load products from API only (no hardcoded or local fallback)
  const loadAllProducts = async () => {
    setProductsLoading(true);
    setError(null);
    try {
      const fromApi = await fetchProductsFromApi();
      setAllProducts(Array.isArray(fromApi) ? fromApi : []);
    } catch (err) {
      console.warn('Products API unavailable:', err);
      setAllProducts([]);
      setError(err.message || 'Failed to load products. Check that the backend is running.');
    } finally {
      setProductsLoading(false);
    }
  };

  // Delete product (admin) via API or local
  const deleteProduct = async (productId) => {
    if (!window.confirm('Remove this product from the shop? This cannot be undone.')) return;
    try {
      if (token) {
        await deleteProductApi(productId, token);
        setSuccess('Product removed successfully.');
      } else {
        setAllProducts(prev => prev.filter(p => p.id !== productId));
        setSuccess('Product removed successfully.');
      }
      setAllProducts(prev => prev.filter(p => p.id !== productId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove product.');
    }
  };

  // Load all news posts (admin) – GET /news/admin/all
  const loadAllNews = async (page = 0, size = 10) => {
    try {
      setNewsLoading(true);
      setError(null);
      const data = await listAllNewsAdminApi({ page, size }, token);
      const list = data.content ?? [];
      setAllNews(list);
      setNewsPage(prev => ({
        ...prev,
        page: data.number ?? page,
        size: data.size ?? size,
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? list.length
      }));
    } catch (err) {
      console.error('Error loading news:', err);
      setAllNews([]);
      setError(err.message || 'Failed to load news posts.');
    } finally {
      setNewsLoading(false);
    }
  };

  // Delete news post (admin)
  const deleteNewsPost = async (postId) => {
    if (!window.confirm('Permanently delete this post and all its likes and comments? This cannot be undone.')) return;
    try {
      setDeletingNewsId(postId);
      setError(null);
      await deleteNewsPostApi(postId, token);
      setAllNews(prev => prev.filter(p => p.id !== postId));
      setNewsPage(prev => ({ ...prev, totalElements: Math.max(0, (prev.totalElements || 0) - 1) }));
      setSuccess('Post deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    } finally {
      setDeletingNewsId(null);
    }
  };

  const loadSliderImages = async () => {
    try {
      setSliderLoading(true);
      setError(null);
      const list = await getHomepageSliderApi();
      setSliderImages(Array.isArray(list) ? list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
    } catch (err) {
      console.error('Error loading homepage slider:', err);
      setSliderImages([]);
      setError(err.message || 'Failed to load homepage slider.');
    } finally {
      setSliderLoading(false);
    }
  };

  const uploadSliderImage = async (e) => {
    e.preventDefault();
    const file = sliderFile || (e.target?.files?.[0]);
    if (!file) {
      setError('Please select an image (JPEG, PNG, WebP; max 10 MB).');
      return;
    }
    const err = validateUploadFile(file);
    if (err) {
      setError(err);
      return;
    }
    try {
      setSliderUploading(true);
      setError(null);
      const options = {};
      if (sliderAltText.trim()) options.altText = sliderAltText.trim();
      if (sliderSortOrder !== '' && !Number.isNaN(Number(sliderSortOrder))) options.sortOrder = Number(sliderSortOrder);
      await uploadHomepageSliderImageApi(file, options, token);
      setSuccess('Slider image added.');
      setTimeout(() => setSuccess(null), 3000);
      setSliderFile(null);
      setSliderAltText('');
      setSliderSortOrder('');
      const input = document.getElementById('slider-file-input');
      if (input) input.value = '';
      loadSliderImages();
    } catch (err) {
      setError(err.message || 'Failed to upload slider image.');
    } finally {
      setSliderUploading(false);
    }
  };

  const deleteSliderImage = async (id) => {
    if (!window.confirm('Remove this image from the homepage slider?')) return;
    try {
      setDeletingSliderId(id);
      setError(null);
      await deleteHomepageSliderImageApi(id, token);
      setSliderImages(prev => prev.filter((s) => s.id !== id));
      setSuccess('Slider image removed.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove slider image.');
    } finally {
      setDeletingSliderId(null);
    }
  };

  const statNumber = (value) => (
    statsLoading && !stats
      ? <span className="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse" aria-label="Loading" />
      : (stats ? value : '—')
  );

  return (
    <AdminShell title="Admin Dashboard" description="Approve guides waiting in the queue, and manage the shop, news, and homepage.">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {statsError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            {statsError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/users" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{statNumber(stats?.totalUsers)}</dd>
                </div>
              </div>
            </div>
          </Link>
          <Link to="/admin/guides?status=VERIFIED" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <UserCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Verified Guides</dt>
                  <dd className="text-lg font-medium text-gray-900">{statNumber(stats?.verifiedGuides)}</dd>
                </div>
              </div>
            </div>
          </Link>
          <Link to="/admin/guides" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-amber-500 flex-shrink-0" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Pending Guides</dt>
                  <dd className="text-lg font-medium text-gray-900">{statNumber(stats?.pendingGuides)}</dd>
                </div>
              </div>
            </div>
          </Link>
          <Link to="/admin/bookings" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-primary-500 flex-shrink-0" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">{statNumber(stats?.totalBookings)}</dd>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <GuideApprovalQueue
          token={token}
          status="PENDING"
          onChanged={() => setStatsVersion((version) => version + 1)}
        />

        {/* All Products - Admin edit/remove */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {allProducts.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/product/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add product
                </Link>
                <button
                  onClick={loadAllProducts}
                  disabled={productsLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {productsLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading products...</div>
            ) : allProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No products found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(product.price).toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/product/${product.id}/edit`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* News & Posts */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Newspaper className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">News & Posts</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {newsPage.totalElements ?? allNews.length} posts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/news/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create post
                </Link>
                <button
                  onClick={() => loadAllNews(newsPage.page, newsPage.size)}
                  disabled={newsLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {newsLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading news...</div>
            ) : allNews.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No posts yet. Create one to get started.</div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes / Comments</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allNews.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{p.title}</div>
                          {p.bodySummary && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{p.bodySummary}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.authorDisplayName || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {p.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(p.likeCount ?? 0)} / {(p.commentCount ?? 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/news/${p.id}/edit`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteNewsPost(p.id)}
                              disabled={deletingNewsId === p.id}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(newsPage.totalPages > 1 || allNews.length >= newsPage.size) && (
                  <div className="px-6 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                      Page {newsPage.page + 1} of {Math.max(1, newsPage.totalPages)} ({newsPage.totalElements} total)
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => loadAllNews(0, newsPage.size)}
                        disabled={newsLoading || newsPage.page <= 0}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllNews(newsPage.page - 1, newsPage.size)}
                        disabled={newsLoading || newsPage.page <= 0}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllNews(newsPage.page + 1, newsPage.size)}
                        disabled={newsLoading || newsPage.page >= Math.max(1, newsPage.totalPages) - 1}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllNews(Math.max(0, newsPage.totalPages - 1), newsPage.size)}
                        disabled={newsLoading || newsPage.page >= Math.max(1, newsPage.totalPages) - 1}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Homepage Slider */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Homepage Slider</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {sliderImages.length} images
                </span>
              </div>
              <button
                onClick={loadSliderImages}
                disabled={sliderLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <form onSubmit={uploadSliderImage} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (JPEG, PNG, WebP; max 10 MB)</label>
                <input
                  id="slider-file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setSliderFile(e.target.files?.[0] || null)}
                  className="block text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt text (optional)</label>
                <input
                  type="text"
                  value={sliderAltText}
                  onChange={(e) => setSliderAltText(e.target.value)}
                  placeholder="Description for accessibility"
                  className="block w-48 py-2 px-3 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort order (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={sliderSortOrder}
                  onChange={(e) => setSliderSortOrder(e.target.value)}
                  placeholder="0"
                  className="block w-24 py-2 px-3 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={sliderUploading || !sliderFile}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                {sliderUploading ? 'Uploading…' : 'Add image'}
              </button>
            </form>
            {sliderLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading slider images…</div>
            ) : sliderImages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No slider images yet. Add one above; the homepage will use default images until then.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sliderImages.map((img) => (
                  <div key={img.id} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <img src={img.imageUrl} alt={img.altText || 'Slider'} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 truncate flex-1 mr-2" title={img.altText || ''}>{img.altText || `Order ${img.sortOrder ?? '-'}`}</span>
                      <button
                        type="button"
                        onClick={() => deleteSliderImage(img.id)}
                        disabled={deletingSliderId === img.id}
                        className="inline-flex items-center p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Remove from slider"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

    </AdminShell>
  );
};

export default AdminDashboard;
