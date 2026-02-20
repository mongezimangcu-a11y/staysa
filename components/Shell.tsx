"use client";

import Link from "next/link";
import Image from "next/image";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Tripconnecta"
              width={160}
              height={40}
              priority
            />
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/listings" className="hover:text-black text-gray-600">
              Listings
            </Link>
            <Link href="/list-property" className="hover:text-black text-gray-600">
              List Property
            </Link>
            <Link href="/admin" className="hover:text-black text-gray-600">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}