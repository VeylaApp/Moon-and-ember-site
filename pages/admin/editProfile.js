// pages/admin/profile-edit.js
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { roles } from '@/lib/roles';
import withAdminAuth from '@/lib/withAdminAuth';

function AdminProfileEditor() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({});
  const [message, setMessage] = useState(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Fetch error:', error);
      } else {
        setProfiles(data);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const selectedProfile = profiles.find((p) => p.id === selectedId);
      setForm(selectedProfile || {});
    }
  }, [selectedId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const { error } = await supabase.from('profiles').upsert(form);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Profile updated');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setShowAuthWarning(true);
    const { error } = await supabase.from('profiles').delete().eq('id', selectedId);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ User deleted');
      setProfiles((prev) => prev.filter((p) => p.id !== selectedId));
      setSelectedId('');
      setForm({});
    }
  };

  return (
    <AdminLayout>
      <div className="ml-52 pt-16 w-full max-w-4xl mx-auto p-6 bg-black-veil text-white">
        <h1 className="text-3xl font-bold mb-4">Admin Profile Editor</h1>

        <div className="mb-4 p-4 bg-orange-200 text-black rounded shadow-md">
          <strong>Note:</strong> This form pulls directly from the <code>profiles</code> database. Changes made here will overwrite existing values. Proceed with caution.
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2 mb-4 text-black"
        >
          <option value="">Select a user</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.username || p.id}</option>
          ))}
        </select>

        {selectedId && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={form.id || ''} />

            {form.avatar_url && (
              <div className="flex items-center space-x-4">
                <img
                  src={form.avatar_url}
                  alt="avatar thumbnail"
                  className="h-16 w-16 rounded-full object-cover border border-white"
                />
                <span className="text-sm text-gray-300">Avatar preview</span>
              </div>
            )}

            {Object.entries(form).map(([key, value]) => {
              if (key === 'id' || key === 'avatar_url') return null;

              if (key === 'role') {
                return (
                  <div key={key}>
                    <label className="block text-sm capitalize">Role</label>
                    <select
                      name="role"
                      value={value || ''}
                      onChange={handleChange}
                      className="w-full p-2 text-black"
                    >
                      <option value="">Select Role</option>
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="block text-sm capitalize">{key.replace('_', ' ')}</label>
                  <input
                    name={key}
                    value={value || ''}
                    onChange={handleChange}
                    className="w-full p-2 text-black"
                  />
                </div>
              );
            })}

            <div className="flex space-x-4">
              <button type="submit" className="bg-green-600 px-4 py-2 rounded">Save</button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Delete User
              </button>
            </div>
          </form>
        )}

        {message && <p className="mt-4 text-sm bg-slate-700 p-2 rounded">{message}</p>}

        {showAuthWarning && (
          <div className="mt-4 bg-yellow-300 text-black p-4 rounded shadow">
            ⚠️ <strong>Reminder:</strong> Deleting this profile does <em>not</em> delete the associated user from the Supabase <code>auth.users</code> table. You must manually remove them there as well.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminProfileEditor);
