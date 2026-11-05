import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadTourImageApi, deleteImageApi, validateUploadFile, UPLOAD_CONSTRAINTS } from '../config/api';

const DEFAULT_MAX_FILES = 10;
const DEFAULT_MAX_SIZE_MB = UPLOAD_CONSTRAINTS.MAX_SIZE_MB;
const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';

/**
 * Reusable image picker: upload files (when tourId is set) and/or add image URLs.
 * value: string[] (image URLs), onChange: (urls: string[]) => void.
 * When tourId is provided, file upload uses POST /upload/tour/{tourId}/image.
 */
const ImagePicker = ({
  value = [],
  onChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  accept = ACCEPT,
  enableUpload = true,
  allowUrlInput = true,
  primaryIndex,
  onPrimaryChange,
  label = 'Images',
  helpText = 'Upload images or paste URLs. First image is the cover.',
  className = '',
  disabled = false,
  tourId = null,
  onTourUpdated = null
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const urls = Array.isArray(value) ? value.filter(Boolean) : [];
  const canAdd = urls.length < maxFiles;

  const addUrl = (url) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setUploadError('Please enter a valid URL (http or https)');
      return;
    }
    if (urls.length >= maxFiles) {
      setUploadError(`Maximum ${maxFiles} images allowed`);
      return;
    }
    setUploadError('');
    onChange([...urls, trimmed]);
    setUrlInput('');
  };

  const removeUrl = async (index) => {
    const urlToRemove = urls[index];
    const next = urls.filter((_, i) => i !== index);
    if (urlToRemove && typeof urlToRemove === 'string' && urlToRemove.includes('cloudinary.com')) {
      try {
        await deleteImageApi(urlToRemove, null);
      } catch (_) {
        // Remove from UI anyway; backend may have already deleted
      }
    }
    onChange(next);
    if (onPrimaryChange != null) {
      const currentPrimary = primaryIndex ?? 0;
      if (currentPrimary >= next.length) onPrimaryChange(Math.max(0, next.length - 1));
      else if (currentPrimary > index) onPrimaryChange(currentPrimary - 1);
      else onPrimaryChange(currentPrimary);
    }
  };

  const setPrimary = (index) => {
    if (onPrimaryChange) onPrimaryChange(index);
  };

  const validateFile = (file) => {
    return validateUploadFile(file) || (file.size > maxSizeMB * 1024 * 1024 ? `Image must be under ${maxSizeMB}MB` : null);
  };

  const uploadFiles = async (files) => {
    if (!enableUpload || !canAdd) return;
    if (!tourId) {
      setUploadError('Save the tour first to upload images, or add image URLs.');
      return;
    }
    const fileList = Array.from(files || []).filter(f => f && UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(f.type));
    if (fileList.length === 0) {
      setUploadError('Allowed types: JPEG, JPG, PNG, WebP');
      return;
    }

    setUploadError('');
    setUploading(true);
    const currentUrls = [...urls];
    const primaryIdx = primaryIndex ?? 0;
    let lastTour = null;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const err = validateFile(file);
      if (err) {
        setUploadError(err);
        break;
      }
      try {
        const isPrimary = currentUrls.length === 0 && i === 0;
        lastTour = await uploadTourImageApi(tourId, file, { isPrimary }, null);
        const images = lastTour?.images || [];
        const newUrl = images.length ? (images[images.length - 1].imageUrl || images[images.length - 1].url) : null;
        if (newUrl) currentUrls.push(newUrl);
        if (currentUrls.length >= maxFiles) break;
      } catch (e) {
        setUploadError(e.message || 'Upload failed');
        break;
      }
    }

    if (currentUrls.length > urls.length) {
      onChange(currentUrls);
      if (onPrimaryChange != null && currentUrls.length > 0 && (primaryIndex ?? 0) >= currentUrls.length) {
        onPrimaryChange(0);
      }
      if (onTourUpdated && lastTour) onTourUpdated(lastTour);
    }
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files?.length) uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !enableUpload || !canAdd) return;
    uploadFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const triggerFileInput = () => {
    if (!disabled && enableUpload && canAdd && !uploading) fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <h3 className="text-lg font-medium text-gray-900">{label}</h3>
      )}
      {helpText && (
        <p className="text-sm text-gray-600">{helpText}</p>
      )}

      {/* Upload zone */}
      {enableUpload && canAdd && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={triggerFileInput}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
            ${disabled || uploading ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drag & drop images here or <span className="text-primary-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Max {maxSizeMB}MB per file • JPEG, PNG, WebP</p>
            </>
          )}
        </div>
      )}

      {/* URL input */}
      {allowUrlInput && canAdd && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl(urlInput))}
            placeholder="https://..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => addUrl(urlInput)}
            disabled={disabled || !urlInput.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add URL
          </button>
        </div>
      )}

      {(uploadError || (urls.length > 0)) && (
        <p className="text-xs text-gray-500">{urls.length}/{maxFiles} images</p>
      )}
      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Thumbnails */}
      <div className="space-y-2">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded border border-gray-200 bg-white overflow-hidden">
              {url.startsWith('data:') || url.startsWith('http') ? (
                <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <span className="flex-1 truncate text-sm text-gray-700 min-w-0">{url}</span>
            {onPrimaryChange != null && (
              <button
                type="button"
                onClick={() => setPrimary(index)}
                className={`text-xs px-2 py-1 rounded flex-shrink-0 ${(primaryIndex ?? 0) === index ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {(primaryIndex ?? 0) === index ? 'Primary' : 'Set primary'}
              </button>
            )}
            <button
              type="button"
              onClick={() => removeUrl(index)}
              disabled={disabled}
              className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePicker;
