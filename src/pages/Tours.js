import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, DollarSign, Filter, Search, Clock } from 'lucide-react';
import { getPublicVerifiedToursPaginated, getGuideTours } from '../config/api';
import { useAuth } from '../context/AuthContext';

const Tours = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const [guideId, setGuideId] = useState(null);
  
  // Static filter options
  const categories = ['All Categories', 'Cultural', 'Adventure', 'Wildlife', 'Beach', 'Historical', 'Food', 'Tea Tours'];
  const priceRanges = ['All Prices', 'Under $50', '$50-$100', '$100-$200', 'Over $200'];
  const durations = ['All Durations', 'Half Day', '1 Day', '2 Days', '3 Days', '4+ Days'];

  // Fetch guide ID if user is authenticated
  useEffect(() => {
    const fetchGuideId = async () => {
      if (isAuthenticated && token && !guideId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1'}/guides/my-profile/exists`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const userGuideId = data.guideId || data.id;
            if (userGuideId) {
              setGuideId(userGuideId);
            }
          }
        } catch (error) {
          console.error('Error fetching guide ID:', error);
        }
      }
    };

    fetchGuideId();
  }, [isAuthenticated, token, guideId]);

  useEffect(() => {
    loadTours();
  }, [currentPage, viewMode]);



  const loadTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (viewMode === 'my' && isAuthenticated && guideId) {
        // Load guide's own tours using the getToursByGuide endpoint
        response = await getGuideTours(guideId, currentPage, 20, token);
      } else {
        // Load public verified tours
        response = await getPublicVerifiedToursPaginated(currentPage, 20, {});
      }
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        // Backend returned direct array
        setTours(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        // Backend returned paginated response
        setTours(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      setError(error.message || 'Failed to load tours');
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, viewMode, isAuthenticated, guideId, token]);

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(0); // Reset to first page when searching
    try {
      const filters = {
        searchTerm,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        duration: selectedDuration !== 'All Durations' ? selectedDuration : undefined
      };
      
      // Handle price range filtering
      if (selectedPriceRange !== 'All Prices') {
        switch (selectedPriceRange) {
          case 'Under $50':
            filters.maxPrice = 50;
            break;
          case '$50-$100':
            filters.minPrice = 50;
            filters.maxPrice = 100;
            break;
          case '$100-$200':
            filters.minPrice = 100;
            filters.maxPrice = 200;
            break;
          case 'Over $200':
            filters.minPrice = 200;
            break;
        }
      }
      
      const response = await getPublicVerifiedToursPaginated(0, 20, filters);
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        // Backend returned direct array
        setTours(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        // Backend returned paginated response
        setTours(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
      setError(null);
    } catch (error) {
      console.error('Error searching tours:', error);
      setError(error.message || 'Failed to search tours');
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPriceRange('');
    setSelectedDuration('');
    setCurrentPage(0);
    loadTours();
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(0);
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPriceRange('');
    setSelectedDuration('');
  };

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    setLoading(true);
    try {
      const filters = {
        searchTerm,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        duration: selectedDuration !== 'All Durations' ? selectedDuration : undefined
      };
      
      // Handle price range filtering
      if (selectedPriceRange !== 'All Prices') {
        switch (selectedPriceRange) {
          case 'Under $50':
            filters.maxPrice = 50;
            break;
          case '$50-$100':
            filters.minPrice = 50;
            filters.maxPrice = 100;
            break;
          case '$100-$200':
            filters.minPrice = 100;
            filters.maxPrice = 200;
            break;
          case 'Over $200':
            filters.minPrice = 200;
            break;
        }
      }
      
      const response = await getPublicVerifiedToursPaginated(newPage, 20, filters);
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        // Backend returned direct array
        setTours(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        // Backend returned paginated response
        setTours(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading tours:', error);
      setError(error.message || 'Failed to load tours');
      setTours([]);
    } finally {
      setLoading(false);
    }
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
            {viewMode === 'my' ? 'My Tours' : 'Discover Amazing Tours'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {viewMode === 'my' 
              ? 'Manage and view all your created tours.'
              : 'Explore curated tours led by local experts who will show you the authentic side of each destination.'
            }
          </p>
          
          {/* View Mode Toggle */}
          {isAuthenticated && guideId && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                <button
                  onClick={() => handleViewModeChange('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'all'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  All Tours
                </button>
                <button
                  onClick={() => handleViewModeChange('my')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'my'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  My Tours
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters - Only show for All Tours view */}
        {viewMode === 'all' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== 'All Categories' || selectedPriceRange !== 'All Prices' || selectedDuration !== 'All Durations') && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                  {searchTerm && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory !== 'All Categories' && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {selectedCategory}
                    </span>
                  )}
                  {selectedPriceRange !== 'All Prices' && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      {selectedPriceRange}
                    </span>
                  )}
                  {selectedDuration !== 'All Durations' && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                      {selectedDuration}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="input-field"
            >
              {priceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="input-field"
            >
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Filter className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>
        </div>
        )}

        {/* Create Tour Button - Only show for My Tours view */}
        {viewMode === 'my' && isAuthenticated && guideId && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Your Tours</h3>
                <p className="text-gray-600">Create new tours or edit existing ones to grow your business.</p>
              </div>
              <Link
                to="/create-tour"
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create New Tour</span>
              </Link>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading tours</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadTours}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="card overflow-hidden">
              <div className="relative">
                <img 
                  src={tour.images && tour.images.length > 0 ? tour.images[0].imageUrl : (tour.imageUrl || tour.image || 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')} 
                  alt={tour.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {tour.category ? tour.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Tour'}
                </div>
                <div className="absolute top-4 right-4 bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                  ${tour.pricePerPerson || tour.price || 0}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tour.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tour.meetingPoint || tour.location || tour.destination || 'Location TBD'}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-secondary-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {tour.averageRating || tour.rating || 0} ({tour.totalReviews || tour.reviewCount || tour.reviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {tour.maxGroupSize ? `Max ${tour.maxGroupSize}` : (tour.groupSize || '2-6')}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {tour.durationHours ? `${tour.durationHours} Hours` : (tour.duration || '1 Day')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${tour.pricePerPerson || tour.price || 0}
                  </div>
                </div>
                
                {tour.highlights && tour.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Highlights:</div>
                    <div className="flex flex-wrap gap-2">
                      {tour.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                  {tour.description || tour.shortDescription || 'Experience an amazing tour with our expert guides.'}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    Guide: <span className="font-medium">
                      {tour.guide?.firstName && tour.guide?.lastName 
                        ? `${tour.guide.firstName} ${tour.guide.lastName}`
                        : (tour.guideName || tour.guide?.name || 'Expert Guide')
                      }
                    </span>
                  </span>
                </div>
                
                {viewMode === 'my' ? (
                  <div className="flex space-x-2">
                    <Link 
                      to={`/tour/${tour.id}`}
                      className="btn-outline flex-1 text-center"
                    >
                      View Details
                    </Link>
                    <Link 
                      to={`/edit-tour/${tour.id}`}
                      className="btn-primary flex-1 text-center"
                    >
                      Edit Tour
                    </Link>
                  </div>
                ) : (
                  <Link 
                    to={`/tour/${tour.id}`}
                    className="btn-primary w-full text-center"
                  >
                    View Details & Book
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-12">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        {tours.length > 0 && (
          <div className="text-center mt-8 text-sm text-gray-600">
            Showing {tours.length} of {totalElements} tours
          </div>
        )}

        {tours.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">
              {viewMode === 'my' 
                ? 'You haven\'t created any tours yet. Start building your tour business!'
                : 'No tours found matching your criteria.'
              }
            </p>
            {viewMode === 'my' ? (
              <Link 
                to="/create-tour"
                className="btn-primary"
              >
                Create Your First Tour
              </Link>
            ) : (
              <button 
                onClick={clearFilters}
                className="btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tours;

