-- CreateEnum
CREATE TYPE "SubsidieStatus" AS ENUM ('CONCEPT', 'IN_BEHANDELING', 'INGEDIEND', 'GOEDGEKEURD', 'AFGEWEZEN', 'UITBETAALD');

-- CreateEnum
CREATE TYPE "MaatregelType" AS ENUM ('TRIPLE_GLAS', 'HR_PLUS_PLUS_GLAS', 'SPOUWMUURISOLATIE', 'DAKISOLATIE', 'VLOERISOLATIE', 'GEVELISOLATIE');

-- CreateTable
CREATE TABLE "subsidie_aanvragen" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quoteId" TEXT,
    "status" "SubsidieStatus" NOT NULL DEFAULT 'CONCEPT',
    "projectAdres" TEXT,
    "meldcode" TEXT,
    "indieningsDatum" TIMESTAMP(3),
    "beschikkingsDatum" TIMESTAMP(3),
    "totaalSubsidie" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "combinatieBonus" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subsidie_aanvragen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subsidie_maatregelen" (
    "id" TEXT NOT NULL,
    "aanvraagId" TEXT NOT NULL,
    "type" "MaatregelType" NOT NULL,
    "oppervlakte" DOUBLE PRECISION NOT NULL,
    "uWaarde" DOUBLE PRECISION,
    "rdWaarde" DOUBLE PRECISION,
    "productMerk" TEXT,
    "productModel" TEXT,
    "tarief" DOUBLE PRECISION NOT NULL,
    "subsidie" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subsidie_maatregelen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subsidie_aanvragen_number_key" ON "subsidie_aanvragen"("number");

-- CreateIndex
CREATE UNIQUE INDEX "subsidie_aanvragen_quoteId_key" ON "subsidie_aanvragen"("quoteId");

-- AddForeignKey
ALTER TABLE "subsidie_aanvragen" ADD CONSTRAINT "subsidie_aanvragen_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subsidie_aanvragen" ADD CONSTRAINT "subsidie_aanvragen_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subsidie_maatregelen" ADD CONSTRAINT "subsidie_maatregelen_aanvraagId_fkey" FOREIGN KEY ("aanvraagId") REFERENCES "subsidie_aanvragen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
