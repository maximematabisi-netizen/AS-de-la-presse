"use client";

import { usePathname } from 'next/navigation';
import Footer from '../components/Footer';
import PageFade from '../components/PageFade';
import Navbar from '../actualite/app/components/Navbar';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/actualite/admin');

  // Pour les routes admin, ne pas afficher le header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Pour les autres routes, afficher le layout normal avec header/footer
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <PageFade>
          {children}
        </PageFade>
      </main>
      <Footer />
    </div>
  );
}

