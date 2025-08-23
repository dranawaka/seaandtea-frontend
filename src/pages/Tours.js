import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, DollarSign, Filter, Search, Clock } from 'lucide-react';
import { searchTours, mockCategories, mockPriceRanges, mockDurations } from '../data/mockData';

const Tours = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    setLoading(true);
    try {
      const allTours = await searchTours({});
      setTours(allTours);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters = {
        searchTerm,
        category: selectedCategory,
        priceRange: selectedPriceRange,
        duration: selectedDuration
      };
      const filteredTours = await searchTours(filters);
      setTours(filteredTours);
    } catch (error) {
      console.error('Error searching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPriceRange('');
    setSelectedDuration('');
    loadTours();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Tours
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore curated tours led by local experts who will show you the authentic side of each destination.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {mockCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="input-field"
            >
              {mockPriceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="input-field"
            >
              {mockDurations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
            
            <button 
              onClick={handleSearch}
              className="btn-primary flex items-center justify-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Apply
            </button>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="card overflow-hidden">
              <div className="relative">
                <img 
                  src={tour.image} 
                  alt={tour.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {tour.category}
                </div>
                <div className="absolute top-4 right-4 bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                  ${tour.price}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tour.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tour.location}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-secondary-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {tour.rating} ({tour.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {tour.groupSize}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {tour.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${tour.price}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Highlights:</div>
                  <div className="flex flex-wrap gap-2">
                    {tour.highlights.map((highlight, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                  {tour.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    Guide: <span className="font-medium">{tour.guide}</span>
                  </span>
                </div>
                
                <Link 
                  to={`/tour/${tour.id}`}
                  className="btn-primary w-full text-center"
                >
                  View Details & Book
                </Link>
              </div>
            </div>
          ))}
        </div>

        {tours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tours found matching your criteria.</p>
            <button 
              onClick={clearFilters}
              className="btn-outline mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tours;

