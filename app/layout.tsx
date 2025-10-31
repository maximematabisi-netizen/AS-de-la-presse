import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Footer from '../components/Footer';
import Navbar from '../actualite/app/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Actualités RDC',
  description: 'Votre source d\'information en République Démocratique du Congo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          {/* Include site-wide footer (shared from actualite) */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
