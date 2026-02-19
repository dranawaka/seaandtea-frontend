import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Mail, Phone, Calendar, MessageSquare, X, ArrowLeft, Briefcase } from 'lucide-react';
import { getPublicGuideProfile, getGuideReviews, getReviewsRating, submitReview, listBookings } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FEATURE_TOURS_ENABLED } from '../config/features';

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
      const data = await getPublicGuideProfile(id);
      setGuideData(data);
    } catch (err) {
      setError(err.message || 'Failed to load guide profile');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
            <p className="text-sm font-semibold text-red-600 mb-1">Unable to load profile</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadGuideProfile}
              className="btn-primary text-sm py-2 px-4"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guideData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <p className="text-gray-500 text-sm">No guide profile found.</p>
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

  const ratingDisplay = (ratingSummary?.averageRating ?? guideData.averageRating ?? guideData.rating ?? 0).toFixed(1);
  const reviewCount = ratingSummary?.totalCount ?? guideData.totalReviews ?? guideReviews.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <Link
          to="/guides"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to guides
        </Link>

        {/* Profile Header */}
        <div className="card rounded-2xl overflow-hidden mb-8 border-0 shadow-card">
          <div className="bg-gradient-to-b from-primary-50 to-white px-6 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
              <div className="flex-shrink-0">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={`${guideDisplayName}`}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-white shadow-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-semibold shadow-lg">
                    {firstName ? firstName.charAt(0) : 'G'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {guideDisplayName}
                  </h1>
                  {guideData.verificationStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                  {guideData.isAvailable !== false && (
                    <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium">
                      Available
                    </span>
                  )}
                </div>
                {guideData.bio && (
                  <p className="text-gray-600 text-base leading-relaxed mb-4 max-w-2xl">{guideData.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-3">
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
                        className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message guide
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Log in to message
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
            {guideData.hourlyRate != null && (
              <div className="px-4 py-4 text-center">
                <p className="text-lg font-semibold text-primary-700">${guideData.hourlyRate}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Per hour</p>
              </div>
            )}
            {guideData.dailyRate != null && (
              <div className="px-4 py-4 text-center">
                <p className="text-lg font-semibold text-primary-700">${guideData.dailyRate}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Per day</p>
              </div>
            )}
            <div className="px-4 py-4 text-center">
              <p className="text-lg font-semibold text-primary-700 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
                {ratingDisplay}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-lg font-semibold text-primary-700">{guideData.totalTours ?? guideData.tourCount ?? 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Tours</p>
            </div>
          </div>
        </div>

        {/* Overview row: location, rating CTA */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          {location && (
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              {location}
            </span>
          )}
          <button
            type="button"
            onClick={handleOpenReviewModal}
            className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
          >
            Write a review
          </button>
        </div>

        {/* Two-column details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-500" />
              Contact & location
            </h2>
            <ul className="space-y-3">
              {email && (
                <li className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="break-all">{email}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{phone}</span>
                </li>
              )}
              {location && (
                <li className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{location}</span>
                </li>
              )}
              {guideData.dateOfBirth && (
                <li className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{new Date(guideData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </li>
              )}
              {!email && !phone && !location && !guideData.dateOfBirth && (
                <li className="text-gray-500 text-sm">Contact details not shared.</li>
              )}
            </ul>
          </div>

          <div className="card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-500" />
              Expertise
            </h2>
            {guideData.specialties && guideData.specialties.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {guideData.specialties.map((s, i) => (
                    <span
                      key={i}
                      className="bg-primary-100 text-primary-800 px-2.5 py-1 rounded-lg text-sm font-medium"
                    >
                      {typeof s === 'string' ? s : s.specialty || s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {guideData.languages && guideData.languages.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {guideData.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-sm"
                    >
                      {typeof lang === 'string' ? lang : lang.language || lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(!guideData.specialties?.length && !guideData.languages?.length) && (
              <p className="text-gray-500 text-sm">No expertise details added yet.</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="card rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Star className="h-4 w-4 text-primary-500" />
              Reviews
            </h2>
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4 w-fit"
            >
              <MessageSquare className="h-4 w-4" />
              Write a review
            </button>
          </div>
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600" />
            </div>
          ) : guideReviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-6">
              No reviews yet. {isAuthenticated && token ? 'Be the first to review this guide.' : 'Log in to leave a review.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {guideReviews.map((review) => (
                <li key={review.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-medium text-gray-900">
                      {review.touristName || (review.user?.firstName ? [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') : null) || review.userName || 'Traveler'}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${(review.rating ?? 0) >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {review.isVerified && (
                        <span className="text-xs text-emerald-600 font-medium" title="Verified booking">Verified</span>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
                  {review.createdAt && (
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  {review.tourId && FEATURE_TOURS_ENABLED && (
                    <p className="text-gray-500 text-xs mt-1">
                      Tour: <Link to={`/tour/${review.tourId}`} className="text-primary-600 hover:underline">View tour</Link>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Review modal */}
        {reviewModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setReviewModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {!isAuthenticated || !token ? (
                  <div>
                    <p className="text-gray-600 text-sm mb-4">Please log in to leave a review for this guide.</p>
                    <Link to="/login" className="btn-primary inline-block text-sm py-2 px-4">
                      Log in
                    </Link>
                  </div>
                ) : bookingsLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600" />
                  </div>
                ) : completedBookings.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    You can leave a review after completing a tour with this guide. Book a tour and return once it&apos;s completed.
                  </p>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    {reviewError && (
                      <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{reviewError}</div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Booking</label>
                      <select
                        required
                        className="input-field py-2.5"
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
                            className="p-0.5 rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                          >
                            <Star className={`h-8 w-8 transition-colors ${reviewForm.rating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
                      <textarea
                        className="input-field"
                        rows={4}
                        maxLength={2000}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                        placeholder="Share your experience with this guide..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Max 2,000 characters</p>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={submittingReview || !reviewForm.bookingId}
                        className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewModalOpen(false)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideProfileViewer;
