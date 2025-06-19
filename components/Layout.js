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

export default function AppStructure() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 border-b border-gray-800">
        <nav className="flex justify-between items-center">
          <h1 className="text-xl font-bold">🌙 Moon & Ember</h1>
          <ul className="flex gap-4">
            <li><a href="/">Home</a></li>
            <li><a href="/grimoire">Grimoire</a></li>
            <li><a href="/coven">Coven</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </header>
      <main className="p-8">
        {/* Route-based content will render here */}
      </main>
    </div>
  );
}

// Pages will live in /pages folder per Next.js convention:
// /pages/index.tsx → Home
// /pages/login.tsx → Login
// /pages/coven.tsx → Forum placeholder
// /pages/grimoire.tsx → Grimoire system
// /pages/blog.tsx → Posts
// /pages/about.tsx → Site/about info
// /pages/contact.tsx → Email/donation/social links
