// Pages for Moon & Ember site
// Using Next.js structure with Supabase auth integration

import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed horizontal nav bar */}
      <header className="fixed top-0 left-0 w-full bg-black z-50 border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <ul className="flex flex-wrap justify-center items-center gap-8 list-none p-0 m-0 text-lg font-semibold">
              <li className="list-none"><Link href="/">Home</Link></li>
              <li className="list-none"><Link href="/grimoire">Grimoire</Link></li>
              <li className="list-none"><Link href="/coven">Coven</Link></li>
              <li className="list-none"><Link href="/blog">Blog</Link></li>
              <li className="list-none"><Link href="/about">About</Link></li>
              <li className="list-none"><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="pt-28 px-4 pb-10">
        {children}
      </main>
    </div>
  );
}
