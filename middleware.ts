import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';

// Define routing configuration for reuse
export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'zh-HK'],

  // Default locale
  defaultLocale: 'en',

  // Locale prefix strategy - use 'always' for more reliable locale handling
  localePrefix: 'always',

  // Enable locale detection from Accept-Language header for first-time visitors
  localeDetection: true,
});

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
