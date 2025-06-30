import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import supabase from '@/lib/supabase';

const betaChecklistData = [
  {
    header: 'Access (Please check these before creating account or logging in)',
    items: [
      'Home, Blog, Contact, About are all visible with content',
      'Grimoire, Journal, Forum links lead to log in page',
    ]
  },
  {
    header: 'Homepage',
    items: [
      'Page loads correctly on desktop and mobile',
      'Background image is loading',
      'Navigation bar is visible and clear',
      'You can scroll the page without issue',
      'Mantra of the day is visible',
      'Energies of the Day is visible, and link properly navigates to full page with expandable planetary position details',
      'Latest blog post displays content and link click opens full page with full post (post is formatted properly'
    ],
  },
  {
    header: 'Navigation',
    items: [
      'Each nav link goes to the correct section (Grimoire, Journal, Blog, Forum, About, Contact)',       
    ]
  },
  {
    header: 'Sign In / Sign Up / Profile (Click Sign In button to get to login page)' ,
    items: [
      'Sign up page has field for email (will give green checkmark in good email, red x if email is already in use)',
      'Sign up page has two password fields to confirm matching input',
      'Sign up page: Show password box check works',
      'Sign in works and does not show errors',
      'You can create a new account and verify your email',
      'You can access your profile page after logging in',
      'Upon logging in through email verification you land on profile page to update required fields',
      'You can change your profile field and image and save it'
    ]
  },
  {
    header: 'Grimoire',
    items: [
      'Page loads properly when logged in',
      'Spacing is correct onto image',
      'Create New Entry: populates pop up box with categories to choose from',
      'Create New Entry: choosing a category popuates a new blank entry page',
      'Create New Entry: Select shared to send to master grimoire (review) and should get pop up for this option',
      'Create New Entry: Select Save and new should return you to the category selection pop up',
      'View My Inventory: Shows all entries you have created and marked "on hand"',
      'View My Entries: Views all entries you have created',
      'View My Entries: Clicking edit button on any entry opens the entry in edit mode',
      'View Master Grimoire: Show all personal and master entries',
      'View Master Grimoire: Use various filters and seletors to see results',
      'View Master Grimoire: Use import button to import master entries to your personal grimoire',
      'Search entries returns all personal and master entries that match the search term',
      'Search entries: use filters to narrow results',
      'The filters on the side work and change which cards are shown'
    ]
  },
  {
    header: 'Journal',
    items: [
      'You can add a journal entry',
      'You can edit an entry and see your changes saved',
      'You can delete an entry and it disappears',
    ]
  },
  {
    header: 'Blog',
    items: [
      'You can see a list of blog posts',
      'Clicking a post opens the full post',
      'The post includes images and paragraph spacing that looks good',
      'The blog loads on mobile and desktop without errors'
    ]
  },
  {
    header: 'Forum',
    items: [
      'Clicking the forum link opens a new tab',
      'You are automatically signed in to the forum if you’re signed in on the site',
      'You can view forum topics',
      'You can reply to a topic or create a new one'
    ]
  },
  {
    header: 'Mobile Testing',
    items: [
      'Page elements rearrange properly for small screens',
      'Text is readable on a phone',
      'No content is cut off or overlapping on mobile'
    ]
  }
];

export default function BetaTestChecklist() {
  const [checkedItems, setCheckedItems] = useState({});
  const [notes, setNotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialState = {};
    betaChecklistData.forEach(section => {
      section.items.forEach(item => {
        initialState[item] = false;
      });
    });
    setCheckedItems(initialState);
  }, []);

  const handleCheckboxChange = (item) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleNoteChange = (item, value) => {
    setNotes((prev) => ({ ...prev, [item]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const combined = betaChecklistData.flatMap(section =>
        section.items.map(item => {
          const checked = checkedItems[item] ? '✓' : '✗';
          const note = notes[item] || '';
          return `${checked} ${item}${note ? ` (Note: ${note})` : ''}`;
        })
      ).join(', ');

      const { error } = await supabase.from('beta_feedback_summary').insert({
        user_id: sessionData?.session?.user?.id || null,
        summary: combined
      });

      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Beta Test Checklist</title>
      </Head>
      <div className="min-h-screen bg-black-veil text-ash-light font-body px-4 py-10">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-4xl font-header text-orange-ember mb-6 text-center">
            Beta Test Checklist
          </h1>

          {betaChecklistData.map((section) => (
            <div key={section.header} className="mb-8">
              <h2 className="text-2xl font-bold text-orange-ember mb-4">
                {section.header}
              </h2>
              {section.items.map((item) => (
                <div
                  key={item}
                  className="bg-forest/60 border border-white/10 p-4 mb-4 rounded-lg backdrop-blur-md"
                >
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checkedItems[item] || false}
                      onChange={() => handleCheckboxChange(item)}
                      className="mt-1"
                    />
                    <span className="font-medium text-lg">{item}</span>
                  </label>
                  <textarea
                    placeholder="Add optional notes for this item..."
                    className="w-full mt-2 p-2 bg-slate-800 rounded text-white"
                    rows={2}
                    value={notes[item] || ''}
                    onChange={(e) => handleNoteChange(item, e.target.value)}
                  />
                  <div className="text-right mt-2">
                    <a
                      href="/reportIssue"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-ember text-sm hover:underline"
                    >
                      Report Issue ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {submitted ? (
            <p className="text-green-400 text-center mt-6 text-lg font-semibold">
              ✅ Thank you! Your beta test feedback has been submitted.
            </p>
          ) : (
            <div className="text-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-ember text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              {error && <p className="text-red-400 mt-2">❌ {error}</p>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
