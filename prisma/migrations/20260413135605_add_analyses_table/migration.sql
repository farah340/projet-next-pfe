-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "nomZone" TEXT,
    "activite" TEXT,
    "scoreTotal" INTEGER,
    "verdict" TEXT,
    "recommandation" TEXT,
    "scoresDetails" JSONB,
    "pointsForts" JSONB,
    "pointsFaibles" JSONB,
    "nbConcurrents" INTEGER,
    "noteMoyConcurrents" DECIMAL(3,1),
    "nbStationsTransport" INTEGER,
    "nbParkings" INTEGER,
    "scoreAttractivite" DECIMAL(3,1),
    "dateAnalyse" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
