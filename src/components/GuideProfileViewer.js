import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Users, Globe, Clock, Shield, CheckCircle, User, Mail, Phone, Calendar, Award, MessageSquare, X } from 'lucide-react';
import { getPublicGuideProfile, getGuideReviews, getReviewsRating, submitReview, listBookings } from '../config/api';
import { useAuth } from '../context/AuthContext';

const GuideProfileViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [guideData, setGuideData] = useState(null);
  const [guideReviews, setGuideReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ bookingId: null, rating: 5, comment: '' });
  const [completedBookings, setCompletedBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

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

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const data = await getGuideReviews(id, 0, 20);
      const content = data.content ?? data.reviews ?? (Array.isArray(data) ? data : []);
      setGuideReviews(content);
    } catch {
      setGuideReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const loadRatingSummary = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getReviewsRating({ guideId: Number(id) });
      setRatingSummary(data);
    } catch {
      setRatingSummary(null);
    }
  }, [id]);

  useEffect(() => {
    if (id && guideData?.id) {
      loadReviews();
      loadRatingSummary();
    }
  }, [id, guideData?.id, loadReviews, loadRatingSummary]);

  const handleOpenReviewModal = async () => {
    if (!isAuthenticated || !token) {
      setReviewError('Please log in to leave a review.');
      setReviewModalOpen(true);
      return;
    }
    setReviewError(null);
    setReviewForm({ bookingId: null, rating: 5, comment: '' });
    setCompletedBookings([]);
    setReviewModalOpen(true);
    setBookingsLoading(true);
    try {
      const bookings = await listBookings(token);
      const guideIdNum = Number(id);
      const completed = (bookings || []).filter(
        (b) =>
          (String(b.status || '').toUpperCase() === 'COMPLETED') &&
          (Number(b.guideId) === guideIdNum || Number(b.tour?.guideId) === guideIdNum)
      );
      setCompletedBookings(completed);
      if (completed.length === 1) setReviewForm((f) => ({ ...f, bookingId: completed[0].id }));
    } catch {
      setCompletedBookings([]);
    } finally {
      setBookingsLoading(false);
    }
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
      setReviewModalOpen(false);
      await loadReviews();
      await loadRatingSummary();
      await loadGuideProfile();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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
  const guideUserId = guideData.userId ?? guideData.user?.id ?? null;
  const guideDisplayName = [firstName, lastName].filter(Boolean).join(' ') || 'Guide';
  const canMessageGuide = guideUserId && user?.id !== guideUserId;

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
                <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
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
                {guideData.isAvailable !== false && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Available
                  </div>
                )}
                {canMessageGuide && (
                  isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => navigate('/messages', {
                        state: {
                          startConversation: {
                            partnerId: guideUserId,
                            partnerName: guideDisplayName,
                            partnerEmail: email || undefined,
                            partnerRole: 'GUIDE'
                          }
                        }
                      })}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message guide
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Log in to message guide
                    </Link>
                  )
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

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">Basic Information</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-700">
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{location}</span>
              </div>
            )}
            {!location && <span className="text-gray-500">Location not specified</span>}
            <div className="flex items-center gap-2 flex-wrap">
              <Star className="h-4 w-4 text-secondary-500" />
              <span>
                {(ratingSummary?.averageRating ?? guideData.averageRating ?? guideData.rating ?? 0).toFixed(1)} ({ratingSummary?.totalCount ?? guideData.totalReviews ?? guideReviews.length ?? 0} reviews)
              </span>
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              >
                Write a review
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{guideData.totalTours ?? guideData.tourCount ?? 0} tours</span>
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

        {/* Reviews */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary-600" />
              Reviews
            </h2>
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
              title="Write a review"
            >
              <MessageSquare className="h-4 w-4" />
              Write a review
            </button>
          </div>
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : guideReviews.length === 0 ? (
            <p className="text-gray-500">
              No reviews yet. {isAuthenticated && token ? 'Be the first to review this guide!' : 'Log in to leave a review.'}
            </p>
          ) : (
            <div className="space-y-4">
              {guideReviews.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {review.touristName || review.user?.firstName ? [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') : review.userName || 'Traveler'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${(review.rating ?? 0) >= star ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`} />
                      ))}
                      {review.isVerified && (
                        <span className="ml-1 text-xs text-green-600 font-medium" title="Verified booking">Verified</span>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                  {review.createdAt && (
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  {review.tourId && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Tour: <Link to={`/tour/${review.tourId}`} className="text-primary-600 hover:underline">View tour</Link>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setReviewModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
                <button type="button" onClick={() => setReviewModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {!isAuthenticated || !token ? (
                <div className="py-4">
                  <p className="text-gray-600 mb-4">Please log in to leave a review for this guide.</p>
                  <Link to="/login" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                    Log in
                  </Link>
                </div>
              ) : bookingsLoading ? (
                <div className="py-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : completedBookings.length === 0 ? (
                <div className="py-4">
                  <p className="text-gray-600">You can leave a review after completing a tour with this guide. Book a tour and come back once it&apos;s completed.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {reviewError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{reviewError}</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select booking to review</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                          className="p-0.5 rounded hover:opacity-80"
                        >
                          <Star className={`h-8 w-8 ${reviewForm.rating >= star ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional, max 2000 characters)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={4}
                      maxLength={2000}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience with this guide..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={submittingReview || !reviewForm.bookingId} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50">
                      {submittingReview ? 'Submitting...' : 'Submit review'}
                    </button>
                    <button type="button" onClick={() => setReviewModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

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
