import Layout from '@/components/Layout';
import MantraOfTheDay from '@/components/MantraOfTheDay';
import EnergyOfDayWidget from '@/components/EnergyOfDayWidget';
import LatestBlogPost from '@/components/LatestBlogPost'; // Make sure this exists

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

        <div className="mt-10 space-y-6 max-w-lg w-full">
          <MantraOfTheDay />
          <EnergyOfDayWidget />
          <LatestBlogPost /> {/* Newly added */}
        </div>
      </div>
    </Layout>
  );
}
