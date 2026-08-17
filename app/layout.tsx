import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppStateProvider } from '@/lib/store';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sentinel — Emergency Response System',
  description:
    'A modern emergency response coordination platform for detecting, reporting, and managing incidents in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
