import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGuideDashboard, getGuideTours } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';
import GuideDashboard from '../components/GuideDashboard';

const normalizeTour = (tour) => ({
  ...tour,
  location: tour.location || tour.destination || tour.meetingPoint || '',
  status: tour.status || (tour.isActive === false ? 'INACTIVE' : 'ACTIVE')
});

const GuideDashboardPage = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tours, setTours] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [missingProfile, setMissingProfile] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    setMissingProfile(false);
    try {
      const dashboard = await getGuideDashboard(token);
      const profile = dashboard.profile || {};
      setStats({
        totalTours: dashboard.totalTours ?? profile.totalTours ?? 0,
        activeTours: dashboard.activeTours ?? 0,
        totalBookings: dashboard.totalBookings ?? 0,
        averageRating: Number(dashboard.averageRating ?? profile.averageRating ?? 0),
        totalRevenue: Number(dashboard.totalRevenue ?? 0),
        thisMonthBookings: dashboard.thisMonthBookings ?? 0
      });
      try {
        const tourData = await getGuideTours(null, 0, 100, token);
        const list = tourData.content || tourData || [];
        setTours((Array.isArray(list) ? list : []).map(normalizeTour));
      } catch {
        setTours([]);
        setError('Your dashboard is available, but tours could not be loaded.');
      }
    } catch (err) {
      setTours([]);
      setStats({});
      if (err.status === 404) {
        setMissingProfile(true);
      } else {
        setError(err.message || 'Failed to load the guide dashboard.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !token) return;
    loadDashboard();
  }, [authLoading, isAuthenticated, token, loadDashboard]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your guide dashboard...</p>
        </div>
      </div>
    );
  }

  if (missingProfile) {
    const canCreate = user?.role === 'GUIDE';
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white shadow rounded-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Guide dashboard</h1>
          <p className="text-gray-600 mb-6">
            {canCreate
              ? 'This account does not have a guide profile yet. Create one from your profile before managing tours.'
              : 'Guide tools are available on guide accounts. This account does not have a guide profile.'}
          </p>
          {canCreate ? (
            <Link to="/profile" className="btn-primary inline-flex">
              Go to profile
            </Link>
          ) : (
            <Link to="/guides" className="btn-primary inline-flex">
              Browse guides
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}
        <GuideDashboard tours={tours} stats={stats} />
      </div>
    </div>
  );
};

export default GuideDashboardPage;
