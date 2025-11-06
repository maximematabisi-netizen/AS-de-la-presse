'use client';

import Link from 'next/link';
import Image from 'next/image';
import SearchBox from './SearchBox';

export default function LogoBar() {
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <nav className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-x-3 sm:gap-x-4 md:gap-x-6 md:gap-x-8 w-full sm:w-auto">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/LOGO.png"
                alt="Les As de la presse"
                width={240}
                height={240}
                priority
                className="w-auto h-24 sm:h-32 md:h-40 lg:h-48 xl:h-60"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight">Les As de la presse</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Votre source d'information en RDC</p>
            </div>
          </div>
          <div className="w-full sm:w-64 md:w-72 flex-shrink-0">
            <SearchBox />
          </div>
        </nav>
      </div>
    </header>
  );
}
