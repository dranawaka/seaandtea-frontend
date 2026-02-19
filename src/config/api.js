// API Configuration
// Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html
const defaultBaseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/api/v1'
  : 'https://seaandtea-backend-production.up.railway.app/api/v1';
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || defaultBaseUrl,
  TIMEOUT: 10000, // 10 seconds
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout'
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_ROLE: '/users/role',
      UPDATE_PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/password',
      UPLOAD_PROFILE_PICTURE: '/upload/profile-picture'
    },
    GUIDES: {
      LIST: '/guides',
      DETAIL: '/guides/:id',
      CREATE: '/guides',
      UPDATE: '/guides/:id',
      DELETE: '/guides/:id',
      // Guide-specific endpoints that actually exist
      PROFILE_EXISTS: '/guides/my-profile/exists', // Check if profile exists
      MY_PROFILE: '/guides/my-profile', // Get current user's guide profile
      VERIFICATION: '/guides/verification',
      AVAILABILITY: '/guides/availability',
      SPECIALTIES: '/guides/specialties',
      LANGUAGES: '/guides/languages',
      CERTIFICATIONS: '/guides/certifications',
      UPLOAD_PROFILE_PICTURE: '/upload/profile-picture',
      // New endpoint for getting guides by verification status
      BY_VERIFICATION_STATUS: '/guides?verificationStatus=:status',
      VERIFIED_PAGINATED: '/guides/verified?page=:page&size=:size'
    },
    ADMIN: {
      USERS: '/admin/users',
      USER_BY_ID: '/admin/users/:id',
      USER_BAN: '/admin/users/:id/ban',
      USER_UNBAN: '/admin/users/:id/unban',
      USER_REMOVE: '/admin/users/:id',
      USER_RESET_REVIEWS: '/admin/users/:id/reviews/reset',
      STATISTICS: '/admin/statistics',
      UNVERIFIED_GUIDES: '/guides?verificationStatus=PENDING',
      VERIFY_GUIDE: '/guides/:id/verify'
    },
    BOOKINGS: {
      LIST: '/bookings',
      DETAIL: '/bookings/:id',
      CREATE: '/bookings',
      UPDATE: '/bookings/:id',
      CANCEL: '/bookings/:id/cancel'
    },
    TOURS: {
      LIST: '/tours',
      DETAIL: '/tours/:id',
      CREATE: '/tours',
      UPDATE: '/tours/:id',
      DELETE: '/tours/:id',
      SEARCH: '/tours/search',
      PUBLIC_VERIFIED_PAGINATED: '/tours/public/verified/paginated',
      GUIDE_TOURS: '/tours/my-tours'
    },
    FILES: {
      UPLOAD_PROFILE_PICTURE: '/upload/profile-picture',
      UPLOAD_GUIDE_PROFILE_PICTURE: '/upload/guide-profile-picture'
    },
    REVIEWS: {
      TOUR_REVIEWS: '/reviews/tour/:tourId',
      GUIDE_REVIEWS: '/reviews/guide/:guideId',
      CREATE: '/reviews',
      UPDATE: '/reviews/:id',
      DELETE: '/reviews/:id'
    },
    PRODUCTS: {
      LIST: '/products',
      DETAIL: '/products/:id',
      CREATE: '/products',
      UPDATE: '/products/:id',
      DELETE: '/products/:id'
    },
    CART: {
      MINE: '/cart',
      ITEMS: '/cart/items',
      ITEM_BY_ID: '/cart/items/:id'
    }
  }
};

// Utility functions
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
  console.log(`🌐 API URL Built: ${fullUrl}`);
  return fullUrl;
};

export const getDefaultHeaders = (includeAuth = false, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log(`📋 API Headers:`, headers);
  return headers;
};

export const logApiCall = (method, url, requestData = null, response = null, error = null) => {
  const timestamp = new Date().toISOString();
  if (requestData) {
    console.log(`🚀 [${timestamp}] API REQUEST:`, { method, url, data: requestData });
  }
  if (response) {
    console.log(`✅ [${timestamp}] API RESPONSE:`, { method, url, status: response.status, statusText: response.statusText });
  }
  if (error) {
    console.log(`❌ [${timestamp}] API ERROR:`, { method, url, error: error.message || error });
  }
};

export const logRequestHeaders = (method, url, headers, data = null) => {
  console.log(`🚀 [${method}] ${url} - Request Details:`, {
    headers: headers,
    data: data,
    timestamp: new Date().toISOString()
  });
};

// Guide profile utility functions
export const getGuideProfileById = async (guideId, token = null) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DETAIL, { id: guideId });
    const headers = getDefaultHeaders(true, token);
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guide profile: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DETAIL, { id: guideId }), null, null, error);
    throw error;
  }
};

// Get current user's guide profile using the existing working endpoint
export const getMyGuideProfile = async (token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.PROFILE_EXISTS);
    const headers = getDefaultHeaders(true, token);
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guide profile: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.PROFILE_EXISTS), null, null, error);
    throw error;
  }
};

// Get guide profile by ID without authentication (public endpoint)
export const getPublicGuideProfile = async (guideId) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DETAIL, { id: guideId });
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guide profile: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DETAIL, { id: guideId }), null, null, error);
    throw error;
  }
};

// Get guides by verification status
export const getGuidesByVerificationStatus = async (status = 'VERIFIED', token = null) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.BY_VERIFICATION_STATUS, { status });
    
    logApiCall('GET', url);
    
    const headers = getDefaultHeaders(!!token, token);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guides by verification status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.BY_VERIFICATION_STATUS, { status }), null, null, error);
    throw error;
  }
};

// Get all guides (public endpoint)
export const getAllGuides = async () => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.LIST);
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all guides: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.LIST), null, null, error);
    throw error;
  }
};

// Get verified guides with pagination (public endpoint)
export const getVerifiedGuidesPaginated = async (page = 0, size = 10) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.VERIFIED_PAGINATED, { page, size });
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch verified guides: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.VERIFIED_PAGINATED, { page, size }), null, null, error);
    throw error;
  }
};

// Get public verified tours with pagination (public endpoint)
export const getPublicVerifiedToursPaginated = async (page = 0, size = 20, filters = {}) => {
  try {
    let url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.PUBLIC_VERIFIED_PAGINATED);
    
    // Add query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    // Add filters if provided
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.duration) params.append('duration', filters.duration);
    if (filters.location) params.append('location', filters.location);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tours: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.PUBLIC_VERIFIED_PAGINATED), null, null, error);
    throw error;
  }
};

// Get tour by ID (public endpoint)
export const getTourById = async (tourId) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.DETAIL, { id: tourId });
    
    logApiCall('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tour: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.DETAIL, { id: tourId }), null, null, error);
    throw error;
  }
};

// Get current user's tours with pagination
export const getGuideTours = async (guideId, page = 0, size = 10, token = null) => {
  try {
    let url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.GUIDE_TOURS);
    
    // Add query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    logApiCall('GET', url);
    
    const headers = getDefaultHeaders(!!token, token);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guide tours: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logApiCall('GET', url, null, response);
    
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.GUIDE_TOURS), null, null, error);
    throw error;
  }
};

// --- Reviews API ---

export const getTourReviews = async (tourId, page = 0, size = 10, sort = 'createdAt,desc') => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.TOUR_REVIEWS, { tourId });
    const params = new URLSearchParams({ page, size, sort });
    const fullUrl = `${url}?${params.toString()}`;
    logApiCall('GET', fullUrl);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 404) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch tour reviews: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logApiCall('GET', fullUrl, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.TOUR_REVIEWS, { tourId }), null, null, error);
    throw error;
  }
};

export const getGuideReviews = async (guideId, page = 0, size = 10, sort = 'createdAt,desc') => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.GUIDE_REVIEWS, { guideId });
    const params = new URLSearchParams({ page, size, sort });
    const fullUrl = `${url}?${params.toString()}`;
    logApiCall('GET', fullUrl);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 404) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch guide reviews: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logApiCall('GET', fullUrl, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.GUIDE_REVIEWS, { guideId }), null, null, error);
    throw error;
  }
};

export const createReview = async (body, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.CREATE);
    const headers = getDefaultHeaders(true, token);
    const payload = {
      ...(body.tourId != null && { tourId: Number(body.tourId) }),
      ...(body.guideId != null && { guideId: Number(body.guideId) }),
      rating: body.rating,
      comment: body.comment != null ? String(body.comment) : '',
      recommendToOthers: body.recommendToOthers != null ? Boolean(body.recommendToOthers) : true
    };
    logApiCall('POST', url, payload);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      let errMessage = `Failed to create review (${response.status})`;
      try {
        const errBody = await response.json();
        if (errBody.message) errMessage = errBody.message;
        else if (errBody.error) errMessage = errBody.error;
        else if (Array.isArray(errBody.errors)) errMessage = errBody.errors.map(e => e.defaultMessage || e.message).join(', ') || errMessage;
      } catch (_) {
        const text = await response.text();
        if (text) errMessage = text.length > 200 ? text.slice(0, 200) + '...' : text;
      }
      throw new Error(errMessage);
    }
    const data = await response.json();
    logApiCall('POST', url, payload, response);
    return data;
  } catch (error) {
    logApiCall('POST', buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.CREATE), body, null, error);
    throw error;
  }
};

export const updateReview = async (reviewId, body, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.UPDATE, { id: reviewId });
    const headers = getDefaultHeaders(true, token);
    logApiCall('PUT', url, body);
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to update review: ${response.status}`);
    }
    const data = await response.json();
    logApiCall('PUT', url, body, response);
    return data;
  } catch (error) {
    logApiCall('PUT', buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.UPDATE, { id: reviewId }), body, null, error);
    throw error;
  }
};

export const deleteReview = async (reviewId, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.DELETE, { id: reviewId });
    const headers = getDefaultHeaders(true, token);
    logApiCall('DELETE', url);
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete review: ${response.status} ${response.statusText}`);
    }
    logApiCall('DELETE', url, null, response);
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    logApiCall('DELETE', buildApiUrl(API_CONFIG.ENDPOINTS.REVIEWS.DELETE, { id: reviewId }), null, null, error);
    throw error;
  }
};

// --- Admin user (view / reset reviews) ---
export const getAdminUserById = async (userId, token) => {
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_BY_ID, { id: userId });
  const headers = getDefaultHeaders(true, token);
  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to fetch user: ${response.status}`);
  }
  return response.json();
};

export const resetUserReviews = async (userId, token) => {
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_RESET_REVIEWS, { id: userId });
  const headers = getDefaultHeaders(true, token);
  const response = await fetch(url, { method: 'POST', headers });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to reset reviews: ${response.status}`);
  }
  return response.status === 204 ? null : await response.json();
};

// --- Products API ---

/**
 * List products with optional filters and pagination (public).
 * @param {{ category?: string, searchTerm?: string, page?: number, size?: number, sortBy?: string, sortDirection?: string }} params
 * @returns {Promise<{ content: array, totalPages: number, totalElements: number, ... }>}
 */
export const listProductsApi = async (params = {}) => {
  try {
    let url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.LIST);
    const search = new URLSearchParams();
    const { category, searchTerm, page = 0, size = 10, sortBy, sortDirection, sort } = params;
    if (category && category !== 'all') search.append('category', category);
    if (searchTerm && searchTerm.trim()) search.append('searchTerm', searchTerm.trim());
    search.append('page', page);
    search.append('size', size);
    if (sort != null && sort !== '') {
      search.append('sort', sort);
    } else if (sortBy != null || sortDirection != null) {
      search.append('sortBy', sortBy ?? 'createdAt');
      search.append('sortDirection', sortDirection ?? 'desc');
    } else {
      search.append('sort', 'createdAt,desc');
    }
    url += `?${search.toString()}`;
    logApiCall('GET', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      let errMessage = `Failed to fetch products: ${response.status}`;
      try {
        const body = await response.json();
        if (body.message) errMessage = body.message;
        else if (body.error) errMessage = `${response.status} – ${body.error}`;
      } catch (_) {
        const text = await response.text();
        if (text && text.length < 200) errMessage = text;
      }
      throw new Error(errMessage);
    }
    const data = await response.json();
    logApiCall('GET', url, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.LIST), null, null, error);
    throw error;
  }
};

/** Best sellers (public). Returns same paginated shape as listProductsApi. */
export const getBestSellersApi = async (page = 0, size = 10) => {
  try {
    let url = `${API_CONFIG.BASE_URL}/products/best-sellers?page=${page}&size=${size}`;
    logApiCall('GET', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch best sellers: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logApiCall('GET', url, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', `${API_CONFIG.BASE_URL}/products/best-sellers`, null, null, error);
    throw error;
  }
};

/** Products by category (public). Returns same paginated shape. */
export const getProductsByCategoryApi = async (category, page = 0, size = 10) => {
  try {
    let url = `${API_CONFIG.BASE_URL}/products/category/${encodeURIComponent(category)}?page=${page}&size=${size}`;
    logApiCall('GET', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products by category: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logApiCall('GET', url, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', `${API_CONFIG.BASE_URL}/products/category/${category}`, null, null, error);
    throw error;
  }
};

/** Legacy: fetch all products (first page, no filter). Returns content array for backward compat. */
export const getProductsApi = async () => {
  const data = await listProductsApi({ page: 0, size: 100 });
  return Array.isArray(data.content) ? data.content : (data.content ?? []);
};

export const getProductByIdApi = async (productId) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL, { id: productId });
    logApiCall('GET', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logApiCall('GET', url, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL, { id: productId }), null, null, error);
    throw error;
  }
};

export const createProductApi = async (body, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE);
    const headers = getDefaultHeaders(true, token);
    logApiCall('POST', url, body);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to create product: ${response.status}`);
    }
    const data = await response.json();
    logApiCall('POST', url, body, response);
    return data;
  } catch (error) {
    logApiCall('POST', buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE), body, null, error);
    throw error;
  }
};

export const updateProductApi = async (productId, body, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE, { id: productId });
    const headers = getDefaultHeaders(true, token);
    logApiCall('PUT', url, body);
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to update product: ${response.status}`);
    }
    const data = await response.json();
    logApiCall('PUT', url, body, response);
    return data;
  } catch (error) {
    logApiCall('PUT', buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE, { id: productId }), body, null, error);
    throw error;
  }
};

export const deleteProductApi = async (productId, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE, { id: productId });
    const headers = getDefaultHeaders(true, token);
    logApiCall('DELETE', url);
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    if (!response.ok && response.status !== 204) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to delete product: ${response.status}`);
    }
    logApiCall('DELETE', url, null, response);
    return response.status === 204 ? null : (response.headers.get('content-length') === '0' ? null : await response.json().catch(() => null));
  } catch (error) {
    logApiCall('DELETE', buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE, { id: productId }), null, null, error);
    throw error;
  }
};

// --- Cart API ---

export const getCartApi = async (token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CART.MINE);
    const headers = getDefaultHeaders(true, token);
    logApiCall('GET', url);
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logApiCall('GET', url, null, response);
    return data;
  } catch (error) {
    logApiCall('GET', buildApiUrl(API_CONFIG.ENDPOINTS.CART.MINE), null, null, error);
    throw error;
  }
};

export const addCartItemApi = async (productId, quantity, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CART.ITEMS);
    const headers = getDefaultHeaders(true, token);
    const body = { productId: Number(productId), quantity: Number(quantity) || 1 };
    logApiCall('POST', url, body);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to add to cart: ${response.status}`);
    }
    const data = await response.json();
    logApiCall('POST', url, body, response);
    return data;
  } catch (error) {
    logApiCall('POST', buildApiUrl(API_CONFIG.ENDPOINTS.CART.ITEMS), { productId, quantity }, null, error);
    throw error;
  }
};

export const updateCartItemApi = async (itemId, quantity, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CART.ITEM_BY_ID, { id: itemId });
    const headers = getDefaultHeaders(true, token);
    const body = { quantity: Number(quantity) };
    logApiCall('PUT', url, body);
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to update cart item: ${response.status}`);
    }
    const data = await response.json();
    logApiCall('PUT', url, body, response);
    return data;
  } catch (error) {
    logApiCall('PUT', buildApiUrl(API_CONFIG.ENDPOINTS.CART.ITEM_BY_ID, { id: itemId }), { quantity }, null, error);
    throw error;
  }
};

export const removeCartItemApi = async (itemId, token) => {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CART.ITEM_BY_ID, { id: itemId });
    const headers = getDefaultHeaders(true, token);
    logApiCall('DELETE', url);
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok && response.status !== 204) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to remove cart item: ${response.status}`);
    }
    logApiCall('DELETE', url, null, response);
    // API returns 200 with full cart body; 204 = no content
    if (response.status === 204) return null;
    return await response.json().catch(() => null);
  } catch (error) {
    logApiCall('DELETE', buildApiUrl(API_CONFIG.ENDPOINTS.CART.ITEM_BY_ID, { id: itemId }), null, null, error);
    throw error;
  }
};
