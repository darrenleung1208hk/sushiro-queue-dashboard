'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { trackLanguageChanged } from '@/lib/analytics';

// Cookie configuration for locale preference
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Sets the locale preference cookie
 * This cookie is read by next-intl middleware to determine user's preferred locale
 */
function setLocaleCookie(locale: string) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // Fallback locale detection from pathname
  const pathnameLocale = pathname.split('/')[1];
  const isPathnameLocaleValid = ['en', 'zh-HK'].includes(pathnameLocale);

  // Use the more reliable locale source
  const currentLocale = isPathnameLocaleValid ? pathnameLocale : locale;

  const handleLanguageChange = (newLocale: string) => {
    // Track the language change
    trackLanguageChanged(currentLocale, newLocale);

    // Store the user's locale preference in a cookie
    // This will be read by the middleware on subsequent visits
    setLocaleCookie(newLocale);

    // Get the current pathname
    const currentPath = pathname;

    // Check if current path starts with a locale prefix
    const localePrefix = `/${currentLocale}`;
    const hasLocalePrefix = currentPath.startsWith(localePrefix);

    // Extract the path without locale
    let pathWithoutLocale = '';
    if (hasLocalePrefix) {
      // Remove the locale prefix and any trailing slash
      pathWithoutLocale = currentPath.replace(localePrefix, '');
      // Ensure we don't have a leading slash
      if (pathWithoutLocale.startsWith('/')) {
        pathWithoutLocale = pathWithoutLocale.substring(1);
      }
    } else {
      // No locale prefix, use the full path (remove leading slash)
      pathWithoutLocale = currentPath.startsWith('/')
        ? currentPath.substring(1)
        : currentPath;
    }

    // Construct the new path
    const newPath = `/${newLocale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;

    // Navigate to the new locale path
    // The cookie ensures the preference is remembered for future visits
    router.push(newPath);
    router.refresh();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-0" />
          {t(`common.languages.${currentLocale}`)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(['en', 'zh-HK'] as const).map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cn(
              'cursor-pointer',
              currentLocale === code ? 'bg-accent' : ''
            )}
          >
            {t(`common.languages.${code}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
