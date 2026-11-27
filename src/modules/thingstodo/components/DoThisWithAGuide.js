import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ActivityCard from '../../../shared/components/ActivityCard';
import { useAuth } from '../../../shared/context/AuthContext';
import { addWishlist, getWishlist, removeWishlist } from '../../../shared/config/api';
import { getActivityTours, getEventTours, getRestaurantTours } from '../../../shared/config/api';
import { useAsync } from '../hooks/useAsync';

const loaders = {
  activities: getActivityTours,
  events: getEventTours,
  restaurants: getRestaurantTours
};

const DoThisWithAGuide = ({ kind, slug, destinationName, tourCategory }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(new Set());
  const { data, loading } = useAsync(
    (signal) => loaders[kind](slug, { size: 6 }, signal),
    [kind, slug]
  );

  useEffect(() => {
    if (!token) {
      setSaved(new Set());
      return;
    }
    getWishlist(token)
      .then((items) => setSaved(new Set((items || []).map((item) => item.id))))
      .catch(() => setSaved(new Set()));
  }, [token]);

  const toggleSave = async (tourId) => {
    if (!token) {
      sessionStorage.setItem('postLoginPath', window.location.pathname);
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

  const tours = data?.tours || [];
  const guides = data?.guides || [];
  const viewAll = `/tours?destination=${encodeURIComponent(destinationName || '')}${
    tourCategory ? `&category=${encodeURIComponent(tourCategory)}` : ''
  }`;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-900">Do this with a guide</h2>
      {loading && <p className="mt-3 text-gray-800">Loading tours…</p>}
      {!loading && tours.length === 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-gray-900">No Sea & Tea guides offer this in {destinationName || 'this place'} yet.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/guides" className="btn-primary min-h-[44px]">Browse guides</Link>
            <Link to="/contact" className="btn-outline min-h-[44px]">Tell us what you need</Link>
          </div>
        </div>
      )}
      {!loading && tours.length > 0 && (
        <>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.slice(0, 3).map((tour) => (
              <ActivityCard key={tour.id} tour={tour} saved={saved.has(tour.id)} onToggleSave={toggleSave} />
            ))}
          </div>
          {guides.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-3">
              {guides.map((guide) => (
                <li key={guide.id}>
                  <Link to={`/guide/${guide.id}`} className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2">
                    {guide.profilePictureUrl && (
                      <img src={guide.profilePictureUrl} alt="" width="40" height="40" className="h-10 w-10 rounded-full object-cover" />
                    )}
                    <span className="font-medium text-gray-900">{guide.firstName}</span>
                    {guide.averageRating != null && <span className="text-sm text-gray-800">{Number(guide.averageRating).toFixed(1)}</span>}
                    {(guide.isVerified || guide.verified) && <span className="text-xs font-semibold text-green-800">Verified</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={viewAll} className="btn-outline min-h-[44px]">View tours</Link>
            <Link to="/guides" className="btn-primary min-h-[44px]">Message a guide</Link>
          </div>
        </>
      )}
    </section>
  );
};

export default DoThisWithAGuide;
