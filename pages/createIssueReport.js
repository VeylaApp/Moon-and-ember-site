import { useState } from 'react';
import Layout from '@/components/Layout';
import supabase from '@/lib/supabase';

export default function ReportIssue() {
  const [comment, setComment] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const placeholderText =
    'Please report the issue or suggestion including page and any error details.';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = comment.trim();

    if (!trimmed || trimmed === placeholderText) {
      alert('Please enter a valid comment.');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert('You must be logged in to submit feedback.');
      return;
    }

    const { error } = await supabase.from('reports').insert([
      {
        user_id: session.user.id,
        comment: trimmed,
      },
    ]);

    if (error) {
      console.error('Error submitting report:', error);
      alert('Something went wrong.');
      return;
    }

    setComment('');
    setShowPopup(true);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-xl bg-black-veil text-white p-6 rounded shadow-lg border border-orange-ember">
          <h1 className="text-2xl font-header text-orange-ember mb-4 text-center">
            Report an Issue or Suggestion
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={8}
              className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400"
              placeholder={placeholderText}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-2 px-4 font-header font-bold text-lg text-white bg-green-700 rounded hover:shadow-[0_0_10px_2px_#204e39]"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-black-veil text-white border border-green-700 rounded-lg p-6 max-w-sm w-full text-center shadow-xl">
            <h2 className="text-xl font-header text-green-500 mb-4">Submitted Successfully!</h2>
            <p className="mb-4">Thank you for helping improve the site.</p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-green-700 rounded hover:shadow-[0_0_10px_2px_#204e39]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
