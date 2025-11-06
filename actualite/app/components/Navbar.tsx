"use client";

import Image from 'next/image';
import SearchBox from './SearchBox';

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 w-full sm:w-auto">
            <Image
              src="/images/LOGO.png"
              alt="Logo"
              width={240}
              height={240}
              priority
              className="w-auto h-24 sm:h-36 md:h-48 lg:h-60 logo-animate flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">Les As de la presse</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Votre source d'information en RDC</p>
            </div>
          </div>
          <div className="w-full sm:w-64 md:w-72 flex-shrink-0">
            <SearchBox />
          </div>
        </div>
      </div>
    </nav>
  );
}