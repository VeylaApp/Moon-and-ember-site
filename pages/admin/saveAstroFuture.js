import { useState } from 'react';

export default function TestSaveFutureAstro() {
  const [inputDate, setInputDate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!inputDate) return;

    setLoading(true);
    setResult(null);

    const [year, month, day] = inputDate.split('-');

    try {
      const res = await fetch('/api/saveFutureAstro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          month: parseInt(month),
          date: parseInt(day),
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 space-y-4">
      <h1 className="text-2xl font-bold text-orange-ember">Manual Save Future Astrology</h1>

      <input
        type="date"
        value={inputDate}
        onChange={(e) => setInputDate(e.target.value)}
        className="bg-white text-black px-4 py-2 rounded"
      />

      <button
        className="bg-orange-ember text-white px-6 py-3 rounded shadow hover:bg-orange-700"
        onClick={handleClick}
        disabled={loading || !inputDate}
      >
        {loading ? 'Saving...' : 'Save Selected Date’s Astro Data'}
      </button>

      {result && (
        <pre className="bg-ash-dark p-4 rounded max-w-2xl text-sm overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
