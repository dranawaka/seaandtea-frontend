import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { getHomepageSliderApi } from '../config/api';

const DEFAULT_SLIDES = [
  { id: 'sigiriya', image: '/images/slider/sigiriya.jpg', title: 'Sigiriya', subtitle: 'The rock fortress, seen from Pidurangala', description: 'Climb the Lion Rock, a UNESCO site in the Cultural Triangle.' },
  { id: 'tea', image: '/images/slider/tea-nuwara-eliya.jpg', title: 'Nuwara Eliya tea country', subtitle: 'Ceylon tea, picked in the hills', description: 'Walk the estates above Nuwara Eliya with the people who pluck the leaf.' },
  { id: 'beach', image: '/images/slider/beach-unawatuna.jpg', title: 'Unawatuna', subtitle: 'A south-coast beach', description: 'Swim at Unawatuna, on the coast below Galle.' },
  { id: 'ella', image: '/images/slider/ella-nine-arch.jpg', title: 'Nine Arch Bridge', subtitle: 'The Ella railway', description: 'Watch the hill-country line cross the Nine Arch Bridge.' },
  { id: 'elephants', image: '/images/slider/yala-elephants.jpg', title: 'Sri Lankan elephants', subtitle: 'Wild herds in the dry zone', description: 'See elephants in the parks of the south and east.' }
];

const isCuratedSlide = (url) =>
  typeof url === 'string' && (url.startsWith('/images/slider/') || url.includes('cloudinary.com'));

const AUTOPLAY_MS = 5000;

const ImageSlider = ({ variant = 'card', children }) => {
  const hero = variant === 'hero';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [apiSlides, setApiSlides] = useState([]);
  const touchStart = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getHomepageSliderApi()
      .then((list) => {
        if (cancelled) return;
        const sorted = (Array.isArray(list) ? list : [])
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setApiSlides(sorted);
      })
      .catch(() => {
        if (!cancelled) setApiSlides([]);
      });
    return () => { cancelled = true; };
  }, []);

  const slides = useMemo(() => {
    const fromApi = apiSlides
      .filter((item) => isCuratedSlide(item.imageUrl))
      .map((item) => ({
        id: item.id,
        image: item.imageUrl,
        title: item.altText || '',
        subtitle: '',
        description: ''
      }));
    return fromApi.length > 0 ? fromApi : DEFAULT_SLIDES;
  }, [apiSlides]);

  useEffect(() => {
    setCurrentSlide((index) => (slides.length === 0 ? 0 : index % slides.length));
  }, [slides]);

  const playing = isPlaying && !hovered && slides.length > 1;

  useEffect(() => {
    if (!playing) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [playing, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  const onTouchStart = (event) => {
    if (event.target.closest('input, button, a, textarea, select')) return;
    touchStart.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStart.current == null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (delta > 50) prevSlide();
    else if (delta < -50) nextSlide();
  };

  const onKeyDown = (event) => {
    if (event.target.closest('input, textarea, select')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }
  };

  if (slides.length === 0) return null;

  const slide = slides[currentSlide] || slides[0];

  return (
    <div
      className={hero
        ? 'relative w-full min-h-[560px] md:min-h-[640px] overflow-hidden text-white'
        : 'image-slider-container relative w-full h-[560px] md:h-[640px] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-primary-900/10'}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Sri Lanka experiences"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={item.image}
              alt={item.title || 'Sri Lanka'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/55 to-primary-900/20" />
      </div>

      {children ? (
        <div className="relative z-10 flex items-center min-h-[560px] md:min-h-[640px] pb-16">
          {children}
        </div>
      ) : (
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <p className="inline-flex mb-4 rounded-full bg-secondary-400/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                Sri Lanka
              </p>
              {slide.title && (
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <h2 className="text-xl md:text-2xl text-secondary-200 mb-6 font-medium">
                  {slide.subtitle}
                </h2>
              )}
              {slide.description && (
                <p className="text-lg text-white/85 mb-8 leading-relaxed">
                  {slide.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="hidden sm:flex absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center bg-white/20 hover:bg-white/35 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="hidden sm:flex absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center bg-white/20 hover:bg-white/35 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => setIsPlaying((value) => !value)}
        className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goToSlide(index)}
            className={`indicator-dot h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-secondary-300' : 'w-2.5 bg-white/55 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}${item.title ? `: ${item.title}` : ''}`}
            aria-current={index === currentSlide ? 'true' : undefined}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        {playing && (
          <div
            key={currentSlide}
            className="h-full bg-secondary-400"
            style={{ animation: `progress ${AUTOPLAY_MS}ms linear forwards` }}
          />
        )}
      </div>
    </div>
  );
};

export default ImageSlider;
