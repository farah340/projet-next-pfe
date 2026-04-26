export type TransportItem = {
  display: string
  count: number
  closest_m: number
  examples?: Array<{
    name: string
    distance_m: number
    rating: number | null
  }>
}

export type InfraCategorie = {
  count: number
  closest_m?: number
  within_500m?: number
  within_1km?: number
  top_3: Array<{
    name: string
    type: string
    distance_m: number
    rating: number | null
  }>
}

export type AttracteurItem = {
  name: string
  type: string
  distance_m: number
  rating: number | null
  reviews?: number
  prix_tnd?: number | null
}

export type ConcurrentItem = {
  id: string
  name: string
  type: string
  type_display: string
  address: string
  lat: number
  lng: number
  distance_m: number
  rating: number | null
  reviews: number
  rating_tier: 'excellent' | 'bon' | 'moyen' | 'faible' | 'non_note'
  google_maps_uri?: string | null
  phone?: string | null
  website?: string | null
  has_website: boolean
  has_instagram: boolean
  has_facebook: boolean
  has_phone: boolean
  digitalisation_score: number
  is_open_now?: boolean | null
  amplitude_horaire_hebdo?: number | null
  jours_ouverts_hebdo?: number | null
  menace_score: number
}

export type DonneesConcurrence = {
  total?: number
  note_moyenne?: number
  dans_500m?: number
  dans_1km?: number
  plus_proche_m?: number
  pct_avec_site?: number
  pct_avec_reseau_social?: number
  concurrents: ConcurrentItem[]
  par_type?: Record<string, { display: string; count: number; percentage: number }>
  stats?: any
  top_5_menace?: any[]
  top_5_proches?: any[]
  top_5_mieux_notes?: any[]
  insights?: Array<{ level: string; message: string }>
}

export type DonneesTransports = {
  total?: number
  plus_proche_transport_m?: number
  plus_proche_parking_m?: number
  transports_publics_count?: number
  parkings_count?: number
  by_type?: Record<string, TransportItem>
  top_5_closest?: any[]
}

export type DonneesInfrastructure = {
  total?: number
  within_500m?: number
  within_1km?: number
  par_categorie?: {
    commerce?: InfraCategorie
    sante?: InfraCategorie
    education?: InfraCategorie
    services?: InfraCategorie
  }
  top_5_closest?: any[]
}

export type DonneesAttractivite = {
  total_attracteurs?: number
  restaurants_cafes?: number
  loisirs?: number
  prix_moyen_tnd?: number
  niveau_zone?: string
  score_global?: number
  top_5_attracteurs?: AttracteurItem[]
  par_categorie?: {
    restauration?: { count: number; top_3: any[] }
    loisirs_culture?: { count: number; top_3: any[] }
    divertissement?: { count: number; top_3: any[] }
  }
  indicateurs?: {
    flux_pietons?: number
    visibilite?: number
    pouvoir_achat?: number
    densite_activite?: number
  }
}

export type Insight = {
  titre: string
  niveau: 'opportunite' | 'warning' | 'info'
  resume: string
  detail: string
}
export type AnalyseResult = {
  scoreGlobal: number
  scoreDelta: string
  scoreDeltaPositive: boolean
  scoreConcurrence?: number
  population: number
  revenuMoyen: number
  potentielEstime: string
  opportunite: string
  verdict?: string
  historiqueScore: Array<{ mois: string; score: number }>
  repartitionSectorielle: Array<{ name: string; value: number }>
  accessibilite: { transports: number; parking: number; pietons: number }
  infrastructure: { commerces: number; services: number; equipements: number }
  attractivite: { fluxPietons: number; visibilite: number; pouvoirAchat: number }
  insights: string[] | Insight[]
  pointsForts?: string[]
  pointsFaibles?: string[]
  recommandation?: string
  niveauZone?: string
  donnees?: {
    concurrence?: DonneesConcurrence
    transports?: DonneesTransports
    infrastructure?: DonneesInfrastructure
    attractivite?: DonneesAttractivite
  }
}