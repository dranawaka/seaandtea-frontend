import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Star, Users, Globe, Clock, Shield, CheckCircle, User, Mail, Phone, Calendar, Award } from 'lucide-react';
import { getPublicGuideProfile } from '../config/api';

const GuideProfileViewer = () => {
  const { id } = useParams();
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGuideProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🚀 Fetching guide profile for ID: ${id}`);
      const data = await getPublicGuideProfile(id);
      
      console.log('📄 Guide profile data received:', data);
      console.log('📊 Available fields:', Object.keys(data));
      
      // Log debug info for fields we're looking for
      console.log('🔍 Field debugging:', {
        firstName: data.firstName,
        userFirstName: data.userFirstName,
        lastName: data.lastName,
        userLastName: data.userLastName,
        email: data.email,
        userEmail: data.userEmail,
        phone: data.phone,
        userPhone: data.userPhone,
        location: data.location,
        profilePicture: data.profileImageUrl || data.profilePictureUrl,
        hasUserObject: !!data.user,
        userObject: data.user
      });
      
      setGuideData(data);
    } catch (error) {
      console.error('❌ Error loading guide profile:', error);
      setError(error.message || 'Failed to load guide profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadGuideProfile();
    }
  }, [id, loadGuideProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guide profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={loadGuideProfile}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!guideData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No guide profile found</p>
        </div>
      </div>
    );
  }

  // Normalize data to handle different API response formats
  const profilePicture = guideData.profileImageUrl || 
                        guideData.profilePictureUrl || 
                        guideData.userProfilePictureUrl ||
                        guideData.user?.profilePictureUrl || 
                        guideData.user?.profileImageUrl ||
                        guideData.imageUrl || 
                        guideData.image ||
                        null;
  
  const firstName = guideData.firstName || guideData.userFirstName || '';
  const lastName = guideData.lastName || guideData.userLastName || '';
  const email = guideData.email || guideData.userEmail || null;
  const phone = guideData.phone || guideData.userPhone || null;
  const location = guideData.location || guideData.userLocation || null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={`${firstName} ${lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                  onError={(e) => {
                    // Fallback to initial on error
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              {!profilePicture && (
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {firstName ? firstName.charAt(0) : 'G'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {firstName} {lastName}
                </h1>
                {guideData.verificationStatus === 'VERIFIED' && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Verified
                  </div>
                )}
              </div>

              {guideData.bio && (
                <p className="text-gray-600 text-lg mb-4">{guideData.bio}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {guideData.hourlyRate && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">${guideData.hourlyRate}</p>
                    <p className="text-sm text-gray-500">per hour</p>
                  </div>
                )}
                {guideData.dailyRate && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">${guideData.dailyRate}</p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                )}
                {guideData.responseTimeHours && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{guideData.responseTimeHours}h</p>
                    <p className="text-sm text-gray-500">response time</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {guideData.isAvailable ? 'Available' : 'Busy'}
                  </p>
                  <p className="text-sm text-gray-500">status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact & Location */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Contact & Location
            </h2>
            
            <div className="space-y-3">
              {email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{email}</span>
                </div>
              )}
              
              {phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{phone}</span>
                </div>
              )}
              
              {location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{location}</span>
                </div>
              )}
              
              {guideData.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {new Date(guideData.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Specialties & Languages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-600" />
              Expertise
            </h2>
            
            {guideData.specialties && guideData.specialties.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {guideData.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                    >
                      {typeof specialty === 'string' ? specialty : specialty.specialty || specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {guideData.languages && guideData.languages.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {guideData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {typeof language === 'string' ? language : language.language || language}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Endpoint Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">API Endpoint Used</h3>
          <code className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
            GET /api/v1/guides/{id}
          </code>
          <p className="text-sm text-blue-700 mt-2">
            This profile was fetched using the public guide profile endpoint.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideProfileViewer;
