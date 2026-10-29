import { PageIntrouvable } from "@/components/PageIntrouvable";
import { SiteChrome } from "@/components/SiteChrome";

// Adresses inconnues : rendue sous la mise en page racine seule, elle reprend donc l'habillage du site.
// Un article introuvable (notFound() dans le groupe (site)) utilise (site)/not-found.tsx.
export default function NotFound() {
  return (
    <SiteChrome>
      <PageIntrouvable />
    </SiteChrome>
  );
}
