'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languageNames = {
  en: 'English',
  'zh-HK': '繁體中文',
};

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

  // Debug logging
  useEffect(() => {
    console.log('LanguageSwitcher - useLocale():', locale);
    console.log('LanguageSwitcher - pathnameLocale:', pathnameLocale);
    console.log('LanguageSwitcher - currentLocale (used):', currentLocale);
    console.log('LanguageSwitcher - Current pathname:', pathname);
  }, [locale, pathnameLocale, currentLocale, pathname]);

  const handleLanguageChange = (newLocale: string) => {
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
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {languageNames[currentLocale as keyof typeof languageNames]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={currentLocale === code ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
