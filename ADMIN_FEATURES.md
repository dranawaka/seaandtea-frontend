# Admin Features for Sea & Tea Tours

## Overview
This document describes the admin functionality that has been added to the Sea & Tea Tours frontend application, allowing administrators to manage unverified guide profiles and system operations.

## Features Added

### 1. Admin Dashboard
- **Location**: `/admin` route
- **Access**: Only users with `ADMIN` role
- **Purpose**: Centralized admin interface for system management

### 2. Guide Profile Verification
- **View Pending Verifications**: See all guide profiles awaiting approval
- **Approve Guides**: Approve guide profiles with one click
- **Reject Guides**: Reject guide profiles (currently removes from list)
- **Real-time Updates**: Dashboard refreshes automatically after actions

### 3. Navigation Integration
- **Profile Dropdown**: Admin section added to user profile dropdown
- **Mobile Navigation**: Admin section also available in mobile menu
- **Role-based Access**: Only visible to users with ADMIN role

## API Endpoints Used

### Admin Endpoints
```javascript
ADMIN: {
  USERS: '/admin/users',
  USER_ROLE: '/admin/users/:id/role',
  STATISTICS: '/admin/statistics',
  UNVERIFIED_GUIDES: '/guides?verificationStatus=PENDING',
  VERIFY_GUIDE: '/guides/:id/verify'
}
```

### Guide Management
- **GET** `/guides?verificationStatus=PENDING` - Fetch unverified guides
- **POST** `/guides/:id/verify` - Approve guide profile

## User Interface

### Admin Dashboard Layout
1. **Header Section**
   - Admin title with shield icon
   - Description of functionality

2. **Unverified Guides Table**
   - Guide profile information (name, contact, specialties, languages)
   - Action buttons (Approve/Reject)
   - Pending count badge
   - Refresh button

3. **Quick Statistics**
   - Total Users (placeholder for future implementation)
   - Verified Guides (placeholder for future implementation)
   - Pending Verifications (real-time count)

### Responsive Design
- **Desktop**: Full table view with all columns
- **Mobile**: Responsive table with horizontal scroll
- **Tablet**: Optimized layout for medium screens

## Security Features

### Role-based Access Control
- **Route Protection**: `/admin` route only accessible to ADMIN users
- **Component Protection**: AdminDashboard component checks user role
- **API Protection**: All admin API calls require valid JWT token

### Access Denied Handling
- **Unauthorized Access**: Shows access denied message for non-admin users
- **Role Display**: Shows user's current role in error message
- **Graceful Fallback**: Redirects to appropriate page based on user role

## Future Enhancements

### Planned Features
1. **User Management**
   - View all users in the system
   - Update user roles (USER → GUIDE → ADMIN)
   - Deactivate/reactivate user accounts

2. **System Statistics**
   - Real-time user counts
   - Booking statistics
   - Revenue analytics
   - Guide performance metrics

3. **Advanced Guide Management**
   - Bulk approve/reject operations
   - Verification document review
   - Guide performance monitoring
   - Suspension/termination capabilities

4. **Content Moderation**
   - Tour content review
   - Review moderation
   - Report handling
   - Content quality metrics

## Technical Implementation

### Components Created
- `AdminDashboard.js` - Main admin interface component
- Updated `Navbar.js` - Added admin section to profile dropdown
- Updated `App.js` - Added admin route

### State Management
- Uses React hooks for local state
- Integrates with existing AuthContext for user authentication
- Real-time updates for guide verification status

### API Integration
- Follows existing API patterns and error handling
- Uses centralized API configuration
- Implements proper loading states and error messages

## Usage Instructions

### For Administrators
1. **Login** with admin credentials
2. **Navigate** to profile dropdown (top right)
3. **Click** "Admin Dashboard" in the admin section
4. **Review** pending guide profile verifications
5. **Approve/Reject** guides as appropriate

### For Developers
1. **Test** admin functionality with admin user account
2. **Verify** role-based access control works correctly
3. **Check** responsive design on different screen sizes
4. **Monitor** API calls and error handling

## Testing

### Manual Testing Checklist
- [ ] Admin user can access `/admin` route
- [ ] Non-admin users see access denied message
- [ ] Admin section appears in profile dropdown for admin users
- [ ] Guide verification table loads correctly
- [ ] Approve/reject buttons work as expected
- [ ] Mobile navigation includes admin section
- [ ] Error handling works for API failures
- [ ] Success messages display after actions

### Automated Testing (Future)
- Unit tests for AdminDashboard component
- Integration tests for admin API endpoints
- E2E tests for complete admin workflow
- Role-based access control tests

## Troubleshooting

### Common Issues
1. **Admin section not visible**
   - Check user role is set to 'ADMIN'
   - Verify JWT token is valid
   - Check browser console for errors

2. **Guide verification not working**
   - Verify backend API is running
   - Check API endpoint configuration
   - Review network requests in browser dev tools

3. **Access denied errors**
   - Confirm user has ADMIN role
   - Check authentication state
   - Verify route protection is working

## Support

For technical support or feature requests related to admin functionality, please refer to the main project documentation or contact the development team.
