/**
 * Feature flags for MVP and phased rollouts.
 * Set REACT_APP_FEATURE_TOURS_ENABLED=false to hide tour listings.
 *
 * MVP 1: guides pay a one-time onboarding fee off the site. Travelers register
 * and message guides. The site does not charge for tours or shop orders.
 * Set REACT_APP_FEATURE_SITE_PAYMENTS=true only when on-site checkout is in scope.
 */
export const FEATURE_TOURS_ENABLED =
  process.env.REACT_APP_FEATURE_TOURS_ENABLED !== 'false';

export const FEATURE_SITE_PAYMENTS =
  process.env.REACT_APP_FEATURE_SITE_PAYMENTS === 'true';
