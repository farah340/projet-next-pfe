// types/comparison.ts

export const MIN_ZONES_FOR_COMPARISON = 2;
export const MAX_ZONES = 4;

export const ZONE_COLORS = [
  { text: "#3b82f6", dot: "#3b82f6", border: "#3b82f6" }, // blue
  { text: "#10b981", dot: "#10b981", border: "#10b981" }, // emerald
  { text: "#f59e0b", dot: "#f59e0b", border: "#f59e0b" }, // amber
  { text: "#8b5cf6", dot: "#8b5cf6", border: "#8b5cf6" }, // violet
];

// === Verdict IA renvoyé par le workflow n8n de comparaison ===

export interface AIScore {
  zoneId: string;
  nom: string;
  rang: number;
  score: number;
}

export interface AIZoneInsight {
  zoneId: string;
  items: string[];
}

export interface AIVerdict {
  gagnant: string;
  gagnantId?: string;
  raison: string;
  alternatives?: string;
  scores?: AIScore[];
  forces?: AIZoneInsight[];
  risques?: AIZoneInsight[];
  recommandationsStrategiques?: string[];
}

export interface AIAnalyzeResponse {
  success: boolean;
  verdict?: AIVerdict;
  pdfUrl?: string;
  reportId?: string;
  error?: string;
}

// === Métriques alignées sur la table `analyses` ===
// Les 7 vraies métriques disponibles en DB (toutes peuplées par le workflow Webhook1)

export interface ZoneMetrics {
  scoreTotal: number;            // 0-100, score global
  scoreAttractivite: number;     // 0-100, score d'attractivité
  nbConcurrents: number;         // nombre brut
  noteMoyConcurrents: number;    // 0-5, note Google moyenne
  nbStationsTransport: number;   // nombre brut
  nbParkings: number;            // nombre brut
  populationEstimee: number;     // population estimée
}

export interface Zone {
  id: string;
  nom: string;
  adresse: string;
  gouvernorat: string;
  lat: number;
  lng: number;
  metrics: ZoneMetrics;
}

export type ComparisonCriterion = {
  key: keyof ZoneMetrics;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  format: (v: number) => string;
  // Pour le radar : valeur "max" servant à normaliser sur 0-10
  radarMax: number;
  // Label court pour le radar
  radarLabel: string;
};

// === Critères de comparaison (alignés sur les vraies données DB) ===
export const COMPARISON_CRITERIA: ComparisonCriterion[] = [
  {
    key: "scoreTotal",
    label: "Score global",
    radarLabel: "Score global",
    unit: "/100",
    higherIsBetter: true,
    radarMax: 100,
    format: (v) => `${Math.round(v)}/100`,
  },
  {
    key: "scoreAttractivite",
    label: "Attractivité",
    radarLabel: "Attractivité",
    unit: "/100",
    higherIsBetter: true,
    radarMax: 100,
    format: (v) => `${Math.round(Number(v))}/100`,
  },
  {
    key: "nbConcurrents",
    label: "Concurrents directs",
    radarLabel: "Concurrence",
    unit: "",
    higherIsBetter: false,
    radarMax: 200,
    format: (v) => v.toLocaleString("fr-FR"),
  },
  {
    key: "noteMoyConcurrents",
    label: "Qualité concurrence",
    radarLabel: "Qualité concur.",
    unit: "/5",
    higherIsBetter: false, // concurrents moins bien notés = opportunité
    radarMax: 5,
    format: (v) => `${Number(v).toFixed(1)}/5`,
  },
  {
    key: "nbStationsTransport",
    label: "Stations de transport",
    radarLabel: "Transport",
    unit: "",
    higherIsBetter: true,
    radarMax: 30,
    format: (v) => v.toLocaleString("fr-FR"),
  },
  {
    key: "nbParkings",
    label: "Parkings",
    radarLabel: "Parkings",
    unit: "",
    higherIsBetter: true,
    radarMax: 50,
    format: (v) => v.toLocaleString("fr-FR"),
  },
];

// === Helpers ===

export function getBestZoneId(
  zones: Zone[],
  criterion: ComparisonCriterion
): string | null {
  if (zones.length === 0) return null;
  // Si la métrique vaut 0 partout, pas de meilleur/pire
  const allZero = zones.every((z) => !z.metrics[criterion.key]);
  if (allZero) return null;

  return zones.reduce((best, current) => {
    const bestVal = best.metrics[criterion.key];
    const currentVal = current.metrics[criterion.key];
    if (criterion.higherIsBetter) {
      return currentVal > bestVal ? current : best;
    }
    return currentVal < bestVal ? current : best;
  }).id;
}

export function getWorstZoneId(
  zones: Zone[],
  criterion: ComparisonCriterion
): string | null {
  if (zones.length === 0) return null;
  const allZero = zones.every((z) => !z.metrics[criterion.key]);
  if (allZero) return null;

  return zones.reduce((worst, current) => {
    const worstVal = worst.metrics[criterion.key];
    const currentVal = current.metrics[criterion.key];
    if (criterion.higherIsBetter) {
      return currentVal < worstVal ? current : worst;
    }
    return currentVal > worstVal ? current : worst;
  }).id;
}