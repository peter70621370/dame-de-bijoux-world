import { LogOut } from "lucide-react";
import { deconnexion } from "@/lib/actions/auth";
import { verifySession } from "@/lib/dal";

/** Compte connecté dans la barre du haut, avec la déconnexion. */
export async function Compte() {
  const admin = await verifySession();
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full bg-nuit font-serif text-lg text-or-clair"
      >
        {admin.name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-48 leading-tight md:block">
        <span className="block truncate text-sm font-medium">{admin.name}</span>
        <span className="block truncate text-xs text-douce">{admin.email}</span>
      </span>
      <form action={deconnexion}>
        <button
          type="submit"
          title="Se déconnecter"
          className="grid size-10 place-items-center rounded-xl text-douce transition-colors hover:bg-sable hover:text-rubis"
        >
          <LogOut size={18} aria-hidden />
          <span className="sr-only">Se déconnecter</span>
        </button>
      </form>
    </div>
  );
}

export function CompteSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3" aria-hidden>
      <span className="size-9 rounded-full bg-sable" />
      <span className="hidden h-8 w-32 rounded-lg bg-sable md:block" />
    </div>
  );
}
