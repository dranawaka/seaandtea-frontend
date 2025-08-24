import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Star, Users, Clock, DollarSign, Lock } from 'lucide-react';
import { buildApiUrl, API_CONFIG, logApiCall } from '../config/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, token, login, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || ''
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
        nationality: profileData.nationality
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
        nationality: user.nationality || ''
      });
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
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
              <div className="px-6 py-4 border-b border-gray-200">
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

              <div className="px-6 py-4">
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nationality *</label>
                        <select
                          name="nationality"
                          value={profileData.nationality}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
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
                          <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
                        )}
                      </div>
                    </div>

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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Password Change */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
              </div>
              <div className="px-6 py-4">
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password *</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password *</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={cancelPasswordChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

