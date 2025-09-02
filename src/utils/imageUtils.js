// Image utility functions for handling fallbacks and placeholders

/**
 * Creates a base64 encoded SVG placeholder image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display in placeholder
 * @param {string} bgColor - Background color (hex)
 * @param {string} textColor - Text color (hex)
 * @returns {string} Base64 encoded SVG data URL
 */
export const createPlaceholderImage = (
  width = 300,
  height = 200,
  text = 'Image',
  bgColor = '#f3f4f6',
  textColor = '#6b7280'
) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="${textColor}" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Default placeholder images for different contexts
 */
export const PLACEHOLDER_IMAGES = {
  GUIDE: createPlaceholderImage(300, 200, 'Guide', '#f3f4f6', '#6b7280'),
  TOUR: createPlaceholderImage(300, 200, 'Tour', '#f3f4f6', '#6b7280'),
  USER: createPlaceholderImage(300, 200, 'User', '#f3f4f6', '#6b7280'),
  PROFILE: createPlaceholderImage(300, 300, 'Profile', '#f3f4f6', '#6b7280'),
  DEFAULT: createPlaceholderImage(300, 200, 'Image', '#f3f4f6', '#6b7280')
};

/**
 * Handles image error by setting a fallback placeholder
 * @param {Event} event - The error event from img element
 * @param {string} placeholderType - Type of placeholder to use
 */
export const handleImageError = (event, placeholderType = 'DEFAULT') => {
  const img = event.target;
  if (img.src !== PLACEHOLDER_IMAGES[placeholderType]) {
    img.src = PLACEHOLDER_IMAGES[placeholderType];
  }
};

/**
 * Gets a safe image URL with fallback
 * @param {string} imageUrl - The primary image URL
 * @param {string} placeholderType - Type of placeholder to use as fallback
 * @returns {string} Safe image URL
 */
export const getSafeImageUrl = (imageUrl, placeholderType = 'DEFAULT') => {
  if (!imageUrl || imageUrl.trim() === '') {
    return PLACEHOLDER_IMAGES[placeholderType];
  }
  
  // Check if it's already a data URL or a valid URL
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative path, make it absolute
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Default to placeholder if we can't determine the format
  return PLACEHOLDER_IMAGES[placeholderType];
};

/**
 * Creates an image component with error handling
 * @param {Object} props - Image props
 * @param {string} props.src - Image source
 * @param {string} props.alt - Alt text
 * @param {string} props.className - CSS classes
 * @param {string} props.placeholderType - Type of placeholder for fallback
 * @returns {JSX.Element} Image element with error handling
 */
export const SafeImage = ({ src, alt, className, placeholderType = 'DEFAULT', ...props }) => {
  const safeSrc = getSafeImageUrl(src, placeholderType);
  
  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      onError={(e) => handleImageError(e, placeholderType)}
      {...props}
    />
  );
};
