import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
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
    <ClerkProvider>
      <html lang="en">
        <body className={spaceGrotesk.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
