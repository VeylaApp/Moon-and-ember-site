// pages/admin/viewAstroByDate.js
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import withAdminProtection from '@/lib/withAdminAuth';

function GetAstroByDatePage() {
  const [date, setDate] = useState('');
  const [astroData, setAstroData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setAstroData(null);
    setError(null);

    try {
      const res = await fetch(`/api/getAstroByDate?date=${date}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to fetch data');

      setAstroData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="View Daily Astrology by Date">
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Get Astrology Data by Date</h1>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 bg-black bg-opacity-70 rounded px-3 py-2 w-full"
          />
          <button
            onClick={handleFetch}
            className="bg-black bg-opacity-70 text-white px-4 py-2 rounded hover:shadow-[0_0_10px_2px_#204e39]"
            disabled={!date || loading}
          >
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {astroData && (
          <div className="bbg-black bg-opacity-70 p-4 rounded shadow">
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(astroData, null, 2)}</pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminProtection(GetAstroByDatePage);
