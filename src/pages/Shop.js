import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Users, Clock, ShoppingBag, Heart, Filter, Search, ArrowRight, Package, Truck, Shield, RefreshCw, Plus, Minus, X, Trash2 } from 'lucide-react';
import { getProducts, fetchProductsPaginatedFromApi, mapProductFromApi } from '../data/shopProducts';
import { useAuth } from '../context/AuthContext';
import { getCartApi, addCartItemApi, updateCartItemApi, removeCartItemApi } from '../config/api';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const PAGE_SIZE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('openCart') === '1') {
      setIsCartOpen(true);
      searchParams.delete('openCart');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts(page, selectedCategory, searchTerm);
  }, [page, selectedCategory, searchTerm]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartFromApi();
    }
  }, [isAuthenticated, token]);

  const loadProducts = async (pageNum = 0, category = 'all', term = '') => {
    try {
      setLoading(true);
      const data = await fetchProductsPaginatedFromApi({
        category: category === 'all' ? undefined : category,
        searchTerm: (term || '').trim() || undefined,
        page: pageNum,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      setProducts(data.content || []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (error) {
      console.warn('Products API unavailable, using local:', error);
      const local = getProducts();
      setProducts(local);
      setTotalPages(1);
      setTotalElements(local.length);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearchTerm(searchInput.trim());
    setPage(0);
  };

  const loadCartFromApi = async () => {
    if (!token) return;
    try {
      setCartLoading(true);
      const data = await getCartApi(token);
      const items = data?.items ?? [];
      const mapped = items.map((it) => ({
        id: it.productId,
        title: it.productName || '',
        image: it.imageUrl || '',
        price: Number(it.unitPrice) || 0,
        quantity: Number(it.quantity) || 1,
        lineTotal: Number(it.lineTotal) || 0,
        cartItemId: it.cartItemId
      }));
      setCart(mapped);
      setCartTotalAmount(Number(data?.totalAmount) ?? 0);
    } catch (err) {
      console.warn('Cart API unavailable:', err);
      setCart([]);
      setCartTotalAmount(0);
    } finally {
      setCartLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'sea', name: 'Sea & Beach Wears and Handy Crafts' },
    { id: 'tea', name: 'Premium Tea' },
    { id: 'spices', name: 'Spices & Food' },
    { id: 'clothing', name: 'Clothing & Textiles' },
    { id: 'souvenirs', name: 'Souvenirs & Crafts' },
    { id: 'beauty', name: 'Beauty & Wellness' },
    { id: 'other', name: 'Other' }
  ];

  const mapCartResponse = (data) => {
    const items = data?.items ?? [];
    return items.map((it) => ({
      id: it.productId,
      title: it.productName || '',
      image: it.imageUrl || '',
      price: Number(it.unitPrice) || 0,
      quantity: Number(it.quantity) || 1,
      lineTotal: Number(it.lineTotal) || 0,
      cartItemId: it.cartItemId
    }));
  };

  const addToCart = async (product) => {
    if (token) {
      try {
        setCartLoading(true);
        const data = await addCartItemApi(product.id, 1, token);
        setCart(mapCartResponse(data));
        setCartTotalAmount(Number(data?.totalAmount) ?? 0);
      } catch (err) {
        console.warn('Add to cart API failed, updating locally:', err);
        updateCartLocal(product, 1);
      } finally {
        setCartLoading(false);
      }
    } else {
      updateCartLocal(product, 1);
    }
  };

  const updateCartLocal = (product, delta) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + delta }
            : item
        );
      }
      return [...prevCart, { id: product.id, title: product.title, image: product.image, price: product.price, quantity: 1, cartItemId: null }];
    });
    setCartTotalAmount(prev => prev + (product.price || 0) * (delta > 0 ? 1 : -1));
  };

  const removeFromCart = async (productId, cartItemId) => {
    if (token && cartItemId) {
      try {
        setCartLoading(true);
        const data = await removeCartItemApi(cartItemId, token);
        if (data) {
          setCart(mapCartResponse(data));
          setCartTotalAmount(Number(data?.totalAmount) ?? 0);
        } else {
          await loadCartFromApi();
        }
      } catch (err) {
        console.warn('Remove from cart API failed:', err);
        setCart(prev => prev.filter(item => item.id !== productId));
        setCartTotalAmount(prev => prev - (cart.find(i => i.id === productId)?.lineTotal ?? 0));
      } finally {
        setCartLoading(false);
      }
    } else {
      const item = cart.find(i => i.id === productId);
      setCart(prev => prev.filter(i => i.id !== productId));
      setCartTotalAmount(prev => prev - (item ? item.price * item.quantity : 0));
    }
  };

  const updateQuantity = async (productId, newQuantity, cartItemId) => {
    if (newQuantity <= 0) {
      const item = cart.find(i => i.id === productId);
      removeFromCart(productId, item?.cartItemId);
      return;
    }
    if (token && cartItemId) {
      try {
        setCartLoading(true);
        const data = await updateCartItemApi(cartItemId, newQuantity, token);
        setCart(mapCartResponse(data));
        setCartTotalAmount(Number(data?.totalAmount) ?? 0);
      } catch (err) {
        console.warn('Update cart API failed:', err);
        setCart(prev =>
          prev.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity, lineTotal: item.price * newQuantity } : item
          )
        );
        setCartTotalAmount(prev => prev - (cart.find(i => i.id === productId)?.lineTotal ?? 0) + (cart.find(i => i.id === productId)?.price ?? 0) * newQuantity);
      } finally {
        setCartLoading(false);
      }
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity, lineTotal: item.price * newQuantity } : item
        )
      );
      const item = cart.find(i => i.id === productId);
      if (item) setCartTotalAmount(prev => prev - item.price * item.quantity + item.price * newQuantity);
    }
  };

  const getCartTotal = () => {
    if (isAuthenticated && token && cart.length > 0 && cartTotalAmount > 0) return cartTotalAmount;
    return cart.reduce((total, item) => total + (item.lineTotal ?? item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const shopFeatures = [
    {
      icon: <Package className="h-8 w-8 text-primary-600" />,
      title: 'Authentic Products',
      description: 'Curated selection of genuine Sri Lankan products from local artisans and producers.'
    },
    {
      icon: <Truck className="h-8 w-8 text-primary-600" />,
      title: 'Worldwide Shipping',
      description: 'Free shipping on orders over $50. Fast and secure delivery to your doorstep.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee with easy returns and exchanges within 30 days.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sri Lankan
              <span className="text-primary-200"> Shop</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover authentic Sri Lankan products, from premium Ceylon tea to handcrafted souvenirs, 
              delivered directly to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {FEATURE_TOURS_ENABLED && (
                <Link to="/tours" className="btn-secondary text-lg px-8 py-3">
                  Book Experiences
                </Link>
              )}
              <Link to="/guides" className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-purple-600">
                Find Local Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Shop With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We bring the best of Sri Lanka directly to you with authentic products and exceptional service
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {shopFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse by category
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Sea Adventures Category */}
            <div 
              className="relative overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => setSelectedCategory('sea')}
            >
              <div className="relative h-80 bg-primary-700">
                <img 
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Sea & Beach Wears and Handy Crafts"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-2">Sea & Beach Wears and Handy Crafts</h3>
                    <p className="text-lg mb-4">Handcrafted beach bags, sea crafts & ocean-inspired items</p>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                      {products.filter(p => p.category === 'sea').length} products
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tea Experiences Category */}
            <div 
              className="relative overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => setSelectedCategory('tea')}
            >
              <div className="relative h-80 bg-primary-700">
                <img 
                  src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85"
                  alt="Premium Tea - Ceylon tea from Sri Lankan highlands"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-2">Premium Tea</h3>
                    <p className="text-lg mb-4">Finest Ceylon tea packets from Sri Lankan highlands</p>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                      {products.filter(p => p.category === 'tea').length} tea varieties
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                Search
              </button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => { setSelectedCategory(category.id); setPage(0); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Authentic Sri Lankan products
            </p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    {product.badge && (
                      <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {product.badge}
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200">
                        <Heart className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-full font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>
                      {product.productType && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          {product.productType}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      {(product.discountPercentage != null || product.originalPrice) && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          {product.discountPercentage != null
                            ? `${product.discountPercentage}% OFF`
                            : `${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addToCart(product)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                          product.inStock
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                      >
                        <ShoppingBag className="h-4 w-4 inline mr-2" />
                        Add to Cart
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages} ({totalElements} products)
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
          
          {products.length === 0 && !loading && (
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">No products found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPage(0);
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Sri Lanka?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Shop authentic products or book unforgettable experiences with our local guides. 
            Discover the magic of Sri Lanka today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {FEATURE_TOURS_ENABLED && (
              <Link to="/tours" className="btn-secondary text-lg px-8 py-3 flex items-center justify-center">
                Browse Tours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
            <Link to="/contact" className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-800">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Shopping Cart ({getCartItemCount()})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ShoppingBag className="h-16 w-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Your cart is empty</p>
                    <p className="text-sm">Add some products to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ${item.price} each
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.cartItemId)}
                              disabled={cartLoading}
                              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.cartItemId)}
                              disabled={cartLoading}
                              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id, item.cartItemId)}
                            disabled={cartLoading}
                            className="text-red-500 hover:text-red-700 mt-1 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200">
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
