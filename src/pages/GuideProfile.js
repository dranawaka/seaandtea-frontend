import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Clock, DollarSign, Award, Languages, Star, Save, Edit3, X, Plus, Trash2 } from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../config/api';
import { useAuth } from '../context/AuthContext';
import GuideDashboard from '../components/GuideDashboard';

const GuideProfile = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [guideData, setGuideData] = useState(null);
  const [tours, setTours] = useState([]);
  
  const [profileData, setProfileData] = useState({
    bio: '',
    hourlyRate: '',
    dailyRate: '',
    responseTimeHours: 24,
    isAvailable: true
  });
  
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  
  const [errors, setErrors] = useState({});

  // Load guide data on component mount
  useEffect(() => {
    if (user && isAuthenticated) {
      loadGuideProfile();
      loadGuideTours();
    }
  }, [user, isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadGuideProfile = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DETAIL.replace(':id', 'me')), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuideData(data);
        setProfileData({
          bio: data.bio || '',
          hourlyRate: data.hourlyRate || '',
          dailyRate: data.dailyRate || '',
          responseTimeHours: data.responseTimeHours || 24,
          isAvailable: data.isAvailable !== false
        });
        setSpecialties(data.specialties || []);
        setLanguages(data.languages || []);
        setCertifications(data.certifications || []);
      } else if (response.status === 404) {
        // Guide profile doesn't exist yet
        setGuideData(null);
      }
    } catch (error) {
      console.error('Error loading guide profile:', error);
    }
  };

  const loadGuideTours = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.LIST), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter tours for the current guide
        const guideTours = data.content ? data.content.filter(tour => tour.guideId === user.id) : [];
        setTours(guideTours);
      }
    } catch (error) {
      console.error('Error loading guide tours:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties(prev => [...prev, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setSpecialties(prev => prev.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages(prev => [...prev, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (index) => {
    setLanguages(prev => prev.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications(prev => [...prev, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (profileData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!profileData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (isNaN(profileData.hourlyRate) || parseFloat(profileData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be a positive number';
    }

    if (specialties.length === 0) {
      newErrors.specialties = 'At least one specialty is required';
    }

    if (languages.length === 0) {
      newErrors.languages = 'At least one language is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = guideData 
        ? API_CONFIG.ENDPOINTS.GUIDES.UPDATE.replace(':id', guideData.id)
        : API_CONFIG.ENDPOINTS.GUIDES.CREATE;
      
      const method = guideData ? 'PUT' : 'POST';

      const response = await fetch(buildApiUrl(endpoint), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: profileData.bio,
          specialties: specialties,
          languages: languages,
          certifications: certifications,
          hourlyRate: parseFloat(profileData.hourlyRate),
          dailyRate: profileData.dailyRate ? parseFloat(profileData.dailyRate) : null,
          responseTimeHours: parseInt(profileData.responseTimeHours),
          isAvailable: profileData.isAvailable
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update guide profile');
      }

      setMessage({ type: 'success', text: guideData ? 'Profile updated successfully!' : 'Guide profile created successfully!' });
      setIsEditing(false);
      
      // Reload guide data
      await loadGuideProfile();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update guide profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    // Reset to original guide data
    if (guideData) {
      setProfileData({
        bio: guideData.bio || '',
        hourlyRate: guideData.hourlyRate || '',
        dailyRate: guideData.dailyRate || '',
        responseTimeHours: guideData.responseTimeHours || 24,
        isAvailable: guideData.isAvailable !== false
      });
      setSpecialties(guideData.specialties || []);
      setLanguages(guideData.languages || []);
      setCertifications(guideData.certifications || []);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guide Profile</h1>
          <p className="mt-2 text-gray-600">Manage your professional information and tour offerings</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Professional Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {guideData ? 'Edit' : 'Create Profile'}
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-4">
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bio *</label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.bio ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Tell travelers about your experience, expertise, and what makes you a great guide..."
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {profileData.bio.length}/500 characters (minimum 50)
                      </p>
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hourly Rate (USD) *</label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="hourlyRate"
                            value={profileData.hourlyRate}
                            onChange={handleProfileChange}
                            min="0"
                            step="0.01"
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                              errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="50.00"
                          />
                        </div>
                        {errors.hourlyRate && (
                          <p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Rate (USD)</label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="dailyRate"
                            value={profileData.dailyRate}
                            onChange={handleProfileChange}
                            min="0"
                            step="0.01"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="400.00"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Optional - for full-day tours</p>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Response Time (hours)</label>
                      <select
                        name="responseTimeHours"
                        value={profileData.responseTimeHours}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={8}>8 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>24 hours</option>
                        <option value={48}>48 hours</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">How quickly you typically respond to booking requests</p>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center">
                      <input
                        id="isAvailable"
                        name="isAvailable"
                        type="checkbox"
                        checked={profileData.isAvailable}
                        onChange={handleProfileChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                        I am currently available for new bookings
                      </label>
                    </div>

                    {/* Specialties */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialties *</label>
                      <div className="mt-1 flex space-x-2">
                        <input
                          type="text"
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., Hiking, Photography, History"
                        />
                        <button
                          type="button"
                          onClick={addSpecialty}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.specialties && (
                        <p className="mt-1 text-sm text-red-600">{errors.specialties}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                          >
                            {specialty}
                            <button
                              type="button"
                              onClick={() => removeSpecialty(index)}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Languages *</label>
                      <div className="mt-1 flex space-x-2">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., English, Spanish, French"
                        />
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.languages && (
                        <p className="mt-1 text-sm text-red-600">{errors.languages}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {languages.map((language, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {language}
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certifications & Training</label>
                      <div className="mt-1 flex space-x-2">
                        <input
                          type="text"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., Wilderness First Aid, CPR, Tour Guide License"
                        />
                        <button
                          type="button"
                          onClick={addCertification}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {certifications.map((certification, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          >
                            {certification}
                            <button
                              type="button"
                              onClick={() => removeCertification(index)}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <X className="h-4 w-4 mr-2 inline" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {guideData ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {guideData ? 'Save Changes' : 'Create Profile'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {guideData ? (
                      <>
                        {/* Bio */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Bio</h3>
                          <p className="text-gray-700">{guideData.bio || 'No bio provided'}</p>
                        </div>

                        {/* Rates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                              <p className="text-lg font-semibold text-gray-900">${guideData.hourlyRate}/hour</p>
                            </div>
                          </div>
                          {guideData.dailyRate && (
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Daily Rate</p>
                                <p className="text-lg font-semibold text-gray-900">${guideData.dailyRate}/day</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Specialties */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Specialties</h3>
                          <div className="flex flex-wrap gap-2">
                            {guideData.specialties?.map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Languages */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Languages</h3>
                          <div className="flex flex-wrap gap-2">
                            {guideData.languages?.map((language, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Certifications */}
                        {guideData.certifications?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Certifications</h3>
                            <div className="flex flex-wrap gap-2">
                              {guideData.certifications.map((certification, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                >
                                  <Award className="h-4 w-4 mr-1 inline" />
                                  {certification}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${guideData.isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className="text-sm text-gray-600">
                            {guideData.isAvailable ? 'Available for new bookings' : 'Currently unavailable'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No guide profile</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your guide profile to start receiving tour bookings.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Stats */}
            {guideData && (
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Tours</span>
                    <span className="text-sm text-gray-900">{guideData.totalTours || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Average Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {guideData.averageRating ? guideData.averageRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Reviews</span>
                    <span className="text-sm text-gray-900">{guideData.totalReviews || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Response Time</span>
                    <span className="text-sm text-gray-900">{guideData.responseTimeHours || 24}h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-sm text-gray-900 capitalize">{user.role || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-sm text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </p>
                </div>
                {guideData && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Verification</p>
                    <p className="text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guideData.verificationStatus === 'VERIFIED' 
                          ? 'bg-green-100 text-green-800'
                          : guideData.verificationStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {guideData.verificationStatus || 'PENDING'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;

