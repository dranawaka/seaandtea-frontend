import React, { useState } from 'react';
import { Search, User, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getMyGuideProfile, getPublicGuideProfile } from '../config/api';
import { useAuth } from '../context/AuthContext';

const GuideProfileTest = () => {
  const { token, isAuthenticated } = useAuth();
  const [guideId, setGuideId] = useState('');
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endpointType, setEndpointType] = useState('my-profile');

  const handleMyProfileSearch = async () => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to fetch your own guide profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setGuideData(null);
      setEndpointType('my-profile');

      console.log('🚀 Testing existing working endpoint: /guides/my-profile/exists');
      const data = await getMyGuideProfile(token);
      
      console.log('📄 My guide profile data received:', data);
      setGuideData(data);
    } catch (error) {
      console.error('❌ Error fetching my guide profile:', error);
      setError(error.message || 'Failed to fetch guide profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicProfileSearch = async (e) => {
    e.preventDefault();
    if (!guideId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setGuideData(null);
      setEndpointType('public');

      console.log(`🚀 Testing public API endpoint: /api/v1/guides/${guideId}`);
      const data = await getPublicGuideProfile(guideId);
      
      console.log('📄 Public guide profile data received:', data);
      setGuideData(data);
    } catch (error) {
      console.error('❌ Error fetching public guide profile:', error);
      setError(error.message || 'Failed to fetch guide profile');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setGuideData(null);
    setError(null);
    setGuideId('');
    setEndpointType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Guide Profile API Test
          </h1>
          <p className="text-lg text-gray-600">
            Test both the existing working endpoint and the public guide profile endpoint
          </p>
        </div>

        {/* Working Endpoint Test */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Existing Working Endpoint</h3>
          </div>
          <p className="text-green-700 mb-4">
            This endpoint is already working and pulling guide information: <code className="bg-green-100 px-2 py-1 rounded">/guides/my-profile/exists</code>
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">API Endpoint Details</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">GET /guides/my-profile/exists</code></p>
              <p><strong>Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080/api/v1</code></p>
              <p><strong>Authentication:</strong> Required (Bearer token)</p>
              <p><strong>Swagger:</strong> <a href="http://localhost:8080/api/v1/swagger-ui/index.html#/guide-controller/getMyGuideProfileIfExists" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View in Swagger UI</a></p>
            </div>
          </div>

          <button
            onClick={handleMyProfileSearch}
            disabled={loading || !isAuthenticated}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && endpointType === 'my-profile' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Test Working Endpoint
              </>
            )}
          </button>
          
          {!isAuthenticated && (
            <p className="text-sm text-green-600 mt-2">⚠️ You must be logged in to test this endpoint</p>
          )}
        </div>

        {/* Public Endpoint Test */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-blue-900 mb-4">Public Guide Profile Endpoint</h3>
          <form onSubmit={handlePublicProfileSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="guideId" className="block text-sm font-medium text-blue-700 mb-2">
                Guide ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                <input
                  type="text"
                  id="guideId"
                  value={guideId}
                  onChange={(e) => setGuideId(e.target.value)}
                  placeholder="Enter guide ID (e.g., 3)"
                  className="input-field pl-10 w-full"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !guideId.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && endpointType === 'public' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Test Public Endpoint
                  </>
                )}
              </button>
              {guideData || error ? (
                <button
                  type="button"
                  onClick={clearResults}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </form>

          <div className="bg-white rounded-lg p-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-2">API Endpoint Details</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">GET /guides/{guideId || ':id'}</code></p>
              <p><strong>Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080/api/v1</code></p>
              <p><strong>Authentication:</strong> Not required (public endpoint)</p>
              <p><strong>Example:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/api/v1/guides/3</code></p>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching guide profile...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                <strong>Possible causes:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                <li>Guide ID doesn't exist</li>
                <li>Backend server is not running</li>
                <li>API endpoint is not implemented</li>
                <li>Network connectivity issues</li>
                <li>Authentication required (for my-profile endpoint)</li>
              </ul>
            </div>
          </div>
        )}

        {guideData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900">Profile Retrieved Successfully!</h3>
            </div>

            {/* Endpoint Used */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Endpoint Used:</strong> {endpointType === 'my-profile' ? 
                  <code className="bg-blue-100 px-2 py-1 rounded">/guides/my-profile/exists</code> : 
                  <code className="bg-blue-100 px-2 py-1 rounded">/guides/{guideId}</code>
                }
              </p>
            </div>

            {/* Profile Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> {guideData.id}</p>
                  <p><span className="font-medium">Name:</span> {guideData.firstName} {guideData.lastName}</p>
                  <p><span className="font-medium">Email:</span> {guideData.email}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      guideData.verificationStatus === 'VERIFIED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {guideData.verificationStatus || 'PENDING'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Rates & Availability</h4>
                <div className="space-y-2 text-sm">
                  {guideData.hourlyRate && (
                    <p><span className="font-medium">Hourly Rate:</span> ${guideData.hourlyRate}</p>
                  )}
                  {guideData.dailyRate && (
                    <p><span className="font-medium">Daily Rate:</span> ${guideData.dailyRate}</p>
                  )}
                  <p><span className="font-medium">Available:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      guideData.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {guideData.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </p>
                  {guideData.responseTimeHours && (
                    <p><span className="font-medium">Response Time:</span> {guideData.responseTimeHours}h</p>
                  )}
                </div>
              </div>
            </div>

            {/* Raw Data */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Raw API Response</h4>
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <pre className="text-xs text-gray-800 overflow-x-auto">
                  {JSON.stringify(guideData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="font-medium text-gray-900 mb-4">How to Use These APIs</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Working Endpoint (Recommended)</h4>
              <p>Use <code className="bg-gray-100 px-2 py-1 rounded">getMyGuideProfile(token)</code> to fetch the current user's guide profile.</p>
              <p className="text-xs text-gray-600 mt-1">This endpoint is already working and pulling guide information.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">2. Public Endpoint</h4>
              <p>Use <code className="bg-gray-100 px-2 py-1 rounded">getPublicGuideProfile(guideId)</code> to fetch any guide's profile by ID.</p>
              <p className="text-xs text-gray-600 mt-1">This endpoint may need backend implementation.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">3. Error Handling</h4>
              <p>Always wrap API calls in try-catch blocks for proper error handling.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfileTest;
