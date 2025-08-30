import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'zh-HK'],

  // Default locale
  defaultLocale: 'en',

  // Locale detection strategy
  localeDetection: true,

  // Locale prefix strategy - use 'always' for more reliable locale handling
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
