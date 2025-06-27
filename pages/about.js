//This code is the 'About' page

import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-header text-orange-ember mb-6">About Moon & Embers</h1>
        <p className="text-lg text-ash-light leading-relaxed mb-4">
          Moon & Embers is a sanctuary for those who feel out of place in traditional
          religious spaces, but still burn with sacred questions, mystical knowing,
          and a yearning for connection beyond the veil.
        </p>
        <p className="text-lg text-ash-light leading-relaxed mb-4">
          Rooted in ancient wisdom, personal gnosis, and modern ritual, this space invites seekers
          of all identities to reclaim their power, explore the unseen, and co-create spiritual meaning
          outside patriarchal structures.
        </p>
        <p className="text-lg text-ash-light leading-relaxed">
          You belong here. Your path is valid. Your magic is real.
        </p>
      </div>
    </Layout>
  );
}

