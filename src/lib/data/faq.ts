import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Tag à rafraîchir (updateTag) après chaque modification de la FAQ. */
export const FAQ_TAG = "faq";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { title: string; items: FaqItem[] };

/** Rubriques de la FAQ dans l'ordre choisi ; une rubrique sans question n'apparaît pas. */
export async function getFaq(): Promise<FaqGroup[]> {
  "use cache";
  cacheTag(FAQ_TAG);
  cacheLife("max");

  const rubriques = await prisma.faqSection.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: { questions: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
  });
  return rubriques
    .filter((r) => r.questions.length > 0)
    .map((r) => ({ title: r.title, items: r.questions.map((q) => ({ q: q.question, a: q.answer })) }));
}

/** Questions cochées « Sur l'accueil », dans l'ordre de la FAQ (trois au plus). */
export async function getQuestionsAccueil(): Promise<FaqItem[]> {
  "use cache";
  cacheTag(FAQ_TAG);
  cacheLife("max");

  const questions = await prisma.faqQuestion.findMany({
    where: { onHome: true },
    orderBy: [{ section: { position: "asc" } }, { section: { createdAt: "asc" } }, { position: "asc" }, { createdAt: "asc" }],
    take: 3,
  });
  return questions.map((q) => ({ q: q.question, a: q.answer }));
}
