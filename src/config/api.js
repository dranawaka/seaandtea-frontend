// API Configuration
// Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1',
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
      UPDATE_ROLE: '/users/role'
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
      CERTIFICATIONS: '/guides/certifications'
    },
    ADMIN: {
      USERS: '/admin/users',
      USER_ROLE: '/admin/users/:id/role',
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
      SEARCH: '/tours/search'
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
