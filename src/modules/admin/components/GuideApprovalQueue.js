import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Edit2, Eye, UserCheck, XCircle } from 'lucide-react';
import { getAdminGuides, rejectGuideApi, verifyGuideApi } from '../../../shared/config/api';

const statusClass = (status) => {
  if (status === 'VERIFIED') return 'bg-green-100 text-green-800';
  if (status === 'REJECTED') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
};

const joinLabels = (items, key) => {
  if (!Array.isArray(items) || items.length === 0) return '—';
  const labels = items
    .map((item) => (typeof item === 'string' ? item : item?.[key]))
    .filter(Boolean);
  return labels.length ? labels.join(', ') : '—';
};

const guideName = (guide) =>
  [guide.userFirstName, guide.userLastName].filter(Boolean).join(' ') || guide.userEmail || 'Guide';

const GuideApprovalQueue = ({ token, status = 'PENDING', onChanged }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const list = await getAdminGuides(token, status === 'ALL' ? null : status);
      setGuides(list);
    } catch (err) {
      setGuides([]);
      setError(err.message || 'Failed to load guides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  const flash = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const approve = async (guideId) => {
    try {
      setActingId(guideId);
      setError(null);
      await verifyGuideApi(guideId, token);
      setGuides((prev) => (
        status === 'PENDING'
          ? prev.filter((guide) => guide.id !== guideId)
          : prev.map((guide) => (guide.id === guideId ? { ...guide, verificationStatus: 'VERIFIED' } : guide))
      ));
      flash('Guide approved.');
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Failed to approve guide.');
    } finally {
      setActingId(null);
    }
  };

  const reject = async (guideId) => {
    if (!window.confirm('Reject this guide profile? They will stay in the system as rejected.')) return;
    try {
      setActingId(guideId);
      setError(null);
      await rejectGuideApi(guideId, token, 'Rejected during admin review');
      setGuides((prev) => (
        status === 'PENDING' || status === 'VERIFIED'
          ? prev.filter((guide) => guide.id !== guideId)
          : prev.map((guide) => (guide.id === guideId ? { ...guide, verificationStatus: 'REJECTED' } : guide))
      ));
      flash('Guide rejected.');
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Failed to reject guide.');
    } finally {
      setActingId(null);
    }
  };

  const title = status === 'PENDING'
    ? 'Guide approval queue'
    : status === 'VERIFIED'
      ? 'Verified guides'
      : status === 'REJECTED'
        ? 'Rejected guides'
        : 'All guides';

  const empty = status === 'PENDING'
    ? 'No guides are waiting for approval.'
    : 'No guides match this filter.';

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              {guides.length}
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
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-md flex">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-md flex">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-green-800">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-sm text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2" />
          Loading guides...
        </div>
      ) : guides.length === 0 ? (
        <div className="p-6 text-center text-gray-500">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Languages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guides.map((guide) => {
                const pending = guide.verificationStatus === 'PENDING';
                const acting = actingId === guide.id;
                return (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
                          {guide.profilePictureUrl ? (
                            <img src={guide.profilePictureUrl} alt="" className="h-10 w-10 object-cover" />
                          ) : (
                            <UserCheck className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guideName(guide)}</div>
                          <div className="text-sm text-gray-500">{guide.userEmail || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{joinLabels(guide.specialties, 'specialty')}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{joinLabels(guide.languages, 'language')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(guide.verificationStatus)}`}>
                        {guide.verificationStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {pending && (
                          <button
                            type="button"
                            onClick={() => approve(guide.id)}
                            disabled={acting}
                            className="inline-flex items-center px-3 py-2 border border-green-300 text-green-700 text-sm font-medium rounded-md hover:bg-green-50 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                        )}
                        {guide.verificationStatus !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => reject(guide.id)}
                            disabled={acting}
                            className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        )}
                        <Link
                          to={`/admin/guide/${guide.id}/edit`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GuideApprovalQueue;
