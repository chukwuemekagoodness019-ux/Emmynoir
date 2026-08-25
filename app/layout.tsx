import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { BagProvider } from '@/components/site/bag-context';
import { Toaster } from '@/components/ui/toaster';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EMMY NOIR — Modern Fashion House',
  description:
    'EMMY NOIR is a premium fashion house featuring EMMY WEARS and EMMY JEWELRIES. Discover considered clothing, jewelry, and collections.',
  openGraph: {
    title: 'EMMY NOIR — Modern Fashion House',
    description:
      'A premium fashion house featuring EMMY WEARS and EMMY JEWELRIES.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <BagProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </BagProvider>
      </body>
    </html>
  );
}
