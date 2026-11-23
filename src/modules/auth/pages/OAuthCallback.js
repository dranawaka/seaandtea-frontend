import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_CONFIG } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';

let capturedOAuthResult = null;

const readOAuthResult = () => {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(hash);
  const fromHash = {
    token: params.get('token'),
    error: params.get('error')
  };
  if (fromHash.token || fromHash.error) {
    capturedOAuthResult = fromHash;
    window.history.replaceState(null, '', window.location.pathname);
    window.setTimeout(() => {
      capturedOAuthResult = null;
    }, 0);
    return fromHash;
  }
  if (capturedOAuthResult) {
    return capturedOAuthResult;
  }
  return { token: null, error: null };
};

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [oauthResult] = useState(readOAuthResult);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = oauthResult.token;
    const oauthError = oauthResult.error;

    if (oauthError) {
      setError(oauthError);
      return undefined;
    }
    if (!token) {
      setError('Social sign-in did not return a session. Please try again.');
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USERS.PROFILE), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || 'Could not finish sign-in.');
        }
        if (cancelled) return;
        login(data, token);
        const next = sessionStorage.getItem('postLoginPath');
        sessionStorage.removeItem('postLoginPath');
        navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : '/', { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not finish sign-in.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [login, navigate, oauthResult]);

  return (
    <div className="min-h-screen auth-shell flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card rounded-3xl border border-primary-100 sm:px-10 text-center">
          {error ? (
            <>
              <h2 className="font-display text-2xl font-medium text-primary-900">Sign-in stopped</h2>
              <p className="mt-3 text-sm text-red-600">{error}</p>
              <div className="mt-6 flex justify-center gap-4 text-sm">
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Back to sign in</Link>
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Create an account</Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
              <p className="mt-4 text-sm text-gray-600">Signing you in...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
