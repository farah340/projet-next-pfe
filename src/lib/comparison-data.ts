import { Zone, ComparisonCriterion } from "@/types/comparison";

// Données mockées — à remplacer par les appels API plus tard
export const MOCK_ZONES: Zone[] = [
  {
    id: "berges-lac-2",
    nom: "Berges du Lac II",
    adresse: "Taieb Mhiri, Délégation La Goulette",
    gouvernorat: "Tunis",
    lat: 36.8442,
    lng: 10.2719,
    metrics: {
      scoreTotal: 84,
      scoreAttractivite: 8.4,
      nbConcurrents: 142,
      noteMoyConcurrents: 3.2,
      nbStationsTransport: 8,
      nbParkings: 12,
      populationEstimee: 42100,
    },
  },
  {
    id: "la-marsa",
    nom: "La Marsa",
    adresse: "La Marsa, Tunis 2070",
    gouvernorat: "Tunis",
    lat: 36.8786,
    lng: 10.3247,
    metrics: {
      scoreTotal: 81,
      scoreAttractivite: 8.1,
      nbConcurrents: 87,
      noteMoyConcurrents: 3.5,
      nbStationsTransport: 6,
      nbParkings: 8,
      populationEstimee: 38500,
    },
  },
  {
    id: "rades",
    nom: "Délégation Radès",
    adresse: "Délégation Radès, Ben Arous",
    gouvernorat: "Ben Arous",
    lat: 36.7689,
    lng: 10.2756,
    metrics: {
      scoreTotal: 68,
      scoreAttractivite: 6.8,
      nbConcurrents: 34,
      noteMoyConcurrents: 4.1,
      nbStationsTransport: 4,
      nbParkings: 5,
      populationEstimee: 29800,
    },
  },
  {
    id: "ariana",
    nom: "Ariana Centre",
    adresse: "Ariana, Tunis",
    gouvernorat: "Ariana",
    lat: 36.8625,
    lng: 10.1956,
    metrics: {
      scoreTotal: 72,
      scoreAttractivite: 7.2,
      nbConcurrents: 65,
      noteMoyConcurrents: 3.8,
      nbStationsTransport: 5,
      nbParkings: 7,
      populationEstimee: 35200,
    },
  },
  {
    id: "tunisie-tradenet",
    nom: "Tunisie TradeNet (TTN)",
    adresse: "Rue du Lac Oubeira, Les Berges du Lac",
    gouvernorat: "Tunis",
    lat: 36.8431,
    lng: 10.2683,
    metrics: {
      scoreTotal: 76,
      scoreAttractivite: 7.6,
      nbConcurrents: 98,
      noteMoyConcurrents: 3.4,
      nbStationsTransport: 7,
      nbParkings: 10,
      populationEstimee: 28900,
    },
  },
];

// Définition des critères de comparaison
export const COMPARISON_CRITERIA: ComparisonCriterion[] = [
  {
    key: "scoreTotal",
    label: "Score global",
    radarLabel: "Score global",
    unit: "/100",
    higherIsBetter: true,
    radarMax: 100,
    format: (v) => `${v}/100`,
  },
  {
    key: "scoreAttractivite",
    label: "Attractivité",
    radarLabel: "Attractivité",
    unit: "/10",
    higherIsBetter: true,
    radarMax: 10,
    format: (v) => `${v}/10`,
  },
  {
    key: "nbConcurrents",
    label: "Concurrents directs",
    radarLabel: "Concurrence",
    unit: "",
    higherIsBetter: false,
    radarMax: 200,
    format: (v) => v.toString(),
  },
  {
    key: "noteMoyConcurrents",
    label: "Qualité concurrence",
    radarLabel: "Qualité concur.",
    unit: "/5",
    higherIsBetter: false,
    radarMax: 5,
    format: (v) => `${v}/5`,
  },
  {
    key: "nbStationsTransport",
    label: "Stations de transport",
    radarLabel: "Transport",
    unit: "",
    higherIsBetter: true,
    radarMax: 30,
    format: (v) => v.toString(),
  },
  {
    key: "nbParkings",
    label: "Parkings",
    radarLabel: "Parkings",
    unit: "",
    higherIsBetter: true,
    radarMax: 50,
    format: (v) => v.toString(),
  },
  {
    key: "populationEstimee",
    label: "Population estimée",
    radarLabel: "Population",
    unit: "hab.",
    higherIsBetter: true,
    radarMax: 50000,
    format: (v) => (v > 0 ? v.toLocaleString("fr-FR") : "—"),
  },
];

export const SECTEURS = [
  { value: "restauration", label: "Restauration" },
  { value: "pharmacie", label: "Pharmacie" },
  { value: "retail", label: "Commerce détail" },
  { value: "services", label: "Services" },
  { value: "education", label: "Éducation" },
  { value: "sante", label: "Santé" },
] as const;

// Helper : trouve l'ID de la zone "meilleure" pour un critère donné
export function getBestZoneId(
  zones: Zone[],
  criterion: ComparisonCriterion
): string | null {
  if (zones.length === 0) return null;
  return zones.reduce((best, current) => {
    const bestVal = best.metrics[criterion.key];
    const currentVal = current.metrics[criterion.key];
    if (criterion.higherIsBetter) {
      return currentVal > bestVal ? current : best;
    }
    return currentVal < bestVal ? current : best;
  }).id;
}

// Helper : trouve l'ID de la zone "pire" pour un critère donné
export function getWorstZoneId(
  zones: Zone[],
  criterion: ComparisonCriterion
): string | null {
  if (zones.length === 0) return null;
  return zones.reduce((worst, current) => {
    const worstVal = worst.metrics[criterion.key];
    const currentVal = current.metrics[criterion.key];
    if (criterion.higherIsBetter) {
      return currentVal < worstVal ? current : worst;
    }
    return currentVal > worstVal ? current : worst;
  }).id;
}