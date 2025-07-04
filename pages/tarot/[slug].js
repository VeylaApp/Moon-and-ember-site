// pages/tarot/[slug].js
import React from 'react';
import supabase from '@/lib/supabase';

export default function TarotCardPage({ card }) {
  if (!card) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-red-700 text-lg">
        Tarot card not found. Please check the URL or try again later.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-[#204e39]">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-6">
        <h1 className="text-3xl font-bold text-center">{card.name}</h1>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={card.image_url}
            alt={card.name}
            className="rounded-xl shadow-md w-full md:w-1/3 object-cover"
          />

          <div className="flex-1 space-y-4 text-sm md:text-base">
            <p><span className="font-semibold">Category:</span> {card.category}</p>
            {card.suit && (
              <p><span className="font-semibold">Suit:</span> {card.suit}</p>
            )}
            <div>
              <h2 className="text-xl font-semibold mt-4 mb-2">Description</h2>
              <p className="text-gray-700">{card.description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">Upright Meaning</h3>
            <p className="text-gray-700">{card.upright}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-1">Reversed Meaning</h3>
            <p className="text-gray-700">{card.reversed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  const { data: card, error } = await supabase
    .from('tarot')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !card) {
    console.log('Slug not found:', slug);
    console.log('Supabase error:', error);
    return {
      props: {
        card: null,
      },
    };
  }

  return {
    props: {
      card,
    },
  };
}
