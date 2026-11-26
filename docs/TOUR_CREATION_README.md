# Tour Creation Implementation

This document outlines the complete tour creation functionality implemented for guides in the Sea & Tea Tours application.

## Overview

The tour creation system provides guides with a comprehensive interface to create and manage their tour offerings. The implementation includes both a dedicated tour creation page and an integrated modal within the guide tours management page.

## Features

### 1. Dedicated Tour Creation Page (`/create-tour`)

- **Multi-step form wizard** with 4 steps:
  1. Basic Information (title, description, category)
  2. Details & Pricing (location, duration, group size, price)
  3. Logistics (meeting point, cancellation policy)
  4. Additional Information (includes, excludes, requirements, highlights)

- **Progress indicator** showing current step and completion status
- **Step-by-step validation** ensuring data quality
- **Responsive design** optimized for all device sizes
- **Real-time error handling** with clear feedback

### 2. Integrated Tour Management (`/guide-tours`)

- **Tour listing** with search and filtering capabilities
- **Quick tour creation** via modal interface
- **Tour editing** with pre-populated forms
- **Tour deletion** with confirmation dialogs
- **Status management** (Active, Inactive, Draft)

## API Integration

### Endpoints Used

- **POST** `/api/v1/tours` - Create new tour
- **PUT** `/api/v1/tours/:id` - Update existing tour
- **DELETE** `/api/v1/tours/:id` - Delete tour
- **GET** `/api/v1/tours` - Retrieve tours

### Request Format

```json
{
  "title": "Tour Title",
  "description": "Tour description...",
  "category": "TEA_TOURS",
  "durationHours": 4,
  "maxGroupSize": 10,
  "pricePerPerson": 75.00,
  "instantBooking": false,
  "securePayment": true,
  "languages": ["English"],
  "highlights": ["Tea plantation visit"],
  "includedItems": ["Professional guide", "Transportation"],
  "excludedItems": ["Personal expenses", "Tips"],
  "meetingPoint": "Kandy Railway Station",
  "cancellationPolicy": "Free cancellation up to 24 hours",
  "imageUrls": [],
  "primaryImageIndex": 0
}
```

### Response Format

```json
{
  "id": 1,
  "name": "Tour Title",
  "description": "Tour description...",
  "category": "TEA_TOURS",
  "location": "Kandy, Sri Lanka",
  "duration": 4,
  "maxGroupSize": 10,
  "price": 75.00,
  "difficultyLevel": "EASY",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Tour Categories

The system supports the following tour categories:

- **TEA_TOURS** - Tea plantation and factory tours
- **BEACH_TOURS** - Beach and coastal activities
- **CULTURAL_TOURS** - Cultural and heritage experiences
- **ADVENTURE_TOURS** - Adventure and outdoor activities
- **FOOD_TOURS** - Culinary and food experiences
- **NATURE_TOURS** - Nature and wildlife tours
- **HISTORICAL_TOURS** - Historical site visits
- **WILDLIFE_TOURS** - Wildlife and animal encounters
- **WATER_SPORTS** - Water-based activities
- **HIKING_TOURS** - Hiking and trekking tours
- **PHOTOGRAPHY_TOURS** - Photography-focused tours
- **WELLNESS_TOURS** - Wellness and relaxation tours



## Form Validation

### Required Fields
- Tour title
- Description (minimum 50 characters)
- Category
- Duration (in hours)
- Maximum group size (positive number)
- Price per person (positive number)
- Meeting point

### Optional Fields
- Cancellation policy
- What's included (includedItems)
- What's not included (excludedItems)
- Highlights
- Languages (defaults to English)
- Image URLs
- Primary image index

### System Fields (Auto-set)
- **instantBooking**: Set to false by default (can be enabled later)
- **securePayment**: Set to true by default for security
- **languages**: Set to ["English"] by default
- **imageUrls**: Set to empty array by default
- **primaryImageIndex**: Set to 0 by default

## User Interface Features

### Navigation
- **Profile dropdown** includes "Create New Tour" link for guides
- **Guide tours page** has prominent "Create New Tour" button
- **Breadcrumb navigation** for easy navigation between pages

### Form Features
- **Real-time validation** with immediate feedback
- **Character counters** for text fields
- **Dynamic array fields** for lists (includes, excludes, etc.)
- **Auto-save indicators** during form submission
- **Loading states** with spinner animations

### Responsive Design
- **Mobile-first approach** with touch-friendly interfaces
- **Adaptive layouts** that work on all screen sizes
- **Accessible design** with proper ARIA labels and keyboard navigation

## Security & Authentication

- **JWT token authentication** required for all tour operations
- **Role-based access** - only guides can create tours
- **Input sanitization** to prevent XSS attacks
- **CSRF protection** through proper headers

## Error Handling

### Client-side Validation
- **Form validation** before submission
- **Real-time error display** with clear messages
- **Field-specific error highlighting**

### Server-side Error Handling
- **Comprehensive error messages** from API responses
- **Network error handling** with retry options
- **Graceful degradation** when services are unavailable

## Testing

### Test Utilities
The `src/utils/tourCreationTest.js` file contains test functions for:
- **API integration testing**
- **Tour creation verification**
- **Tour retrieval testing**

### Manual Testing Checklist
- [ ] Create tour with all required fields
- [ ] Create tour with optional fields
- [ ] Validate form error handling
- [ ] Test responsive design on mobile
- [ ] Verify API integration
- [ ] Test tour editing functionality
- [ ] Test tour deletion with confirmation
- [ ] Verify navigation between pages

## File Structure

```
src/
├── pages/
│   ├── CreateTour.js          # Dedicated tour creation page
│   └── GuideTours.js          # Tour management page with modal
├── components/
│   └── Navbar.js              # Navigation with tour creation links
├── config/
│   └── api.js                 # API configuration and endpoints
├── context/
│   └── AuthContext.js         # Authentication context
└── utils/
    └── tourCreationTest.js    # Test utilities
```

## Usage Instructions

### For Guides

1. **Access Tour Creation**
   - Log in with guide account
   - Click profile dropdown → "Create New Tour"
   - Or navigate to `/create-tour` directly

2. **Create a New Tour**
   - Fill out the multi-step form
   - Complete each step with required information
   - Add optional details for better tour descriptions
   - Submit the form to create the tour

3. **Manage Existing Tours**
   - Navigate to "My Tours" page
   - View all created tours in a grid layout
   - Edit or delete tours as needed
   - Use search and filters to find specific tours

### For Developers

1. **API Testing**
   ```javascript
   import { runTourAPITests } from './utils/tourCreationTest';
   
   // Run tests with valid token
   const results = await runTourAPITests(token);
   console.log(results);
   ```

2. **Customization**
   - Modify tour categories in the form components
   - Add new validation rules in the form validation functions
   - Extend the API integration for additional features

## Future Enhancements

- **Image upload** for tour photos
- **Tour scheduling** with availability management
- **Pricing tiers** for different group sizes
- **Tour templates** for quick creation
- **Bulk operations** for multiple tours
- **Advanced analytics** for tour performance
- **Integration with booking system**

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend server is running on `localhost:8080`
   - Check authentication token is valid
   - Ensure proper CORS configuration

2. **Form Validation Errors**
   - Check all required fields are filled
   - Verify character limits for text fields
   - Ensure numeric fields contain valid numbers

3. **Navigation Issues**
   - Clear browser cache and cookies
   - Verify user role is set to 'GUIDE'
   - Check authentication state

### Debug Information

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will show detailed API calls and responses in the browser console.

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.
