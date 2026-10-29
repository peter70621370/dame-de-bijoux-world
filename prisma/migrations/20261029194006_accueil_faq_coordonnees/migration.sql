-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL DEFAULT 'boutique',
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "mapsUrl" TEXT NOT NULL DEFAULT '',
    "hours" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,
    "tiktok" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "onHome" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePage" (
    "id" TEXT NOT NULL DEFAULT 'accueil',
    "heroTitle" TEXT NOT NULL,
    "heroText" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "heroImageAlt" TEXT NOT NULL,
    "heroImage2" TEXT,
    "heroImage2Alt" TEXT NOT NULL DEFAULT '',
    "featuredId" TEXT,
    "wholesaleTitle" TEXT NOT NULL,
    "wholesaleText" TEXT NOT NULL,
    "wholesalePoints" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FaqQuestion_sectionId_idx" ON "FaqQuestion"("sectionId");

-- AddForeignKey
ALTER TABLE "FaqQuestion" ADD CONSTRAINT "FaqQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FaqSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomePage" ADD CONSTRAINT "HomePage_featuredId_fkey" FOREIGN KEY ("featuredId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
