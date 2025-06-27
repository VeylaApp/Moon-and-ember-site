// pages/admin/saveAstroRange.js
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import withAdminAuth from '@/lib/withAdminAuth';

function ManualSaveAstroRange() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!start || !end) return alert('Please enter both start and end dates');
    setLoading(true);
    setResult(null);

    const res = await fetch('/api/saveAstroRange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, limit: 50 }),
    });

    const json = await res.json();
    setResult(json);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🌌 Save 50 Days of Astrology Data</h1>

      <div className="mb-4">
        <label className="block text-sm mb-1">Start Date (YYYY-MM-DD)</label>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full p-2 rounded bg-ash-dark text-black"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">End Date (YYYY-MM-DD)</label>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full p-2 rounded bg-ash-dark text-black"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-orange-ember hover:shadow-[0_0_10px_2px_#204e39] text-white py-2 px-4 rounded"
      >
        {loading ? 'Saving…' : 'Save Range'}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-green-300">
            ✅ {result.message}
          </h2>
          <ul className="mt-2 text-sm max-h-64 overflow-y-auto border border-white/10 rounded p-2 bg-white/10">
            {result.details.map((r, i) => (
              <li key={i}>
                {r.date}: {r.status || `❌ ${r.error?.message || r.error}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ✅ Wrap with admin auth and layout
ManualSaveAstroRange.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default withAdminAuth(ManualSaveAstroRange);
