import Layout from '@/components/Layout';
import EnergyOfDayWidget from '@/components/EnergyOfDayWidget';
import LatestBlogPost from '@/components/LatestBlogPost';

export default function Home() {
  return (
    <Layout>
      <div className="relative z-20 flex flex-col items-center justify-start text-center min-h-[90vh] pt-20 px-4">
        <h1 className="text-5xl md:text-7xl font-header text-orange-ember drop-shadow-lg mb-4">
          Moon & Embers
        </h1>

        <p className="text-xl md:text-2xl text-ash-light max-w-2xl drop-shadow-sm">
          A sanctuary for spiritual seekers, mystics, and those who walk between worlds.
        </p>

        <div className="mt-10 w-full max-w-6xl px-4">
          {/* Side-by-Side Widgets with 25% increased width */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
            <div className="basis-[60%] max-w-xl w-full mx-auto">
              <EnergyOfDayWidget />
            </div>
            <div className="basis-[60%] max-w-xl w-full mx-auto">
              <LatestBlogPost />
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-ash-light mt-20 mb-4">
        © {new Date().getFullYear()} Second Bloom Consulting, LLC. All rights reserved.
      </footer>
    </Layout>
  );
}
