'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import AdminLayout from '@/components/AdminLayout'
import nextDynamic from 'next/dynamic' // renamed to avoid conflict with export below

const ReactQuill = nextDynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function EditBlogPost() {
  const { id } = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) fetchBlog()
  }, [id])

  const fetchBlog = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError('Blog post not found.')
      console.error(error)
    } else {
      setBlog(data)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setBlog(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (value) => {
    setBlog(prev => ({ ...prev, content: value }))
  }

  const handleUpdate = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: blog.title,
        content: blog.content,
        status: blog.status,
        created_at: blog.created_at,
        author_name: blog.author_name
      })
      .eq('id', blog.id)

    setSaving(false)

    if (error) {
      alert('Error saving blog post')
      console.error(error)
    } else {
      router.push('/admin/blog')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-white">Loading blog post...</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">{error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>

        {/* Title */}
        <div>
          <label className="block text-base font-semibold text-white mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={blog.title || ''}
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-base font-semibold text-white mb-1">Content</label>
          <div className="bg-white text-black border border-gray-300 rounded">
            <ReactQuill
              value={blog.content || ''}
              onChange={handleContentChange}
              theme="snow"
              className="text-black"
              style={{
                minHeight: '300px',
                maxHeight: '600px',
                overflowY: 'auto',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="block text-base font-semibold text-white mb-1">Author</label>
          <input
            type="text"
            name="author_name"
            value={blog.author_name || ''}
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-base font-semibold text-white mb-1">Date</label>
          <input
            type="datetime-local"
            name="created_at"
            value={
              blog.created_at
                ? new Date(blog.created_at).toISOString().slice(0, 16)
                : ''
            }
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-base font-semibold text-white mb-1">Status</label>
          <select
            name="status"
            value={blog.status || 'draft'}
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:shadow-[0_0_10px_2px_#204e39] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </AdminLayout>
  )
}

// ⛔ Prevent pre-render error during build
export const dynamic = 'force-dynamic'
