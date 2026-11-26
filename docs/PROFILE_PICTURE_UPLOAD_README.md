# Profile Picture Upload Feature

## Overview
This feature allows both users and guides to upload, update, and remove their profile pictures throughout the Sea & Tea Tours application.

## Components Added/Modified

### 1. ProfilePictureUpload Component (`src/components/ProfilePictureUpload.js`)
A reusable component that handles profile picture uploads with the following features:
- **File validation**: Only accepts image files (JPG, PNG, GIF) up to 5MB
- **Preview functionality**: Shows image preview before upload
- **Multiple sizes**: Supports small, medium, large, and xlarge display sizes
- **Upload/Remove actions**: Upload new images or remove existing ones
- **Error handling**: Displays user-friendly error messages
- **Loading states**: Shows loading indicators during upload
- **Responsive design**: Works on both desktop and mobile

### 2. API Configuration (`src/config/api.js`)
Added new endpoints for profile picture uploads:
- `FILES.UPLOAD_PROFILE_PICTURE: '/upload/profile-picture'` (for regular users)
- `FILES.UPLOAD_GUIDE_PROFILE_PICTURE: '/upload/guide-profile-picture'` (for guides)

### 3. UserProfile Page (`src/pages/UserProfile.js`)
- Added ProfilePictureUpload component to the sidebar
- Integrated with existing profile management
- Works for both regular users and guides
- Updates user context when profile picture changes

### 4. GuideDashboard Component (`src/components/GuideDashboard.js`)
- Added ProfilePictureUpload component to the dashboard header
- Provides quick access to profile picture management
- Updates user context when profile picture changes

### 5. AuthContext (`src/context/AuthContext.js`)
- Added `updateProfilePicture` function for centralized profile picture management
- Automatically updates localStorage when profile picture changes
- Ensures profile picture updates are reflected across the entire application

### 6. Navbar Component (`src/components/Navbar.js`)
- Displays user's profile picture in the navigation bar
- Shows profile picture in dropdown menu
- Falls back to UserCircle icon if no profile picture is set
- Works on both desktop and mobile views

## Usage

### For Users
1. Navigate to `/profile` page
2. Find the "Profile Picture" section in the sidebar
3. Click "Upload" to select an image file
4. The image will be uploaded and displayed immediately
5. Use "Remove" to delete the current profile picture

### For Guides
1. Navigate to `/profile` page (same as users)
2. Or use the GuideDashboard at the top of the dashboard
3. Follow the same upload/remove process as users

## API Endpoints

### Upload Profile Picture
```
POST /api/v1/upload/profile-picture          (for regular users)
POST /api/v1/upload/guide-profile-picture    (for guides)
```
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with 'file' field
- **Response**: `{ profilePictureUrl: string }` or similar format

### Remove Profile Picture
```
DELETE /api/v1/upload/profile-picture        (for regular users)
DELETE /api/v1/upload/guide-profile-picture  (for guides)
```
- **Method**: DELETE
- **Response**: Success/error message

## File Validation
- **Allowed types**: image/jpeg, image/png, image/gif
- **Maximum size**: 5MB
- **Client-side validation**: Immediate feedback for invalid files

## State Management
- Profile pictures are stored in the user object in AuthContext
- Changes are automatically persisted to localStorage
- Updates are reflected across all components immediately
- No page refresh required

## Error Handling
- Network errors are caught and displayed to users
- File validation errors are shown immediately
- Upload progress is indicated with loading states
- Success messages confirm successful operations

## Responsive Design
- Works on desktop, tablet, and mobile devices
- Different sizes available for different contexts
- Touch-friendly interface for mobile users

## Security Considerations
- Files are validated on the client side
- Server-side validation should be implemented in the backend
- Authentication required for all upload operations
- JWT tokens are used for authorization

## Future Enhancements
- Image cropping functionality
- Multiple image formats support
- Image compression before upload
- Batch upload for multiple images
- Image editing tools (filters, adjustments)
