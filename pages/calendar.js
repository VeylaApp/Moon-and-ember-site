import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import supabase from '@/lib/supabase';

export default function CalendarPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Prevents SSR issues with iframe
  }, []);

  return (
    <Layout>
      <Head>
        <title>Moon & Embers Calendar</title>
        <meta
          name="description"
          content="Explore upcoming rituals, moon circles, workshops, and community gatherings with the Moon & Embers calendar."
        />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-header text-orange-ember text-center drop-shadow-md mb-4">
          Community Calendar
        </h1>

        <div className="text-center mb-8">
          <a
            href="https://calendar.google.com/calendar/ical/dbb941a59434977c5310cd0790226bb35b3e506b0e0ca49904eca1318516f9fe%40group.calendar.google.com/public/basic.ics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm md:text-base font-medium text-orange-ember border border-orange-ember px-5 py-2 rounded-full hover:bg-orange-ember hover:text-black transition-all duration-200"
          >
            Import to Your Calendar
          </a>
        </div>

        {isClient && (
          <div className="w-full rounded-xl overflow-hidden shadow-lg bg-[#1f1f1f]/80 backdrop-blur-sm border border-[#2e2e2e] p-2">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=dbb941a59434977c5310cd0790226bb35b3e506b0e0ca49904eca1318516f9fe%40group.calendar.google.com&ctz=America%2FNew_York&mode=MONTH"
              className="w-full h-[700px] md:h-[850px] border-0"
              frameBorder="0"
              scrolling="no"
              title="Moon and Embers Calendar"
            ></iframe>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/requestCalendar"
            className="inline-block text-sm md:text-base font-medium text-orange-ember border border-orange-ember px-5 py-2 rounded-full hover:bg-orange-ember hover:text-black transition-all duration-200"
          >
            Submit Calendar Request
          </a>
        </div>
      </div>
    </Layout>
  );
}
