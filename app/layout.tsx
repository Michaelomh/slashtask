import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'SlashTask',
    template: '%s | SlashTask',
  },
  description:
    'SlashTask is a personal task manager that helps you stay on top of your work, projects, and goals.',
  keywords: ['task manager', 'productivity', 'to-do list', 'project management'],
  authors: [{ name: 'SlashTask' }],
  creator: 'SlashTask',
  metadataBase: new URL('https://slashtask.app'),
  openGraph: {
    type: 'website',
    title: 'SlashTask',
    description:
      'A personal task manager that helps you stay on top of your work, projects, and goals.',
    siteName: 'SlashTask',
  },
  twitter: {
    card: 'summary',
    title: 'SlashTask',
    description:
      'A personal task manager that helps you stay on top of your work, projects, and goals.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
