import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Calendar as CalendarIcon, Users, DollarSign, Clock, Check, X, Heart, Share2 } from 'lucide-react';
import { getTourById, getTourReviews, getReviewsRating, submitReview, listBookings, getGuideProfileById } from '../config/api';
import { useAuth } from '../context/AuthContext';

const TourDetail = () => {
  const { id } = useParams();
  const { user, token, isAuthenticated } = useAuth();
  const [tour, setTour] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [participants, setParticipants] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ bookingId: null, rating: 5, comment: '' });
  const [completedBookings, setCompletedBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const normalizeTour = (t) => {
    if (!t) return t;
    const itinerary = Array.isArray(t.itinerary) ? t.itinerary.map((day) => ({
      ...day,
      activities: Array.isArray(day?.activities) ? day.activities : []
    })) : [];
    return {
      ...t,
      rating: t.averageRating ?? t.rating ?? 0,
      reviews: t.totalReviews ?? t.reviewCount ?? t.reviews ?? 0,
      price: t.pricePerPerson ?? t.price,
      image: t.imageUrl ?? t.images?.[0] ?? t.image,
      location: t.location ?? t.destination,
      duration: t.duration ?? t.durationHours ? `${t.durationHours}h` : '',
      groupSize: t.maxGroupSize ?? t.groupSize,
      highlights: Array.isArray(t.highlights) ? t.highlights : [],
      itinerary,
      included: Array.isArray(t.included) ? t.included : [],
      notIncluded: Array.isArray(t.notIncluded) ? t.notIncluded : []
    };
  };

  const loadTourData = async () => {
    setLoading(true);
    try {
      const tourData = await getTourById(id);
      if (tourData) {
        const normalized = normalizeTour(tourData);
        setTour(normalized);
        if (tourData.guideId != null) {
          try {
            const guideData = await getGuideProfileById(tourData.guideId);
            setGuide({
              id: guideData.id,
              name: guideData.user?.firstName ? `${guideData.user.firstName} ${guideData.user.lastName || ''}`.trim() : guideData.displayName || 'Guide',
              image: guideData.profilePictureUrl || guideData.user?.profilePictureUrl,
              location: guideData.location,
              rating: guideData.averageRating ?? 0,
              reviews: guideData.totalReviews ?? 0,
              tours: guideData.tourCount ?? 0,
              bio: guideData.bio || guideData.shortBio || ''
            });
          } catch (e) {
            console.warn('Could not load guide:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewError(null);
    try {
      const data = await getTourReviews(id, 0, 50);
      const content = data.content ?? data.reviews ?? (Array.isArray(data) ? data : []);
      setReviews(content);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviewError(error.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTourData();
  }, [id]);

  const loadRatingSummary = useCallback(async () => {
    if (!tour?.id) return;
    try {
      const data = await getReviewsRating({ tourId: Number(tour.id) });
      setRatingSummary(data);
    } catch {
      setRatingSummary(null);
    }
  }, [tour?.id]);

  useEffect(() => {
    if (tour?.id) {
      loadReviews();
      loadRatingSummary();
    }
  }, [tour?.id, loadReviews, loadRatingSummary]);

  const loadCompletedBookingsForReview = useCallback(async () => {
    if (!token || !tour?.id) return;
    setBookingsLoading(true);
    try {
      const bookings = await listBookings(token);
      const tourIdNum = Number(tour.id);
      const completed = (bookings || []).filter(
        (b) =>
          String(b.status || '').toUpperCase() === 'COMPLETED' &&
          (Number(b.tourId) === tourIdNum || Number(b.tour?.id) === tourIdNum)
      );
      setCompletedBookings(completed);
      if (completed.length === 1) setReviewForm((f) => ({ ...f, bookingId: completed[0].id }));
    } catch {
      setCompletedBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [token, tour?.id]);

  useEffect(() => {
    if (activeTab === 'reviews' && isAuthenticated && token && tour?.id) {
      loadCompletedBookingsForReview();
    }
  }, [activeTab, isAuthenticated, token, tour?.id, loadCompletedBookingsForReview]);

  const handleBooking = () => {
    alert('Booking functionality would be implemented here. This would typically redirect to a payment system or booking form.');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token || !reviewForm.bookingId) {
      setReviewError('Please select a completed booking to review.');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await submitReview(
        {
          bookingId: Number(reviewForm.bookingId),
          rating: Number(reviewForm.rating),
          comment: (reviewForm.comment || '').trim()
        },
        token
      );
      setReviewForm({ bookingId: null, rating: 5, comment: '' });
      await loadReviews();
      await loadRatingSummary();
      await loadTourData();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviewDisplayName = (review) => {
    return review.touristName || (review.user?.firstName ? [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') : null) || review.userName || review.authorName || 'Traveler';
  };

  const reviewDate = (review) => {
    const d = review.createdAt ?? review.date;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
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
                  <span className="font-medium">{(ratingSummary?.averageRating ?? tour.rating ?? 0).toFixed(1)}</span>
                  <span className="ml-1">({ratingSummary?.totalCount ?? tour.reviews ?? 0} reviews)</span>
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
                  <CalendarIcon className="h-5 w-5 mr-2" />
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
                          {guide.image ? (
                            <img src={guide.image} alt={guide.name} className="w-24 h-24 rounded-full object-cover" />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-semibold text-primary-700">
                              {(guide.name || 'G').charAt(0)}
                            </div>
                          )}
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
                      {reviewError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{reviewError}</div>
                      )}
                      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Star className="h-8 w-8 text-secondary-500 mr-3" />
                            <div>
                              <div className="text-2xl font-bold text-gray-900">{(ratingSummary?.averageRating ?? tour.rating ?? 0).toFixed(1)}</div>
                              <div className="text-gray-600">out of 5 stars</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{ratingSummary?.totalCount ?? tour.reviews ?? reviews.length}</div>
                            <div className="text-gray-600">total reviews</div>
                          </div>
                        </div>
                        {ratingSummary?.ratingBreakdown && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-700 mb-2">Rating distribution</div>
                            <div className="space-y-1">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingSummary.ratingBreakdown[String(star)] ?? 0;
                                const total = ratingSummary.totalCount || 1;
                                return (
                                  <div key={star} className="flex items-center gap-2">
                                    <span className="text-gray-600 w-6">{star} ★</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-secondary-500 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                                    </div>
                                    <span className="text-gray-500 text-sm w-8">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {isAuthenticated && token && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a review</h3>
                          {bookingsLoading ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                            </div>
                          ) : completedBookings.length === 0 ? (
                            <p className="text-gray-600">You can leave a review after completing this tour. Book the tour and come back once it&apos;s completed.</p>
                          ) : (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select booking to review</label>
                                <select
                                  required
                                  className="input-field w-full"
                                  value={reviewForm.bookingId ?? ''}
                                  onChange={(e) => setReviewForm((f) => ({ ...f, bookingId: e.target.value ? Number(e.target.value) : null }))}
                                >
                                  <option value="">Choose a completed booking...</option>
                                  {completedBookings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.tour?.title || `Booking #${b.id}`} {b.tourDate ? ` – ${new Date(b.tourDate).toLocaleDateString()}` : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                                      className="p-1 focus:outline-none"
                                    >
                                      <Star className={`h-8 w-8 ${reviewForm.rating >= star ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional, max 2000 characters)</label>
                                <textarea
                                  value={reviewForm.comment}
                                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                                  rows={3}
                                  maxLength={2000}
                                  className="input-field w-full"
                                  placeholder="Share your experience..."
                                />
                              </div>
                              <button type="submit" disabled={submittingReview || !reviewForm.bookingId} className="btn-primary">
                                {submittingReview ? 'Submitting...' : 'Submit review'}
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {reviewsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
                          No reviews yet. {isAuthenticated ? 'Be the first to review this tour!' : 'Log in to leave a review.'}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold mr-3">
                                    {(reviewDisplayName(review) || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{reviewDisplayName(review)}</div>
                                    <div className="text-sm text-gray-500">{reviewDate(review)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className={`h-4 w-4 ${(review.rating ?? 0) >= star ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  {review.isVerified && (
                                    <span className="text-sm text-green-600 font-medium">Verified</span>
                                  )}
                                </div>
                              </div>
                              {review.comment && <p className="text-gray-600">{review.comment}</p>}
                            </div>
                          ))}
                        </div>
                      )}
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
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="input-field pl-10 w-full"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
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

