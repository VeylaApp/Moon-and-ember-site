'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import AdminLayout from '@/components/AdminLayout'

export default function AdminBlogLanding() {
  const router = useRouter()
  const [publishedBlogs, setPublishedBlogs] = useState([])
  const [draftBlogs, setDraftBlogs] = useState([])
  const [rejectionNotes, setRejectionNotes] = useState({})

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    const { data: published, error: pubErr } = await supabase
      .from('blog_posts')
      .select('id, title, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    if (pubErr) {
      console.error('Error fetching published blogs:', pubErr)
    } else {
      setPublishedBlogs(published)
    }

    const { data: drafts, error: draftErr } = await supabase
      .from('blog_posts')
      .select('id, title, created_at, rejection_notes')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (draftErr) {
      console.error('Error fetching drafts:', draftErr)
    } else {
      setDraftBlogs(drafts)
      const initialNotes = {}
      drafts.forEach(d => {
        initialNotes[d.id] = d.rejection_notes || ''
      })
      setRejectionNotes(initialNotes)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) {
      alert('Failed to delete post')
      console.error(error)
    } else {
      fetchBlogs()
    }
  }

  const handleStatusChange = async (id, newStatus, notes = '') => {
    console.log('🟡 Attempting to update blog post...')
    console.log('ID:', id)
    console.log('New Status:', newStatus)
    console.log('Rejection Notes:', notes)

    const updateFields = { status: newStatus }
    if (newStatus === 'rejected') {
      updateFields.rejection_notes = notes || ''
    }

    // Check if the row is being matched
    const { data: matchCheck, error: matchErr } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)

    console.log('🔍 Matching row:', matchCheck)

    if (matchErr) {
      console.error('Error checking matching row:', matchErr)
      return
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateFields)
      .eq('id', id)

    if (error) {
      console.error('❌ Supabase update error:', error)
      alert('Failed to update blog status')
    } else {
      console.log('✅ Blog post updated:', data)
      fetchBlogs()
    }
  }

  const handleNoteChange = (id, value) => {
    setRejectionNotes(prev => ({ ...prev, [id]: value }))
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Manage Blog Posts</h1>
          <button
            onClick={() => router.push('/admin/createBlog')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:shadow-[0_0_10px_2px_#204e39]"
          >
            Post New Blog
          </button>
        </div>

        {/* Published Blogs */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">Last 10 Published Blogs</h2>
          <ul className="space-y-2">
            {publishedBlogs.map(blog => (
              <li key={blog.id} className="flex justify-between items-center border p-2 rounded">
                <span className="text-white">{blog.title}</span>
                <div className="space-x-3">
                  <button
                    onClick={() => router.push(`/admin/edit/${blog.id}`)}
                    className="text-blue-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push('/admin/viewBlogs')}
            className="mt-4 text-sm text-indigo-400 hover:underline"
          >
            View All Blogs →
          </button>
        </section>

        {/* Draft Review */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-white">Review Draft Blogs</h2>
          {draftBlogs.length === 0 ? (
            <p className="text-gray-300">No drafts to review.</p>
          ) : (
            <ul className="space-y-4">
              {draftBlogs.map(blog => (
                <li key={blog.id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-white">{blog.title}</h3>
                      <p className="text-sm text-gray-400">
                        Created: {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                      <label className="block mt-2 text-sm text-white">Rejection Notes:</label>
                      <textarea
                        value={rejectionNotes[blog.id]}
                        onChange={(e) => handleNoteChange(blog.id, e.target.value)}
                        placeholder="Add rejection reason here..."
                        className="w-full mt-1 p-2 border rounded text-black"
                      />
                    </div>
                    <div className="flex flex-col gap-2 min-w-[100px]">
                      <button
                        onClick={() => handleStatusChange(blog.id, 'published')}
                        className="text-green-400 hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(blog.id, 'rejected', rejectionNotes[blog.id])
                        }
                        className="text-red-400 hover:underline"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
