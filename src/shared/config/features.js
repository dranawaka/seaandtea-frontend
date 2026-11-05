/**
 * Feature flags for MVP and phased rollouts.
 * Set REACT_APP_FEATURE_TOURS_ENABLED=true to enable the Tours feature when ready.
 */
export const FEATURE_TOURS_ENABLED =
  process.env.REACT_APP_FEATURE_TOURS_ENABLED === 'true';
