import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, AlertCircle, CheckCircle, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { getProducts, saveProducts, getProductById } from '../data/shopProducts';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'tea', name: 'Tea' },
  { id: 'sea', name: 'Sea & Beach' },
  { id: 'spices', name: 'Spices & Food' },
  { id: 'clothing', name: 'Clothing & Textiles' },
  { id: 'souvenirs', name: 'Souvenirs & Crafts' },
  { id: 'beauty', name: 'Beauty & Wellness' },
  { id: 'beverages', name: 'Beverages' }
];

const PRODUCT_TYPES = ['Tea Packet', 'Beach Ware', 'Sea Craft', ''];

const AdminEditProduct = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
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
    inStock: true,
    badge: '',
    productType: '',
    rating: '',
    reviews: ''
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/admin');
      return;
    }
    const idNum = productId ? parseInt(productId, 10) : null;
    if (!idNum) {
      navigate('/admin');
      return;
    }
    const p = getProductById(idNum);
    if (!p) {
      setMessage({ type: 'error', text: 'Product not found.' });
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
      inStock: p.inStock !== false,
      badge: p.badge || '',
      productType: p.productType || '',
      rating: p.rating != null ? String(p.rating) : '',
      reviews: p.reviews != null ? String(p.reviews) : ''
    });
  }, [user, productId, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageChange = (index, value) => {
    setForm(prev => {
      const next = [...(prev.images || [])];
      next[index] = value;
      return { ...prev, images: next };
    });
  };

  const handleAddImage = () => {
    setForm(prev => ({ ...prev, images: [...(prev.images || []), ''] }));
  };

  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
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
      const idNum = product.id;
      const imageUrls = (form.images || []).map(u => (u || '').trim()).filter(Boolean);
      const primaryImage = imageUrls[0] || product.image || '';
      const updated = {
        ...product,
        title: form.title.trim(),
        category: form.category,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        description: form.description.trim(),
        image: primaryImage,
        imageUrls: imageUrls.length > 0 ? imageUrls : (product.image ? [product.image] : []),
        inStock: form.inStock,
        badge: form.badge.trim() || null,
        productType: form.productType || null,
        rating: form.rating ? parseFloat(form.rating) : 0,
        reviews: form.reviews ? parseInt(form.reviews, 10) : 0
      };
      const list = getProducts().map(p => p.id === idNum ? updated : p);
      saveProducts(list);
      setMessage({ type: 'success', text: 'Product updated successfully.' });
      setProduct(updated);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update product' });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {message.text && <p className="text-red-600 mb-4">{message.text}</p>}
          <button onClick={() => navigate('/admin')} className="text-primary-600 hover:underline">Back to Admin</button>
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
            <span className="text-sm font-medium text-gray-500">Admin – Edit Product</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Product: {product.title}</h1>
        <p className="text-gray-600 mb-6">ID: {product.id}</p>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Product pictures</label>
            <p className="text-xs text-gray-500 mb-2">Add one or more image URLs. The first image is used as the main product image.</p>
            {(form.images || []).map((url, index) => (
              <div key={index} className="flex gap-2 items-start mb-3">
                <div className="flex-1 flex gap-2 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded border border-gray-200 bg-gray-50 overflow-hidden">
                    {url && url.trim().startsWith('http') ? (
                      <img src={url.trim()} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md flex-shrink-0"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddImage}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add picture
            </button>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product type (optional)</label>
            <select
              value={form.productType}
              onChange={(e) => handleChange('productType', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {PRODUCT_TYPES.map(t => (
                <option key={t || 'none'} value={t}>{t || '—'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge (optional)</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => handleChange('badge', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. Best Seller, New"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              checked={form.inStock}
              onChange={(e) => handleChange('inStock', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">In stock</label>
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
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
