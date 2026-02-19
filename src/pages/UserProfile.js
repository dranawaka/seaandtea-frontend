import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Star, Users, Clock, DollarSign, Lock, Award, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { buildApiUrl, API_CONFIG, logApiCall } from '../config/api';
import { useAuth } from '../context/AuthContext';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, token, login, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Guide profile state
  const [guideData, setGuideData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    location: '',
    profilePictureUrl: ''
  });
  
  // Guide profile form data
  const [guideFormData, setGuideFormData] = useState({
    bio: '',
    hourlyRate: '',
    dailyRate: '',
    responseTimeHours: 24,
    isAvailable: true,
    specialties: [],
    languages: []
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [guideErrors, setGuideErrors] = useState({});

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || '',
        location: user.location || '',
        profilePictureUrl: user.profilePictureUrl || ''
      });
      
      // Load guide profile if user is a guide
      if (user.role === 'GUIDE') {
        loadGuideProfile();
      }
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load guide profile from backend
  const loadGuideProfile = async () => {
    try {
      setIsLoading(true);
      
      // First, check if the user has a guide profile
      const existsUrl = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.PROFILE_EXISTS);
      
      const existsResponse = await fetch(existsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (existsResponse.ok) {
        const existsData = await existsResponse.json();
        
        // Check if profile exists - handle different response structures
        const profileExists = existsData.exists === true || existsData.guideId || existsData.id;
        const guideId = existsData.guideId || existsData.id;
        
        if (profileExists && guideId) {
          // Profile exists, load it
          const profileUrl = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DETAIL.replace(':id', guideId));
          
          const profileResponse = await fetch(profileUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.ok) {
            const data = await profileResponse.json();
            setGuideData(data);
            setVerificationStatus(data.verificationStatus || 'PENDING');
            
            // Map backend data to frontend state
            setGuideFormData({
              bio: data.bio || '',
              hourlyRate: data.hourlyRate || data.rate?.hourly || '',
              dailyRate: data.dailyRate || data.rate?.daily || '',
              responseTimeHours: data.responseTimeHours || data.responseTime || 24,
              isAvailable: data.isAvailable !== false,
              specialties: Array.isArray(data.specialties) ? data.specialties.map(s => typeof s === 'string' ? s : s.specialty || '').filter(Boolean) : [],
              languages: Array.isArray(data.languages) ? data.languages.map(l => typeof l === 'string' ? l : l.language || '').filter(Boolean) : []
            });
          }
        } else {
          // Profile doesn't exist, set default values
          setGuideFormData({
            bio: '',
            hourlyRate: '',
            dailyRate: '',
            responseTimeHours: 24,
            isAvailable: true,
            specialties: ['Cultural Tours'],
            languages: ['English']
          });
        }
      }
    } catch (error) {
      console.error('Error loading guide profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Guide form handling
  const handleGuideFormChange = (field, value) => {
    setGuideFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (guideErrors[field]) {
      setGuideErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle array field changes (specialties, languages)
  const handleArrayChange = (field, index, value) => {
    setGuideFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  // Add new item to array field
  const addArrayItem = (field) => {
    setGuideFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    setGuideFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!profileData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Must be at least 18 years old';
      }
    }

    if (!profileData.nationality) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!profileData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate guide profile data
  const validateGuideProfile = () => {
    const newErrors = {};

    if (!guideFormData.bio?.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (guideFormData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!guideFormData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (parseFloat(guideFormData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be greater than 0';
    }

    if (guideFormData.specialties.length === 0) {
      newErrors.specialties = 'At least one specialty is required';
    } else if (guideFormData.specialties.some(s => !s.trim())) {
      newErrors.specialties = 'All specialties must have values';
    }

    if (guideFormData.languages.length === 0) {
      newErrors.languages = 'At least one language is required';
    } else if (guideFormData.languages.some(l => !l.trim())) {
      newErrors.languages = 'All languages must have values';
    }

    setGuideErrors(newErrors);
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
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE);
      const profileUpdateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        nationality: profileData.nationality,
        location: profileData.location
      };
      
      console.log(`🚀 Updating user profile: ${url}`, profileUpdateData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileUpdateData)
      });

      // Log the API call
      logApiCall('PUT', url, profileUpdateData, response);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update the user context with new data
      const updatedUser = { ...user, ...profileData };
      login(updatedUser, token);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit guide profile
  const handleGuideProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateGuideProfile()) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });

      // Prepare request body - aligned with backend API
      const requestBody = {
        bio: guideFormData.bio.trim(),
        hourlyRate: parseFloat(guideFormData.hourlyRate),
        dailyRate: guideFormData.dailyRate ? parseFloat(guideFormData.dailyRate) : null,
        responseTimeHours: parseInt(guideFormData.responseTimeHours),
        isAvailable: guideFormData.isAvailable,
        // Map specialties to the expected format
        specialties: guideFormData.specialties.filter(s => s.trim()).map(specialty => ({
          specialty: specialty.trim(),
          yearsExperience: 1, // Default value
          certificationUrl: null
        })),
        // Map languages to the expected format
        languages: guideFormData.languages.filter(l => l.trim()).map(language => ({
          language: language.trim(),
          proficiencyLevel: 'FLUENT' // Default value
        }))
      };

      let url, method;
      if (guideData && guideData.id) {
        // Update existing profile
        url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.UPDATE.replace(':id', guideData.id));
        method = 'PUT';
      } else {
        // Create new profile
        url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.CREATE);
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save guide profile');
      }

      if (guideData) {
        setMessage({ type: 'success', text: 'Guide profile updated successfully!' });
      } else {
        setMessage({ type: 'success', text: 'Guide profile created successfully! It will be reviewed for verification within 1-2 business days.' });
      }
      
      setGuideData(data);
      setVerificationStatus(data.verificationStatus || 'PENDING');
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save guide profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD);
      const passwordUpdateData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      
      console.log(`🚀 Changing password: ${url}`, { ...passwordUpdateData, newPassword: '[HIDDEN]' });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordUpdateData)
      });

      // Log the API call
      logApiCall('PUT', url, { ...passwordUpdateData, newPassword: '[HIDDEN]' }, response);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    // Reset to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || '',
        location: user.location || ''
      });
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
  };

  // Handle profile picture update
  const handleProfilePictureUpdate = (newImageUrl) => {
    setProfileData(prev => ({
      ...prev,
      profilePictureUrl: newImageUrl
    }));

    // Update the user context with new profile picture
    const updatedUser = { ...user, profilePictureUrl: newImageUrl };
    login(updatedUser, token);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
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
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-6">
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                        />
                        <p className="mt-2 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileChange}
                          className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                        <select
                          name="nationality"
                          value={profileData.nationality}
                          onChange={handleProfileChange}
                          className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.nationality ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select nationality</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="JP">Japan</option>
                          <option value="CN">China</option>
                          <option value="IN">India</option>
                          <option value="BR">Brazil</option>
                          <option value="MX">Mexico</option>
                          <option value="IT">Italy</option>
                          <option value="ES">Spain</option>
                          <option value="NL">Netherlands</option>
                          <option value="SE">Sweden</option>
                          <option value="NO">Norway</option>
                          <option value="DK">Denmark</option>
                          <option value="FI">Finland</option>
                          <option value="CH">Switzerland</option>
                          <option value="AT">Austria</option>
                          <option value="BE">Belgium</option>
                          <option value="PT">Portugal</option>
                          <option value="IE">Ireland</option>
                          <option value="NZ">New Zealand</option>
                          <option value="SG">Singapore</option>
                          <option value="HK">Hong Kong</option>
                          <option value="KR">South Korea</option>
                          <option value="TH">Thailand</option>
                          <option value="VN">Vietnam</option>
                          <option value="MY">Malaysia</option>
                          <option value="ID">Indonesia</option>
                          <option value="PH">Philippines</option>
                          <option value="LK">Sri Lanka</option>
                          <option value="BD">Bangladesh</option>
                          <option value="PK">Pakistan</option>
                          <option value="AF">Afghanistan</option>
                          <option value="IR">Iran</option>
                          <option value="IQ">Iraq</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="QA">Qatar</option>
                          <option value="KW">Kuwait</option>
                          <option value="BH">Bahrain</option>
                          <option value="OM">Oman</option>
                          <option value="JO">Jordan</option>
                          <option value="LB">Lebanon</option>
                          <option value="SY">Syria</option>
                          <option value="EG">Egypt</option>
                          <option value="MA">Morocco</option>
                          <option value="DZ">Algeria</option>
                          <option value="TN">Tunisia</option>
                          <option value="LY">Libya</option>
                          <option value="SD">Sudan</option>
                          <option value="ET">Ethiopia</option>
                          <option value="KE">Kenya</option>
                          <option value="NG">Nigeria</option>
                          <option value="ZA">South Africa</option>
                          <option value="GH">Ghana</option>
                          <option value="UG">Uganda</option>
                          <option value="TZ">Tanzania</option>
                          <option value="RW">Rwanda</option>
                          <option value="BI">Burundi</option>
                          <option value="MG">Madagascar</option>
                          <option value="MU">Mauritius</option>
                          <option value="SC">Seychelles</option>
                          <option value="MV">Maldives</option>
                          <option value="LK">Sri Lanka</option>
                          <option value="NP">Nepal</option>
                          <option value="BT">Bhutan</option>
                          <option value="MM">Myanmar</option>
                          <option value="LA">Laos</option>
                          <option value="KH">Cambodia</option>
                          <option value="MN">Mongolia</option>
                          <option value="KZ">Kazakhstan</option>
                          <option value="UZ">Uzbekistan</option>
                          <option value="KG">Kyrgyzstan</option>
                          <option value="TJ">Tajikistan</option>
                          <option value="TM">Turkmenistan</option>
                          <option value="AZ">Azerbaijan</option>
                          <option value="GE">Georgia</option>
                          <option value="AM">Armenia</option>
                          <option value="TR">Turkey</option>
                          <option value="GR">Greece</option>
                          <option value="CY">Cyprus</option>
                          <option value="MT">Malta</option>
                          <option value="HR">Croatia</option>
                          <option value="SI">Slovenia</option>
                          <option value="SK">Slovakia</option>
                          <option value="CZ">Czech Republic</option>
                          <option value="PL">Poland</option>
                          <option value="HU">Hungary</option>
                          <option value="RO">Romania</option>
                          <option value="BG">Bulgaria</option>
                          <option value="RS">Serbia</option>
                          <option value="ME">Montenegro</option>
                          <option value="BA">Bosnia and Herzegovina</option>
                          <option value="MK">North Macedonia</option>
                          <option value="AL">Albania</option>
                          <option value="XK">Kosovo</option>
                          <option value="MD">Moldova</option>
                          <option value="UA">Ukraine</option>
                          <option value="BY">Belarus</option>
                          <option value="LT">Lithuania</option>
                          <option value="LV">Latvia</option>
                          <option value="EE">Estonia</option>
                          <option value="RU">Russia</option>
                          <option value="IS">Iceland</option>
                          <option value="FO">Faroe Islands</option>
                          <option value="GL">Greenland</option>
                          <option value="CA">Canada</option>
                          <option value="US">United States</option>
                          <option value="MX">Mexico</option>
                          <option value="GT">Guatemala</option>
                          <option value="BZ">Belize</option>
                          <option value="SV">El Salvador</option>
                          <option value="HN">Honduras</option>
                          <option value="NI">Nicaragua</option>
                          <option value="CR">Costa Rica</option>
                          <option value="PA">Panama</option>
                          <option value="CO">Colombia</option>
                          <option value="VE">Venezuela</option>
                          <option value="GY">Guyana</option>
                          <option value="SR">Suriname</option>
                          <option value="GF">French Guiana</option>
                          <option value="BR">Brazil</option>
                          <option value="EC">Ecuador</option>
                          <option value="PE">Peru</option>
                          <option value="BO">Bolivia</option>
                          <option value="PY">Paraguay</option>
                          <option value="UY">Uruguay</option>
                          <option value="AR">Argentina</option>
                          <option value="CL">Chile</option>
                          <option value="FK">Falkland Islands</option>
                          <option value="AU">Australia</option>
                          <option value="NZ">New Zealand</option>
                          <option value="FJ">Fiji</option>
                          <option value="PG">Papua New Guinea</option>
                          <option value="SB">Solomon Islands</option>
                          <option value="VU">Vanuatu</option>
                          <option value="NC">New Caledonia</option>
                          <option value="PF">French Polynesia</option>
                          <option value="TO">Tonga</option>
                          <option value="WS">Samoa</option>
                          <option value="KI">Kiribati</option>
                          <option value="TV">Tuvalu</option>
                          <option value="NR">Nauru</option>
                          <option value="PW">Palau</option>
                          <option value="MH">Marshall Islands</option>
                          <option value="FM">Micronesia</option>
                          <option value="GU">Guam</option>
                          <option value="MP">Northern Mariana Islands</option>
                          <option value="AS">American Samoa</option>
                          <option value="CK">Cook Islands</option>
                          <option value="NU">Niue</option>
                          <option value="TK">Tokelau</option>
                          <option value="WF">Wallis and Futuna</option>
                          <option value="TK">Tokelau</option>
                          <option value="NU">Niue</option>
                          <option value="CK">Cook Islands</option>
                          <option value="PF">French Polynesia</option>
                          <option value="NC">New Caledonia</option>
                          <option value="VU">Vanuatu</option>
                          <option value="SB">Solomon Islands</option>
                          <option value="PG">Papua New Guinea</option>
                          <option value="FJ">Fiji</option>
                          <option value="NZ">New Zealand</option>
                          <option value="AU">Australia</option>
                          <option value="FK">Falkland Islands</option>
                          <option value="CL">Chile</option>
                          <option value="AR">Argentina</option>
                          <option value="UY">Uruguay</option>
                          <option value="PY">Paraguay</option>
                          <option value="BO">Bolivia</option>
                          <option value="PE">Peru</option>
                          <option value="EC">Ecuador</option>
                          <option value="BR">Brazil</option>
                          <option value="GF">French Guiana</option>
                          <option value="SR">Suriname</option>
                          <option value="GY">Guyana</option>
                          <option value="VE">Venezuela</option>
                          <option value="CO">Colombia</option>
                          <option value="PA">Panama</option>
                          <option value="CR">Costa Rica</option>
                          <option value="NI">Nicaragua</option>
                          <option value="HN">Honduras</option>
                          <option value="SV">El Salvador</option>
                          <option value="BZ">Belize</option>
                          <option value="GT">Guatemala</option>
                          <option value="MX">Mexico</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GL">Greenland</option>
                          <option value="FO">Faroe Islands</option>
                          <option value="IS">Iceland</option>
                          <option value="RU">Russia</option>
                          <option value="EE">Estonia</option>
                          <option value="LV">Latvia</option>
                          <option value="LT">Lithuania</option>
                          <option value="BY">Belarus</option>
                          <option value="UA">Ukraine</option>
                          <option value="MD">Moldova</option>
                          <option value="XK">Kosovo</option>
                          <option value="AL">Albania</option>
                          <option value="MK">North Macedonia</option>
                          <option value="BA">Bosnia and Herzegovina</option>
                          <option value="ME">Montenegro</option>
                          <option value="RS">Serbia</option>
                          <option value="BG">Bulgaria</option>
                          <option value="RO">Romania</option>
                          <option value="HU">Hungary</option>
                          <option value="PL">Poland</option>
                          <option value="CZ">Czech Republic</option>
                          <option value="SK">Slovakia</option>
                          <option value="SI">Slovenia</option>
                          <option value="HR">Croatia</option>
                          <option value="MT">Malta</option>
                          <option value="CY">Cyprus</option>
                          <option value="GR">Greece</option>
                          <option value="TR">Turkey</option>
                          <option value="AM">Armenia</option>
                          <option value="GE">Georgia</option>
                          <option value="AZ">Azerbaijan</option>
                          <option value="TM">Turkmenistan</option>
                          <option value="TJ">Tajikistan</option>
                          <option value="KG">Kyrgyzstan</option>
                          <option value="UZ">Uzbekistan</option>
                          <option value="KZ">Kazakhstan</option>
                          <option value="MN">Mongolia</option>
                          <option value="KH">Cambodia</option>
                          <option value="LA">Laos</option>
                          <option value="MM">Myanmar</option>
                          <option value="BT">Bhutan</option>
                          <option value="NP">Nepal</option>
                          <option value="LK">Sri Lanka</option>
                          <option value="MV">Maldives</option>
                          <option value="SC">Seychelles</option>
                          <option value="MU">Mauritius</option>
                          <option value="MG">Madagascar</option>
                          <option value="BI">Burundi</option>
                          <option value="RW">Rwanda</option>
                          <option value="TZ">Tanzania</option>
                          <option value="UG">Uganda</option>
                          <option value="NG">Nigeria</option>
                          <option value="KE">Kenya</option>
                          <option value="ET">Ethiopia</option>
                          <option value="SD">Sudan</option>
                          <option value="LY">Libya</option>
                          <option value="TN">Tunisia</option>
                          <option value="DZ">Algeria</option>
                          <option value="MA">Morocco</option>
                          <option value="EG">Egypt</option>
                          <option value="SY">Syria</option>
                          <option value="LB">Lebanon</option>
                          <option value="JO">Jordan</option>
                          <option value="OM">Oman</option>
                          <option value="BH">Bahrain</option>
                          <option value="KW">Kuwait</option>
                          <option value="QA">Qatar</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="IQ">Iraq</option>
                          <option value="IR">Iran</option>
                          <option value="AF">Afghanistan</option>
                          <option value="PK">Pakistan</option>
                          <option value="BD">Bangladesh</option>
                          <option value="LK">Sri Lanka</option>
                          <option value="ID">Indonesia</option>
                          <option value="MY">Malaysia</option>
                          <option value="VN">Vietnam</option>
                          <option value="TH">Thailand</option>
                          <option value="HK">Hong Kong</option>
                          <option value="SG">Singapore</option>
                          <option value="KR">South Korea</option>
                          <option value="CN">China</option>
                          <option value="JP">Japan</option>
                          <option value="AT">Austria</option>
                          <option value="CH">Switzerland</option>
                          <option value="FI">Finland</option>
                          <option value="DK">Denmark</option>
                          <option value="NO">Norway</option>
                          <option value="SE">Sweden</option>
                          <option value="BE">Belgium</option>
                          <option value="IE">Ireland</option>
                          <option value="PT">Portugal</option>
                          <option value="ES">Spain</option>
                          <option value="IT">Italy</option>
                          <option value="NL">Netherlands</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                          <option value="GB">United Kingdom</option>
                        </select>
                        {errors.nationality && (
                          <p className="mt-2 text-sm text-red-600">{errors.nationality}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City, Country"
                        />
                        {errors.location && (
                          <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <X className="h-4 w-4 mr-2 inline" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">First Name</p>
                        <p className="text-sm text-gray-900">{profileData.firstName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Name</p>
                        <p className="text-sm text-gray-900">{profileData.lastName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{profileData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{profileData.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="text-sm text-gray-900">
                          {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nationality</p>
                        <p className="text-sm text-gray-900">{profileData.nationality}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">{profileData.location || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guide Profile Section - Only for GUIDE users */}
              {user && user.role === 'GUIDE' && (
                <div className="border-t border-gray-200">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Guide Profile</h3>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          {guideData ? 'Edit Guide Profile' : 'Create Guide Profile'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    {isEditing ? (
                      <form onSubmit={handleGuideProfileSubmit} className="space-y-6">
                        {/* Bio */}
                        <div className="pb-1">
                          <label className="block text-sm font-medium text-gray-700 mb-3">Bio *</label>
                          <textarea
                            name="bio"
                            rows={5}
                            value={guideFormData.bio}
                            onChange={(e) => handleGuideFormChange('bio', e.target.value)}
                            className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 leading-relaxed ${
                              guideErrors.bio ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Tell travelers about your experience, expertise, and what makes you a great guide..."
                          />
                          {guideErrors.bio && <p className="mt-2 text-sm text-red-600">{guideErrors.bio}</p>}
                          <p className="mt-2 text-xs text-gray-500">Minimum 50 characters. Describe your guiding style and experience.</p>
                          <div className="mt-4" aria-hidden />
                        </div>

                        {/* Rates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (USD) *</label>
                            <input
                              type="number"
                              name="hourlyRate"
                              value={guideFormData.hourlyRate}
                              onChange={(e) => handleGuideFormChange('hourlyRate', e.target.value)}
                              step="0.01"
                              min="0"
                              className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                                guideErrors.hourlyRate ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="25.00"
                            />
                            {guideErrors.hourlyRate && <p className="mt-2 text-sm text-red-600">{guideErrors.hourlyRate}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (USD) - Optional</label>
                            <input
                              type="number"
                              name="dailyRate"
                              value={guideFormData.dailyRate}
                              onChange={(e) => handleGuideFormChange('dailyRate', e.target.value)}
                              step="0.01"
                              min="0"
                              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              placeholder="200.00"
                            />
                            <p className="mt-2 text-xs text-gray-500">Leave empty if you only offer hourly rates</p>
                          </div>
                        </div>

                        {/* Response Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Response Time (hours)</label>
                          <input
                            type="number"
                            name="responseTimeHours"
                            value={guideFormData.responseTimeHours}
                            onChange={(e) => handleGuideFormChange('responseTimeHours', e.target.value)}
                            min="1"
                            max="168"
                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          <p className="mt-2 text-xs text-gray-500">How quickly you typically respond to booking requests</p>
                        </div>

                        {/* Specialties */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Specialties *</label>
                          <div className="space-y-3">
                            {guideFormData.specialties.map((specialty, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <input
                                  type="text"
                                  value={specialty}
                                  onChange={(e) => handleArrayChange('specialties', index, e.target.value)}
                                  className={`flex-1 px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                                    guideErrors.specialties ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                  placeholder="e.g., Cultural Tours, Wildlife Safaris"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('specialties', index)}
                                  className="p-2.5 text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addArrayItem('specialties')}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Specialty
                            </button>
                          </div>
                          {guideErrors.specialties && <p className="mt-2 text-sm text-red-600">{guideErrors.specialties}</p>}
                          <p className="mt-2 text-xs text-gray-500">Add your areas of expertise and tour specialties</p>
                        </div>

                        {/* Languages */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Languages *</label>
                          <div className="space-y-3">
                            {guideFormData.languages.map((language, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <input
                                  type="text"
                                  value={language}
                                  onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                                  className={`flex-1 px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                                    guideErrors.languages ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                  placeholder="e.g., English, Sinhala, Tamil"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('languages', index)}
                                  className="p-2.5 text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addArrayItem('languages')}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Language
                            </button>
                          </div>
                          {guideErrors.languages && <p className="mt-2 text-sm text-red-600">{guideErrors.languages}</p>}
                          <p className="mt-2 text-xs text-gray-500">Languages you can guide tours in</p>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="isAvailable"
                            checked={guideFormData.isAvailable}
                            onChange={(e) => handleGuideFormChange('isAvailable', e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 block text-sm text-gray-900">
                            Available for new tour bookings
                          </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {guideData ? 'Update Guide Profile' : 'Create Guide Profile'}
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        {guideData ? (
                          <>
                            {/* Verification Status Display */}
                            <div className="p-5 bg-gray-50 border border-gray-200 rounded-md">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {verificationStatus === 'VERIFIED' ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                                  )}
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                      {verificationStatus === 'VERIFIED' ? 'Profile Verified' : 'Verification Pending'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {verificationStatus === 'VERIFIED' 
                                        ? 'Your profile is visible to travelers and you can receive bookings'
                                        : 'Your profile is under review and will be visible once verified'
                                      }
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    verificationStatus === 'VERIFIED' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-8">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-5">Basic Information</h3>
                                <div className="space-y-5">
                                  <div className="pb-2">
                                    <p className="text-sm font-medium text-gray-500 mb-3">Bio</p>
                                    <p className="text-gray-900 leading-relaxed whitespace-pre-line">{guideData.bio}</p>
                                    <div className="mt-6" aria-hidden />
                                  </div>
                                  
                                  <div className="flex items-center space-x-3">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                                      <p className="text-gray-900">${guideData.hourlyRate || guideData.rate?.hourly}/hour</p>
                                    </div>
                                  </div>
                                  
                                  {guideData.dailyRate || guideData.rate?.daily ? (
                                    <div className="flex items-center space-x-3">
                                      <DollarSign className="h-5 w-5 text-gray-400" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Daily Rate</p>
                                        <p className="text-gray-900">${guideData.dailyRate || guideData.rate?.daily}/day</p>
                                      </div>
                                    </div>
                                  ) : null}
                                  
                                  <div className="flex items-center space-x-3">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Response Time</p>
                                      <p className="text-gray-900">{guideData.responseTimeHours || guideData.responseTime} hours</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Professional Details (under Basic Information) */}
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-5">Professional Details</h3>
                                <div className="space-y-5">
                                  <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Total Tours</p>
                                      <p className="text-gray-900">{guideData.totalTours || 0}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3">
                                    <Star className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Rating</p>
                                      <p className="text-gray-900">{guideData.averageRating || 0} ({guideData.totalReviews || 0} reviews)</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Specialties */}
                            {guideData.specialties && guideData.specialties.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Specialties</h3>
                                <div className="flex flex-wrap gap-2">
                                  {guideData.specialties.map((specialty, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                      {typeof specialty === 'string' ? specialty : specialty.specialty || 'Unknown Specialty'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Languages */}
                            {guideData.languages && guideData.languages.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                  {guideData.languages.map((language, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-800"
                                    >
                                      {typeof language === 'string' ? language : language.language || 'Unknown Language'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Guide Profile Yet</h3>
                            <p className="text-gray-500 mb-4">
                              Create your guide profile to start offering tours and receiving bookings from travelers.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Picture */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
              </div>
              <div className="px-6 py-6">
                <ProfilePictureUpload
                  currentImageUrl={profileData.profilePictureUrl}
                  onImageUpdate={handleProfilePictureUpdate}
                  userId={user?.id}
                  userRole={user?.role}
                  size="large"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
              </div>
              <div className="px-6 py-6">
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.currentPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={cancelPasswordChange}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          'Update'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              </div>
              <div className="px-6 py-6 space-y-5">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;