import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Home() {
  // Get the Accept-Language header to detect preferred locale
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Default to English, but prefer Chinese if available
  let locale = 'en';
  if (acceptLanguage.includes('zh') || acceptLanguage.includes('zh-HK')) {
    locale = 'zh-HK';
  }

  redirect(`/${locale}/dashboard`);
}
