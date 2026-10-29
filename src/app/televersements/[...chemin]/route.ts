import { lirePhoto } from "@/lib/stockage";

// Photos envoyées depuis le back-office (voir src/lib/stockage.ts). Leur nom est unique et ne change
// jamais : elles peuvent rester en cache un an.
export async function GET(_request: Request, { params }: RouteContext<"/televersements/[...chemin]">) {
  const photo = await lirePhoto((await params).chemin);
  if (!photo) return new Response("Photo introuvable", { status: 404 });

  return new Response(new Uint8Array(photo.contenu), {
    headers: { "Content-Type": photo.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
