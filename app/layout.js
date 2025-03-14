import './globals.css';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SupabaseAuthProvider } from './auth/SupabaseAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'KI Sprachassistent',
  description: 'Ein KI-gestützter Sprachassistent mit Whisper, Llama und ElevenLabs',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} dark`}>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}