import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, DollarSign, Star, Calendar, TrendingUp, Eye, Edit3, Plus } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { useAuth } from '../context/AuthContext';
import { getTourImageUrl } from '../utils/imageUtils';

const GuideDashboard = ({ tours = [], stats = {} }) => {
  const { user, login, token } = useAuth();
  const recentTours = tours.slice(0, 3); // Show last 3 tours
  
  const defaultStats = {
    totalTours: tours.length,
    totalBookings: 0,
    averageRating: 0,
    totalRevenue: 0,
    activeTours: tours.filter(tour => tour.status === 'ACTIVE').length,
    thisMonthBookings: 0
  };

  const finalStats = { ...defaultStats, ...stats };

  // Handle profile picture update
  const handleProfilePictureUpdate = (newImageUrl) => {
    const updatedUser = { ...user, profilePictureUrl: newImageUrl };
    login(updatedUser, token);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Profile Picture Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <ProfilePictureUpload
            currentImageUrl={user?.profilePictureUrl}
            onImageUpdate={handleProfilePictureUpdate}
            userId={user?.id}
            userRole={user?.role}
            size="medium"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user?.firstName}!</h2>
            <p className="text-gray-600">Manage your tours and track your performance</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Dashboard Overview</h3>
        <p className="text-gray-600">Your tour performance and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Tours</p>
              <p className="text-2xl font-semibold text-blue-900">{finalStats.totalTours}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Bookings</p>
              <p className="text-2xl font-semibold text-green-900">{finalStats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Average Rating</p>
              <p className="text-2xl font-semibold text-yellow-900">
                {finalStats.averageRating ? finalStats.averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-purple-900">
                ${finalStats.totalRevenue ? finalStats.totalRevenue.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/guide-tours"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Tour
          </Link>
          <Link
            to="/guide-tours"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Tours
          </Link>
          <Link
            to="/guide-profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Recent Tours */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Recent Tours</h3>
          <Link
            to="/guide-tours"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all →
          </Link>
        </div>
        
        {recentTours.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No tours yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get started by creating your first tour
            </p>
            <Link
              to="/guide-tours"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTours.map((tour) => {
              const tourImg = getTourImageUrl(tour);
              return (
              <div key={tour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {tourImg ? (
                      <img
                        src={tourImg}
                        alt={tour.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{tour.title}</h4>
                    <p className="text-sm text-gray-500">{tour.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tour.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    tour.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tour.status}
                  </span>
                  <Link
                    to={`/tour/${tour.id}`}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tours</p>
                <p className="text-2xl font-semibold text-gray-900">{finalStats.activeTours}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {finalStats.activeTours > 0 ? 'Great! You have active tours available for booking.' : 'No active tours at the moment.'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">{finalStats.thisMonthBookings}</p>
                <p className="text-sm text-gray-500">bookings</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {finalStats.thisMonthBookings > 0 ? 'Keep up the great work!' : 'Focus on promoting your tours this month.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;

