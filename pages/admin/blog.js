import { useState } from 'react';
import withAdminAuth from '@/lib/withAdminAuth';
import AdminLayout from '@/components/AdminLayout';

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

    let coverImagePath = '';

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', `${Date.now()}-${file.name}`);

      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage(`❌ Upload failed: ${uploadData.error}`);
        return;
      }

      coverImagePath = uploadData.path;
    }

    const cleanedForm = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim()).join(', '),
      cover_image_url: coverImagePath
    };

    const res = await fetch('https://bohmreonbrxneehnqvku.supabase.co/rest/v1/blog_posts', {
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
          <textarea name="content" value={form.content} onChange={handleChange} placeholder="Write your post here..." rows={10} className="w-full p-2 rounded bg-slate-800 text-white"></textarea>
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


