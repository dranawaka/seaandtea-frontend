import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, ArrowLeft, Save, MapPin, Clock, Users, DollarSign, Star } from 'lucide-react';
import { buildApiUrl, API_CONFIG, logApiCall, getTourById } from '../config/api';
import { useAuth } from '../context/AuthContext';

const CreateTour = () => {
  const navigate = useNavigate();
  const { id: tourId } = useParams();
  const isEditMode = Boolean(tourId);
  const { user, token, isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTour, setLoadingTour] = useState(isEditMode);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [tourForm, setTourForm] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    maxGroupSize: '',
    price: '',
    includes: [],
    excludes: [],
    highlights: [],
    meetingPoint: '',
    cancellationPolicy: ''
  });
  
  const [errors, setErrors] = useState({});

  // Load tour when editing
  useEffect(() => {
    if (!isEditMode || !tourId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingTour(true);
        const tour = await getTourById(tourId);
        if (cancelled) return;
        setTourForm({
          title: tour.title || '',
          description: tour.description || '',
          category: tour.category || '',
          duration: (tour.durationHours != null ? tour.durationHours : tour.duration)?.toString() || '',
          maxGroupSize: (tour.maxGroupSize != null ? tour.maxGroupSize : tour.maxGroupSize)?.toString() || '',
          price: (tour.pricePerPerson != null ? tour.pricePerPerson : tour.price)?.toString() || '',
          includes: tour.includedItems || tour.includes || [],
          excludes: tour.excludedItems || tour.excludes || [],
          highlights: tour.highlights || [],
          meetingPoint: tour.meetingPoint || '',
          cancellationPolicy: tour.cancellationPolicy || ''
        });
      } catch (err) {
        if (!cancelled) setMessage({ type: 'error', text: err.message || 'Failed to load tour' });
      } finally {
        if (!cancelled) setLoadingTour(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isEditMode, tourId]);

  // Redirect if not authenticated; allow GUIDE or ADMIN (ADMIN only in edit mode)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isEditMode && user?.role !== 'GUIDE') {
      navigate('/');
      return;
    }
    if (isEditMode && user?.role !== 'GUIDE' && user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTourForm(prev => ({
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

  const handleArrayInputChange = (field, value, action = 'add') => {
    if (action === 'add' && value.trim()) {
      setTourForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    } else if (action === 'remove') {
      setTourForm(prev => ({
        ...prev,
        [field]: prev[field].filter((_, index) => index !== value)
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!tourForm.title.trim()) {
          newErrors.title = 'Tour title is required';
        }
        if (!tourForm.description.trim()) {
          newErrors.description = 'Tour description is required';
        } else if (tourForm.description.length < 50) {
          newErrors.description = 'Description must be at least 50 characters';
        }
        if (!tourForm.category) {
          newErrors.category = 'Category is required';
        }
        break;
      
      case 2:
        if (!tourForm.duration.trim()) {
          newErrors.duration = 'Duration is required';
        }
        if (!tourForm.maxGroupSize) {
          newErrors.maxGroupSize = 'Maximum group size is required';
        } else if (isNaN(tourForm.maxGroupSize) || parseInt(tourForm.maxGroupSize) <= 0) {
          newErrors.maxGroupSize = 'Group size must be a positive number';
        }
        if (!tourForm.price) {
          newErrors.price = 'Price is required';
        } else if (isNaN(tourForm.price) || parseFloat(tourForm.price) <= 0) {
          newErrors.price = 'Price must be a positive number';
        }
        break;
      
      case 3:
        if (!tourForm.meetingPoint.trim()) {
          newErrors.meetingPoint = 'Meeting point is required';
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const tourData = {
      title: tourForm.title,
      description: tourForm.description,
      category: tourForm.category,
      durationHours: parseInt(tourForm.duration, 10) || 0,
      maxGroupSize: parseInt(tourForm.maxGroupSize, 10) || 0,
      pricePerPerson: parseFloat(tourForm.price) || 0,
      instantBooking: false,
      securePayment: true,
      languages: ['English'],
      highlights: tourForm.highlights,
      includedItems: tourForm.includes,
      excludedItems: tourForm.excludes,
      meetingPoint: tourForm.meetingPoint,
      cancellationPolicy: tourForm.cancellationPolicy,
      imageUrls: [],
      primaryImageIndex: 0
    };

    try {
      const isUpdate = isEditMode && tourId;
      const url = isUpdate
        ? buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.UPDATE, { id: tourId })
        : buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.CREATE);
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tourData)
      });

      logApiCall(method, url, tourData, response);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isUpdate ? 'Failed to update tour' : 'Failed to create tour'));
      }

      setMessage({
        type: 'success',
        text: isUpdate ? 'Tour updated successfully! Redirecting...' : 'Tour created successfully! Redirecting to your tours...'
      });

      const redirectTo = user?.role === 'ADMIN' ? '/admin' : '/guide-tours';
      setTimeout(() => navigate(redirectTo), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || (isEditMode ? 'Failed to update tour' : 'Failed to create tour') });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Tour title, description, and category' },
    { number: 2, title: 'Details & Pricing', description: 'Duration, group size, and price' },
    { number: 3, title: 'Logistics', description: 'Meeting point and cancellation policy' },
    { number: 4, title: 'Additional Info', description: 'What\'s included, excluded, and highlights' }
  ];

  const canAccess = user && (user.role === 'GUIDE' || (isEditMode && user.role === 'ADMIN'));
  if (!user || !canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loadingTour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/guide-tours')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isEditMode ? 'Back to Admin' : 'Back to Tours'}
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Tour' : 'Create New Tour'}</h1>
                <p className="mt-2 text-gray-600">{isEditMode ? 'Update tour details' : 'Share your expertise with travelers'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
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

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tour Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={tourForm.title}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Sunset Beach Adventure"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category *</label>
                      <select
                        name="category"
                        value={tourForm.category}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        <option value="TEA_TOURS">Tea Tours</option>
                        <option value="BEACH_TOURS">Beach Tours</option>
                        <option value="CULTURAL_TOURS">Cultural Tours</option>
                        <option value="ADVENTURE_TOURS">Adventure Tours</option>
                        <option value="FOOD_TOURS">Food Tours</option>
                        <option value="NATURE_TOURS">Nature Tours</option>
                        <option value="HISTORICAL_TOURS">Historical Tours</option>
                        <option value="WILDLIFE_TOURS">Wildlife Tours</option>
                        <option value="WATER_SPORTS">Water Sports</option>
                        <option value="HIKING_TOURS">Hiking Tours</option>
                        <option value="PHOTOGRAPHY_TOURS">Photography Tours</option>
                        <option value="WELLNESS_TOURS">Wellness Tours</option>
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description *</label>
                      <textarea
                        name="description"
                        rows={6}
                        value={tourForm.description}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Describe your tour experience, what travelers will see and do, and why they should choose your tour..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {tourForm.description.length}/1000 characters (minimum 50)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details & Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Details & Pricing</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div>
                       <label className="block text-sm font-medium text-gray-700">Duration (Hours) *</label>
                       <input
                         type="number"
                         name="duration"
                         value={tourForm.duration}
                         onChange={handleInputChange}
                         min="1"
                         className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                           errors.duration ? 'border-red-500' : 'border-gray-300'
                         }`}
                         placeholder="e.g., 4"
                       />
                       {errors.duration && (
                         <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                       )}
                     </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration *</label>
                      <input
                        type="text"
                        name="duration"
                        value={tourForm.duration}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.duration ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 4 hours, 1 day"
                      />
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Group Size *</label>
                      <input
                        type="number"
                        name="maxGroupSize"
                        value={tourForm.maxGroupSize}
                        onChange={handleInputChange}
                        min="1"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.maxGroupSize ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="10"
                      />
                      {errors.maxGroupSize && (
                        <p className="mt-1 text-sm text-red-600">{errors.maxGroupSize}</p>
                      )}
                    </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700">Price Per Person (USD) *</label>
                       <input
                         type="number"
                         name="price"
                         value={tourForm.price}
                         onChange={handleInputChange}
                         min="0"
                         step="0.01"
                         className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                           errors.price ? 'border-red-500' : 'border-gray-300'
                         }`}
                         placeholder="50.00"
                       />
                       {errors.price && (
                         <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                       )}
                     </div>

                    
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Logistics */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Logistics</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Meeting Point *</label>
                      <input
                        type="text"
                        name="meetingPoint"
                        value={tourForm.meetingPoint}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.meetingPoint ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Hotel lobby, Central Station, Specific landmark"
                      />
                      {errors.meetingPoint && (
                        <p className="mt-1 text-sm text-red-600">{errors.meetingPoint}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cancellation Policy</label>
                      <textarea
                        name="cancellationPolicy"
                        rows={4}
                        value={tourForm.cancellationPolicy}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Free cancellation up to 24 hours before the tour. No refunds for cancellations within 24 hours."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                  
                  <div className="space-y-6">
                    <ArrayField
                      label="What's Included"
                      field="includes"
                      values={tourForm.includes}
                      onAdd={(value) => handleArrayInputChange('includes', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('includes', index, 'remove')}
                      placeholder="e.g., Professional guide, transportation, lunch"
                    />

                    <ArrayField
                      label="What's Not Included"
                      field="excludes"
                      values={tourForm.excludes}
                      onAdd={(value) => handleArrayInputChange('excludes', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('excludes', index, 'remove')}
                      placeholder="e.g., Personal expenses, tips, insurance"
                    />

                    

                    <ArrayField
                      label="Highlights"
                      field="highlights"
                      values={tourForm.highlights}
                      onAdd={(value) => handleArrayInputChange('highlights', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('highlights', index, 'remove')}
                      placeholder="e.g., Ancient temple visit, scenic viewpoints"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Tour...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Tour
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Array Field Component
const ArrayField = ({ label, field, values, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {value}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CreateTour;
