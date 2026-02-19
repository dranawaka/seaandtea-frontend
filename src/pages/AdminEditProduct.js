import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { getProducts, saveProducts, getProductById, fetchProductByIdFromApi, mapProductToApi } from '../data/shopProducts';
import { updateProductApi, createProductApi } from '../config/api';
import { useAuth } from '../context/AuthContext';
import ImagePicker from '../components/ImagePicker';

const CATEGORIES = [
  { id: 'sea', name: 'Sea & Beach Wears and Handy Crafts' },
  { id: 'tea', name: 'Premium Tea' },
  { id: 'spices', name: 'Spices & Food' },
  { id: 'clothing', name: 'Clothing & Textiles' },
  { id: 'souvenirs', name: 'Souvenirs & Crafts' },
  { id: 'beauty', name: 'Beauty & Wellness' },
  { id: 'other', name: 'Other' }
];

const AdminEditProduct = () => {
  const { id: productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    category: 'tea',
    price: '',
    originalPrice: '',
    description: '',
    images: [''],
    isActive: true,
    isBestSeller: false,
    rating: '',
    reviews: ''
  });

  // Route /admin/product/new has no :id param, so detect via pathname
  const isNewProduct = productId === 'new' || location.pathname.endsWith('/new');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/admin');
      return;
    }
    if (isNewProduct) {
      setLoading(false);
      setProduct({ isNew: true });
      return;
    }
    const idNum = productId ? parseInt(productId, 10) : null;
    if (!idNum || isNaN(idNum)) {
      navigate('/admin');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let p = null;
        if (token) {
          try {
            p = await fetchProductByIdFromApi(idNum);
          } catch (e) {
            console.warn('Product API failed, trying local:', e);
          }
        }
        if (!p) p = getProductById(idNum);
        if (cancelled) return;
        if (!p) {
          setMessage({ type: 'error', text: 'Product not found.' });
          setLoading(false);
          return;
        }
        setProduct(p);
        const imageUrls = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : (p.image ? [p.image] : ['']);
        setForm({
          title: p.title || '',
          category: p.category || 'tea',
          price: p.price != null ? String(p.price) : '',
          originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
          description: p.description || '',
          images: imageUrls.length ? imageUrls : [''],
          isActive: p.inStock !== false && p.isActive !== false,
          isBestSeller: p.isBestSeller === true,
          rating: p.rating != null ? String(p.rating) : '',
          reviews: p.reviews != null ? String(p.reviews) : ''
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, productId, isNewProduct, navigate, token, location.pathname]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!(form.title || '').trim()) next.title = 'Title is required';
    if (form.price === '' || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) next.price = 'Valid price is required';
    if (form.originalPrice !== '' && (isNaN(parseFloat(form.originalPrice)) || parseFloat(form.originalPrice) < 0)) next.originalPrice = 'Must be a positive number or empty';
    if (!(form.description || '').trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const imageUrls = (form.images || []).map(u => (u || '').trim()).filter(Boolean);
      const payload = {
        title: form.title.trim(),
        name: form.title.trim(),
        category: form.category,
        price: parseFloat(form.price),
        currentPrice: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        description: form.description.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : [],
        primaryImageIndex: 0,
        isActive: form.isActive,
        isBestSeller: form.isBestSeller,
        rating: form.rating ? parseFloat(form.rating) : 0,
        reviews: form.reviews ? parseInt(form.reviews, 10) : 0,
        reviewCount: form.reviews ? parseInt(form.reviews, 10) : 0
      };

      if (isNewProduct) {
        if (!token) {
          setMessage({ type: 'error', text: 'You must be logged in to add products.' });
          setSaving(false);
          return;
        }
        const created = await createProductApi(mapProductToApi(payload), token);
        setMessage({ type: 'success', text: 'Product added successfully. It will appear in the shop.' });
        setTimeout(() => navigate('/admin'), 1500);
        return;
      }

      const idNum = product.id;
      const updated = { ...product, ...payload };
      if (token) {
        await updateProductApi(idNum, mapProductToApi(updated), token);
        setMessage({ type: 'success', text: 'Product updated successfully.' });
        setProduct(updated);
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        const list = getProducts().map(p => p.id === idNum ? updated : p);
        saveProducts(list);
        setMessage({ type: 'success', text: 'Product updated successfully.' });
        setProduct(updated);
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || (isNewProduct ? 'Failed to add product' : 'Failed to update product') });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;
  if (loading || (!product && !isNewProduct)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {loading && <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />}
          {!loading && message.text && <p className="text-red-600 mb-4">{message.text}</p>}
          {!loading && <button onClick={() => navigate('/admin')} className="text-primary-600 hover:underline">Back to Admin</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </button>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-500">Admin – {isNewProduct ? 'Add Product' : 'Edit Product'}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{isNewProduct ? 'Add new product' : `Edit Product: ${product.title}`}</h1>
        {!isNewProduct && <p className="text-gray-600 mb-6">ID: {product.id}</p>}
        {isNewProduct && <p className="text-gray-600 mb-6">New products will appear on the shop page.</p>}

        {message.text && (
          <div className={`mb-6 p-4 rounded-md flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Product title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original price (USD) – optional</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.originalPrice}
                onChange={(e) => handleChange('originalPrice', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Product description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <ImagePicker
              label="Product pictures"
              helpText="Upload images or paste URLs. The first image is used as the main product image."
              value={(form.images || []).filter(Boolean)}
              onChange={(urls) => setForm(prev => ({ ...prev, images: urls.length > 0 ? urls : [''] }))}
              maxFiles={10}
              enableUpload={true}
              allowUrlInput={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => handleChange('rating', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reviews count</label>
              <input
                type="number"
                min="0"
                value={form.reviews}
                onChange={(e) => handleChange('reviews', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active (visible in shop)</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBestSeller"
                checked={form.isBestSeller}
                onChange={(e) => handleChange('isBestSeller', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-700">Best seller</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? (isNewProduct ? 'Adding...' : 'Saving...') : (isNewProduct ? 'Add product' : 'Save changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
