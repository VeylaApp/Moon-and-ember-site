import { useState } from 'react';
import dynamic from 'next/dynamic';
import withAdminAuth from '@/lib/withAdminAuth';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@supabase/supabase-js';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function BlogAdmin() {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published_at: '',
    status: 'draft',
    tags: '',
    cover_image_url: ''
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let coverImagePath = '/images/logo.jpg'; // default

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) {
        setMessage(`❌ Upload failed: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      coverImagePath = data.publicUrl;
    }

    const cleanedForm = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim()).join(', '),
      cover_image_url: coverImagePath
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blog_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(cleanedForm)
    });

    const result = await res.json();
    if (res.ok) {
      setMessage('✅ Blog post published!');
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        published_at: '',
        status: 'draft',
        tags: '',
        cover_image_url: ''
      });
      setFile(null);
    } else {
      setMessage(`❌ Error: ${result.message || 'Failed to publish post'}`);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-orange-ember">Create a Blog Post</h1>
        {message && <p className="mb-4 text-white bg-midnight/70 p-2 rounded">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 rounded bg-slate-800 text-white" />
          <input type="text" name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" required className="w-full p-2 rounded bg-slate-800 text-white" />
          <input type="text" name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Excerpt" className="w-full p-2 rounded bg-slate-800 text-white" />
          
          {/* 🖋 Rich Text Editor */}
          <ReactQuill
            value={form.content}
            onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
            className="bg-white text-black rounded"
            theme="snow"
          />

          <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma-separated)" className="w-full p-2 rounded bg-slate-800 text-white" />
          <input type="date" name="published_at" value={form.published_at} onChange={handleChange} className="w-full p-2 rounded bg-slate-800 text-white" />
          <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 rounded bg-slate-800 text-white">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 rounded bg-slate-800 text-white" />
          <button type="submit" className="bg-orange-ember text-white px-4 py-2 rounded hover:bg-orange-600">Publish</button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(BlogAdmin);
