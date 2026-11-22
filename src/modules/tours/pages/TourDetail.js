import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Calendar as CalendarIcon, Users, Clock, Check, X, Heart, Share2, Languages, ShieldCheck, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { FEATURE_SITE_PAYMENTS } from '../../../shared/config/features';
import { getTourById, getTourReviews, getReviewsRating, submitReview, listBookings, getGuideProfileById, getTourAvailability, createBooking, getWishlist, addWishlist, removeWishlist } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { categoryLabel, formatDuration, formatLkr, formatUsd } from '../../../shared/data/destinations';
import { preferSriLankanPhoto } from '../../../shared/utils/imageUtils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1400&q=80';

function isoDate(value) {
  if (!value) return '';
  if (Array.isArray(value)) {
    const [year, month, day] = value;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return String(value).slice(0, 10);
}

function formatClock(value) {
  if (!value) return '';
  if (Array.isArray(value)) {
    const [hour, minute] = value;
    return `${String(hour).padStart(2, '0')}:${String(minute || 0).padStart(2, '0')}`;
  }
  return String(value).slice(0, 5);
}

function languageList(languages) {
  if (!Array.isArray(languages)) return '';
  return languages.map((item) => (typeof item === 'string' ? item : item.language)).filter(Boolean).join(', ');
}

function dateLabel(iso) {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function Stars({ value, className = 'h-4 w-4' }) {
  const score = Number(value) || 0;
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${className} ${score >= star ? 'text-accent-500 fill-accent-500' : 'text-primary-200'}`} />
      ))}
    </span>
  );
}

function PhotoGrid({ images, title }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const photos = images.length ? images : [FALLBACK_IMAGE];
  const current = photos[Math.min(active, photos.length - 1)];
  const side = photos.map((src, index) => ({ src, index })).filter((item) => item.index !== active).slice(0, 3);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowRight') setActive((index) => (index + 1) % photos.length);
      if (event.key === 'ArrowLeft') setActive((index) => (index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length]);

  return (
    <>
      <div className={`grid gap-2 ${side.length ? 'md:grid-cols-3 md:h-[420px]' : ''}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`relative overflow-hidden rounded-2xl ${side.length ? 'md:col-span-2 h-64 md:h-full' : 'h-72 md:h-[420px]'}`}
        >
          <img src={current} alt={title} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
        </button>
        {side.length > 0 && (
          <div className="hidden md:grid grid-rows-3 gap-2">
            {side.map((item, position) => (
              <button key={`${item.src}-${item.index}`} type="button" onClick={() => setActive(item.index)} className="relative overflow-hidden rounded-2xl">
                <img src={item.src} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                {position === side.length - 1 && photos.length > 1 && (
                  <span className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-ink/50 to-transparent p-3 text-sm font-bold text-white">
                    {photos.length} photos
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto md:hidden">
          {photos.map((src, index) => (
            <button key={`${src}-${index}`} type="button" onClick={() => setActive(index)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 ${index === active ? 'ring-primary-600' : 'ring-transparent'}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4" onClick={() => setOpen(false)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white" onClick={() => setOpen(false)}>Close</button>
          {photos.length > 1 && (
            <button type="button" aria-label="Previous photo" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white" onClick={(event) => { event.stopPropagation(); setActive((index) => (index - 1 + photos.length) % photos.length); }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <img src={current} alt={title} className="max-h-[80vh] max-w-5xl rounded-2xl object-contain" onClick={(event) => event.stopPropagation()} />
          {photos.length > 1 && (
            <button type="button" aria-label="Next photo" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white" onClick={(event) => { event.stopPropagation(); setActive((index) => (index + 1) % photos.length); }}>
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [tour, setTour] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [participants, setParticipants] = useState(2);
  const [availability, setAvailability] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [booking, setBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

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
    const images = Array.isArray(t.images) ? t.images : [];
    const primaryOrFirst = images.length > 0 ? (images.find((img) => img.isPrimary) || images[0]) : null;
    const imageUrlFromArray = primaryOrFirst ? (primaryOrFirst.imageUrl || primaryOrFirst.url) : null;
    return {
      ...t,
      rating: t.averageRating ?? t.rating ?? 0,
      reviews: t.totalReviews ?? t.reviewCount ?? t.reviews ?? 0,
      price: t.pricePerPerson ?? t.price,
      image: preferSriLankanPhoto(t.imageUrl ?? imageUrlFromArray ?? t.image),
      location: t.destination || t.location || t.meetingPoint || 'Sri Lanka',
      destination: t.destination || t.location || '',
      meetingPoint: t.meetingPoint || '',
      cancellationPolicy: t.cancellationPolicy || 'Free cancellation up to 48 hours before departure',
      duration: t.durationHours ? formatDuration(t.durationHours) : (t.duration || ''),
      durationHours: t.durationHours,
      groupSize: t.maxGroupSize ?? t.groupSize,
      maxGroupSize: t.maxGroupSize ?? t.groupSize ?? 8,
      highlights: Array.isArray(t.highlights) ? t.highlights : [],
      languages: Array.isArray(t.languages) ? t.languages : [],
      itinerary,
      images,
      included: Array.isArray(t.includedItems) ? t.includedItems : (Array.isArray(t.included) ? t.included : []),
      notIncluded: Array.isArray(t.excludedItems) ? t.excludedItems : (Array.isArray(t.notIncluded) ? t.notIncluded : [])
    };
  };

  const loadTourData = async () => {
    setLoading(true);
    try {
      const tourData = await getTourById(id);
      if (tourData) {
        const normalized = normalizeTour(tourData);
        setTour(normalized);
        const embedded = tourData.guide;
        if (embedded) {
          setGuide({
            id: embedded.id,
            userId: embedded.userId ?? embedded.user?.id,
            email: embedded.email || embedded.userEmail || embedded.user?.email,
            name: [embedded.firstName, embedded.lastName].filter(Boolean).join(' ') || embedded.displayName || 'Local operator',
            image: embedded.profilePictureUrl,
            location: embedded.location || tourData.destination || 'Sri Lanka',
            rating: embedded.averageRating ?? 0,
            reviews: embedded.totalReviews ?? 0,
            tours: embedded.totalTours ?? embedded.tourCount ?? 0,
            bio: embedded.bio || embedded.shortBio || '',
            verified: Boolean(embedded.isVerified)
          });
        }
        const guideId = tourData.guideId ?? embedded?.id;
        if (guideId != null) {
          try {
            const guideData = await getGuideProfileById(guideId);
            setGuide((current) => ({
              id: guideData.id ?? current?.id,
              userId: guideData.userId ?? guideData.user?.id ?? current?.userId,
              email: guideData.userEmail || guideData.user?.email || current?.email,
              name: guideData.user?.firstName
                ? `${guideData.user.firstName} ${guideData.user.lastName || ''}`.trim()
                : guideData.displayName || current?.name || 'Local operator',
              image: guideData.profilePictureUrl || guideData.user?.profilePictureUrl || current?.image,
              location: guideData.location || current?.location || tourData.destination,
              rating: guideData.averageRating ?? current?.rating ?? 0,
              reviews: guideData.totalReviews ?? current?.reviews ?? 0,
              tours: guideData.tourCount ?? guideData.totalTours ?? current?.tours ?? 0,
              bio: guideData.bio || guideData.shortBio || current?.bio || '',
              verified: guideData.verificationStatus === 'VERIFIED' || current?.verified || false
            }));
          } catch (e) {
            console.warn('Could not load guide:', e);
          }
        }
      } else {
        setTour(null);
      }
    } catch (error) {
      console.error('Error loading tour data:', error);
      setTour(null);
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
    window.scrollTo(0, 0);
    loadTourData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const from = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + 60);
    const to = end.toISOString().split('T')[0];
    getTourAvailability(id, from, to)
      .then((days) => setAvailability(Array.isArray(days) ? days : []))
      .catch(() => setAvailability([]));
  }, [id]);

  useEffect(() => {
    if (!token || !id) return;
    getWishlist(token)
      .then((items) => setIsFavorite((items || []).some((item) => String(item.id) === String(id))))
      .catch(() => setIsFavorite(false));
  }, [token, id]);

  const spotsForDate = availability.find((day) => isoDate(day.date) === selectedDate);
  const remainingSpots = spotsForDate ? Number(spotsForDate.remainingSpots) : (tour?.maxGroupSize || 8);
  const participantOptions = Math.max(0, Math.min(remainingSpots || 0, tour?.maxGroupSize || 8));
  const openDays = availability.filter((day) => Number(day.remainingSpots) > 0).slice(0, 6);

  useEffect(() => {
    if (participantOptions > 0 && participants > participantOptions) {
      setParticipants(participantOptions);
    }
  }, [participantOptions, participants]);

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
    if (isAuthenticated && token && tour?.id) {
      loadCompletedBookingsForReview();
    }
  }, [isAuthenticated, token, tour?.id, loadCompletedBookingsForReview]);

  const contactGuide = () => {
    if (!guide?.userId) {
      if (guide?.id) navigate(`/guide/${guide.id}`);
      return;
    }
    if (!token) {
      sessionStorage.setItem('postLoginPath', `/tour/${id}`);
      navigate('/login');
      return;
    }
    navigate('/messages', {
      state: {
        startConversation: {
          partnerId: guide.userId,
          partnerName: guide.name,
          partnerEmail: guide.email || undefined,
          partnerRole: 'GUIDE'
        }
      }
    });
  };

  const handleBooking = async () => {
    if (!selectedDate) {
      document.getElementById('book-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!token) {
      sessionStorage.setItem('postLoginPath', `/tour/${id}?date=${selectedDate}`);
      navigate('/login');
      return;
    }
    setBooking(true);
    setBookingError('');
    try {
      const created = await createBooking({
        tourId: Number(id),
        date: selectedDate,
        numberOfPeople: participants
      }, token);
      navigate(`/checkout/${created.id}`);
    } catch (err) {
      setBookingError(err.message || 'Could not book this tour');
    } finally {
      setBooking(false);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      sessionStorage.setItem('postLoginPath', `/tour/${id}`);
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) await removeWishlist(id, token);
      else await addWishlist(Number(id), token);
      setIsFavorite(!isFavorite);
    } catch (err) {
      setBookingError(err.message || 'Could not update wishlist');
    }
  };

  const shareTour = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tour?.title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-ink/70">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold text-ink mb-4">Experience not found</h1>
          <p className="text-ink/70 mb-8">This tour is not available.</p>
          <Link to="/tours" className="btn-primary">Browse experiences</Link>
        </div>
      </div>
    );
  }

  const score = Number(ratingSummary?.averageRating ?? tour.rating ?? 0);
  const reviewCount = ratingSummary?.totalCount ?? tour.reviews ?? reviews.length;
  const photos = tour.images.map((img) => preferSriLankanPhoto(img.imageUrl || img.url)).filter(Boolean);
  if (photos.length === 0 && tour.image) photos.push(tour.image);
  const spoken = languageList(tour.languages);
  const departure = formatClock(tour.departureTime);
  const facts = [
    tour.duration ? { icon: Clock, label: 'Duration', value: tour.duration } : null,
    tour.groupSize ? { icon: Users, label: 'Group size', value: `Up to ${tour.groupSize}` } : null,
    spoken ? { icon: Languages, label: 'Live guide', value: spoken } : null,
    tour.meetingPoint ? { icon: MapPin, label: 'Meeting point', value: tour.meetingPoint } : null,
    { icon: ShieldCheck, label: 'Cancellation', value: tour.cancellationPolicy },
    departure ? { icon: CalendarIcon, label: 'Departs', value: departure } : null
  ].filter(Boolean);
  const plan = tour.itinerary.length > 0
    ? tour.itinerary.flatMap((day, dayIndex) => {
        const activities = day.activities.length ? day.activities : [day.title || `Day ${day.day || dayIndex + 1}`];
        return activities.map((activity, activityIndex) => ({
          title: activityIndex === 0 && day.title ? day.title : activity,
          detail: activityIndex === 0 && day.title ? activity : '',
          marker: activityIndex === 0 ? `Day ${day.day || dayIndex + 1}` : ''
        }));
      })
    : [
        { marker: 'Start', title: tour.meetingPoint || tour.location, detail: departure ? `Meet at ${departure}` : 'Meet your guide' },
        { marker: 'Experience', title: tour.title, detail: tour.duration ? `${tour.duration} in ${tour.location}` : tour.location },
        { marker: 'End', title: tour.location, detail: 'The experience ends where your guide confirms' }
      ];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const bookPanel = !FEATURE_SITE_PAYMENTS ? (
    <div id="book-panel" className="card-modern p-5 scroll-mt-24">
      <p className="text-sm text-ink/60">Listed from</p>
      <p className="text-3xl font-extrabold text-ink">{formatLkr(tour.price)}</p>
      <p className="text-sm text-ink/60 mb-4">{formatUsd(tour.price)} per person, paid to the guide</p>
      <p className="text-sm text-ink/80">Sea and Tea does not take payment. Register, then message the guide to arrange the trip.</p>
      <button type="button" onClick={contactGuide} className="btn-primary mt-4 w-full py-3 text-base inline-flex items-center justify-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Contact guide
      </button>
    </div>
  ) : (
    <div id="book-panel" className="card-modern p-5 scroll-mt-24">
      <p className="text-sm text-ink/60">From</p>
      <p className="text-3xl font-extrabold text-ink">{formatLkr(tour.price)}</p>
      <p className="text-sm text-ink/60 mb-4">{formatUsd(tour.price)} per person</p>
      {openDays.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-bold text-ink mb-2">Upcoming dates</p>
          <div className="flex flex-wrap gap-2">
            {openDays.map((day) => {
              const iso = isoDate(day.date);
              const selected = iso === selectedDate;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-100 bg-sand text-ink hover:border-primary-400'}`}
                >
                  {dateLabel(iso)}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <label className="block text-sm font-bold text-ink mb-1">Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(event) => setSelectedDate(event.target.value)}
        className="input-field mb-3"
        min={new Date().toISOString().split('T')[0]}
      />
      <label className="block text-sm font-bold text-ink mb-1">Travelers</label>
      <select
        value={participants}
        onChange={(event) => setParticipants(parseInt(event.target.value, 10))}
        className="input-field"
        disabled={participantOptions < 1}
      >
        {Array.from({ length: Math.max(participantOptions, 1) }, (_, index) => index + 1).map((num) => (
          <option key={num} value={num} disabled={num > participantOptions}>
            {num} {num === 1 ? 'person' : 'people'}
          </option>
        ))}
      </select>
      {selectedDate && (
        <p className="text-xs text-ink/60 mt-1">{remainingSpots > 0 ? `${remainingSpots} spots left` : 'Sold out on this date'}</p>
      )}
      <div className="mt-4 border-t border-primary-100 pt-4 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-ink/70">{participants} × {formatLkr(tour.price)}</span><span className="font-bold">{formatLkr(calculateTotalPrice())}</span></div>
        <p className="text-xs text-ink/50">Charged as {formatUsd(calculateTotalPrice())}</p>
      </div>
      {bookingError && <p className="text-sm text-red-600 mt-3">{bookingError}</p>}
      <button
        type="button"
        onClick={handleBooking}
        disabled={booking || (Boolean(selectedDate) && remainingSpots < 1)}
        className="btn-primary mt-4 w-full py-3 text-base disabled:opacity-50"
      >
        {booking ? 'Booking…' : selectedDate ? 'Book now' : 'Check availability'}
      </button>
      <p className="text-center text-sm text-ink/60 mt-3">{tour.cancellationPolicy}</p>
    </div>
  ));

  return (
    <div className="pb-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-x-10 lg:items-start">
          <div className="lg:col-span-2">
            <nav className="text-sm text-ink/60 mb-3">
              <Link to="/" className="hover:text-primary-700">Home</Link>
              <span> / </span>
              <Link to="/tours" className="hover:text-primary-700">Experiences</Link>
              {tour.destination && (
                <>
                  <span> / </span>
                  <Link to={`/tours?destination=${encodeURIComponent(tour.destination)}`} className="hover:text-primary-700">{tour.destination}</Link>
                </>
              )}
            </nav>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-ink leading-tight">{tour.title}</h1>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={shareTour} className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-2 text-sm font-bold text-ink" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
                </button>
                <button type="button" onClick={toggleFavorite} className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-2 text-sm font-bold text-ink" aria-label={isFavorite ? 'Remove from wishlist' : 'Save'}>
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-accent-500 text-accent-500' : ''}`} />
                  <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-ink">
                <Stars value={score} />
                {score.toFixed(1)}
                <a href="#reviews" className="font-semibold text-primary-700 underline-offset-2 hover:underline">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</a>
              </span>
              <Link to={`/tours?category=${tour.category}`} className="rounded-full bg-primary-50 px-3 py-1 font-bold text-primary-800">{categoryLabel(tour.category)}</Link>
              <span className="inline-flex items-center text-ink/70"><MapPin className="h-4 w-4 mr-1" />{tour.location}</span>
            </div>
            <div className="mt-5">
              <PhotoGrid images={photos} title={tour.title} />
            </div>
          </div>

          <aside className="mt-6 lg:mt-0 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:self-stretch">
            <div className="lg:sticky lg:top-24">
              {bookPanel}
            </div>
          </aside>

          <div className="lg:col-span-2 mt-8 space-y-10">
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-primary-100 py-6">
              {facts.map((fact) => (
                <div key={fact.label} className="flex gap-3">
                  <fact.icon className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-ink">{fact.label}</p>
                    <p className="text-sm text-ink/70">{fact.value}</p>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-ink mb-3">About this activity</h2>
              <p className="text-ink/80 text-lg leading-relaxed whitespace-pre-line">{tour.description}</p>
            </section>

            {tour.highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-extrabold text-ink mb-4">Highlights</h2>
                <ul className="space-y-3">
                  {tour.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-ink/80">
                      <Check className="h-5 w-5 text-secondary-500 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(tour.included.length > 0 || tour.notIncluded.length > 0) && (
              <section className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-ink mb-4">Includes</h2>
                  <ul className="space-y-2">
                    {tour.included.map((item) => (
                      <li key={item} className="flex gap-2 text-ink/80"><Check className="h-4 w-4 text-secondary-500 mt-1 shrink-0" />{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-ink mb-4">Not included</h2>
                  <ul className="space-y-2">
                    {tour.notIncluded.map((item) => (
                      <li key={item} className="flex gap-2 text-ink/80"><X className="h-4 w-4 text-accent-500 mt-1 shrink-0" />{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-extrabold text-ink mb-4">{tour.itinerary.length > 0 ? 'Itinerary' : 'How the day runs'}</h2>
              <ol className="relative border-l-2 border-primary-100 ml-3 space-y-6">
                {plan.map((step, index) => (
                  <li key={`${step.marker}-${step.title}-${index}`} className="pl-6">
                    <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full bg-primary-600 ring-4 ring-sand" />
                    {step.marker && <p className="text-xs font-bold uppercase tracking-wide text-primary-700">{step.marker}</p>}
                    <p className="font-bold text-ink">{step.title}</p>
                    {step.detail && step.detail !== step.title && <p className="text-sm text-ink/70 mt-1">{step.detail}</p>}
                  </li>
                ))}
              </ol>
            </section>

            {guide && (
              <section>
                <h2 className="text-2xl font-extrabold text-ink mb-4">Activity provider</h2>
                <div className="card-modern p-5 flex gap-4">
                  {guide.image ? (
                    <img src={guide.image} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-extrabold text-primary-800">
                      {(guide.name || 'G').charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-ink">{guide.name}</h3>
                      {guide.verified && <span className="rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-bold text-secondary-700">Verified</span>}
                    </div>
                    <p className="text-sm text-ink/70">{guide.location} · {guide.tours} experiences</p>
                    {guide.bio && <p className="text-sm text-ink/80 mt-2">{guide.bio}</p>}
                    {guide.id && <Link to={`/guide/${guide.id}`} className="inline-block mt-3 text-sm font-bold text-primary-700">View profile</Link>}
                  </div>
                </div>
              </section>
            )}

            <section id="reviews">
              <h2 className="text-2xl font-extrabold text-ink mb-4">Reviews</h2>
              {reviewError && <p className="mb-3 text-sm text-red-600">{reviewError}</p>}
              <div className="flex flex-wrap items-end gap-6 mb-6">
                <div>
                  <p className="text-4xl font-extrabold text-ink">{score.toFixed(1)}</p>
                  <Stars value={score} className="h-5 w-5" />
                  <p className="text-sm text-ink/60 mt-1">{reviewCount} reviews</p>
                </div>
                {ratingSummary?.ratingBreakdown && (
                  <div className="flex-1 min-w-[220px] space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingSummary.ratingBreakdown[String(star)] ?? 0;
                      const total = ratingSummary.totalCount || 1;
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-4 text-ink/70">{star}</span>
                          <div className="flex-1 h-2 rounded-full bg-primary-100 overflow-hidden">
                            <div className="h-full bg-accent-500" style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                          <span className="w-6 text-ink/50">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isAuthenticated && token && (
                <div className="card-modern p-5 mb-6">
                  <h3 className="font-extrabold text-ink mb-3">Write a review</h3>
                  {bookingsLoading ? (
                    <p className="text-sm text-ink/60">Checking your bookings…</p>
                  ) : completedBookings.length === 0 ? (
                    <p className="text-sm text-ink/70">You can review this experience after you complete it.</p>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <select
                        required
                        className="input-field"
                        value={reviewForm.bookingId ?? ''}
                        onChange={(event) => setReviewForm((form) => ({ ...form, bookingId: event.target.value ? Number(event.target.value) : null }))}
                      >
                        <option value="">Choose a completed booking</option>
                        {completedBookings.map((item) => (
                          <option key={item.id} value={item.id}>
                            Booking #{item.id}{item.tourDate ? ` · ${new Date(item.tourDate).toLocaleDateString()}` : ''}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setReviewForm((form) => ({ ...form, rating: star }))} aria-label={`${star} stars`}>
                            <Star className={`h-7 w-7 ${reviewForm.rating >= star ? 'text-accent-500 fill-accent-500' : 'text-primary-200'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))}
                        rows={3}
                        maxLength={2000}
                        className="input-field"
                        placeholder="How was the experience?"
                      />
                      <button type="submit" disabled={submittingReview || !reviewForm.bookingId} className="btn-primary disabled:opacity-50">
                        {submittingReview ? 'Submitting…' : 'Submit review'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {reviewsLoading ? (
                <p className="text-ink/60">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="text-ink/60">No reviews yet.</p>
              ) : (
                <div className="space-y-5">
                  {visibleReviews.map((review) => (
                    <article key={review.id} className="border-b border-primary-100 pb-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-800">
                            {(reviewDisplayName(review) || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-ink">{reviewDisplayName(review)}</p>
                            <p className="text-xs text-ink/50">{reviewDate(review)}</p>
                          </div>
                        </div>
                        <Stars value={review.rating} />
                      </div>
                      {review.comment && <p className="mt-3 text-ink/80">{review.comment}</p>}
                    </article>
                  ))}
                  {reviews.length > 3 && (
                    <button type="button" className="btn-outline" onClick={() => setShowAllReviews((open) => !open)}>
                      {showAllReviews ? 'Show fewer reviews' : `See all ${reviews.length} reviews`}
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-primary-100 bg-white px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-ink/60">From</p>
          <p className="text-lg font-extrabold text-ink">{formatLkr(tour.price)}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (!FEATURE_SITE_PAYMENTS) {
              contactGuide();
              return;
            }
            if (selectedDate) handleBooking();
            else document.getElementById('book-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          {!FEATURE_SITE_PAYMENTS ? 'Contact guide' : selectedDate ? 'Book now' : 'Check availability'}
        </button>
      </div>
    </div>
  );
};

export default TourDetail;
