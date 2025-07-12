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
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
            <div className="basis-[60%] max-w-xl w-full mx-auto">
              <EnergyOfDayWidget />
            </div>
            <div className="basis-[60%] max-w-xl w-full mx-auto">
              <LatestBlogPost />
            </div>
          </div>

          {/* Support the Site Section (closer to content) */}
          <div className="flex flex-col items-center justify-center mt-12 text-center px-4">
            <p className="text-lg text-orange-ember font-medium mb-4">
              Enjoying this website? Consider donating to support development costs!
            </p>
            <a
              href="https://buymeacoffee.com/moonandember"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4"
            >
              <img
                src="/donate-qr.png"
                alt="Buy Me a Coffee QR Code"
                className="w-32 h-32 mx-auto hover:scale-105 transition-transform"
              />
            </a>
            <a
              href="https://buymeacoffee.com/moonandember"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:underline"
            >
              buymeacoffee.com/moonandember
            </a>
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-ash-light mt-20 mb-4">
        © {new Date().getFullYear()} Second Bloom Consulting, LLC. All rights reserved.
      </footer>
    </Layout>
  );
}
