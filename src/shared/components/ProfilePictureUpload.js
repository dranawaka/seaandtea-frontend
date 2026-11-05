import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';
import { buildApiUrl, API_CONFIG, logApiCall, validateUploadFile, UPLOAD_CONSTRAINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { PLACEHOLDER_IMAGES } from '../utils/imageUtils';

const ProfilePictureUpload = ({ 
  currentImageUrl, 
  onImageUpdate, 
  userId, 
  userRole = 'USER',
  size = 'large',
  className = '',
  disabled = false 
}) => {
  const { updateProfilePicture } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-16 h-16',
      image: 'w-16 h-16',
      icon: 'h-6 w-6',
      button: 'text-xs px-2 py-1'
    },
    medium: {
      container: 'w-24 h-24',
      image: 'w-24 h-24',
      icon: 'h-8 w-8',
      button: 'text-sm px-3 py-1.5'
    },
    large: {
      container: 'w-32 h-32',
      image: 'w-32 h-32',
      icon: 'h-10 w-10',
      button: 'text-sm px-4 py-2'
    },
    xlarge: {
      container: 'w-40 h-40',
      image: 'w-40 h-40',
      icon: 'h-12 w-12',
      button: 'text-base px-4 py-2'
    }
  };

  const config = sizeConfig[size] || sizeConfig.large;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validationError = validateUploadFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSuccess('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the appropriate endpoint based on user role
      const endpoint = userRole === 'GUIDE' 
        ? API_CONFIG.ENDPOINTS.FILES.UPLOAD_GUIDE_PROFILE_PICTURE
        : API_CONFIG.ENDPOINTS.FILES.UPLOAD_PROFILE_PICTURE;
      
      const url = buildApiUrl(endpoint);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Uploading profile picture:', { 
        url, 
        fileSize: file.size, 
        fileType: file.type, 
        userRole, 
        endpoint 
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      logApiCall('POST', url, { file: file.name, size: file.size }, response);

      const data = await response.json();

      if (!response.ok) {
        console.error('Upload failed:', { status: response.status, data });
        throw new Error(data.message || data.error || 'Failed to upload image');
      }

      // Update the parent component with the new image URL
      const imageUrl = data.profilePictureUrl || data.imageUrl || data.url || data.fileUrl;
      if (onImageUpdate) {
        onImageUpdate(imageUrl);
      }

      // Update the auth context
      updateProfilePicture(imageUrl);

      setSuccess('Profile picture updated successfully!');
      setPreviewUrl(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    setIsUploading(true);
    setError('');

    try {
      // Use the appropriate endpoint based on user role
      const endpoint = userRole === 'GUIDE' 
        ? API_CONFIG.ENDPOINTS.FILES.UPLOAD_GUIDE_PROFILE_PICTURE
        : API_CONFIG.ENDPOINTS.FILES.UPLOAD_PROFILE_PICTURE;
      
      const url = buildApiUrl(endpoint);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      logApiCall('DELETE', url, null, response);

      if (!response.ok) {
        const data = await response.json();
        console.error('Remove failed:', { status: response.status, data });
        throw new Error(data.message || data.error || 'Failed to remove image');
      }

      // Update the parent component
      if (onImageUpdate) {
        onImageUpdate(null);
      }

      // Update the auth context
      updateProfilePicture(null);

      setSuccess('Profile picture removed successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Remove error:', error);
      setError(error.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayImage = previewUrl || currentImageUrl;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      <div className={`relative ${config.container} rounded-full overflow-hidden border-4 border-gray-200 group`}>
        {displayImage ? (
          <img
            src={displayImage}
            alt="Profile"
            className={`${config.image} object-cover`}
          />
        ) : (
          <div className={`${config.image} bg-gray-100 flex items-center justify-center`}>
            <Camera className={`${config.icon} text-gray-400`} />
          </div>
        )}

        {/* Upload Overlay */}
        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              ) : (
                <Upload className="h-6 w-6 text-primary-600" />
              )}
            </button>
          </div>
        )}

        {/* Remove Button */}
        {displayImage && !disabled && (
          <button
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex space-x-2">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className={`inline-flex items-center ${config.button} border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {displayImage ? 'Change' : 'Upload'}
              </>
            )}
          </button>

          {displayImage && (
            <button
              onClick={handleRemoveImage}
              disabled={isUploading}
              className={`inline-flex items-center ${config.button} border border-red-300 rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <Check className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        <p>Upload a clear photo of yourself</p>
        <p>Max size: {UPLOAD_CONSTRAINTS.MAX_SIZE_MB}MB • JPEG, PNG, WebP</p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
