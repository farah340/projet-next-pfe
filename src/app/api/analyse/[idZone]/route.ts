import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'

const safeParse = (v: any, fallback: any) => {
  if (v === null || v === undefined) return fallback
  if (typeof v !== 'string') return v
  try { return JSON.parse(v) } catch { return fallback }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idZone: string }> }
) {
  try {
    const { activite } = await req.json()
    const { idZone } = await params
    const zoneId = idZone

    if (!zoneId || !activite) {
      return NextResponse.json(
        { error: 'zoneId et activite sont requis' },
        { status: 400 }
      )
    }

    const zone = await prisma.zone.findUnique({ where: { id: zoneId } })
    if (!zone) {
      return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 })
    }

    // ── Récupération des lieux proches (5 km) ──
    const lieux: any[] = await prisma.$queryRaw`
      SELECT l.categorie, l.types, l.note, l."nbAvis", l.nom, l.lat, l.lng
      FROM "Lieu" l
      WHERE (
        6371000 * acos(
          cos(radians(${zone.lat})) * cos(radians(l.lat)) *
          cos(radians(l.lng) - radians(${zone.lng})) +
          sin(radians(${zone.lat})) * sin(radians(l.lat))
        )
      ) <= 5000
    `

    const parCategorie: Record<string, number> = {}
    lieux.forEach(l => {
      const cat = l.categorie || 'Autre'
      parCategorie[cat] = (parCategorie[cat] || 0) + 1
    })

    const avecNote = lieux.filter(l => l.note !== null)
    const noteMoyenne = avecNote.length > 0
      ? avecNote.reduce((sum, l) => sum + parseFloat(l.note), 0) / avecNote.length
      : null

    // ── Appel n8n ──
    const n8nUrl = process.env.N8N_WEBHOOK_URL!
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    let n8nData: any = null
    let useMock = false

    try {
      const n8nRes = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: zone.id,
          nom_zone: zone.nom,
          latitude: zone.lat,
          longitude: zone.lng,
          type_activite: activite,
          google_api_key: process.env.GOOGLE_MAPS_API_KEY,
          lieux_db: lieux.slice(0, 20),
          par_categorie: parCategorie,
          note_moy_db: noteMoyenne ? Math.round(noteMoyenne * 10) / 10 : null,
          total_lieux_db: lieux.length,
        }),
        signal: controller.signal,
      })

      if (!n8nRes.ok) {
        console.warn('n8n erreur:', n8nRes.status)
        useMock = true
      } else {
        const raw = await n8nRes.json()
        // Le webhook retourne un array — on prend le premier item
        n8nData = Array.isArray(raw) ? raw[0] : raw
        console.log('n8n OK — sources:', n8nData?._debug?.sources_trouvees)
        console.log('Concurrents reçus:', n8nData?.donnees?.concurrence?.concurrents?.length ?? 0)
      }
    } catch (fetchError: any) {
      console.error('n8n fetch ERROR:', fetchError.message)
      useMock = true
    }
    clearTimeout(timeout)

    // ── Construction de la réponse ──
    let response: any

    if (!useMock && n8nData) {
      // ✅ Helper pour mapper un concurrent avec tous les champs (liens, présence digitale)
      const mapConcurrent = (c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        type_display: c.type_display,
        address: c.address,
        lat: c.lat,
        lng: c.lng,
        distance_m: c.distance_m,
        rating: c.rating,
        reviews: c.reviews,
        rating_tier: c.rating_tier,
        digitalisation_score: c.digitalisation_score,
        menace_score: c.menace_score,
        is_open_now: c.is_open_now,
        amplitude_horaire_hebdo: c.amplitude_horaire_hebdo,
        jours_ouverts_hebdo: c.jours_ouverts_hebdo,
        website: c.website ?? null,
        phone: c.phone ?? null,
        google_maps_uri: c.google_maps_uri ?? null,
        has_website: c.has_website ?? false,
        has_instagram: c.has_instagram ?? false,
        has_facebook: c.has_facebook ?? false,
        has_phone: c.has_phone ?? false,
      });

      response = {
        // Scores & metadata
        success: n8nData.success ?? true,
        zone_id: n8nData.zone_id ?? zoneId,
        zone_name: n8nData.zone_name ?? zone.nom,
        categorie: n8nData.categorie ?? activite,
        dateAnalyse: n8nData.dateAnalyse ?? new Date().toISOString(),
        scoreGlobal: n8nData.scoreGlobal ?? 0,
        verdict: n8nData.verdict ?? '',
        scoreConcurrence: n8nData.scoreConcurrence ?? 0,

        // Scores détaillés
        accessibilite: safeParse(n8nData.accessibilite, { transports: 0, parking: 0, pietons: 0 }),
        infrastructure: safeParse(n8nData.infrastructure, { commerces: 0, services: 0, equipements: 0 }),
        attractivite: safeParse(n8nData.attractivite, { fluxPietons: 0, visibilite: 0, pouvoirAchat: 0 }),

        // Narratif IA
        niveauZone: n8nData.niveauZone ?? '',
        opportunite: n8nData.opportunite ?? '',
        recommandation: n8nData.recommandation ?? '',
        angleStrategique: n8nData.angleStrategique ?? '',

        // Listes IA
        pointsForts: safeParse(n8nData.pointsForts, []),
        pointsFaibles: safeParse(n8nData.pointsFaibles, []),
        insights: safeParse(n8nData.insights, []),

        // Visualisation
        historiqueScore: safeParse(n8nData.historiqueScore, []),
        repartitionSectorielle: safeParse(n8nData.repartitionSectorielle, []),

        // Données complètes du Merge n8n
        donnees: {
          concurrence: n8nData.donnees?.concurrence ? {
            total: n8nData.donnees.concurrence.total,
            note_moyenne: n8nData.donnees.concurrence.note_moyenne,
            dans_500m: n8nData.donnees.concurrence.dans_500m,
            dans_1km: n8nData.donnees.concurrence.dans_1km,
            plus_proche_m: n8nData.donnees.concurrence.plus_proche_m,
            excellents: n8nData.donnees.concurrence.excellents,
            pct_avec_site: n8nData.donnees.concurrence.pct_avec_site,
            pct_avec_reseau_social: n8nData.donnees.concurrence.pct_avec_reseau_social,
            concurrents: (n8nData.donnees.concurrence.concurrents ?? []).map(mapConcurrent),
            top_5_menace: (n8nData.donnees.concurrence.top_5_menace ?? []).map(mapConcurrent),
            top_5_proches: (n8nData.donnees.concurrence.top_5_proches ?? []).map(mapConcurrent),
            top_5_mieux_notes: (n8nData.donnees.concurrence.top_5_mieux_notes ?? []).map(mapConcurrent),
            par_type: n8nData.donnees.concurrence.par_type ?? {},
            insights: n8nData.donnees.concurrence.insights ?? [],
          } : null,

          transports: n8nData.donnees?.transports ? {
            total: n8nData.donnees.transports.total,
            plus_proche_transport_m: n8nData.donnees.transports.plus_proche_transport_m,
            plus_proche_parking_m: n8nData.donnees.transports.plus_proche_parking_m,
            transports_publics_count: n8nData.donnees.transports.transports_publics_count,
            parkings_count: n8nData.donnees.transports.parkings_count,
            within_500m: n8nData.donnees.transports.within_500m,
            within_1km: n8nData.donnees.transports.within_1km,
            by_type: n8nData.donnees.transports.by_type ?? {},
            top_5_closest: n8nData.donnees.transports.top_5_closest ?? [],
          } : null,

          infrastructure: n8nData.donnees?.infrastructure ? {
            total: n8nData.donnees.infrastructure.total,
            within_500m: n8nData.donnees.infrastructure.within_500m,
            within_1km: n8nData.donnees.infrastructure.within_1km,
            commerces: n8nData.donnees.infrastructure.commerces,
            sante: n8nData.donnees.infrastructure.sante,
            education: n8nData.donnees.infrastructure.education,
            services: n8nData.donnees.infrastructure.services,
            par_categorie: n8nData.donnees.infrastructure.par_categorie ?? {},
            by_type: n8nData.donnees.infrastructure.by_type ?? {},
            top_5_closest: n8nData.donnees.infrastructure.top_5_closest ?? [],
          } : null,

          attractivite: n8nData.donnees?.attractivite ? {
            total_attracteurs: n8nData.donnees.attractivite.total_attracteurs,
            restaurants_cafes: n8nData.donnees.attractivite.restaurants_cafes,
            loisirs: n8nData.donnees.attractivite.loisirs,
            prix_moyen_tnd: n8nData.donnees.attractivite.prix_moyen_tnd,
            niveau_zone: n8nData.donnees.attractivite.niveau_zone,
            score_global: n8nData.donnees.attractivite.score_global,
            par_categorie: n8nData.donnees.attractivite.par_categorie ?? {},
            indicateurs: n8nData.donnees.attractivite.indicateurs ?? {},
            top_5_attracteurs: n8nData.donnees.attractivite.top_5_attracteurs ?? [],
          } : null,
        },

        // Stats DB locales
        stats: {
          totalLieux: lieux.length,
          parCategorie,
          noteMoyenne: noteMoyenne ? Math.round(noteMoyenne * 10) / 10 : null,
        },

        _debug: n8nData._debug ?? null,
      }

    } else {
      // ── Fallback mock ──
      console.log('Mock utilisé pour:', zone.nom)
      response = {
        success: false,
        zone_id: zoneId,
        zone_name: zone.nom,
        categorie: activite,
        dateAnalyse: new Date().toISOString(),
        scoreGlobal: 75,
        verdict: 'Favorable',
        scoreConcurrence: 50,
        accessibilite: { transports: 70, parking: 65, pietons: 80 },
        infrastructure: { commerces: 75, services: 60, equipements: 70 },
        attractivite: { fluxPietons: 72, visibilite: 68, pouvoirAchat: 75 },
        niveauZone: 'standard',
        opportunite: `Zone favorable pour ${activite}`,
        recommandation: 'Analyse n8n indisponible — données estimées',
        angleStrategique: '',
        pointsForts: ['Données mock — relancer l\'analyse'],
        pointsFaibles: [],
        insights: ['Connexion n8n indisponible'],
        historiqueScore: [
          { mois: 'Jan', score: 70 }, { mois: 'Fév', score: 72 },
          { mois: 'Mar', score: 73 }, { mois: 'Avr', score: 75 },
        ],
        repartitionSectorielle: Object.entries(parCategorie)
          .map(([name, value]) => ({
            name,
            value: lieux.length > 0 ? Math.round((value / lieux.length) * 100) : 0
          }))
          .sort((a, b) => b.value - a.value),
        donnees: {
          concurrence: null,
          transports: null,
          infrastructure: null,
          attractivite: null,
        },
        stats: {
          totalLieux: lieux.length,
          parCategorie,
          noteMoyenne: noteMoyenne ? Math.round(noteMoyenne * 10) / 10 : null,
        },
      }
    }

    // ── Sauvegarde Prisma ──
    try {
      await prisma.analyse.create({
        data: {
          zoneId: zone.id,
          nomZone: zone.nom,
          activite,
          scoreTotal: response.scoreGlobal,
          verdict: response.verdict ?? null,
          recommandation: response.recommandation ?? null,
          scoresDetails: response.accessibilite,
          pointsForts: response.pointsForts,
          pointsFaibles: response.pointsFaibles,
          nbConcurrents: response.donnees?.concurrence?.total ?? lieux.length,
          noteMoyConcurrents: response.donnees?.concurrence?.note_moyenne ?? noteMoyenne ?? 0,
          nbStationsTransport: response.donnees?.transports?.transports_publics_count ?? 0,
          nbParkings: response.donnees?.transports?.parkings_count ?? 0,
          scoreAttractivite: response.attractivite?.fluxPietons ?? 0,
        },
      })
    } catch (dbErr: any) {
      console.warn('Prisma save failed (non-bloquant):', dbErr.message)
    }

    return NextResponse.json(response)

  } catch (e) {
    console.error('[analyse/idZone]', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}