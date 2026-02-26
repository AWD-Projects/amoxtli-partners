import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sileo';
import { ClerkErrorBoundary } from '@/components/clerk-error-boundary';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Amoxtli Partners',
  description: 'Partner referral program for Amoxtli',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider clerkJSUrl="/clerk/clerk.browser.js">
      <html lang="en">
        <body className={spaceGrotesk.className}>
          <ClerkErrorBoundary>
            {children}
          </ClerkErrorBoundary>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
