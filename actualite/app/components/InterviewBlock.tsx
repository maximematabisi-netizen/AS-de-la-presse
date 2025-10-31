"use client";

import Image from 'next/image';

interface QA {
  q: string;
  a: string;
}

interface InterviewBlockProps {
  name?: string;
  role?: string;
  avatar?: string;
  qas: QA[];
}

export default function InterviewBlock({ name, role, avatar, qas }: InterviewBlockProps) {
  return (
    <section className="my-8 rounded-md overflow-hidden shadow-sm bg-white">
      <div className="border-l-4 border-blue-600 bg-blue-50/30 p-6">
        <div className="flex items-center gap-4 mb-4">
          {avatar ? (
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
              <Image src={avatar} alt={name || 'Intervenant'} width={56} height={56} className="object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">👤</div>
          )}
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{name || 'Interview'}</h3>
            {role && <div className="text-sm text-gray-600">{role}</div>}
          </div>
        </div>

        <div className="space-y-6">
          {qas.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="md:w-48 flex-shrink-0">
                <div className="text-sm font-semibold text-gray-700">Journaliste</div>
                {item.q && <div className="mt-2 text-gray-700">{item.q}</div>}
              </div>
              <div className="flex-1">
                <div className="mt-1 p-4 bg-white rounded border border-gray-100">
                  <div className="prose max-w-none text-gray-800">{item.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
