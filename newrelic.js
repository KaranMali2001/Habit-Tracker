"use strict";

/**
 * New Relic agent configuration for Vercel serverless functions
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || "HabitTracker"],

  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * This setting controls distributed tracing.
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * Serverless mode configuration for Vercel
   */
  serverless_mode: {
    enabled: true,
  },

  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces.
   */
  allow_all_headers: true,

  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations.
     */
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
      "response.headers.x*",
    ],
  },

  /**
   * Logging configuration
   */
  logging: {
    level: "info",
    filepath: "stdout", // For Vercel logs
    enabled: true,
  },

  /**
   * Error collection configuration
   */
  error_collector: {
    enabled: true,
    capture_events: true,
    max_event_samples_stored: 100,
  },

  /**
   * Browser monitoring configuration (disabled for API-only monitoring)
   */
  browser_monitoring: {
    enable: false,
  },

  /**
   * Automatic instrumentation for Next.js
   */
  instrumentation: {
    "@next/server": {
      enabled: true,
    },
  },

  /**
   * Performance configuration for serverless
   */
  performance_metrics: {
    enabled: true,
    capture_params: true,
  },
};
