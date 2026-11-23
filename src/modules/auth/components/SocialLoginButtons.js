import React, { useEffect, useState } from 'react';
import { buildApiUrl, API_CONFIG } from '../../../shared/config/api';

const startOAuth = (provider) => {
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.OAUTH, { provider });
  const returnTo = encodeURIComponent(window.location.origin);
  window.location.assign(`${url}?returnTo=${returnTo}`);
};

const SocialLoginButtons = ({ onError }) => {
  const [providers, setProviders] = useState(null);
  const [starting, setStarting] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.PROVIDERS))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setProviders(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const begin = (provider, label) => {
    if (providers && providers[provider] === false) {
      onError?.(`${label} sign-in is not configured yet.`);
      return;
    }
    setStarting(provider);
    startOAuth(provider);
  };

  const googleOff = providers?.google === false;
  const facebookOff = providers?.facebook === false;

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => begin('google', 'Google')}
          disabled={googleOff || Boolean(starting)}
          title={googleOff ? 'Google sign-in is not configured yet' : 'Continue with Google'}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="ml-2">{starting === 'google' ? 'Redirecting...' : 'Google'}</span>
        </button>

        <button
          type="button"
          onClick={() => begin('facebook', 'Facebook')}
          disabled={facebookOff || Boolean(starting)}
          title={facebookOff ? 'Facebook sign-in is not configured yet' : 'Continue with Facebook'}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          <span className="ml-2">{starting === 'facebook' ? 'Redirecting...' : 'Facebook'}</span>
        </button>
      </div>
      {googleOff && facebookOff && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Add Google and Facebook credentials on the server to enable these buttons.
        </p>
      )}
    </div>
  );
};

export default SocialLoginButtons;
