"use server";

import { refresh, updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { verifyAdmin } from "@/lib/dal";
import { FAQ_TAG } from "@/lib/data/faq";
import { prisma } from "@/lib/prisma";
import { erreursParChamp, type EtatFormulaire } from "./formulaires";

/** Questions reprises sur l'accueil, au plus. */
const MAX_ACCUEIL = 3;

const schemaQuestion = z.object({
  sectionId: z.string().min(1, "Choisissez la rubrique."),
  question: z.string().trim().min(5, "Écrivez la question.").max(160, "160 caractères au maximum."),
  answer: z.string().trim().min(5, "Écrivez la réponse.").max(1500, "1 500 caractères au maximum."),
  onHome: z.boolean(),
});

const ORDRE = [{ position: "asc" as const }, { createdAt: "asc" as const }];

/** Crée la question (`id` nul) ou enregistre ses modifications. */
export async function enregistrerQuestion(
  id: string | null,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await verifyAdmin();

  const texte = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schemaQuestion.safeParse({
    sectionId: texte("sectionId"),
    question: texte("question"),
    answer: texte("answer"),
    onHome: formData.get("onHome") === "on",
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const q = resultat.data;

  const [existante, rubrique, autresAccueil] = await Promise.all([
    id ? prisma.faqQuestion.findUnique({ where: { id }, select: { sectionId: true, updatedAt: true } }) : null,
    prisma.faqSection.findUnique({ where: { id: q.sectionId }, select: { id: true } }),
    q.onHome ? prisma.faqQuestion.count({ where: { onHome: true, ...(id ? { NOT: { id } } : {}) } }) : 0,
  ]);
  if (id && !existante) return { message: "Cette question n’existe plus : elle a peut-être été supprimée entre-temps." };
  if (existante && texte("version") !== existante.updatedAt.toISOString()) {
    return {
      conflit: true,
      message: "Cette question a été modifiée ailleurs entre-temps. Rechargez la page pour repartir de sa dernière version.",
    };
  }
  if (!rubrique) {
    return {
      message: "Vérifiez les champs signalés en rouge.",
      erreurs: { sectionId: "Cette rubrique n’existe plus : choisissez-en une autre." },
    };
  }
  if (autresAccueil >= MAX_ACCUEIL) {
    return {
      message: "Vérifiez les champs signalés en rouge.",
      erreurs: { onHome: "Trois questions sont déjà sur l’accueil : décochez d’abord l’une d’elles." },
    };
  }

  // Une question qui arrive dans une rubrique (nouvelle, ou déplacée) se range à la fin.
  const aLaFin = async () => {
    const { _max } = await prisma.faqQuestion.aggregate({ where: { sectionId: q.sectionId }, _max: { position: true } });
    return (_max.position ?? -1) + 1;
  };

  if (id && existante) {
    const question = await prisma.faqQuestion.update({
      where: { id },
      data: { ...q, ...(existante.sectionId !== q.sectionId ? { position: await aLaFin() } : {}) },
    });
    updateTag(FAQ_TAG);
    refresh();
    return { ok: "Modifications enregistrées.", version: question.updatedAt.toISOString() };
  }

  const creee = await prisma.faqQuestion.create({ data: { ...q, position: await aLaFin() } });
  updateTag(FAQ_TAG);
  redirect(`/admin/faq?ajout=${creee.id}`, RedirectType.replace);
}

export async function supprimerQuestion(id: string) {
  await verifyAdmin();
  await prisma.faqQuestion.deleteMany({ where: { id } });
  updateTag(FAQ_TAG);
  redirect("/admin/faq?suppression=question", RedirectType.replace);
}

/** Monte (-1) ou descend (1) la question d'un rang dans sa rubrique. */
export async function deplacerQuestion(id: string, sens: -1 | 1) {
  await verifyAdmin();
  if (sens !== -1 && sens !== 1) return;

  const question = await prisma.faqQuestion.findUnique({ where: { id }, select: { sectionId: true } });
  if (!question) return;
  const ordre = await prisma.faqQuestion.findMany({
    where: { sectionId: question.sectionId },
    orderBy: ORDRE,
    select: { id: true },
  });
  const i = ordre.findIndex((q) => q.id === id);
  if (!ordre[i + sens]) return;
  [ordre[i], ordre[i + sens]] = [ordre[i + sens], ordre[i]];

  await prisma.$transaction(
    ordre.map((q, position) => prisma.faqQuestion.update({ where: { id: q.id }, data: { position } })),
  );
  updateTag(FAQ_TAG);
  refresh();
}

const schemaRubrique = z.object({
  title: z.string().trim().min(2, "Donnez un nom à la rubrique.").max(60, "60 caractères au maximum."),
});

/** Crée la rubrique (`id` nul) ou la renomme. */
export async function enregistrerRubrique(
  id: string | null,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await verifyAdmin();

  const resultat = schemaRubrique.safeParse({ title: String(formData.get("title") ?? "") });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const { title } = resultat.data;

  const [existante, homonyme] = await Promise.all([
    id ? prisma.faqSection.findUnique({ where: { id }, select: { updatedAt: true } }) : null,
    prisma.faqSection.findFirst({
      where: { title: { equals: title, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    }),
  ]);
  if (id && !existante) return { message: "Cette rubrique n’existe plus : elle a peut-être été supprimée entre-temps." };
  if (existante && String(formData.get("version") ?? "") !== existante.updatedAt.toISOString()) {
    return {
      conflit: true,
      message: "Cette rubrique a été modifiée ailleurs entre-temps. Rechargez la page pour repartir de sa dernière version.",
    };
  }
  if (homonyme) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: { title: "Une autre rubrique porte déjà ce nom." } };
  }

  if (id) {
    const rubrique = await prisma.faqSection.update({ where: { id }, data: { title } });
    updateTag(FAQ_TAG);
    refresh();
    return { ok: "Modifications enregistrées.", version: rubrique.updatedAt.toISOString() };
  }

  const { _max } = await prisma.faqSection.aggregate({ _max: { position: true } });
  const creee = await prisma.faqSection.create({ data: { title, position: (_max.position ?? -1) + 1 } });
  updateTag(FAQ_TAG);
  redirect(`/admin/faq?rubrique=${creee.id}`, RedirectType.replace);
}

/** Supprime une rubrique vide ; une rubrique qui contient encore des questions est conservée. */
export async function supprimerRubrique(id: string) {
  await verifyAdmin();

  const rubrique = await prisma.faqSection.findUnique({
    where: { id },
    select: { _count: { select: { questions: true } } },
  });
  if (!rubrique) redirect("/admin/faq", RedirectType.replace);
  // La page de la rubrique explique alors qu'il faut d'abord déplacer ou supprimer ses questions.
  if (rubrique._count.questions > 0) redirect(`/admin/faq/rubriques/${id}`, RedirectType.replace);

  await prisma.faqSection.delete({ where: { id } });
  updateTag(FAQ_TAG);
  redirect("/admin/faq?suppression=rubrique", RedirectType.replace);
}

/** Monte (-1) ou descend (1) la rubrique d'un rang. */
export async function deplacerRubrique(id: string, sens: -1 | 1) {
  await verifyAdmin();
  if (sens !== -1 && sens !== 1) return;

  const ordre = await prisma.faqSection.findMany({ orderBy: ORDRE, select: { id: true } });
  const i = ordre.findIndex((r) => r.id === id);
  if (i < 0 || !ordre[i + sens]) return;
  [ordre[i], ordre[i + sens]] = [ordre[i + sens], ordre[i]];

  await prisma.$transaction(
    ordre.map((r, position) => prisma.faqSection.update({ where: { id: r.id }, data: { position } })),
  );
  updateTag(FAQ_TAG);
  refresh();
}
