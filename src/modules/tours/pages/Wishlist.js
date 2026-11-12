import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ActivityCard from '../../../shared/components/ActivityCard';
import { getWishlist, removeWishlist } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('postLoginPath', '/wishlist');
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!token) return;
    getWishlist(token)
      .then((items) => setTours(items || []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleSave = async (tourId) => {
    await removeWishlist(tourId, token);
    setTours((current) => current.filter((tour) => tour.id !== tourId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Wishlist</h1>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : tours.length === 0 ? (
        <div className="card-modern p-10 text-center">
          <p className="text-gray-600 mb-4">Save experiences with the heart to find them later.</p>
          <Link to="/tours" className="btn-primary">Browse experiences</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.map((tour) => (
            <ActivityCard key={tour.id} tour={tour} saved onToggleSave={toggleSave} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
