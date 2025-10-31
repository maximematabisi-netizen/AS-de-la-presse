'use client';

import Link from 'next/link';
import Image from 'next/image';
import SearchBox from './SearchBox';

export default function LogoBar() {
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-x-8">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/LOGO.png"
                alt="Les As de la presse"
                width={240}
                height={240}
                priority
                className="w-auto h-36 md:h-60"
              />
            </Link>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold">Les As de la presse</h1>
              <p className="text-sm text-gray-500">Votre source d'information en RDC</p>
            </div>
          </div>
          <div className="w-72">
            <SearchBox />
          </div>
        </nav>
      </div>
    </header>
  );
}
