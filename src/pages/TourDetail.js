import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, DollarSign, Clock, Check, X, Heart, Share2, Calendar as CalendarIcon } from 'lucide-react';
import { getTourById, getGuideById } from '../data/mockData';

const TourDetail = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [participants, setParticipants] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTourData();
  }, [id]);

  const loadTourData = async () => {
    setLoading(true);
    try {
      const tourData = await getTourById(id);
      if (tourData) {
        setTour(tourData);
        const guideData = await getGuideById(tourData.guideId);
        setGuide(guideData);
      }
    } catch (error) {
      console.error('Error loading tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    // In a real app, this would redirect to a booking system
    alert('Booking functionality would be implemented here. This would typically redirect to a payment system or booking form.');
  };

  const calculateTotalPrice = () => {
    if (!tour) return 0;
    return tour.price * participants;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'included', label: 'What\'s Included' },
    { id: 'guide', label: 'Your Guide' },
    { id: 'reviews', label: 'Reviews' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour Not Found</h1>
          <p className="text-gray-600 mb-8">The tour you're looking for doesn't exist.</p>
          <Link to="/tours" className="btn-primary">
            Browse All Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <img 
          src={tour.image} 
          alt={tour.title}
          className="w-full h-96 md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl">
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {tour.category}
                </span>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-secondary-400 mr-1" />
                  <span className="font-medium">{tour.rating}</span>
                  <span className="ml-1">({tour.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {tour.title}
              </h1>
              <div className="flex items-center space-x-6 text-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {tour.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {tour.duration}
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {tour.groupSize}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-full ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            } transition-all duration-200`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button className="p-3 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all duration-200">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Tour Details */}
            <div className="lg:col-span-2">
              {/* Navigation Tabs */}
              <div className="bg-white rounded-xl shadow-lg mb-8">
                <nav className="flex space-x-8 p-6 border-b">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
                
                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tour Overview</h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {tour.description}
                      </p>
                      
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Highlights</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {tour.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                              <span className="text-gray-700">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">Duration: {tour.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">Group Size: {tour.groupSize}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">Location: {tour.location}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">Price: ${tour.price} per person</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Itinerary Tab */}
                  {activeTab === 'itinerary' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Itinerary</h2>
                      <div className="space-y-6">
                        {tour.itinerary.map((day, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                              <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                                {day.day}
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                            </div>
                            <div className="space-y-2">
                              {day.activities.map((activity, activityIndex) => (
                                <div key={activityIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-gray-700">{activity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What's Included Tab */}
                  {activeTab === 'included' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included & Not Included</h2>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            What's Included
                          </h3>
                          <div className="space-y-3">
                            {tour.included.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-3" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <X className="h-5 w-5 text-red-500 mr-2" />
                            Not Included
                          </h3>
                          <div className="space-y-3">
                            {tour.notIncluded.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <X className="h-4 w-4 text-red-500 mr-3" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guide Tab */}
                  {activeTab === 'guide' && guide && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Your Guide</h2>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-6">
                          <img 
                            src={guide.image} 
                            alt={guide.name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{guide.name}</h3>
                            <div className="flex items-center text-gray-600 mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {guide.location}
                            </div>
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-secondary-500 mr-1" />
                                <span className="text-sm">{guide.rating} ({guide.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm">{guide.tours} tours</span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{guide.bio}</p>
                            <Link 
                              to={`/guide/${guide.id}`}
                              className="btn-outline"
                            >
                              View Full Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Traveler Reviews</h2>
                      
                      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Star className="h-8 w-8 text-secondary-500 mr-3" />
                            <div>
                              <div className="text-2xl font-bold text-gray-900">{tour.rating}</div>
                              <div className="text-gray-600">out of 5 stars</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{tour.reviews}</div>
                            <div className="text-gray-600">total reviews</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Mock reviews - in real app, these would come from API */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <img 
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                                alt="Reviewer"
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">David Chen</div>
                                <div className="text-sm text-gray-500">March 2024</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                            </div>
                          </div>
                          <p className="text-gray-600">
                            "Absolutely incredible experience! The tour exceeded all our expectations. Our guide was knowledgeable, 
                            friendly, and showed us places we would never have discovered on our own. Highly recommend!"
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <img 
                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                                alt="Reviewer"
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">Sarah Williams</div>
                                <div className="text-sm text-gray-500">February 2024</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                              <Star className="h-4 w-4 text-secondary-500" />
                            </div>
                          </div>
                          <p className="text-gray-600">
                            "Perfect blend of adventure and culture. The itinerary was well-planned and our guide was exceptional. 
                            We learned so much about the local history and traditions. Worth every penny!"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${tour.price}
                    </div>
                    <div className="text-gray-600">per person</div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Choose a date</option>
                        {tour.availability.map((date, index) => (
                          <option key={index} value={date}>
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Participants
                      </label>
                      <select
                        value={participants}
                        onChange={(e) => setParticipants(parseInt(e.target.value))}
                        className="input-field"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Price per person:</span>
                      <span className="font-medium">${tour.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium">{participants}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>${calculateTotalPrice()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate}
                    className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Book This Tour
                  </button>
                  
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      Free cancellation up to 48 hours before departure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourDetail;

