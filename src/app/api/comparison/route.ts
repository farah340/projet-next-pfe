import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/bd";

const RequestSchema = z.object({
  secteur: z.string().min(1),
  zones: z
    .array(
      z
        .object({
          id: z.string().min(1),
          nom: z.string().optional(),
        })
        .passthrough()
    )
    .min(2, "Au moins 2 zones requises")
    .max(4, "Maximum 4 zones"),
});

const N8N_WEBHOOK_URL = process.env.N8N_COMPARISON_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  try {
    // === 1. Authentification ===
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // === 2. Vérification de la config ===
    if (!N8N_WEBHOOK_URL) {
      console.error("N8N_COMPARISON_WEBHOOK_URL non définie");
      return NextResponse.json(
        { success: false, error: "Configuration serveur manquante" },
        { status: 500 }
      );
    }

    // === 3. Parse + validation Zod ===
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { secteur, zones } = parsed.data;
    const requestedIds = zones.map((z) => z.id);

    // === 4. Vérification que les zones appartiennent au user (sécurité) ===
    const userZones = await prisma.zone.findMany({
      where: {
        id: { in: requestedIds },
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (userZones.length !== requestedIds.length) {
      // L'utilisateur a envoyé au moins un ID qui ne lui appartient pas
      // (ou qui n'existe pas). Refus net pour éviter toute fuite de données.
      return NextResponse.json(
        {
          success: false,
          error: "Une ou plusieurs zones sélectionnées sont introuvables",
        },
        { status: 403 }
      );
    }

    // === 5. Forward vers n8n ===
    const n8nPayload = {
      secteur,
      zoneIds: requestedIds,
      reportId: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      // Bonus : on transmet le userId à n8n (utile si tu veux historiser
      // les rapports en DB plus tard, ou pour de l'auditing)
      userId: session.user.id,
    };

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nPayload),
      signal: AbortSignal.timeout(60_000),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text().catch(() => "");
      console.error("n8n error:", n8nResponse.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Le service de génération a échoué (${n8nResponse.status})`,
        },
        { status: 502 }
      );
    }

    const data = await n8nResponse.json();

    if (!data.success || !data.verdict) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Réponse invalide du service d'analyse",
        },
        { status: 502 }
      );
    }

    // === 6. Réponse au front ===
    return NextResponse.json({
      success: true,
      verdict: data.verdict,
      pdfUrl: data.pdfUrl,
      reportId: data.reportId,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        {
          success: false,
          error: "La génération a pris trop de temps. Réessayez.",
        },
        { status: 504 }
      );
    }

    console.error("ai-analyze error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Erreur serveur inconnue",
      },
      { status: 500 }
    );
  }
}