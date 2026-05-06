// app/api/types-activite/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/bd";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userOnly = searchParams.get("userOnly") === "1";
    const withAnalyses = searchParams.get("withAnalyses") === "1";

    // === Mode user-scoped (pour la page comparaison) ===
    if (userOnly || withAnalyses) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Non authentifié" },
          { status: 401 }
        );
      }

      const userId = session.user.id;

      // Types liés aux zones de l'user via ZoneActivite
      const types = await prisma.typeActivite.findMany({
        where: {
          actif: true,
          zones: {
            some: {
              zone: { userId },
            },
          },
        },
        select: {
          id: true,
          nom: true,
          icone: true,
        },
        orderBy: { nom: "asc" },
      });

      // Filtrage supplémentaire : ne garder que ceux avec des analyses
      if (withAnalyses) {
        const activitesAvecAnalyses = await prisma.analyse.findMany({
          where: {
            zone: { userId },
            activite: { not: null },
          },
          select: { activite: true },
          distinct: ["activite"],
        });

        const activesSet = new Set(
          activitesAvecAnalyses
            .map((a) => a.activite?.toLowerCase())
            .filter(Boolean) as string[]
        );

        const filtered = types.filter((t) =>
          activesSet.has(t.nom.toLowerCase())
        );

        return NextResponse.json(filtered);
      }

      return NextResponse.json(types);
    }

    // === Comportement par défaut (rétrocompatible) ===
    const types = await prisma.typeActivite.findMany({
      where: { actif: true },
      include: {
        categories: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { nom: "asc" },
    });

    return NextResponse.json({ types });
  } catch (error) {
    console.error("Erreur types-activite:", error);
    return NextResponse.json(
      { error: "Erreur base de données" },
      { status: 500 }
    );
  }
}