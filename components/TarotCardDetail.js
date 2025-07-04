// components/TarotCardDetail.js
import React from 'react';

export default function TarotCardDetail({
  name,
  category,
  suit,
  description,
  upright,
  reversed,
  image_url,
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-[#204e39]">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-6">
        <h1 className="text-3xl font-bold text-center">{name}</h1>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={image_url}
            alt={name}
            className="rounded-xl shadow-md w-full md:w-1/3 object-cover"
          />

          <div className="flex-1 space-y-4 text-sm md:text-base">
            <p><span className="font-semibold">Category:</span> {category}</p>
            {suit && (
              <p><span className="font-semibold">Suit:</span> {suit}</p>
            )}
            <div>
              <h2 className="text-xl font-semibold mt-4 mb-2">Description</h2>
              <p className="text-gray-700">{description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">Upright Meaning</h3>
            <p className="text-gray-700">{upright}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-1">Reversed Meaning</h3>
            <p className="text-gray-700">{reversed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
