// Remplit une base vide : catalogue et FAQ d'origine + compte de test facultatif (SEED_ADMIN_* dans .env).
// Ne modifie jamais ce qui existe déjà : sans risque à relancer, y compris sur la base en ligne.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { categoriesInitiales, faqInitiale, produitsInitiaux } from "./donnees-initiales";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function importerCatalogue() {
  if ((await prisma.category.count()) > 0) {
    console.log("Catalogue déjà présent : rien à importer.");
    return;
  }

  const idsCategories = new Map<string, string>();
  for (const [position, c] of categoriesInitiales.entries()) {
    const categorie = await prisma.category.create({
      data: {
        slug: c.slug,
        label: c.label,
        tag: c.tag,
        blurb: c.blurb,
        onRequest: c.onRequest ?? false,
        image: c.image,
        position,
      },
    });
    idsCategories.set(c.slug, categorie.id);
  }

  for (const [position, p] of produitsInitiaux.entries()) {
    await prisma.$transaction(async (tx) => {
      const produit = await tx.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          categoryId: idsCategories.get(p.category)!,
          price: p.price,
          isNew: p.isNew ?? false,
          short: p.short,
          description: p.description,
          details: p.details,
          optionName: p.option?.name,
          optionPlural: p.option?.plural,
          optionChoose: p.option?.choose,
          position,
        },
      });

      const images = [];
      for (const [i, img] of p.images.entries()) {
        images.push(
          await tx.productImage.create({
            data: { productId: produit.id, url: img.src, alt: img.alt, position: i },
          }),
        );
      }

      for (const [i, v] of (p.option?.values ?? []).entries()) {
        await tx.productVariant.create({
          data: {
            productId: produit.id,
            label: v.label,
            imageId: v.image === undefined ? null : images[v.image].id,
            position: i,
          },
        });
      }
    });
  }

  console.log(`Catalogue importé : ${categoriesInitiales.length} catégories, ${produitsInitiaux.length} produits.`);
}

async function importerFaq() {
  if ((await prisma.faqSection.count()) > 0) {
    console.log("FAQ déjà présente : rien à importer.");
    return;
  }

  for (const [position, rubrique] of faqInitiale.entries()) {
    await prisma.faqSection.create({
      data: {
        title: rubrique.title,
        position,
        questions: {
          create: rubrique.questions.map((q, i) => ({
            question: q.question,
            answer: q.answer,
            onHome: q.onHome ?? false,
            position: i,
          })),
        },
      },
    });
  }

  console.log(`FAQ importée : ${faqInitiale.length} rubriques.`);
}

async function creerCompteDeTest() {
  const { SEED_ADMIN_NAME: name, SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env;
  if (!name || !email || !password) {
    console.log("SEED_ADMIN_* absents : aucun compte créé.");
    return;
  }

  const adresse = email.trim().toLowerCase();
  if (await prisma.adminUser.findUnique({ where: { email: adresse } })) {
    console.log("Compte de test déjà présent.");
    return;
  }

  await prisma.adminUser.create({
    data: { name, email: adresse, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log("Compte de test créé (identifiants dans .env).");
}

async function main() {
  await importerCatalogue();
  await importerFaq();
  await creerCompteDeTest();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
