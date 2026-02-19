import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { buildApiUrl, API_CONFIG, getTourById, createTour as createTourApi } from '../config/api';
import { useAuth } from '../context/AuthContext';
import ImagePicker from '../components/ImagePicker';

// Parse duration from API (number of hours or string like "4 hours", "1 day")
const parseDurationHours = (dur) => {
  if (dur == null) return '';
  if (typeof dur === 'number' && !isNaN(dur)) return String(dur);
  const s = String(dur).trim();
  const num = parseFloat(s);
  if (!isNaN(num)) return String(Math.round(num));
  const hourMatch = s.match(/(\d+)\s*(hour|hr|h)/i);
  if (hourMatch) return hourMatch[1];
  const dayMatch = s.match(/(\d+)\s*(day|d)/i);
  if (dayMatch) return String(Number(dayMatch[1]) * 24);
  return s;
};

// API category enum (exact values for POST /api/v1/tours)
const TOUR_CATEGORIES = [
  { value: 'TEA_TOURS', label: 'Tea Tours' },
  { value: 'BEACH_TOURS', label: 'Beach Tours' },
  { value: 'CULTURAL_TOURS', label: 'Cultural Tours' },
  { value: 'ADVENTURE_TOURS', label: 'Adventure Tours' },
  { value: 'FOOD_TOURS', label: 'Food Tours' },
  { value: 'WILDLIFE_TOURS', label: 'Wildlife Tours' }
];

const CreateTour = () => {
  const navigate = useNavigate();
  const { id: tourId } = useParams();
  const isEditMode = Boolean(tourId);
  const { user, token, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingTour, setLoadingTour] = useState(isEditMode);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [tourForm, setTourForm] = useState({
    title: '',
    description: '',
    category: '',
    durationHours: '',
    maxGroupSize: '10',
    price: '',
    instantBooking: false,
    securePayment: true,
    languages: [],
    includes: [],
    excludes: [],
    highlights: [],
    meetingPoint: '',
    cancellationPolicy: '',
    imageUrls: [],
    primaryImageIndex: 0
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
        const urls = (tour.images || []).map(img => img.imageUrl || img.url).filter(Boolean);
        const primaryIdx = (tour.images || []).findIndex(img => img.isPrimary);
        setTourForm({
          title: tour.title || '',
          description: tour.description || '',
          category: tour.category || '',
          durationHours: parseDurationHours(tour.durationHours ?? tour.duration),
          maxGroupSize: (tour.maxGroupSize != null ? tour.maxGroupSize : 10)?.toString() ?? '10',
          price: (tour.pricePerPerson != null ? tour.pricePerPerson : tour.price)?.toString() ?? '',
          instantBooking: Boolean(tour.instantBooking),
          securePayment: tour.securePayment !== false,
          languages: Array.isArray(tour.languages) ? tour.languages : [],
          includes: tour.includedItems || tour.includes || [],
          excludes: tour.excludedItems || tour.excludes || [],
          highlights: tour.highlights || [],
          meetingPoint: tour.meetingPoint || '',
          cancellationPolicy: tour.cancellationPolicy || '',
          imageUrls: urls,
          primaryImageIndex: primaryIdx >= 0 ? primaryIdx : 0
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

  const maxByField = { languages: 10, highlights: 20, includes: 30, excludes: 30, imageUrls: 10 };

  const handleArrayInputChange = (field, value, action = 'add') => {
    if (action === 'add' && value.trim()) {
      const max = maxByField[field] ?? 100;
      setTourForm(prev => ({
        ...prev,
        [field]: [...(prev[field] || [])].length < max ? [...prev[field], value.trim()] : prev[field]
      }));
    } else if (action === 'remove') {
      setTourForm(prev => {
        const nextList = prev[field].filter((_, index) => index !== value);
        let nextPrimary = prev.primaryImageIndex;
        if (field === 'imageUrls') {
          if (value < prev.primaryImageIndex) nextPrimary = prev.primaryImageIndex - 1;
          else if (value === prev.primaryImageIndex) nextPrimary = Math.max(0, prev.primaryImageIndex - 1);
          nextPrimary = Math.min(nextPrimary, nextList.length - 1);
          if (nextList.length === 0) nextPrimary = 0;
        }
        return { ...prev, [field]: nextList, ...(field === 'imageUrls' ? { primaryImageIndex: Math.max(0, nextPrimary) } : {}) };
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: {
        const title = tourForm.title.trim();
        if (!title) newErrors.title = 'Tour title is required';
        else if (title.length < 3) newErrors.title = 'Title must be at least 3 characters';
        else if (title.length > 200) newErrors.title = 'Title must be at most 200 characters';
        const desc = tourForm.description.trim();
        if (!desc) newErrors.description = 'Tour description is required';
        else if (desc.length < 10) newErrors.description = 'Description must be at least 10 characters';
        else if (desc.length > 2000) newErrors.description = 'Description must be at most 2000 characters';
        if (!tourForm.category) newErrors.category = 'Category is required';
        break;
      }
      case 2: {
        const hours = Number(tourForm.durationHours);
        if (tourForm.durationHours === '' || isNaN(hours)) newErrors.durationHours = 'Duration is required';
        else if (hours < 1 || hours > 168) newErrors.durationHours = 'Duration must be between 1 and 168 hours';
        const size = Number(tourForm.maxGroupSize);
        if (tourForm.maxGroupSize === '' || isNaN(size)) newErrors.maxGroupSize = 'Max group size is required';
        else if (size < 1 || size > 50) newErrors.maxGroupSize = 'Group size must be between 1 and 50';
        const price = parseFloat(tourForm.price);
        if (!tourForm.price || isNaN(price)) newErrors.price = 'Price is required';
        else if (price < 0.01 || price > 10000) newErrors.price = 'Price must be between 0.01 and 10,000';
        break;
      }
      case 3:
        if (tourForm.meetingPoint.length > 500) newErrors.meetingPoint = 'Meeting point must be at most 500 characters';
        if ((tourForm.cancellationPolicy || '').length > 1000) newErrors.cancellationPolicy = 'Cancellation policy must be at most 1000 characters';
        break;
      case 4:
        if ((tourForm.highlights || []).length > 20) newErrors.highlights = 'Maximum 20 highlights';
        if ((tourForm.includes || []).length > 30) newErrors.includes = 'Maximum 30 items';
        if ((tourForm.excludes || []).length > 30) newErrors.excludes = 'Maximum 30 items';
        if ((tourForm.languages || []).length > 10) newErrors.languages = 'Maximum 10 languages';
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
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const tourPayload = {
      title: tourForm.title.trim(),
      description: tourForm.description.trim(),
      category: tourForm.category,
      durationHours: Number(tourForm.durationHours) || 1,
      maxGroupSize: Number(tourForm.maxGroupSize) || 10,
      pricePerPerson: parseFloat(tourForm.price) || 0,
      instantBooking: Boolean(tourForm.instantBooking),
      securePayment: Boolean(tourForm.securePayment),
      languages: tourForm.languages || [],
      highlights: (tourForm.highlights || []).slice(0, 20),
      includedItems: (tourForm.includes || []).slice(0, 30),
      excludedItems: (tourForm.excludes || []).slice(0, 30),
      meetingPoint: (tourForm.meetingPoint || '').trim().slice(0, 500),
      cancellationPolicy: (tourForm.cancellationPolicy || '').trim().slice(0, 1000),
      imageUrls: (tourForm.imageUrls || []).slice(0, 10),
      primaryImageIndex: Math.max(0, Math.min((tourForm.imageUrls || []).length - 1, Number(tourForm.primaryImageIndex) || 0))
    };

    try {
      if (isEditMode && tourId) {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.UPDATE, { id: tourId });
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(tourPayload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Failed to update tour');
        setMessage({ type: 'success', text: 'Tour updated successfully! Redirecting...' });
        setTimeout(() => navigate(user?.role === 'ADMIN' ? '/admin' : '/guide-tours'), 1500);
      } else {
        const data = await createTourApi(tourPayload, token);
        setMessage({ type: 'success', text: 'Tour created successfully! Redirecting to tour...' });
        setTimeout(() => navigate(`/tour/${data.id}`), 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || (isEditMode ? 'Failed to update tour' : 'Failed to create tour') });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Title, description, category' },
    { number: 2, title: 'Details & Pricing', description: 'Duration (hours), group size, price' },
    { number: 3, title: 'Logistics', description: 'Meeting point, cancellation policy' },
    { number: 4, title: 'Additional Info', description: 'Included, excluded, highlights, languages' },
    { number: 5, title: 'Images', description: 'Upload or paste image URLs' }
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
                        maxLength={200}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g. Sunset Sail & Tea Tasting"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">{tourForm.title.length}/200 (min 3)</p>
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
                        {TOUR_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
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
                        placeholder="Describe your tour (10–2000 characters)..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {tourForm.description.length}/2000 (min 10)
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
                      <label className="block text-sm font-medium text-gray-700">Duration (hours) *</label>
                      <input
                        type="number"
                        name="durationHours"
                        value={tourForm.durationHours}
                        onChange={handleInputChange}
                        min={1}
                        max={168}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.durationHours ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g. 4"
                      />
                      {errors.durationHours && (
                        <p className="mt-1 text-sm text-red-600">{errors.durationHours}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">1–168 hours (max 1 week)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max group size *</label>
                      <input
                        type="number"
                        name="maxGroupSize"
                        value={tourForm.maxGroupSize}
                        onChange={handleInputChange}
                        min={1}
                        max={50}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.maxGroupSize ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="10"
                      />
                      {errors.maxGroupSize && (
                        <p className="mt-1 text-sm text-red-600">{errors.maxGroupSize}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">1–50</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Price per person (USD) *</label>
                      <input
                        type="number"
                        name="price"
                        value={tourForm.price}
                        onChange={handleInputChange}
                        min={0.01}
                        max={10000}
                        step="0.01"
                        className={`mt-1 block w-full max-w-xs px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="65.00"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">0.01 – 10,000</p>
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
                      <label className="block text-sm font-medium text-gray-700">Meeting point (optional, max 500 chars)</label>
                      <input
                        type="text"
                        name="meetingPoint"
                        value={tourForm.meetingPoint}
                        onChange={handleInputChange}
                        maxLength={500}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.meetingPoint ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g. Harbour Pier 2, next to the blue kiosk"
                      />
                      {errors.meetingPoint && (
                        <p className="mt-1 text-sm text-red-600">{errors.meetingPoint}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cancellation policy (optional, max 1000 chars)</label>
                      <textarea
                        name="cancellationPolicy"
                        rows={4}
                        maxLength={1000}
                        value={tourForm.cancellationPolicy}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. Free cancellation up to 24 hours before start."
                      />
                      <p className="mt-1 text-xs text-gray-500">{(tourForm.cancellationPolicy || '').length}/1000</p>
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
                    <div className="flex flex-wrap gap-6">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={tourForm.instantBooking}
                          onChange={(e) => setTourForm(prev => ({ ...prev, instantBooking: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Instant booking</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={tourForm.securePayment}
                          onChange={(e) => setTourForm(prev => ({ ...prev, securePayment: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Secure payment</span>
                      </label>
                    </div>
                    <ArrayField
                      label="Languages (max 10)"
                      field="languages"
                      values={tourForm.languages || []}
                      onAdd={(value) => handleArrayInputChange('languages', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('languages', index, 'remove')}
                      placeholder="e.g. English, Spanish"
                    />
                    <ArrayField
                      label="What's included (max 30)"
                      field="includes"
                      values={tourForm.includes}
                      onAdd={(value) => handleArrayInputChange('includes', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('includes', index, 'remove')}
                      placeholder="e.g. Guide, transport, lunch"
                    />
                    <ArrayField
                      label="What's not included (max 30)"
                      field="excludes"
                      values={tourForm.excludes}
                      onAdd={(value) => handleArrayInputChange('excludes', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('excludes', index, 'remove')}
                      placeholder="e.g. Personal expenses, tips"
                    />
                    <ArrayField
                      label="Highlights (max 20)"
                      field="highlights"
                      values={tourForm.highlights}
                      onAdd={(value) => handleArrayInputChange('highlights', value, 'add')}
                      onRemove={(index) => handleArrayInputChange('highlights', index, 'remove')}
                      placeholder="e.g. Sunset views, tea tasting"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Images */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <ImagePicker
                  label="Tour images"
                  helpText="Upload images (after saving) or paste URLs (max 10). Set which image is the cover."
                  value={tourForm.imageUrls || []}
                  onChange={(urls) => setTourForm(prev => ({ ...prev, imageUrls: urls }))}
                  primaryIndex={tourForm.primaryImageIndex}
                  onPrimaryChange={(index) => setTourForm(prev => ({ ...prev, primaryImageIndex: index }))}
                  maxFiles={10}
                  enableUpload={true}
                  allowUrlInput={true}
                  tourId={isEditMode && tourId ? Number(tourId) : null}
                />
                {errors.imageUrls && (
                  <p className="mt-1 text-sm text-red-600">{errors.imageUrls}</p>
                )}
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
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Update Tour' : 'Create Tour'}
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
