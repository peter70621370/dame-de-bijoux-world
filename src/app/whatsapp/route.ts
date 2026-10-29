import { connection } from "next/server";
import { getBoutique } from "@/lib/data/boutique";
import { greetingUrl } from "@/lib/whatsapp";

// Lien « WhatsApp de la boutique » proposé dans les annonces : enregistré tel quel,
// il suit le numéro des coordonnées même si la boutique en change.
export async function GET() {
  await connection();
  const { whatsapp } = await getBoutique();
  return Response.redirect(greetingUrl(whatsapp), 307);
}
