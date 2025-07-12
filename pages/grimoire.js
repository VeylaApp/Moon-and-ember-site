// pages/requestCalendar.js

import { useState } from 'react';
import supabase from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function CalendarRequest() {
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isFutureDate = (inputDate) => {
    return new Date(inputDate) > new Date();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFutureDate(date)) {
      setError('Please select a future date.');
      return;
    }

    if (isRecurring && !recurringType) {
      setError('Please select how often it recurs.');
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setError('You must be logged in to submit.');
      return;
    }

    let fullComment = comment;
    if (isRecurring) {
      fullComment += ` (Recurring: ${recurringType})`;
    }

    const { error: insertError } = await supabase.from('reports').insert([
      {
        user_id: session.user.id,
        date_requested: date,
        comment: fullComment,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      setError('Submission failed. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6 text-center mt-10">
        <h1 className="text-3xl font-header text-orange-ember mb-6">Submit Calendar Request</h1>

        {submitted ? (
          <p className="text-green-500 font-medium">Request submitted successfully!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Requested Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Comment or Description:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                rows={4}
                required
              ></textarea>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
              />
              <label className="text-sm">Recurring request?</label>
            </div>

            {isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-1">How often?</label>
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                >
                  <option value="">-- Select One --</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-orange-ember text-black px-6 py-2 rounded-full font-medium hover:shadow-[0_0_10px_2px_#204e39] transition-all"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
