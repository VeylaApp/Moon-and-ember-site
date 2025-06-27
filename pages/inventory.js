import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';

const categoryIcons = {
  "Herbs and Flowers": "🌿",
  "Crystals and Stones": "💎",
  "Miscellaneous": "🛠️",
  "Candles": "🕯️",
  "Books": "📚",
  "Oils and Liquids": "🧪",
  "Spells and Rituals": "🔮",
  "Dieties": "✨",
  "Colors": "🎨",
  "Uncategorized": "📦",
};

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOnHandCards = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('cards')
        .select('id, title, category_id, categories(name)')
        .eq('user_id', session.user.id)
        .eq('on_hand', true);

      if (error) {
        console.error('Error fetching inventory:', error);
      } else {
        setCards(data);
      }
      setLoading(false);
    };

    fetchOnHandCards();
  }, [router]);

  const groupedByCategory = cards.reduce((acc, card) => {
    const category = (card.categories?.name || 'Uncategorized').trim();
    if (!acc[category]) acc[category] = [];
    acc[category].push(card);
    return acc;
  }, {});

  const allCategories = [...new Set(cards.map(card => (card.categories?.name || 'Uncategorized').trim()))];

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories(allCategories);
  };

  const handleSelectNone = () => {
    setSelectedCategories([]);
  };

  const handlePrint = () => window.print();

  if (loading) return <Layout>Loading...</Layout>;

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
        <div className="max-w-3xl mx-auto p-6 rounded-lg backdrop-blur-md">
          <h1 className="text-3xl font-header text-orange-ember mb-6 text-center">
            Your Inventory
          </h1>

          <div className="mb-6 bg-white/10 p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="font-header">Filter by Category:</p>
              <div className="space-x-2 text-sm">
                <button onClick={handleSelectAll} className="underline hover:text-orange-ember">Select All</button>
                <button onClick={handleSelectNone} className="underline hover:text-orange-ember">Select None</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {allCategories.map(cat => (
                <label key={cat} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span>{categoryIcons[cat] || '📦'} {cat}</span>
                </label>
              ))}
            </div>
          </div>

          {cards.length === 0 ? (
            <p className="text-center text-ash-light">You have no items marked "on hand" yet.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByCategory).map(([category, entries]) => (
                (selectedCategories.length === 0 || selectedCategories.includes(category)) && (
                  <div key={category}>
                    <h2 className="text-xl font-header text-gold-aura mb-2">
                      {categoryIcons[category] || '📦'} {category}
                    </h2>
                    <ul className="space-y-2 ml-4">
                      {entries.map((card) => (
                        <li key={card.id}>
                          <a
                            href={`/viewCard?id=${card.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ash-light hover:text-orange-ember underline"
                          >
                            {card.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}

          {cards.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={handlePrint}
                className="font-header text-lg text-green-forest hover:shadow-[0_0_10px_2px_#204e39] transition-shadow px-6 py-2 rounded"
              >
                Print Inventory
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
