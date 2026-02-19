import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, CheckCircle, XCircle, Clock, Eye, UserCheck, AlertCircle, Trash2, MapPin, Edit2, ShoppingBag, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildApiUrl, API_CONFIG, getAllGuides, getPublicVerifiedToursPaginated } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getProducts, saveProducts } from '../data/shopProducts';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [unverifiedGuides, setUnverifiedGuides] = useState([]);
  const [allGuides, setAllGuides] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [usersPage, setUsersPage] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [actingOnUserId, setActingOnUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [toursLoading, setToursLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load unverified guides on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadUnverifiedGuides();
      loadAllGuides();
      loadAllTours();
      loadAllProducts();
      loadAllUsers(0, 20);
    }
  }, [user]);

  // Load unverified guide profiles
  const loadUnverifiedGuides = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.UNVERIFIED_GUIDES), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnverifiedGuides(data.content || data || []);
      } else {
        throw new Error('Failed to load unverified guides');
      }
    } catch (error) {
      console.error('Error loading unverified guides:', error);
      setError('Failed to load unverified guides. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Approve guide profile
  const approveGuide = async (guideId) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.VERIFY_GUIDE, { id: guideId }), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Guide profile approved successfully!');
        // Remove the approved guide from the list
        setUnverifiedGuides(prev => prev.filter(guide => guide.id !== guideId));
        // Reload the list after a short delay
        setTimeout(() => {
          loadUnverifiedGuides();
        }, 1000);
      } else {
        throw new Error('Failed to approve guide profile');
      }
    } catch (error) {
      console.error('Error approving guide:', error);
      setError('Failed to approve guide profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reject guide profile (removes guide via API)
  const rejectGuide = async (guideId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DELETE, { id: guideId }), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok || response.status === 204) {
        setUnverifiedGuides(prev => prev.filter(guide => guide.id !== guideId));
        setAllGuides(prev => prev.filter(guide => guide.id !== guideId));
        setSuccess('Guide profile rejected and removed.');
      } else {
        throw new Error('Failed to reject guide');
      }
    } catch (err) {
      console.error('Error rejecting guide:', err);
      setError('Failed to reject guide profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load all guides for admin list
  const loadAllGuides = async () => {
    try {
      setGuidesLoading(true);
      const data = await getAllGuides();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setAllGuides(list);
    } catch (err) {
      console.error('Error loading guides:', err);
    } finally {
      setGuidesLoading(false);
    }
  };

  // Load all tours for admin list (paginated, fetch first 100)
  const loadAllTours = async () => {
    try {
      setToursLoading(true);
      const data = await getPublicVerifiedToursPaginated(0, 100, {});
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setAllTours(list);
    } catch (err) {
      console.error('Error loading tours:', err);
    } finally {
      setToursLoading(false);
    }
  };

  // Delete guide (admin)
  const deleteGuide = async (guideId) => {
    if (!window.confirm('Permanently remove this guide? This cannot be undone.')) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.DELETE, { id: guideId }), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok || response.status === 204) {
        setAllGuides(prev => prev.filter(g => g.id !== guideId));
        setUnverifiedGuides(prev => prev.filter(g => g.id !== guideId));
        setSuccess('Guide removed successfully.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete guide');
      }
    } catch (err) {
      console.error('Error deleting guide:', err);
      setError(err.message || 'Failed to remove guide.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete tour (admin)
  const deleteTour = async (tourId) => {
    if (!window.confirm('Permanently remove this tour? This cannot be undone.')) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TOURS.DELETE, { id: tourId }), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok || response.status === 204) {
        setAllTours(prev => prev.filter(t => t.id !== tourId));
        setSuccess('Tour removed successfully.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete tour');
      }
    } catch (err) {
      console.error('Error deleting tour:', err);
      setError(err.message || 'Failed to remove tour.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load all users (admin) – paginated per Swagger: GET /admin/users?page=0&size=20&sort=createdAt,desc
  const loadAllUsers = async (page = 0, size = 20) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USERS)}?page=${page}&size=${size}&sort=createdAt,desc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.content ?? [];
        const totalPages = data.totalPages ?? 0;
        const totalElements = data.totalElements ?? list.length;
        setAllUsers(list);
        setUsersPage(prev => ({ ...prev, page, size, totalPages, totalElements }));
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || errData.error || (typeof errData === 'string' ? errData : null) || `Server error (${response.status}).`;
        setUsersError(msg);
        setAllUsers([]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setAllUsers([]);
      setUsersError(err.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Ban user (admin) – PATCH /admin/users/{id}/ban
  const banUser = async (userId) => {
    if (userId === user?.id) return;
    try {
      setActingOnUserId(userId);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_BAN, { id: userId }), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, isActive: false } : u)));
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

  // Unban user (admin) – PATCH /admin/users/{id}/unban
  const unbanUser = async (userId) => {
    try {
      setActingOnUserId(userId);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_UNBAN, { id: userId }), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, isActive: true } : u)));
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

  // Remove user permanently (admin) – DELETE /admin/users/{id}
  const removeUser = async (userId) => {
    if (userId === user?.id) return;
    if (!window.confirm('Permanently remove this user and all their data (guide profile, tours, bookings, reviews)? This cannot be undone.')) return;
    try {
      setActingOnUserId(userId);
      setError(null);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USER_REMOVE, { id: userId }), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok || response.status === 200) {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        setUsersPage(prev => ({ ...prev, totalElements: Math.max(0, (prev.totalElements || 0) - 1) }));
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

  // Load products (from shared storage)
  const loadAllProducts = () => {
    setAllProducts(getProducts());
  };

  // Delete product (admin)
  const deleteProduct = (productId) => {
    if (!window.confirm('Remove this product from the shop? This cannot be undone.')) return;
    const updated = allProducts.filter(p => p.id !== productId);
    saveProducts(updated);
    setAllProducts(updated);
    setSuccess('Product removed successfully.');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Early return if not admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <Shield className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">
            This page is only accessible to administrators. Your current role is: <strong>{user?.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage users, guides, and system operations</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {usersPage.totalElements ?? allUsers.length} users
                </span>
              </div>
              <button
                onClick={loadAllUsers}
                disabled={usersLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {usersError && (
              <div className="p-4 mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 mr-2" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">{usersError}</p>
                  <button
                    type="button"
                    onClick={loadAllUsers}
                    disabled={usersLoading}
                    className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline disabled:opacity-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
            {usersLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2" />
                Loading users...
              </div>
            ) : allUsers.length === 0 && !usersError ? (
              <div className="p-6 text-center text-gray-500">
                No users found. If you expect to see users here, ensure the backend exposes GET /admin/users.
              </div>
            ) : allUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No users to display.</div>
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
                    {allUsers.map((u) => {
                      const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
                      const email = u.email || '—';
                      const role = u.role || 'USER';
                      const isActive = u.isActive !== false;
                      const isCurrentUser = u.id === user?.id;
                      const isAdmin = role === 'ADMIN';
                      const acting = actingOnUserId === u.id;
                      const guideSummary = u.guideSummary;
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                {u.profilePictureUrl ? (
                                  <img src={u.profilePictureUrl} alt="" className="h-10 w-10 object-cover" />
                                ) : (
                                  <Users className="h-5 w-5 text-primary-600" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{name}</div>
                                <div className="text-sm text-gray-500">ID: {u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              role === 'GUIDE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {isActive ? 'Active' : 'Banned'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {guideSummary ? (
                              <span title={`Verified: ${guideSummary.verificationStatus}, Tours: ${guideSummary.totalTours ?? 0}`}>
                                Guide · {guideSummary.totalTours ?? 0} tours
                              </span>
                            ) : role === 'GUIDE' ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {isCurrentUser ? (
                              <span className="text-gray-400">(you)</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => banUser(u.id)}
                                    disabled={acting || isAdmin}
                                    title={isAdmin ? 'Cannot ban admin users' : 'Ban user'}
                                    className="inline-flex items-center px-2 py-1.5 border border-amber-300 text-amber-700 text-xs font-medium rounded hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Ban
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => unbanUser(u.id)}
                                    disabled={acting}
                                    className="inline-flex items-center px-2 py-1.5 border border-green-300 text-green-700 text-xs font-medium rounded hover:bg-green-50 disabled:opacity-50"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Unban
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeUser(u.id)}
                                  disabled={acting || isAdmin}
                                  title={isAdmin ? 'Cannot remove admin users' : 'Permanently remove user'}
                                  className="inline-flex items-center px-2 py-1.5 border border-red-300 text-red-700 text-xs font-medium rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {usersPage.totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Page {usersPage.page + 1} of {usersPage.totalPages} ({usersPage.totalElements} total)
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadAllUsers(usersPage.page - 1, usersPage.size)}
                        disabled={usersLoading || usersPage.page <= 0}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllUsers(usersPage.page + 1, usersPage.size)}
                        disabled={usersLoading || usersPage.page >= usersPage.totalPages - 1}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Unverified Guides Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Unverified Guide Profiles</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {unverifiedGuides.length} pending
                </span>
              </div>
              <button
                onClick={loadUnverifiedGuides}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Loading unverified guides...
                </div>
              </div>
            ) : unverifiedGuides.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All guides verified!</h3>
                <p className="text-gray-500">There are no pending guide profile verifications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guide
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialties
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Languages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unverifiedGuides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {guide.profilePictureUrl ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={guide.profilePictureUrl}
                                  alt={`${guide.firstName} ${guide.lastName}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {guide.firstName} {guide.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {guide.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guide.email}</div>
                          <div className="text-sm text-gray-500">{guide.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {(guide.specialties || []).map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {typeof specialty === 'string' ? specialty : specialty.specialty || 'Unknown Specialty'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {(guide.languages || []).map((language, index) => {
                              const languageText = typeof language === 'string' ? language : language.language || 'Unknown Language';
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {languageText}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveGuide(guide.id)}
                              disabled={isLoading}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => rejectGuide(guide.id)}
                              disabled={isLoading}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* All Guides - Admin remove */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">All Guides</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {allGuides.length}
                </span>
              </div>
              <button
                onClick={loadAllGuides}
                disabled={guidesLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {guidesLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading guides...</div>
            ) : allGuides.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No guides found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allGuides.map((guide) => {
                    const name = guide.firstName && guide.lastName
                      ? `${guide.firstName} ${guide.lastName}`
                      : guide.fullName || guide.user?.firstName
                        ? `${guide.user?.firstName || ''} ${guide.user?.lastName || ''}`.trim()
                        : `Guide #${guide.id}`;
                    const email = guide.email || guide.user?.email || '—';
                    return (
                      <tr key={guide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {(guide.profilePictureUrl || guide.profileImageUrl) ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={guide.profilePictureUrl || guide.profileImageUrl}
                                  alt={name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{name}</div>
                              <div className="text-sm text-gray-500">ID: {guide.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/admin/guide/${guide.id}/edit`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteGuide(guide.id)}
                              disabled={isLoading}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* All Tours - Admin remove */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">All Tours</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {allTours.length}
                </span>
              </div>
              <button
                onClick={loadAllTours}
                disabled={toursLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {toursLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading tours...</div>
            ) : allTours.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No tours found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location / Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTours.map((tour) => {
                    const title = tour.title || tour.name || `Tour #${tour.id}`;
                    const location = tour.location || tour.region || '—';
                    const price = tour.price != null ? `$${Number(tour.price).toFixed(0)}` : '—';
                    return (
                      <tr key={tour.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{title}</div>
                          <div className="text-sm text-gray-500">ID: {tour.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location} · {price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/edit-tour/${tour.id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteTour(tour.id)}
                              disabled={isLoading}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* All Products - Admin edit/remove */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Shop Products</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {allProducts.length}
                </span>
              </div>
              <button
                onClick={loadAllProducts}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {allProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No products found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(product.price).toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/product/${product.id}/edit`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{usersPage.totalElements ?? allUsers.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verified Guides</dt>
                    <dd className="text-lg font-medium text-gray-900">-</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Verifications</dt>
                    <dd className="text-lg font-medium text-gray-900">{unverifiedGuides.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
