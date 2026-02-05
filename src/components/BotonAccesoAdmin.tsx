import React from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export const BotonAccesoAdmin: React.FC = () => {
  return (
    <Link href="/admin">
      <button className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 transition-all hover:scale-110 z-50 group">
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Panel Admin
        </span>
      </button>
    </Link>
  );
};