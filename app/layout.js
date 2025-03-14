import './globals.css';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'KI Sprachassistent',
  description: 'Ein KI-gestützter Sprachassistent mit Whisper, Llama und ElevenLabs',
  themeColor: '#4f46e5',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KI Sprachassistent',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://ki-sprachassistent.yourdomain.com/',
    title: 'KI Sprachassistent',
    description: 'Ein KI-gestützter Sprachassistent mit Whisper, Llama und ElevenLabs',
    siteName: 'KI Sprachassistent',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} dark-mode`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}