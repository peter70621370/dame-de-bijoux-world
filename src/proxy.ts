import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decryptSession } from "@/lib/session";

// Contrôle rapide à l'entrée de /admin, sur le seul cookie. La vérification complète
// (compte toujours actif en base) se fait dans chaque page et action : voir src/lib/dal.ts.
export async function proxy(request: NextRequest) {
  // Les actions serveur (POST) vérifient elles-mêmes la session et savent rediriger ;
  // une redirection ici leur ferait perdre le fil.
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  const session = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
  const pageConnexion = pathname === "/admin/connexion";

  if (!session && !pageConnexion) {
    return NextResponse.redirect(new URL("/admin/connexion", request.url));
  }
  // Déjà connecté : pas besoin du formulaire, sauf si le serveur vient de refuser la session.
  if (session && pageConnexion && !searchParams.has("session")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
