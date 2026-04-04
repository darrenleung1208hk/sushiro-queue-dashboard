import type { Metadata } from 'next';
import { Inter, Noto_Sans_HK } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansHk = Noto_Sans_HK({
  variable: '--font-noto-sans-hk',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Sushiro Queue Dashboard',
  description: 'Real-time queue monitoring for Sushiro restaurants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.variable} ${notoSansHk.variable} font-sans`}>
        {children}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
