import React from 'react';

const sliderBase = (url) => {
  if (typeof url !== 'string') return null;
  const match = url.match(/^(\/images\/slider\/[a-z0-9-]+)\.jpe?g(?:\?.*)?$/i);
  return match ? match[1] : null;
};

export const sliderWebpSrcSet = (url, widths) => {
  const base = sliderBase(url);
  if (!base) return null;
  return widths.map((width) => `${base}-${width}.webp ${width}w`).join(', ');
};

const OptimizedImage = ({
  src,
  alt = '',
  sizes = '100vw',
  widths = [960, 1600],
  className,
  priority = false,
  loading,
  width,
  height,
  onLoad,
  onError,
}) => {
  const srcSet = sliderWebpSrcSet(src, widths);
  const imageLoading = loading || (priority ? 'eager' : 'lazy');
  const fetchpriority = priority ? 'high' : 'low';
  const img = (
    <img
      src={srcSet ? src.replace(/\.jpe?g(?:\?.*)?$/i, '.jpg') : src}
      alt={alt}
      className={className}
      sizes={srcSet ? sizes : undefined}
      width={width}
      height={height}
      loading={imageLoading}
      decoding="async"
      fetchpriority={fetchpriority}
      onLoad={onLoad}
      onError={onError}
    />
  );

  if (!srcSet) return img;

  return (
    <picture className="block h-full w-full">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      {img}
    </picture>
  );
};

export default OptimizedImage;
