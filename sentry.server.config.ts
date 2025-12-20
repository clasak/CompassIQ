/**
 * Sentry Server Configuration
 * Tracks errors and performance on the server
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const env = event.contexts.runtime.env as Record<string, any>
      delete env.SUPABASE_SERVICE_ROLE_KEY
      delete env.UPSTASH_REDIS_REST_TOKEN
      delete env.SENTRY_AUTH_TOKEN
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }

    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    // Database connection timeouts (handled by retry logic)
    'ETIMEDOUT',
    'ECONNREFUSED',
  ],
})
