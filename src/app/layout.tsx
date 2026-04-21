import type { Metadata } from 'next';
import SessionProviderWrapper from '@/components/SessionProvider';
import GlobalLoader from '@/components/GlobalLoader';
import './globals.css';
import './swal-theme.css';

export const metadata: Metadata = {
  title: 'Digital Heroes — Play Golf. Win Prizes. Change Lives.',
  description:
    'A subscription platform combining golf performance tracking, monthly prize draws, and charitable giving.',
  keywords: ['golf', 'charity', 'prize draw', 'stableford', 'digital heroes'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Digital Heroes — Play Golf. Win Prizes. Change Lives.',
    description: 'Track golf scores, win monthly prizes, and support charities that matter.',
    type: 'website',
    url: 'https://digitalheroes.co.in',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
      </head>
      <body>
        {/* SessionProvider must be client-only — wrapper handles that */}
        <SessionProviderWrapper>
          {/* GlobalLoader provides useGlobalLoader() context + overlays to entire app */}
          <GlobalLoader>
            {children}
          </GlobalLoader>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
