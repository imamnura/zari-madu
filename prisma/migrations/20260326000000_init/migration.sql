-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_contents" (
    "id" TEXT NOT NULL,
    "badges" JSONB NOT NULL,
    "typewriterTexts" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "productImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_contents" (
    "id" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "why_choose_contents" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "why_choose_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonial_contents" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "testimonials" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnership_contents" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "partnerships" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnership_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_contents" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "articles" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Zari Honey',
    "whatsapp" TEXT NOT NULL DEFAULT '+6285777578827',
    "instagram" TEXT NOT NULL DEFAULT 'https://www.instagram.com/zarihoney',
    "email" TEXT NOT NULL DEFAULT 'info@zarilife.com',
    "shopeeLink" TEXT NOT NULL DEFAULT 'https://id.shp.ee/GgH8AKs',
    "mapsLocation" TEXT NOT NULL DEFAULT 'https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8',
    "mapsEmbed" TEXT NOT NULL,
    "whatsappOrderMessage" TEXT,
    "whatsappResellerMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_honey_collections" (
    "id" TEXT NOT NULL,
    "honeyCollectionContentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT,
    "image" VARCHAR(500),
    "label" TEXT,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_honey_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honey_collection_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Produk Premium Kami',
    "description" TEXT NOT NULL DEFAULT 'Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "honey_collection_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "premium_honey_collections" ADD CONSTRAINT "premium_honey_collections_honeyCollectionContentId_fkey" FOREIGN KEY ("honeyCollectionContentId") REFERENCES "honey_collection_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
