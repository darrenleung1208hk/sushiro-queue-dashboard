import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';

// Supported locales - should match middleware configuration
const SUPPORTED_LOCALES = ['en', 'zh-HK'] as const;
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Determines the best locale for the user based on:
 * 1. Stored preference (NEXT_LOCALE cookie) - highest priority
 * 2. Browser language (Accept-Language header) - fallback for first-time visitors
 * 3. Default locale (en) - final fallback
 */
function detectLocale(
  storedLocale: string | undefined,
  acceptLanguage: string
): string {
  // Priority 1: Check for stored user preference
  if (
    storedLocale &&
    SUPPORTED_LOCALES.includes(
      storedLocale as (typeof SUPPORTED_LOCALES)[number]
    )
  ) {
    return storedLocale;
  }

  // Priority 2: Detect from browser's Accept-Language header
  // Check for Chinese language preference (zh, zh-HK, zh-TW, zh-CN, etc.)
  if (acceptLanguage.includes('zh')) {
    return 'zh-HK';
  }

  // Priority 3: Default to English
  return DEFAULT_LOCALE;
}

export default async function Home() {
  // Get stored locale preference from cookie
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  // Get the Accept-Language header for first-time visitor detection
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Determine the best locale for this user
  const locale = detectLocale(storedLocale, acceptLanguage);

  redirect(`/${locale}/dashboard`);
}
