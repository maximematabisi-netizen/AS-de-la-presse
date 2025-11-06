import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Footer from '../components/Footer';
import PageFade from '../components/PageFade';
import Navbar from '../actualite/app/components/Navbar';
import AdminLayoutWrapper from './admin-layout-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'As de la presse',
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
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  );
}
