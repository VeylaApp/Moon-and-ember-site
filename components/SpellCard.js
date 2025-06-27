
export default function SpellCard({ title, description }) {
  return (
    <div className="bg-black-veil border border-purple-moon rounded-xl p-6 shadow-lg text-ash-light">
      <h3 className="text-xl font-header text-gold-aura mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}
