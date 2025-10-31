"use client";

import Image from 'next/image';
import SearchBox from './SearchBox';

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Image
              src="/images/LOGO.png"
              alt="Logo"
              width={240}
              height={240}
              priority
              className="w-auto h-60 logo-animate"
            />
            <div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Les As de la presse</h1>
              <p className="text-sm text-gray-600">Votre source d'information en RDC</p>
            </div>
          </div>
          <div className="w-72">
            <SearchBox />
          </div>
        </div>
      </div>
    </nav>
  );
}