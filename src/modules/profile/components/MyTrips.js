import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelBooking, listBookings } from '../../../shared/config/api';
import { formatLkr, formatUsd } from '../../../shared/data/destinations';
import { useAuth } from '../../../shared/context/AuthContext';
import { FEATURE_SITE_PAYMENTS } from '../../../shared/config/features';

const MyTrips = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    listBookings(token)
      .then((items) => setBookings(items || []))
      .catch((err) => setError(err.message || 'Could not load trips'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    setLoading(true);
    listBookings(token)
      .then((items) => { if (!cancelled) setBookings(items || []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load trips'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const cancel = async (id) => {
    setError('');
    try {
      await cancelBooking(id, token);
      load();
    } catch (err) {
      setError(err.message || 'Could not cancel this trip');
    }
  };

  return (
    <section className="bg-white shadow rounded-lg mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My trips</h2>
      </div>
      <div className="px-6 py-5">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading trips…</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">
            {FEATURE_SITE_PAYMENTS
              ? <>No bookings yet. <Link to="/tours" className="text-primary-700 font-semibold">Find an experience</Link></>
              : <>Trips are arranged with the guide. <Link to="/guides" className="text-primary-700 font-semibold">Message a guide</Link></>}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <li key={booking.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Link to={`/tour/${booking.tourId}`} className="font-semibold text-gray-900 hover:text-primary-700">{booking.tourTitle}</Link>
                  <p className="text-sm text-gray-600">{booking.bookingDate} · {booking.destination} · {booking.numberOfPeople} people</p>
                  <p className="text-sm text-gray-500">
                    {booking.status}
                    {FEATURE_SITE_PAYMENTS ? ` · ${booking.paymentStatus}` : ''}
                    {' · '}{formatLkr(booking.totalAmount)} ({formatUsd(booking.totalAmount)})
                  </p>
                </div>
                <div className="flex gap-2">
                  {FEATURE_SITE_PAYMENTS && booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
                    <Link to={`/checkout/${booking.id}`} className="btn-primary text-sm py-2">Pay</Link>
                  )}
                  {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                    <button type="button" className="btn-outline text-sm py-2" onClick={() => cancel(booking.id)}>Cancel</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default MyTrips;
