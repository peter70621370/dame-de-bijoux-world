import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Compte, CompteSkeleton, NomCompte } from "@/components/admin/Compte";
import { verifySession } from "@/lib/dal";

// Le menu et la barre s'affichent tout de suite ; le compte et la page (voir loading.tsx), qui lisent
// la session et la base, arrivent juste après. Chaque page vérifie elle-même la session (src/lib/dal.ts).
export default function EspaceLayout({ children }: LayoutProps<"/admin">) {
  // Pas attendu ici : le menu l'attend lui-même pour ajouter les rubriques d'administrateur. Sans session,
  // null : c'est la page qui renvoie vers la connexion.
  const role = verifySession().then(
    (admin) => admin.role,
    () => null,
  );

  return (
    <AdminShell
      role={role}
      nom={
        <Suspense>
          <NomCompte />
        </Suspense>
      }
      compte={
        <Suspense fallback={<CompteSkeleton />}>
          <Compte />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
