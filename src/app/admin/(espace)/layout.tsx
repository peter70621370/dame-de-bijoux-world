import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Compte, CompteSkeleton, NomCompte } from "@/components/admin/Compte";

// Le menu et la barre s'affichent tout de suite ; le compte et la page (voir loading.tsx), qui lisent
// la session et la base, arrivent juste après. Chaque page vérifie elle-même la session (src/lib/dal.ts).
export default function EspaceLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell
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
