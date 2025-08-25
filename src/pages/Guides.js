import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Globe, Filter, Search, Clock, Shield, CheckCircle, Zap } from 'lucide-react';
import { searchGuides, mockLocations, mockLanguages, mockSpecialties } from '../data/mockData';

const Guides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const allGuides = await searchGuides({});
      setGuides(allGuides);
    } catch (error) {
      console.error('Error loading guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters = {
        searchTerm,
        location: selectedLocation,
        language: selectedLanguage,
        specialty: selectedSpecialty
      };
      const filteredGuides = await searchGuides(filters);
      setGuides(filteredGuides);
    } catch (error) {
      console.error('Error searching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedLanguage('');
    setSelectedSpecialty('');
    loadGuides();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guides...</p>
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
          <div className="grid md:grid-cols-5 gap-4">
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
              {mockLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input-field"
            >
              <option value="">All Languages</option>
              {mockLanguages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="input-field"
            >
              <option value="">All Specialties</option>
              {mockSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
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

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div key={guide.id} className="card overflow-hidden">
              <div className="relative">
                <img 
                  src={guide.image} 
                  alt={guide.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-primary-600">
                  {guide.rating} ★
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {guide.name}
                  </h3>
                  {guide.verified && (
                    <div className="flex items-center text-green-600">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {guide.location}
                </div>
                
                <div className="flex items-center justify-between mb-4">
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
                    {guide.languages.map((language, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {typeof language === 'string' ? language : language.language || 'Unknown Language'}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Specialties:</div>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((specialty, index) => (
                      <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                        {typeof specialty === 'string' ? specialty : specialty.specialty || 'Unknown Specialty'}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                  {guide.bio}
                </p>
                
                {/* Response Time & Instant Booking */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span>Response: {guide.responseTime}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="font-medium">Instant Booking</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    to={`/guide/${guide.id}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Profile
                  </Link>
                  <button className="btn-primary flex-1">
                    Book Now
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
      </div>
    </div>
  );
};

export default Guides;

