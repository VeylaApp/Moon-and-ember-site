// Pages for Moon & Ember site
// Using Next.js structure with Supabase auth integration

// 1. Home Page (/)
// 1a. Login Page (/login)
// 2. Coven (Forum) (/coven)
// 3. Grimoire (/grimoire)
// 4. Blog (/blog)
// 5. About (/about)
// 6. Contact (/contact)

// Each page will have basic structure created
// Auth protection (gating) will be added to all except Login
// Placeholder text and navigation scaffolding will be included

import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Top Nav */}
      <header className="fixed top-0 left-0 w-full bg-black z-50 border-b border-gray-800">
        <nav className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🌙 Moon & Ember</h1>
          <ul className="flex gap-4">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/grimoire">Grimoire</Link></li>
            <li><Link href="/coven">Coven</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </header>

      {/* Push content down so it’s not hidden behind fixed nav */}
      <main className="pt-24 px-4 pb-10">
        {children}
      </main>
    </div>
  );
}

