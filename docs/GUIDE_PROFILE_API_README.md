# Guide Profile API Endpoint

## Overview
The guide profile system has **two endpoints** available:

1. **✅ Working Endpoint**: `/guides/my-profile/exists` - Already implemented and pulling guide information
2. **🔄 Public Endpoint**: `/guides/:id` - For fetching any guide's profile by ID

## Working Endpoint (Recommended)

### `/guides/my-profile/exists`
This endpoint is **already working** and pulling guide information from your backend.

**URL:** `GET /guides/my-profile/exists`  
**Base URL:** `http://localhost:8080/api/v1`  
**Authentication:** Required (Bearer token)  
**Swagger UI:** [View in Swagger](http://localhost:8080/api/v1/swagger-ui/index.html#/guide-controller/getMyGuideProfileIfExists)

### Usage
```javascript
import { getMyGuideProfile } from '../config/api';

const fetchMyGuideProfile = async (token) => {
  try {
    const data = await getMyGuideProfile(token);
    console.log('My guide profile:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Public Endpoint

### `/guides/:id`
This endpoint allows fetching any guide's profile by their unique ID.

**URL:** `GET /guides/:id`  
**Base URL:** `http://localhost:8080/api/v1`  
**Authentication:** Not required (public endpoint)  
**Example:** `/api/v1/guides/3`

### Usage
```javascript
import { getPublicGuideProfile } from '../config/api';

const fetchGuideProfile = async (guideId) => {
  try {
    const data = await getPublicGuideProfile(guideId);
    console.log('Guide profile:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## API Configuration

The endpoints are configured in `src/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api/v1',
  ENDPOINTS: {
    GUIDES: {
      PROFILE_EXISTS: '/guides/my-profile/exists', // ✅ Working endpoint
      DETAIL: '/guides/:id',                       // 🔄 Public endpoint
      // ... other endpoints
    }
  }
};
```

## Available Functions

### `getMyGuideProfile(token)` ✅
- **Purpose**: Fetch current user's guide profile
- **Authentication**: Required
- **Endpoint**: `/guides/my-profile/exists`
- **Status**: Working and tested

### `getPublicGuideProfile(guideId)` 🔄
- **Purpose**: Fetch any guide's profile by ID
- **Authentication**: Not required
- **Endpoint**: `/guides/:id`
- **Status**: May need backend implementation

### `getGuideProfileById(guideId, token)` 🔄
- **Purpose**: Fetch guide profile with authentication
- **Authentication**: Required
- **Endpoint**: `/guides/:id`
- **Status**: May need backend implementation

## Testing

### 1. Test Page
Navigate to `/guide-profile-test` to test both endpoints:
- **Green section**: Test the working `/guides/my-profile/exists` endpoint
- **Blue section**: Test the public `/guides/:id` endpoint

### 2. Working Endpoint Test
```javascript
// Test in browser console (must be logged in)
const testWorkingEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/guides/my-profile/exists', {
      headers: {
        'Authorization': `Bearer ${yourToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('Working endpoint response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. Public Endpoint Test
```javascript
// Test in browser console
const testPublicEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/guides/3');
    const data = await response.json();
    console.log('Public endpoint response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Response Format

### Success Response (200 OK)
```json
{
  "id": 3,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "location": "Colombo, Sri Lanka",
  "bio": "Experienced tour guide with 5+ years in Sri Lankan tourism",
  "hourlyRate": 25,
  "dailyRate": 200,
  "responseTimeHours": 24,
  "isAvailable": true,
  "verificationStatus": "VERIFIED",
  "specialties": ["Cultural Tours", "Adventure Tours"],
  "languages": ["English", "Sinhala", "Tamil"],
  "dateOfBirth": "1990-01-01",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Current Status

| Endpoint | Status | Authentication | Notes |
|----------|--------|----------------|-------|
| `/guides/my-profile/exists` | ✅ Working | Required | Already pulling guide data |
| `/guides/:id` | 🔄 Pending | Optional | May need backend implementation |

## Recommendations

1. **Use the working endpoint** (`/guides/my-profile/exists`) for authenticated users
2. **Test the public endpoint** (`/guides/:id`) to see if backend implementation is needed
3. **Check Swagger UI** for complete API documentation
4. **Monitor backend logs** for any errors when testing endpoints

## Troubleshooting

### Working Endpoint Issues
- Ensure user is logged in and has a valid token
- Check if user has GUIDE role
- Verify backend server is running on port 8080

### Public Endpoint Issues
- Verify the guide ID exists in the database
- Check if backend has implemented the `/guides/:id` endpoint
- Look for CORS configuration issues

### Debug Steps
1. Check browser network tab for request/response details
2. Verify backend server is running
3. Test endpoints directly with curl or Postman
4. Check backend logs for errors
5. Use Swagger UI to test endpoints
