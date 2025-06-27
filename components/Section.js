
export default function Section({ title, children }) {
  return (
    <div className="mb-12 md:mb-20">
      <h2 className="text-2xl md:text-4xl font-header text-orange-ember mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
