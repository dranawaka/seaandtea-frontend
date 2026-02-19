import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, CheckCircle, XCircle, Eye, UserCheck, AlertCircle, Trash2, Edit2, ShoppingBag, UserX, ChevronLeft, ChevronRight, RotateCcw, X, Search, ChevronsLeft, ChevronsRight, Plus, Newspaper } from 'lucide-react';
import { buildApiUrl, API_CONFIG, getAllGuides, getAdminUserById, resetUserReviews, deleteProductApi, listAllNewsAdminApi, deleteNewsPostApi } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fetchProductsFromApi } from '../data/shopProducts';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [allGuides, setAllGuides] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [allNews, setAllNews] = useState([]);
  const [newsPage, setNewsPage] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [deletingNewsId, setDeletingNewsId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter users by search and filters (client-side on current page)
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

  // Load data on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAllGuides();
      loadAllProducts();
      loadAllUsers(0, 20);
      loadAllNews(0, 10);
    }
  }, [user]);

  // Verify guide profile (from user management)
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
        setTimeout(() => setSuccess(null), 3000);
        loadAllGuides();
        loadAllUsers(usersPage.page, usersPage.size);
      } else {
        throw new Error('Failed to approve guide profile');
      }
    } catch (err) {
      console.error('Error approving guide:', err);
      setError(err.message || 'Failed to approve guide profile.');
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
        setAllGuides(prev => prev.filter(g => g.id !== guideId));
        setSuccess('Guide profile rejected and removed.');
        setTimeout(() => setSuccess(null), 3000);
        loadAllUsers(usersPage.page, usersPage.size);
      } else {
        throw new Error('Failed to reject guide');
      }
    } catch (err) {
      console.error('Error rejecting guide:', err);
      setError(err.message || 'Failed to reject guide profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve guide ID for a user (from guideSummary or allGuides)
  const getGuideIdForUser = (u) => u.guideSummary?.id ?? allGuides.find(g => g.userId === u.id || g.user?.id === u.id)?.id;

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

  // View user details (admin) – GET /admin/users/{id}
  const openViewUser = async (userId) => {
    setViewUserId(userId);
    setUserDetail(null);
    setUserDetailLoading(true);
    setError(null);
    try {
      const data = await getAdminUserById(userId, token);
      setUserDetail(data);
    } catch (err) {
      console.error('Error loading user detail:', err);
      setError(err.message || 'Failed to load user details.');
    } finally {
      setUserDetailLoading(false);
    }
  };

  const closeViewUser = () => {
    setViewUserId(null);
    setUserDetail(null);
  };

  // Reset reviews for user (admin) – POST /admin/users/{id}/reviews/reset
  const handleResetReview = async (userId) => {
    if (!window.confirm('Reset all reviews for this user? This may clear or recalculate their review data.')) return;
    try {
      setResettingReviewUserId(userId);
      setError(null);
      await resetUserReviews(userId, token);
      setSuccess('User reviews reset successfully.');
      setTimeout(() => setSuccess(null), 3000);
      if (viewUserId === userId) {
        const data = await getAdminUserById(userId, token);
        setUserDetail(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset user reviews.');
    } finally {
      setResettingReviewUserId(null);
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

  // Load products from API only (no hardcoded or local fallback)
  const loadAllProducts = async () => {
    setProductsLoading(true);
    setError(null);
    try {
      const fromApi = await fetchProductsFromApi();
      setAllProducts(Array.isArray(fromApi) ? fromApi : []);
    } catch (err) {
      console.warn('Products API unavailable:', err);
      setAllProducts([]);
      setError(err.message || 'Failed to load products. Check that the backend is running.');
    } finally {
      setProductsLoading(false);
    }
  };

  // Delete product (admin) via API or local
  const deleteProduct = async (productId) => {
    if (!window.confirm('Remove this product from the shop? This cannot be undone.')) return;
    try {
      if (token) {
        await deleteProductApi(productId, token);
        setSuccess('Product removed successfully.');
      } else {
        setAllProducts(prev => prev.filter(p => p.id !== productId));
        setSuccess('Product removed successfully.');
      }
      setAllProducts(prev => prev.filter(p => p.id !== productId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove product.');
    }
  };

  // Load all news posts (admin) – GET /news/admin/all
  const loadAllNews = async (page = 0, size = 10) => {
    try {
      setNewsLoading(true);
      setError(null);
      const data = await listAllNewsAdminApi({ page, size }, token);
      const list = data.content ?? [];
      setAllNews(list);
      setNewsPage(prev => ({
        ...prev,
        page: data.number ?? page,
        size: data.size ?? size,
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? list.length
      }));
    } catch (err) {
      console.error('Error loading news:', err);
      setAllNews([]);
      setError(err.message || 'Failed to load news posts.');
    } finally {
      setNewsLoading(false);
    }
  };

  // Delete news post (admin)
  const deleteNewsPost = async (postId) => {
    if (!window.confirm('Permanently delete this post and all its likes and comments? This cannot be undone.')) return;
    try {
      setDeletingNewsId(postId);
      setError(null);
      await deleteNewsPostApi(postId, token);
      setAllNews(prev => prev.filter(p => p.id !== postId));
      setNewsPage(prev => ({ ...prev, totalElements: Math.max(0, (prev.totalElements || 0) - 1) }));
      setSuccess('Post deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    } finally {
      setDeletingNewsId(null);
    }
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
                  {(userSearchText || userFilterRole || userFilterStatus) ? `${filteredUsers.length} of ${usersPage.totalElements ?? allUsers.length}` : (usersPage.totalElements ?? allUsers.length)} users
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
          {/* Search and filters */}
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
              className="block py-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All roles</option>
              <option value="USER">USER</option>
              <option value="GUIDE">GUIDE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select
              value={userFilterStatus}
              onChange={(e) => setUserFilterStatus(e.target.value)}
              className="block py-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No users match your search or filters.{' '}
                <button type="button" onClick={() => { setUserSearchText(''); setUserFilterRole(''); setUserFilterStatus(''); }} className="text-primary-600 hover:underline">Clear filters</button>
              </div>
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
                      const email = u.email || '—';
                      const role = u.role || 'USER';
                      const isActive = u.isActive !== false;
                      const isCurrentUser = u.id === user?.id;
                      const isAdmin = role === 'ADMIN';
                      const acting = actingOnUserId === u.id;
                      const guideSummary = u.guideSummary;
                      const guideId = getGuideIdForUser(u);
                      const isPendingGuide = guideSummary?.verificationStatus === 'PENDING' && guideId;
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
                              <span title={`${guideSummary.verificationStatus}, Tours: ${guideSummary.totalTours ?? 0}`}>
                                {guideSummary.verificationStatus === 'PENDING' ? 'Pending · ' : ''}Guide · {guideSummary.totalTours ?? 0} tours
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
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => openViewUser(u.id)}
                                  disabled={acting}
                                  title="View user details and reviews"
                                  className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetReview(u.id)}
                                  disabled={acting || resettingReviewUserId === u.id}
                                  title="Reset reviews for this user"
                                  className="inline-flex items-center px-2 py-1.5 border border-blue-300 text-blue-700 text-xs font-medium rounded hover:bg-blue-50 disabled:opacity-50"
                                >
                                  <RotateCcw className={`h-4 w-4 mr-1 ${resettingReviewUserId === u.id ? 'animate-spin' : ''}`} />
                                  Reset review
                                </button>
                                {isPendingGuide && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => approveGuide(guideId)}
                                      disabled={isLoading}
                                      title="Verify guide profile"
                                      className="inline-flex items-center px-2 py-1.5 border border-green-300 text-green-700 text-xs font-medium rounded hover:bg-green-50 disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Verify
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => rejectGuide(guideId)}
                                      disabled={isLoading}
                                      title="Reject and remove guide profile"
                                      className="inline-flex items-center px-2 py-1.5 border border-red-300 text-red-700 text-xs font-medium rounded hover:bg-red-50 disabled:opacity-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </button>
                                  </>
                                )}
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
                {/* Pagination */}
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
                          className="py-1 pl-2 pr-6 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => loadAllUsers(0, usersPage.size)}
                        disabled={usersLoading || usersPage.page <= 0}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="First page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllUsers(usersPage.page - 1, usersPage.size)}
                        disabled={usersLoading || usersPage.page <= 0}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllUsers(usersPage.page + 1, usersPage.size)}
                        disabled={usersLoading || usersPage.page >= Math.max(1, usersPage.totalPages) - 1}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllUsers(Math.max(0, usersPage.totalPages - 1), usersPage.size)}
                        disabled={usersLoading || usersPage.page >= Math.max(1, usersPage.totalPages) - 1}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Last page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* View User Modal */}
        {viewUserId && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50" onClick={closeViewUser} aria-hidden="true" />
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User details</h3>
                  <button
                    type="button"
                    onClick={closeViewUser}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {userDetailLoading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading...</p>
                  </div>
                ) : userDetail ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {userDetail.profilePictureUrl ? (
                          <img src={userDetail.profilePictureUrl} alt="" className="h-14 w-14 object-cover" />
                        ) : (
                          <Users className="h-7 w-7 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {[userDetail.firstName, userDetail.lastName].filter(Boolean).join(' ') || '—'}
                        </div>
                        <div className="text-sm text-gray-500">{userDetail.email}</div>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            userDetail.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            userDetail.role === 'GUIDE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userDetail.role || 'USER'}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${userDetail.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {userDetail.isActive !== false ? 'Active' : 'Banned'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div><dt className="text-gray-500">User ID</dt><dd className="font-mono text-gray-900">{userDetail.id}</dd></div>
                      {userDetail.guideSummary && (
                        <div>
                          <dt className="text-gray-500">Guide</dt>
                          <dd className="text-gray-900">Verified: {String(userDetail.guideSummary.verificationStatus)} · Tours: {userDetail.guideSummary.totalTours ?? 0}</dd>
                        </div>
                      )}
                      {(userDetail.reviewCount != null || userDetail.totalReviews != null) && (
                        <div>
                          <dt className="text-gray-500">Reviews</dt>
                          <dd className="text-gray-900">{userDetail.reviewCount ?? userDetail.totalReviews ?? 0}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="pt-4 border-t flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetReview(userDetail.id)}
                        disabled={resettingReviewUserId === userDetail.id}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-50 disabled:opacity-50"
                      >
                        <RotateCcw className={`h-4 w-4 mr-2 ${resettingReviewUserId === userDetail.id ? 'animate-spin' : ''}`} />
                        Reset review
                      </button>
                      <button
                        type="button"
                        onClick={closeViewUser}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                      >
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

        {/* All Products - Admin edit/remove */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {allProducts.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/product/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add product
                </Link>
                <button
                  onClick={loadAllProducts}
                  disabled={productsLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {productsLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading products...</div>
            ) : allProducts.length === 0 ? (
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

        {/* News & Posts */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Newspaper className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">News & Posts</h2>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {newsPage.totalElements ?? allNews.length} posts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/news/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create post
                </Link>
                <button
                  onClick={() => loadAllNews(newsPage.page, newsPage.size)}
                  disabled={newsLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {newsLoading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading news...</div>
            ) : allNews.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No posts yet. Create one to get started.</div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes / Comments</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allNews.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{p.title}</div>
                          {p.bodySummary && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{p.bodySummary}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.authorDisplayName || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {p.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(p.likeCount ?? 0)} / {(p.commentCount ?? 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/news/${p.id}/edit`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteNewsPost(p.id)}
                              disabled={deletingNewsId === p.id}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(newsPage.totalPages > 1 || allNews.length >= newsPage.size) && (
                  <div className="px-6 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                      Page {newsPage.page + 1} of {Math.max(1, newsPage.totalPages)} ({newsPage.totalElements} total)
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => loadAllNews(0, newsPage.size)}
                        disabled={newsLoading || newsPage.page <= 0}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllNews(newsPage.page - 1, newsPage.size)}
                        disabled={newsLoading || newsPage.page <= 0}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllNews(newsPage.page + 1, newsPage.size)}
                        disabled={newsLoading || newsPage.page >= Math.max(1, newsPage.totalPages) - 1}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllNews(Math.max(0, newsPage.totalPages - 1), newsPage.size)}
                        disabled={newsLoading || newsPage.page >= Math.max(1, newsPage.totalPages) - 1}
                        className="inline-flex items-center p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    <dd className="text-lg font-medium text-gray-900">{allGuides.length}</dd>
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
