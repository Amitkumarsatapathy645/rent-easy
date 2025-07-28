import './globals.css';
import type { Metadata } from 'next/';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RentEasy - Find Your Perfect Rental Home',
  description: 'Discover thousands of verified rental properties and connect directly with owners. Your dream home is just a click away.',
  icons: {
    icon: '/favicon.ico?v=2',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}