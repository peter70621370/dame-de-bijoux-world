import Link from "next/link";
import { LogOut } from "lucide-react";
import { deconnexion } from "@/lib/actions/auth";
import { verifySession } from "@/lib/dal";

/** Compte connecté en bas du menu : lien vers « Mon compte », et la déconnexion. */
export async function Compte() {
  const admin = await verifySession();
  return (
    <div className="flex items-center gap-1 menu-reduit:flex-col">
      <Link
        href="/admin/mon-compte"
        title="Mon compte"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5 menu-reduit:flex-none"
      >
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 font-serif text-lg text-or-clair"
        >
          {admin.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 leading-tight menu-reduit:hidden">
          <span className="block truncate text-sm font-medium text-ivoire">{admin.name}</span>
          <span className="block truncate text-xs text-ivoire/50">{admin.email}</span>
        </span>
      </Link>
      <form action={deconnexion}>
        <button
          type="submit"
          title="Se déconnecter"
          className="grid size-10 place-items-center rounded-xl text-ivoire/60 transition-colors hover:bg-white/10 hover:text-ivoire"
        >
          <LogOut size={18} aria-hidden />
          <span className="sr-only">Se déconnecter</span>
        </button>
      </form>
    </div>
  );
}

/** Nom du compte connecté, sous le logo du menu. */
export async function NomCompte() {
  const admin = await verifySession();
  return admin.name;
}

export function CompteSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-2 menu-reduit:justify-center menu-reduit:px-0" aria-hidden>
      <span className="size-9 rounded-full bg-white/10" />
      <span className="h-8 w-32 rounded-lg bg-white/10 menu-reduit:hidden" />
    </div>
  );
}
