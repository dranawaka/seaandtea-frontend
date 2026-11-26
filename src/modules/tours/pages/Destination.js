import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ActivityCard from '../../../shared/components/ActivityCard';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import { destinationBySlug } from '../../../shared/data/destinations';
import { addWishlist, getWishlist, removeWishlist, searchTours } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';

const Destination = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const place = destinationBySlug(slug);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    if (!place) return undefined;
    let cancelled = false;
    setLoading(true);
    const names = place.destinations?.length ? place.destinations : [place.name];
    Promise.all(names.map((name) => (
      searchTours({ destination: name, sortBy: 'bookings', sortDirection: 'desc', size: 24 })
        .then((data) => data.content || [])
        .catch(() => [])
    ))).then((lists) => {
      if (cancelled) return;
      const seen = new Set();
      const merged = [];
      lists.flat().forEach((tour) => {
        if (!seen.has(tour.id)) {
          seen.add(tour.id);
          merged.push(tour);
        }
      });
      setTours(merged);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [place]);

  useEffect(() => {
    if (!token) {
      setSaved(new Set());
      return;
    }
    getWishlist(token).then((items) => setSaved(new Set((items || []).map((item) => item.id)))).catch(() => setSaved(new Set()));
  }, [token]);

  const toggleSave = async (tourId) => {
    if (!token) {
      sessionStorage.setItem('postLoginPath', `/destinations/${slug}`);
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

  if (!place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-3">Destination not found</h1>
        <Link to="/tours" className="btn-primary">Browse experiences</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="relative h-72">
        <OptimizedImage
          src={place.image}
          alt={place.name}
          sizes="100vw"
          priority
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-white">
            <p className="text-sm uppercase tracking-wide">Sri Lanka</p>
            <h1 className="text-4xl md:text-5xl font-bold">{place.name}</h1>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">Things to do in {place.name}</h2>
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
        ) : tours.length === 0 ? (
          <p className="text-gray-600">No published tours in {place.name} yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tours.map((tour) => (
              <ActivityCard key={tour.id} tour={tour} saved={saved.has(tour.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Destination;
