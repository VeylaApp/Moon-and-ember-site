import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function ViewCard() {
  const router = useRouter();
  const { id } = router.query;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchCard = async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching entry:', error);
        return;
      }

      setCard(data);
      setLoading(false);
    };

    fetchCard();
  }, [router.isReady, id]);

  if (loading) return <Layout>Loading...</Layout>;

  if (!card) {
    return (
      <Layout>
        <div className="text-center text-white mt-12">Entry not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat p-8 text-white"
        style={{
          backgroundImage: 'url("/images/page.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="max-w-xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-header text-orange-ember mb-4 text-center">{card.title}</h1>

          {card.image_url && (
            <img
              src={card.image_url}
              alt={card.title}
              className="mx-auto mb-6 rounded shadow-md max-h-80 object-cover"
            />
          )}

          {card.supplies && (
            <div className="mb-4">
              <h2 className="text-lg font-header text-gold-aura mb-2">Supplies</h2>
              <ul className="list-disc list-inside space-y-1 text-white">
                {card.supplies.split(';').map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-lg font-header text-gold-aura mb-2">Description</h2>
            <p className="text-white whitespace-pre-line">{card.description}</p>
          </div>

          {card.tags && (
            <div className="text-sm text-ash-light italic mt-4">
              <span className="text-orange-ember">Tags:</span> {card.tags}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
