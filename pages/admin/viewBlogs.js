'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import AdminLayout from '@/components/AdminLayout'

export default function ViewAllBlogs() {
  const router = useRouter()
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    fetchAllBlogs()
  }, [])

  const fetchAllBlogs = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, created_at, status')
      .order('created_at', { ascending: false })

    if (error) console.error('Error loading blogs:', error)
    else setBlogs(data)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return

    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) {
      alert('Error deleting post')
      console.error(error)
    } else {
      fetchAllBlogs()
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Blog Posts</h1>
          <button
            onClick={() => router.push('/admin/createBlog')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:shadow-[0_0_10px_2px_#204e39]"
          >
            Post New Blog
          </button>
        </div>

        {blogs.length === 0 ? (
          <p>No blog posts found.</p>
        ) : (
          <ul className="space-y-3">
            {blogs.map(blog => (
              <li key={blog.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{blog.title}</h2>
                  <p className="text-sm text-gray-500">
                    Posted: {new Date(blog.created_at).toLocaleDateString()} — Status:{" "}
                    <span className="uppercase font-medium text-gray-700">{blog.status}</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/admin/edit/${blog.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  )
}
