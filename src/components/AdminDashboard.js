import React, { useState, useEffect } from 'react';
import { Shield, Users, CheckCircle, XCircle, Clock, Eye, UserCheck, AlertCircle } from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [unverifiedGuides, setUnverifiedGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load unverified guides on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadUnverifiedGuides();
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

  // Reject guide profile
  const rejectGuide = async (guideId) => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll just remove from the list
      // In a real implementation, you'd call a reject endpoint
      setUnverifiedGuides(prev => prev.filter(guide => guide.id !== guideId));
      setSuccess('Guide profile rejected successfully!');
    } catch (error) {
      console.error('Error rejecting guide:', error);
      setError('Failed to reject guide profile. Please try again.');
    } finally {
      setIsLoading(false);
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
