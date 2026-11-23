import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Eye } from 'lucide-react';
import { listAdminBookings } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';
import AdminShell from '../components/AdminShell';

const statusClass = (status) => {
  if (status === 'CONFIRMED' || status === 'PAID' || status === 'COMPLETED') return 'bg-green-100 text-green-800';
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
};

const AdminBookings = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      setBookings(await listAdminBookings(token));
    } catch (err) {
      setBookings([]);
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  return (
    <AdminShell title="Bookings" description="Every tour booking, including traveler, guide, date, and payment.">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">All bookings</h2>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {bookings.length}
            </span>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-md flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-800">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traveler</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.tourTitle || '—'}</div>
                      <div className="text-sm text-gray-500">{booking.destination || `Booking ${booking.id}`}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{booking.touristName || '—'}</div>
                      <div className="text-gray-500">{booking.touristEmail || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guideName || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.bookingDate || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.numberOfPeople ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.totalAmount != null ? `$${Number(booking.totalAmount).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(booking.status)}`}>
                        {booking.status || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(booking.paymentStatus)}`}>
                        {booking.paymentStatus || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminBookings;
