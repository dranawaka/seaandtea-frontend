// API Configuration
// Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://seaandtea-backend-production.up.railway.app/api/v1',
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
