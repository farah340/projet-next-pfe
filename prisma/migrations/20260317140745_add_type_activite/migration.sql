-- CreateTable
CREATE TABLE "TypeActivite" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "osmKey" TEXT NOT NULL,
    "osmValue" TEXT NOT NULL,
    "icone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeActivite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZoneActivite" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "typeActiviteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoneActivite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZoneActivite_zoneId_typeActiviteId_key" ON "ZoneActivite"("zoneId", "typeActiviteId");

-- AddForeignKey
ALTER TABLE "ZoneActivite" ADD CONSTRAINT "ZoneActivite_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZoneActivite" ADD CONSTRAINT "ZoneActivite_typeActiviteId_fkey" FOREIGN KEY ("typeActiviteId") REFERENCES "TypeActivite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
