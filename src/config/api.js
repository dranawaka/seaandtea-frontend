// API Configuration
// Swagger UI: https://industrious-gratitude-production-dfe4.up.railway.app/api/v1/swagger-ui/index.html
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://industrious-gratitude-production-dfe4.up.railway.app/api/v1',
  TIMEOUT: 10000, // 10 seconds
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/password',
    },
    TOURS: {
      LIST: '/tours',
      DETAIL: '/tours/:id',
      SEARCH: '/tours/search',
      CREATE: '/tours',
      UPDATE: '/tours/:id',
      DELETE: '/tours/:id',
    },
    GUIDES: {
      LIST: '/guides',
      DETAIL: '/guides/:id',
      SEARCH: '/guides/search',
      CREATE: '/guides',
      UPDATE: '/guides/:id',
    },
    BOOKINGS: {
      LIST: '/bookings',
      DETAIL: '/bookings/:id',
      CREATE: '/bookings',
      UPDATE: '/bookings/:id',
      UPDATE_STATUS: '/bookings/:id/status',
    },
    REVIEWS: {
      LIST: '/tours/:tourId/reviews',
      CREATE: '/reviews',
      UPDATE: '/reviews/:id',
      DELETE: '/reviews/:id',
    },
    PAYMENTS: {
      CREATE_INTENT: '/payments/create-intent',
      CONFIRM: '/payments/confirm',
      HISTORY: '/payments/history',
    },
    MESSAGES: {
      CONVERSATIONS: '/messages/conversations',
      CONVERSATION_MESSAGES: '/messages/conversations/:id',
      SEND: '/messages',
    },
    ADMIN: {
      USERS: '/admin/users',
      USER_ROLE: '/admin/users/:id/role',
      STATISTICS: '/admin/statistics',
    },
  },
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
  console.log(`🌐 API URL Built: ${fullUrl}`);
  return fullUrl;
};

// Default headers for API requests
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

// Utility function to log API requests and responses
export const logApiCall = (method, url, requestData = null, response = null, error = null) => {
  const timestamp = new Date().toISOString();
  
  if (requestData) {
    console.log(`🚀 [${timestamp}] API REQUEST:`, {
      method,
      url,
      data: requestData
    });
  }
  
  if (response) {
    console.log(`✅ [${timestamp}] API RESPONSE:`, {
      method,
      url,
      status: response.status,
      statusText: response.statusText,
      data: response.data || response
    });
  }
  
  if (error) {
    console.log(`❌ [${timestamp}] API ERROR:`, {
      method,
      url,
      error: error.message || error
    });
  }
};
