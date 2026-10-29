// Squelette affiché pendant le chargement d'une page du back-office, y compris d'une page à l'autre.
export default function Chargement() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-sable" />
        <div className="h-10 w-64 rounded-xl bg-sable" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-white" />
    </div>
  );
}
