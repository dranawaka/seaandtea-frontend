import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: '/images/slider/beach-1.png',
      title: 'Pristine Beaches',
      subtitle: 'Discover untouched coastal paradises',
      description: 'From Mirissa to Arugam Bay, experience Sri Lanka\'s most beautiful beaches with local guides who know every hidden gem.'
    },
    {
      id: 2,
      image: '/images/slider/mountains-1.png',
      title: 'Misty Mountains',
      subtitle: 'Tea plantations & highland adventures',
      description: 'Explore Ella, Nuwara Eliya and the central highlands where misty mountains meet endless tea plantations.'
    },
    {
      id: 3,
      image: '/images/slider/culture-1.png',
      title: 'Ancient Culture',
      subtitle: 'UNESCO sites & historic temples',
      description: 'Walk through 2000+ years of history at ancient temples, ruins and UNESCO World Heritage sites.'
    },
    {
      id: 4,
      image: '/images/slider/wildlife-1.png',
      title: 'Wildlife Safaris',
      subtitle: 'Elephants, leopards & exotic birds',
      description: 'Encounter incredible wildlife in national parks where elephants roam and leopards hunt in their natural habitat.'
    },
    {
      id: 5,
      image: '/images/slider/local-1.png',
      title: 'Local Experiences',
      subtitle: 'Authentic encounters with locals',
      description: 'Connect with Sri Lankan culture through authentic experiences guided by passionate local experts.'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="image-slider-container relative w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl">
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="content-transition transform transition-all duration-1000 ease-in-out">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {slides[currentSlide].title}
                </h1>
                <h2 className="text-xl md:text-2xl text-secondary-300 mb-6 font-medium">
                  {slides[currentSlide].subtitle}
                </h2>
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                  {slides[currentSlide].description}
                </p>

              </div>
            </div>
          </div>
        </div>



        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`indicator-dot w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-secondary-500 transition-all duration-100 ease-linear"
            style={{
              width: isPlaying ? `${((currentSlide + 1) / slides.length) * 100}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;