import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Providers } from '../providers';
import type { Metadata } from 'next';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale === 'zh-HK') {
    return {
      title: '壽司郎排隊儀表板',
      description: '實時監控壽司郎餐廳排隊狀況',
    };
  }

  return {
    title: 'Sushiro Queue Dashboard',
    description: 'Real-time queue monitoring for Sushiro restaurants',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-4">{children}</div>
        </div>
        <Toaster />
        <Sonner />
      </Providers>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh-HK' }];
}
