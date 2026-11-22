import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ActivityCard from '../../../shared/components/ActivityCard';
import { DESTINATIONS, TOUR_CATEGORIES, formatLkr } from '../../../shared/data/destinations';
import { searchTours, getWishlist, addWishlist, removeWishlist } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';

const SORTS = [
  { id: 'bookings', label: 'Popular' },
  { id: 'rating', label: 'Top rated' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'newest', label: 'Newest' }
];

const Tours = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(new Set());
  const [page, setPage] = useState(Number(searchParams.get('page') || 0));

  const q = searchParams.get('q') || '';
  const destination = searchParams.get('destination') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'bookings';
  const date = searchParams.get('date') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    setPage(Number(searchParams.get('page') || 0));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const sortBy = sort === 'price-asc' || sort === 'price-desc' ? 'price' : sort === 'newest' ? 'createdAt' : sort;
    const sortDirection = sort === 'price-asc' ? 'asc' : 'desc';
    setLoading(true);
    searchTours({
      searchTerm: q || undefined,
      destination: destination || undefined,
      category: category || undefined,
      maxPrice: maxPrice || undefined,
      sortBy,
      sortDirection,
      page,
      size: 12
    }).then((data) => {
      if (cancelled) return;
      setTours(data.content || []);
      setTotal(data.totalElements || 0);
      setError('');
    }).catch((err) => {
      if (!cancelled) {
        setTours([]);
        setError(err.message || 'Could not load tours');
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [q, destination, category, sort, maxPrice, page]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSaved(new Set());
      return;
    }
    getWishlist(token).then((items) => setSaved(new Set((items || []).map((item) => item.id)))).catch(() => setSaved(new Set()));
  }, [isAuthenticated, token]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const toggleSave = async (tourId) => {
    if (!token) {
      sessionStorage.setItem('postLoginPath', `/tours?${searchParams.toString()}`);
      navigate('/login');
      return;
    }
    const next = new Set(saved);
    if (next.has(tourId)) {
      await removeWishlist(tourId, token);
      next.delete(tourId);
    } else {
      await addWishlist(tourId, token);
      next.add(tourId);
    }
    setSaved(next);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-primary-900">
            {destination || q || 'Experiences in Sri Lanka'}
          </h1>
          <p className="text-ink/70 mt-1">{loading ? 'Looking for tours…' : `${total} experiences`}</p>
          {date && <p className="text-sm text-primary-700 mt-1">Date saved for booking: {date}</p>}
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="card-modern p-5 h-fit space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Destination</label>
              <select className="input-field" value={destination} onChange={(event) => updateParam('destination', event.target.value)}>
                <option value="">Anywhere</option>
                {DESTINATIONS.map((place) => <option key={place.slug} value={place.name}>{place.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Category</label>
              <select className="input-field" value={category} onChange={(event) => updateParam('category', event.target.value)}>
                <option value="">All</option>
                {TOUR_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Max price</label>
              <select className="input-field" value={maxPrice} onChange={(event) => updateParam('maxPrice', event.target.value)}>
                <option value="">Any</option>
                <option value="50">Under {formatLkr(50)}</option>
                <option value="100">Under {formatLkr(100)}</option>
                <option value="200">Under {formatLkr(200)}</option>
              </select>
              <p className="text-xs text-ink/60 mt-1">LKR uses 1 USD = 300. The filter matches the USD price stored on each tour.</p>
            </div>
            <button type="button" className="text-sm font-semibold text-primary-700" onClick={() => setSearchParams(date ? { date } : {})}>
              Clear filters
            </button>
          </aside>
          <div className="lg:col-span-3">
            <div className="flex justify-end mb-4">
              <select className="input-field w-auto" value={sort} onChange={(event) => updateParam('sort', event.target.value)} aria-label="Sort tours">
                {SORTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {loading ? (
              <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
            ) : tours.length === 0 ? (
              <div className="card-modern p-10 text-center text-gray-600">No experiences match those filters.</div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {tours.map((tour) => (
                  <ActivityCard key={tour.id} tour={tour} date={date} saved={saved.has(tour.id)} onToggleSave={toggleSave} />
                ))}
              </div>
            )}
            {total > 12 && (
              <div className="flex justify-center gap-3 mt-8">
                <button type="button" className="btn-outline" disabled={page === 0} onClick={() => updateParam('page', String(page - 1))}>Previous</button>
                <button type="button" className="btn-outline" disabled={(page + 1) * 12 >= total} onClick={() => updateParam('page', String(page + 1))}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tours;
