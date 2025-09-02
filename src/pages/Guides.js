import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Globe, Filter, Search, Clock, Shield, CheckCircle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildApiUrl, API_CONFIG, logApiCall, getGuidesByVerificationStatus, getAllGuides, getVerifiedGuidesPaginated } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { PLACEHOLDER_IMAGES, handleImageError } from '../utils/imageUtils';

const Guides = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadGuides();
    loadFilterOptions();
  }, [currentPage, pageSize]);

  const loadGuides = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the new paginated endpoint for verified guides
      const response = await getVerifiedGuidesPaginated(currentPage, pageSize);
      console.log('Paginated guides response:', response);
      
      // Debug: Log sample guide data to see available fields
      if (response.content && response.content.length > 0) {
        console.log('Sample guide data:', response.content[0]);
        console.log('Available fields:', Object.keys(response.content[0]));
        
        // Check if user object exists and what fields it has
        if (response.content[0].user) {
          console.log('User object:', response.content[0].user);
          console.log('User fields:', Object.keys(response.content[0].user));
        }
      }
      
      // Extract pagination info
      if (response.content) {
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        
        // Transform the backend data to match our frontend structure
        const transformedGuides = response.content.map(guide => {
          // Extract profile picture from various possible field names
          const profilePicture = guide.profileImageUrl || 
                                guide.profilePictureUrl || 
                                guide.userProfilePictureUrl ||
                                guide.user?.profilePictureUrl || 
                                guide.user?.profileImageUrl ||
                                guide.imageUrl || 
                                guide.image ||
                                null;
          
          // Debug: Log profile picture info for first guide
          if (guide.id === response.content[0]?.id) {
            console.log('Guide profile picture debug:', {
              guideId: guide.id,
              guideName: guide.fullName || `${guide.userFirstName || ''} ${guide.userLastName || ''}`.trim(),
              profileImageUrl: guide.profileImageUrl,
              profilePictureUrl: guide.profilePictureUrl,
              userProfilePictureUrl: guide.userProfilePictureUrl,
              userProfilePictureUrlNested: guide.user?.profilePictureUrl,
              userProfileImageUrl: guide.user?.profileImageUrl,
              imageUrl: guide.imageUrl,
              image: guide.image,
              finalProfilePicture: profilePicture
            });
          }
          
          return {
            id: guide.id,
            name: guide.fullName || `${guide.userFirstName || ''} ${guide.userLastName || ''}`.trim() || 'Guide Name',
            image: profilePicture || PLACEHOLDER_IMAGES.GUIDE,
            location: guide.location || 'Location not specified',
            rating: guide.averageRating || 0,
            reviews: guide.totalReviews || 0,
            tours: guide.totalTours || 0,
            hourlyRate: guide.hourlyRate || 0,
            dailyRate: guide.dailyRate || 0,
            languages: guide.languages || [],
            specialties: guide.specialties || [],
            bio: guide.bio || 'No bio available',
            responseTime: guide.responseTimeHours ? `Within ${guide.responseTimeHours} hours` : 'Within 24 hours',
            verified: guide.verificationStatus === 'VERIFIED',
            verificationStatus: guide.verificationStatus,
            isAvailable: guide.isAvailable || false,
            userEmail: guide.userEmail || null
          };
        });

        setGuides(transformedGuides);
      } else {
        // Fallback for non-paginated response
        const transformedGuides = response.map(guide => {
          // Extract profile picture from various possible field names
          const profilePicture = guide.profileImageUrl || 
                                guide.profilePictureUrl || 
                                guide.userProfilePictureUrl ||
                                guide.user?.profilePictureUrl || 
                                guide.user?.profileImageUrl ||
                                guide.imageUrl || 
                                guide.image ||
                                null;
          
          // Debug: Log profile picture info for first guide
          if (guide.id === response[0]?.id) {
            console.log('Guide profile picture debug:', {
              guideId: guide.id,
              guideName: guide.fullName || `${guide.userFirstName || ''} ${guide.userLastName || ''}`.trim(),
              profileImageUrl: guide.profileImageUrl,
              profilePictureUrl: guide.profilePictureUrl,
              userProfilePictureUrl: guide.userProfilePictureUrl,
              userProfilePictureUrlNested: guide.user?.profilePictureUrl,
              userProfileImageUrl: guide.user?.profileImageUrl,
              imageUrl: guide.imageUrl,
              image: guide.image,
              finalProfilePicture: profilePicture
            });
          }
          
          return {
            id: guide.id,
            name: guide.fullName || `${guide.userFirstName || ''} ${guide.userLastName || ''}`.trim() || 'Guide Name',
            image: profilePicture || PLACEHOLDER_IMAGES.GUIDE,
            location: guide.location || 'Location not specified',
            rating: guide.averageRating || 0,
            reviews: guide.totalReviews || 0,
            tours: guide.totalTours || 0,
            hourlyRate: guide.hourlyRate || 0,
            dailyRate: guide.dailyRate || 0,
            languages: guide.languages || [],
            specialties: guide.specialties || [],
            bio: guide.bio || 'No bio available',
            responseTime: guide.responseTimeHours ? `Within ${guide.responseTimeHours} hours` : 'Within 24 hours',
            verified: guide.verificationStatus === 'VERIFIED',
            verificationStatus: guide.verificationStatus,
            isAvailable: guide.isAvailable || false,
            userEmail: guide.userEmail || null
          };
        });

        setGuides(transformedGuides);
        setTotalPages(1);
        setTotalElements(transformedGuides.length);
      }
    } catch (error) {
      console.error('Error loading guides:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Load locations, languages, and specialties from the guides data
      // This will be populated after guides are loaded
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const handleSearch = async () => {
    // Reset pagination when searching
    setCurrentPage(0);
    // Reload guides with current filters
    await loadGuides();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedLanguage('');
    setSelectedSpecialty('');
    setSelectedAvailability('');
    loadGuides();
  };

  // Update filter options when guides are loaded
  useEffect(() => {
    if (guides.length > 0) {
      // Extract unique locations
      const uniqueLocations = [...new Set(guides.map(guide => guide.location))].filter(Boolean);
      setLocations(uniqueLocations);
      
      // Extract unique languages
      const allLanguages = guides.flatMap(guide => guide.languages);
      const uniqueLanguages = [...new Set(allLanguages.map(lang => 
        typeof lang === 'string' ? lang : lang.language
      ))].filter(Boolean);
      setLanguages(uniqueLanguages);
      
      // Extract unique specialties
      const allSpecialties = guides.flatMap(guide => guide.specialties);
      const uniqueSpecialties = [...new Set(allSpecialties.map(spec => 
        typeof spec === 'string' ? spec : spec.specialty
      ))].filter(Boolean);
      setSpecialties(uniqueSpecialties);
    }
  }, [guides]);

  if (loading && guides.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guides from backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading guides</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={loadGuides}
            className="btn-primary"
          >
            Try Again
          </button>
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
            Find Your Perfect Sri Lankan Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified local guides from Sri Lanka's thriving freelance community. 
            Book by the hour or day with instant confirmation and secure payments.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input-field"
            >
              <option value="">All Languages</option>
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="input-field"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="input-field"
            >
              <option value="">All Availability</option>
              <option value="true">Available Only</option>
              <option value="false">Unavailable Only</option>
            </select>
            
            <button 
              onClick={handleSearch}
              className="btn-primary flex items-center justify-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Loading Indicator for Pagination */}
        {loading && guides.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading more guides...</p>
          </div>
        )}

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div key={guide.id} className="card overflow-hidden">
              <div className="relative">
                <img 
                  src={guide.image} 
                  alt={guide.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', {
                      guideId: guide.id,
                      guideName: guide.name,
                      imageSrc: guide.image,
                      error: e.target.src
                    });
                    handleImageError(e, 'GUIDE');
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', {
                      guideId: guide.id,
                      guideName: guide.name,
                      imageSrc: guide.image
                    });
                  }}
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-primary-600">
                  {guide.rating} ★
                </div>
              </div>
              
              <div className="p-6">
                {/* Basic Information Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">Basic Information</h4>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {guide.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {guide.verified && (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      )}
                      {guide.isAvailable ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Available</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Unavailable</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {guide.location}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-secondary-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        {guide.rating} ({guide.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {guide.tours} tours
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {guide.bio}
                  </p>
                </div>

                {/* Professional Details Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">Professional Details</h4>
                  
                  {/* Pricing Information */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Hourly Rate:</span>
                      </div>
                      <span className="font-semibold text-primary-600">${guide.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Daily Rate:</span>
                      </div>
                      <span className="font-semibold text-primary-600">${guide.dailyRate}/day</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Languages:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guide.languages.map((language, index) => {
                        const langName = typeof language === 'string' ? language : language.language || 'Unknown Language';
                        const proficiency = typeof language === 'object' && language.proficiencyLevel ? language.proficiencyLevel : '';
                        return (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {langName}
                            {proficiency && (
                              <span className="ml-1 text-xs text-gray-500">({proficiency})</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Specialties:</div>
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, index) => {
                        const specName = typeof specialty === 'string' ? specialty : specialty.specialty || 'Unknown Specialty';
                        const yearsExp = typeof specialty === 'object' && specialty.yearsExperience ? specialty.yearsExperience : '';
                        return (
                          <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                            {specName}
                            {yearsExp && (
                              <span className="ml-1 text-xs text-primary-500">({yearsExp}y)</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Contact Information:</div>
                    <div className="text-xs text-gray-700">
                      <div className="flex items-center mb-1">
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{guide.userEmail || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Response Time:</span>
                        <span className="ml-2">{guide.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Instant Booking */}
                <div className="flex items-center justify-center mb-4 text-sm">
                  <div className="flex items-center text-blue-600">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="font-medium">Instant Booking Available</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    to={`/guide/${guide.id}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Profile
                  </Link>
                  <button 
                    className={`flex-1 ${guide.isAvailable ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'}`}
                    disabled={!guide.isAvailable}
                    title={guide.isAvailable ? 'Book this guide' : 'Guide is currently unavailable'}
                  >
                    {guide.isAvailable ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No guides found matching your criteria.</p>
            <button 
              onClick={clearFilters}
              className="btn-outline mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Showing {guides.length} of {totalElements} guides
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Page size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h3>
            <p className="text-xs text-gray-600">Total guides loaded: {guides.length}</p>
            <p className="text-xs text-gray-600">Current page: {currentPage + 1} of {totalPages}</p>
            <p className="text-xs text-gray-600">API endpoint: {buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.VERIFIED_PAGINATED, { page: currentPage, size: pageSize })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guides;

