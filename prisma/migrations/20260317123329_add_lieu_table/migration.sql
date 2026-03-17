-- CreateTable
CREATE TABLE "Lieu" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "note" DOUBLE PRECISION,
    "nbAvis" INTEGER NOT NULL DEFAULT 0,
    "types" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "zoneId" TEXT NOT NULL,
    "collecteLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lieu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lieu_placeId_key" ON "Lieu"("placeId");

-- AddForeignKey
ALTER TABLE "Lieu" ADD CONSTRAINT "Lieu_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
