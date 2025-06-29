// components/AdminLayout.js
import { useRouter } from 'next/router';

export default function AdminLayout({ children }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-black-veil text-white">
      {/* Sidebar */}
      <div className="fixed top-16 left-0 w-48 h-[calc(100vh-4rem)] bg-slate-900 text-white p-4 shadow-xl z-40">
        <h2 className="text-xl font-bold mb-4">Admin Tools</h2>
        <nav className="space-y-2">
      <button onClick={() => router.push('/')} className="block w-full text-left hover:underline">Home</button>
          <button onClick={() => router.push('/admin/editProfile')} className="block w-full text-left hover:underline">Edit Profiles</button>
          <button onClick={() => router.push('/admin/blog')} className="block w-full text-left hover:underline">Manage Blog</button>
          <button onClick={() => router.push('/admin/SubmissionReview')} className="block w-full text-left hover:underline">Review Submissions</button>
           <button onClick={() => router.push('/admin/viewAllCards')} className="block w-full text-left hover:underline">View All Grimoire Entries</button>
           <button onClick={() => router.push('/admin/saveAstroRange')} className="block w-full text-left hover:underline">API Call and Save by Date Range</button>
            <button onClick={() => router.push('/admin/viewAstroByDate')} className="block w-full text-left hover:underline">View API data by Date</button>
            <button onClick={() => router.push('https://forum.moonandembers.com/admin')} className="block w-full text-left hover:underline">Forum Admin</button>
        </nav>
      </div>

      {/* Page content */}
      <div className="ml-52 pt-16 w-full px-6">{children}</div>
    </div>
  );
}
