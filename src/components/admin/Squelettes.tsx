// Squelettes affichés pendant le chargement des pages du back-office (fichiers loading.tsx).

function EnTeteVide({ centre = false }: { centre?: boolean }) {
  return (
    <div className={`space-y-3 ${centre ? "mx-auto max-w-3xl" : ""}`}>
      <div className="h-3 w-28 rounded bg-sable" />
      <div className="h-10 w-56 rounded-xl bg-sable" />
    </div>
  );
}

export function SqueletteListe() {
  return (
    <div className="animate-pulse space-y-6 md:space-y-8" aria-hidden>
      <EnTeteVide />
      <div className="h-12 rounded-xl bg-white" />
      <div className="divide-y divide-filet rounded-2xl border border-filet bg-white">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="size-16 rounded-xl bg-sable" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-sable" />
              <div className="h-3 w-1/3 rounded bg-sable" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SqueletteFormulaire() {
  return (
    <div className="animate-pulse space-y-6 md:space-y-8" aria-hidden>
      <EnTeteVide centre />
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="h-56 rounded-2xl bg-white" />
        <div className="h-96 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
