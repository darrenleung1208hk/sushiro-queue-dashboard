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

  const handleLanguageChange = (newLocale: string) => {
    // Get the current pathname
    const currentPath = pathname;
    
    // Check if current path starts with a locale prefix
    const localePrefix = `/${locale}`;
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
      pathWithoutLocale = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
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
          {languageNames[locale as keyof typeof languageNames]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={locale === code ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
