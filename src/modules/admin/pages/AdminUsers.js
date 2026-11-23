import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, RotateCcw, Search, Trash2, UserCheck, Users, UserX, X, XCircle } from 'lucide-react';
import { API_CONFIG, buildApiUrl, getAdminUserById, rejectGuideApi, resetUserReviews, verifyGuideApi } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';
import AdminShell from '../components/AdminShell';

const AdminUsers = () => {
  const { user, token } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [usersPage, setUsersPage] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [actingOnUserId, setActingOnUserId] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [resettingReviewUserId, setResettingReviewUserId] = useState(null);
  const [userSearchText, setUserSearchText] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    const search = (userSearchText || '').trim().toLowerCase();
    return allUsers.filter((u) => {
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const matchSearch = !search || name.includes(search) || email.includes(search);
      const matchRole = !userFilterRole || (u.role || 'USER') === userFilterRole;
      const active = u.isActive !== false;
      const matchStatus = !userFilterStatus || (userFilterStatus === 'active' && active) || (userFilterStatus === 'banned' && !active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, userSearchText, userFilterRole, userFilterStatus]);

  const loadAllUsers = async (page = 0, size = 20) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USERS)}?page=${page}&size=${size}&sort=createdAt,desc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.content ?? [];
        setAllUsers(list);
        setUsersPage((prev) => ({
          ...prev,
          page,
          size,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? list.length,
        }));
      } else {
        const errData = await response.json().catch(() => ({}));
        setUsersError(errData.message || errData.error || `Server error (${response.status}).`);
        setAllUsers([]);
      }
    } catch (err) {
      setAllUsers([]);
      setUsersError(err.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      loadAllUsers(0, 20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const guideIdFor = (u) => u.guideSummary?.guideId ?? u.guideSummary?.id ?? null;

  const approveGuide = async (guideId) => {
    try {
      setIsLoading(true);
      setError(null);
      await verifyGuideApi(guideId, token);
      setAllUsers((prev) => prev.map((u) => (
        guideIdFor(u) === guideId
          ? { ...u, guideSummary: { ...u.guideSummary, verificationStatus: 'VERIFIED' } }
          : u
      )));
      setSuccess('Guide profile approved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to approve guide profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const rejectGuide = async (guideId) => {
    if (!window.confirm('Reject this guide profile? They will stay in the system as rejected.')) return;
    try {
      setIsLoading(true);
      setError(null);
      await rejectGuideApi(guideId, token, 'Rejected during admin review');
      setAllUsers((prev) => prev.map((u) => (
        guideIdFor(u) === guideId
          ? { ...u, guideSummary: { ...u.guideSummary, verificationStatus: 'REJECTED' } }
          : u
      )));
      setSuccess('Guide profile rejected.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reject guide profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId) => {
    if (userId === user?.id) return;
    try {
      setActingOnUserId(userId);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_BAN, { id: userId }), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
        setSuccess('User banned.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to ban user');
      }
    } catch (err) {
      setError(err.message || 'Failed to ban user.');
    } finally {
      setActingOnUserId(null);
    }
  };

  const unbanUser = async (userId) => {
    try {
      setActingOnUserId(userId);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_UNBAN, { id: userId }), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
        setSuccess('User unbanned.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to unban user');
      }
    } catch (err) {
      setError(err.message || 'Failed to unban user.');
    } finally {
      setActingOnUserId(null);
    }
  };

  const openViewUser = async (userId) => {
    setViewUserId(userId);
    setUserDetail(null);
    setUserDetailLoading(true);
    setError(null);
    try {
      setUserDetail(await getAdminUserById(userId, token));
    } catch (err) {
      setError(err.message || 'Failed to load user details.');
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleResetReview = async (userId) => {
    if (!window.confirm('Reset all reviews for this user? This may clear or recalculate their review data.')) return;
    try {
      setResettingReviewUserId(userId);
      setError(null);
      await resetUserReviews(userId, token);
      setSuccess('User reviews reset successfully.');
      setTimeout(() => setSuccess(null), 3000);
      if (viewUserId === userId) {
        setUserDetail(await getAdminUserById(userId, token));
      }
    } catch (err) {
      setError(err.message || 'Failed to reset user reviews.');
    } finally {
      setResettingReviewUserId(null);
    }
  };

  const removeUser = async (userId) => {
    if (userId === user?.id) return;
    if (!window.confirm('Permanently remove this user and all their data (guide profile, tours, bookings, reviews)? This cannot be undone.')) return;
    try {
      setActingOnUserId(userId);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_REMOVE, { id: userId }), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok || response.status === 204) {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        setUsersPage((prev) => ({ ...prev, totalElements: Math.max(0, (prev.totalElements || 0) - 1) }));
        setSuccess('User removed.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to remove user');
      }
    } catch (err) {
      setError(err.message || 'Failed to remove user.');
    } finally {
      setActingOnUserId(null);
    }
  };

  return (
    <AdminShell title="Users" description="Search accounts, manage bans, and see which guides are still pending.">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="ml-3 text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {(userSearchText || userFilterRole || userFilterStatus)
                  ? `${filteredUsers.length} of ${usersPage.totalElements ?? allUsers.length}`
                  : (usersPage.totalElements ?? allUsers.length)} users
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadAllUsers(usersPage.page, usersPage.size)}
              disabled={usersLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearchText}
              onChange={(e) => setUserSearchText(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={userFilterRole}
            onChange={(e) => setUserFilterRole(e.target.value)}
            className="block py-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All roles</option>
            <option value="USER">USER</option>
            <option value="GUIDE">GUIDE</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select
            value={userFilterStatus}
            onChange={(e) => setUserFilterStatus(e.target.value)}
            className="block py-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          {(userSearchText || userFilterRole || userFilterStatus) && (
            <button
              type="button"
              onClick={() => { setUserSearchText(''); setUserFilterRole(''); setUserFilterStatus(''); }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          {usersError && (
            <div className="p-4 mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-md flex">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-amber-800">{usersError}</p>
                <button type="button" onClick={() => loadAllUsers(usersPage.page, usersPage.size)} className="mt-2 text-sm font-medium text-amber-700 underline">
                  Try again
                </button>
              </div>
            </div>
          )}
          {usersLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading users...</div>
          ) : allUsers.length === 0 && !usersError ? (
            <div className="p-6 text-center text-gray-500">No users found.</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No users match your search or filters.</div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => {
                    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
                    const role = u.role || 'USER';
                    const isActive = u.isActive !== false;
                    const isCurrentUser = u.id === user?.id;
                    const isAdmin = role === 'ADMIN';
                    const acting = actingOnUserId === u.id;
                    const guideId = guideIdFor(u);
                    const guideStatus = u.guideSummary?.verificationStatus;
                    const isPendingGuide = guideStatus === 'PENDING' && guideId;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{name}</div>
                          <div className="text-sm text-gray-500">ID: {u.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : role === 'GUIDE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>{role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isActive ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.guideSummary ? (
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              guideStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : guideStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {guideStatus || 'PENDING'}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {isCurrentUser ? (
                            <span className="text-gray-400">(you)</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <button type="button" onClick={() => openViewUser(u.id)} disabled={acting} className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 disabled:opacity-50">
                                <Eye className="h-4 w-4 mr-1" /> View
                              </button>
                              <button type="button" onClick={() => handleResetReview(u.id)} disabled={acting || resettingReviewUserId === u.id} className="inline-flex items-center px-2 py-1.5 border border-blue-300 text-blue-700 text-xs font-medium rounded hover:bg-blue-50 disabled:opacity-50">
                                <RotateCcw className={`h-4 w-4 mr-1 ${resettingReviewUserId === u.id ? 'animate-spin' : ''}`} /> Reset review
                              </button>
                              {isPendingGuide && (
                                <>
                                  <button type="button" onClick={() => approveGuide(guideId)} disabled={isLoading} className="inline-flex items-center px-2 py-1.5 border border-green-300 text-green-700 text-xs font-medium rounded hover:bg-green-50 disabled:opacity-50">
                                    <CheckCircle className="h-4 w-4 mr-1" /> Verify
                                  </button>
                                  <button type="button" onClick={() => rejectGuide(guideId)} disabled={isLoading} className="inline-flex items-center px-2 py-1.5 border border-red-300 text-red-700 text-xs font-medium rounded hover:bg-red-50 disabled:opacity-50">
                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                  </button>
                                </>
                              )}
                              {isActive ? (
                                <button type="button" onClick={() => banUser(u.id)} disabled={acting || isAdmin} className="inline-flex items-center px-2 py-1.5 border border-amber-300 text-amber-700 text-xs font-medium rounded hover:bg-amber-50 disabled:opacity-50">
                                  <UserX className="h-4 w-4 mr-1" /> Ban
                                </button>
                              ) : (
                                <button type="button" onClick={() => unbanUser(u.id)} disabled={acting} className="inline-flex items-center px-2 py-1.5 border border-green-300 text-green-700 text-xs font-medium rounded hover:bg-green-50 disabled:opacity-50">
                                  <UserCheck className="h-4 w-4 mr-1" /> Unban
                                </button>
                              )}
                              <button type="button" onClick={() => removeUser(u.id)} disabled={acting || isAdmin} className="inline-flex items-center px-2 py-1.5 border border-red-300 text-red-700 text-xs font-medium rounded hover:bg-red-50 disabled:opacity-50">
                                <Trash2 className="h-4 w-4 mr-1" /> Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(usersPage.totalPages > 0 || allUsers.length > 0) && (
                <div className="px-6 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      Page {usersPage.page + 1} of {Math.max(1, usersPage.totalPages)} ({usersPage.totalElements ?? allUsers.length} total)
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      Rows per page
                      <select
                        value={usersPage.size}
                        onChange={(e) => loadAllUsers(0, Number(e.target.value))}
                        disabled={usersLoading}
                        className="py-1 pl-2 pr-6 border border-gray-300 rounded text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => loadAllUsers(0, usersPage.size)} disabled={usersLoading || usersPage.page <= 0} className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" title="First page"><ChevronsLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => loadAllUsers(usersPage.page - 1, usersPage.size)} disabled={usersLoading || usersPage.page <= 0} className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" title="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => loadAllUsers(usersPage.page + 1, usersPage.size)} disabled={usersLoading || usersPage.page >= Math.max(1, usersPage.totalPages) - 1} className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" title="Next page"><ChevronRight className="h-4 w-4" /></button>
                    <button type="button" onClick={() => loadAllUsers(Math.max(0, usersPage.totalPages - 1), usersPage.size)} disabled={usersLoading || usersPage.page >= Math.max(1, usersPage.totalPages) - 1} className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" title="Last page"><ChevronsRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {viewUserId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => { setViewUserId(null); setUserDetail(null); }} aria-hidden="true" />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User details</h3>
                <button type="button" onClick={() => { setViewUserId(null); setUserDetail(null); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {userDetailLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
              ) : userDetail ? (
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-gray-900">{[userDetail.firstName, userDetail.lastName].filter(Boolean).join(' ') || '—'}</div>
                    <div className="text-sm text-gray-500">{userDetail.email}</div>
                  </div>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div><dt className="text-gray-500">User ID</dt><dd className="font-mono text-gray-900">{userDetail.id}</dd></div>
                    {userDetail.guideSummary && (
                      <div>
                        <dt className="text-gray-500">Guide</dt>
                        <dd className="text-gray-900">{userDetail.guideSummary.verificationStatus} · Tours: {userDetail.guideSummary.totalTours ?? 0}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="pt-4 border-t flex justify-end">
                    <button type="button" onClick={() => { setViewUserId(null); setUserDetail(null); }} className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Could not load user details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminUsers;
