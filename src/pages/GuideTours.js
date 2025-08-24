import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, Calendar, MapPin, DollarSign, Users, Clock, Star, Search, Filter, X } from 'lucide-react';
import { buildApiUrl, API_CONFIG, logApiCall } from '../config/api';
import { useAuth } from '../context/AuthContext';

const GuideTours = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  
  const [tourForm, setTourForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    duration: '',
    maxGroupSize: '',
    price: '',
    difficulty: 'EASY',
    includes: [],
    excludes: [],
    requirements: [],
    highlights: []
  });
  
  const [errors, setErrors] = useState({});

  // Load tours on component mount
  useEffect(() => {
    if (user && isAuthenticated) {
      loadTours();
    }
  }, [user, isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadTours = async () => {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.LIST);
      console.log(`🚀 Loading tours for guide ${user?.id} from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Log the API call
      logApiCall('GET', url, null, response);

      if (response.ok) {
        const data = await response.json();
        // Filter tours for the current guide
        const guideTours = data.content ? data.content.filter(tour => tour.guideId === user.id) : [];
        setTours(guideTours);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      setMessage({ type: 'error', text: 'Failed to load tours' });
    } finally {
      setIsLoading(false);
    }
  };

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

  const validateTourForm = () => {
    const newErrors = {};

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

    if (!tourForm.location.trim()) {
      newErrors.location = 'Location is required';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    
    if (!validateTourForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.CREATE);
      const tourData = {
        ...tourForm,
        maxGroupSize: parseInt(tourForm.maxGroupSize),
        price: parseFloat(tourForm.price)
      };
      
      console.log(`🚀 Creating tour: ${url}`, tourData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tourData)
      });

      // Log the API call
      logApiCall('POST', url, tourData, response);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create tour');
      }

      setMessage({ type: 'success', text: 'Tour created successfully!' });
      setShowCreateModal(false);
      resetTourForm();
      await loadTours();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create tour' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTour = async (e) => {
    e.preventDefault();
    
    if (!validateTourForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.UPDATE.replace(':id', selectedTour.id));
      const tourData = {
        ...tourForm,
        maxGroupSize: parseInt(tourForm.maxGroupSize),
        price: parseFloat(tourForm.price)
      };
      
      console.log(`🚀 Updating tour ${selectedTour.id}: ${url}`, tourData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tourData)
      });

      // Log the API call
      logApiCall('PUT', url, tourData, response);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update tour');
      }

      setMessage({ type: 'success', text: 'Tour updated successfully!' });
      setShowEditModal(false);
      setSelectedTour(null);
      resetTourForm();
      await loadTours();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update tour' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.DELETE.replace(':id', tourId));
      console.log(`🚀 Deleting tour ${tourId}: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Log the API call
      logApiCall('DELETE', url, null, response);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete tour');
      }

      setMessage({ type: 'success', text: 'Tour deleted successfully!' });
      await loadTours();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete tour' });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (tour) => {
    setSelectedTour(tour);
    setTourForm({
      title: tour.title || '',
      description: tour.description || '',
      category: tour.category || '',
      location: tour.location || '',
      duration: tour.duration || '',
      maxGroupSize: tour.maxGroupSize?.toString() || '',
      price: tour.price?.toString() || '',
      difficulty: tour.difficulty || 'EASY',
      includes: tour.includes || [],
      excludes: tour.excludes || [],
      requirements: tour.requirements || [],
      highlights: tour.highlights || []
    });
    setShowEditModal(true);
  };

  const resetTourForm = () => {
    setTourForm({
      title: '',
      description: '',
      category: '',
      location: '',
      duration: '',
      maxGroupSize: '',
      price: '',
      difficulty: 'EASY',
      includes: [],
      excludes: [],
      requirements: [],
      highlights: []
    });
    setErrors({});
  };

  const openCreateModal = () => {
    resetTourForm();
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTour(null);
    resetTourForm();
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || tour.category === filterCategory;
    const matchesStatus = !filterStatus || tour.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tours</h1>
              <p className="mt-2 text-gray-600">Manage your tour offerings and bookings</p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Tour
            </button>
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

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search tours..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                <option value="ADVENTURE">Adventure</option>
                <option value="CULTURAL">Cultural</option>
                <option value="NATURE">Nature</option>
                <option value="FOOD">Food & Dining</option>
                <option value="HISTORICAL">Historical</option>
                <option value="WILDLIFE">Wildlife</option>
                <option value="WATER_SPORTS">Water Sports</option>
                <option value="HIKING">Hiking</option>
                <option value="PHOTOGRAPHY">Photography</option>
                <option value="WELLNESS">Wellness</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterStatus('');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tours Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tours...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <MapPin className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory || filterStatus 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first tour'
              }
            </p>
            {!searchTerm && !filterCategory && !filterStatus && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tour
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Tour Image */}
                <div className="relative h-48 bg-gray-200">
                  {tour.imageUrl ? (
                    <img
                      src={tour.imageUrl}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <MapPin className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tour.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      tour.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tour.status}
                    </span>
                  </div>
                </div>

                {/* Tour Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {tour.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tour.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      Max {tour.maxGroupSize} people
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${tour.price} per person
                    </div>
                  </div>

                  {/* Tour Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {tour.averageRating ? tour.averageRating.toFixed(1) : 'N/A'} ({tour.totalReviews || 0})
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tour.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      tour.difficulty === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tour.difficulty}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/tour/${tour.id}`)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(tour)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTour(tour.id)}
                      className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tour Modal */}
      {showCreateModal && (
        <TourModal
          isOpen={showCreateModal}
          onClose={closeModal}
          onSubmit={handleCreateTour}
          tourForm={tourForm}
          setTourForm={setTourForm}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
          errors={errors}
          isLoading={isLoading}
          mode="create"
        />
      )}

      {/* Edit Tour Modal */}
      {showEditModal && (
        <TourModal
          isOpen={showEditModal}
          onClose={closeModal}
          onSubmit={handleEditTour}
          tourForm={tourForm}
          setTourForm={setTourForm}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
          errors={errors}
          isLoading={isLoading}
          mode="edit"
        />
      )}
    </div>
  );
};

// Tour Modal Component
const TourModal = ({ isOpen, onClose, onSubmit, tourForm, setTourForm, handleInputChange, handleArrayInputChange, errors, isLoading, mode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'create' ? 'Create New Tour' : 'Edit Tour'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={tourForm.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter tour title"
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
                  <option value="ADVENTURE">Adventure</option>
                  <option value="CULTURAL">Cultural</option>
                  <option value="NATURE">Nature</option>
                  <option value="FOOD">Food & Dining</option>
                  <option value="HISTORICAL">Historical</option>
                  <option value="WILDLIFE">Wildlife</option>
                  <option value="WATER_SPORTS">Water Sports</option>
                  <option value="HIKING">Hiking</option>
                  <option value="PHOTOGRAPHY">Photography</option>
                  <option value="WELLNESS">Wellness</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={tourForm.location}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Kandy, Sri Lanka"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700">Price (USD) *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  name="difficulty"
                  value={tourForm.difficulty}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="DIFFICULT">Difficult</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                rows={4}
                value={tourForm.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your tour experience, what travelers will see and do..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {tourForm.description.length}/1000 characters (minimum 50)
              </p>
            </div>

            {/* Array Fields */}
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
              label="Requirements"
              field="requirements"
              values={tourForm.requirements}
              onAdd={(value) => handleArrayInputChange('requirements', value, 'add')}
              onRemove={(index) => handleArrayInputChange('requirements', index, 'remove')}
              placeholder="e.g., Comfortable walking shoes, water bottle"
            />

            <ArrayField
              label="Highlights"
              field="highlights"
              values={tourForm.highlights}
              onAdd={(value) => handleArrayInputChange('highlights', value, 'add')}
              onRemove={(index) => handleArrayInputChange('highlights', index, 'remove')}
              placeholder="e.g., Ancient temple visit, scenic viewpoints"
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
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
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  mode === 'create' ? 'Create Tour' : 'Update Tour'
                )}
              </button>
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

export default GuideTours;

