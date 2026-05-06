// app/dashboard/comparaison/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Zone,
    AIVerdict,
    MIN_ZONES_FOR_COMPARISON,
} from "@/types/comparison";
import { Save, Download, BarChart3, Loader2 } from "lucide-react";

import ZoneSelector from "@/components/comparison/ZoneSelector";
import GlobalScoreBar from "@/components/comparison/GlobalScoreBar";
import RadarChart from "@/components/comparison/RadarChart";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import VerdictCard from "@/components/comparison/VerdictCard";

// === Types des réponses API ===

interface AnalyseFromAPI {
    id: string;
    zoneId: string;
    scoreTotal: number | null;
    scoreAttractivite: string | number | null; // Decimal Prisma → string en JSON
    nbConcurrents: number | null;
    noteMoyConcurrents: string | number | null;
    nbStationsTransport: number | null;
    nbParkings: number | null;
    scoresDetails: any;
    verdict: string | null;
    recommandation: string | null;
    dateAnalyse: string;
    activite: string | null;
}

interface ZoneFromAPI {
    id: string;
    nom: string;
    description: string | null;
    adresse: string;
    lat: number;
    lng: number;
    geojson: any;
    userId: string;
    createdAt: string;
    updatedAt: string;
    analyses?: AnalyseFromAPI[];
    _count?: { analyses: number };
}

interface TypeActiviteFromAPI {
    id: string;
    nom: string;
    icone: string | null;
}

// === Helper : sélectionne la meilleure analyse parmi celles disponibles ===
// Priorité : analyse récente avec des données valides (concurrents > 0 ou parkings > 0)
function pickBestAnalyse(analyses?: AnalyseFromAPI[]): AnalyseFromAPI | undefined {
    if (!analyses || analyses.length === 0) return undefined;

    // 1. Cherche une analyse avec des vraies données (pas que des 0)
    const withData = analyses.find(
        (a) =>
            (a.nbConcurrents ?? 0) > 0 ||
            (a.nbParkings ?? 0) > 0 ||
            (a.nbStationsTransport ?? 0) > 0
    );
    if (withData) return withData;

    // 2. Sinon prend la plus récente (déjà triée DESC par l'API)
    return analyses[0];
}

// === Helper : extrait les vraies metrics depuis l'analyse ===
function buildMetricsFromAnalyse(analyse?: AnalyseFromAPI) {
    if (!analyse) {
        return {
            scoreTotal: 0,
            scoreAttractivite: 0,
            nbConcurrents: 0,
            noteMoyConcurrents: 0,
            nbStationsTransport: 0,
            nbParkings: 0,
            populationEstimee: 0,
        };
    }

    return {
        scoreTotal: Number(analyse.scoreTotal ?? 0),
        scoreAttractivite: Number(analyse.scoreAttractivite ?? 0),
        nbConcurrents: Number(analyse.nbConcurrents ?? 0),
        noteMoyConcurrents: Number(analyse.noteMoyConcurrents ?? 0),
        nbStationsTransport: Number(analyse.nbStationsTransport ?? 0),
        nbParkings: Number(analyse.nbParkings ?? 0),
        populationEstimee: 0,
    };
}

export default function ComparaisonPage() {
    const [availableZones, setAvailableZones] = useState<Zone[]>([]);
    const [typesActivite, setTypesActivite] = useState<TypeActiviteFromAPI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
    const [secteur, setSecteur] = useState<string>("");

    const [verdict, setVerdict] = useState<AIVerdict | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // === Fetch des zones + types d'activité au mount et quand secteur change ===
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                setIsLoading(true);
                setLoadError(null);

                const zonesUrl = secteur
                    ? `/api/zones?withAnalyses=1&activite=${encodeURIComponent(secteur)}`
                    : `/api/zones?withAnalyses=1`;

                const [zonesRes, typesRes] = await Promise.all([
                    fetch(zonesUrl, { credentials: "include" }),
                    typesActivite.length === 0
                        ? fetch("/api/types-activite?withAnalyses=1", {
                              credentials: "include",
                          })
                        : Promise.resolve(null),
                ]);

                if (!zonesRes.ok) {
                    if (zonesRes.status === 401) {
                        throw new Error("Vous devez être connecté");
                    }
                    throw new Error(`Erreur chargement zones (${zonesRes.status})`);
                }

                const zonesData: ZoneFromAPI[] = await zonesRes.json();

                let typesData: TypeActiviteFromAPI[] = typesActivite;
                if (typesRes) {
                    if (!typesRes.ok) {
                        throw new Error(`Erreur chargement secteurs (${typesRes.status})`);
                    }
                    typesData = await typesRes.json();
                }

                if (cancelled) return;

                // Mapping : extraction des vraies metrics depuis la meilleure analyse
                const zones: Zone[] = zonesData.map((z) => ({
                    id: z.id,
                    nom: z.nom,
                    adresse: z.adresse,
                    gouvernorat: z.adresse,
                    lat: z.lat,
                    lng: z.lng,
                    metrics: buildMetricsFromAnalyse(pickBestAnalyse(z.analyses)),
                }));

                setAvailableZones(zones);

                if (typesRes) {
                    setTypesActivite(typesData);
                    if (typesData.length > 0 && !secteur) {
                        setSecteur(typesData[0].nom);
                    }
                }
            } catch (err) {
                if (cancelled) return;
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger les données";
                setLoadError(msg);
                console.error("Erreur chargement:", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadData();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secteur]);

    const handleAddZone = (zone: Zone) => {
        setSelectedZones((prev) => [...prev, zone]);
        setVerdict(null);
        setPdfUrl(null);
        setError(null);
    };

    const handleRemoveZone = (zoneId: string) => {
        setSelectedZones((prev) => prev.filter((z) => z.id !== zoneId));
        setVerdict(null);
        setPdfUrl(null);
        setError(null);
    };

    const handleSecteurChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSecteur(e.target.value);
        setSelectedZones([]);
        setVerdict(null);
        setPdfUrl(null);
    };

    const handleGenerateVerdict = async () => {
        if (selectedZones.length < MIN_ZONES_FOR_COMPARISON) return;
        if (!secteur) {
            setError("Veuillez sélectionner un secteur");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch("/api/comparison", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    secteur,
                    zones: selectedZones.map((z) => ({
                        id: z.id,
                        nom: z.nom,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Erreur inconnue");
            }

            setVerdict(data.verdict);
            if (data.pdfUrl) {
                setPdfUrl(data.pdfUrl);
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erreur lors de la génération";
            setError(message);
            console.error("Erreur génération verdict:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!pdfUrl) return;
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `comparaison-zones-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSave = async () => {
        alert("Fonctionnalité de sauvegarde à implémenter");
    };

    const canCompare = selectedZones.length >= MIN_ZONES_FOR_COMPARISON;

    if (isLoading && availableZones.length === 0 && typesActivite.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2
                            className="mx-auto text-blue-600 animate-spin mb-3"
                            size={32}
                        />
                        <p className="text-sm text-gray-600">Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="font-medium text-red-900 mb-2">
                        Impossible de charger les données
                    </p>
                    <p className="text-sm text-red-700 mb-4">{loadError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (typesActivite.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <BarChart3 className="mx-auto text-amber-600 mb-3" size={40} />
                    <p className="font-medium text-amber-900 mb-2">
                        Aucun secteur disponible
                    </p>
                    <p className="text-sm text-amber-700">
                        Aucune analyse n'a encore été faite pour vos zones. Lancez d'abord
                        une analyse sur au moins une de vos zones.
                    </p>
                </div>
            </div>
        );
    }

    if (availableZones.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <BarChart3 className="mx-auto text-amber-600 mb-3" size={40} />
                    <p className="font-medium text-amber-900 mb-2">
                        Aucune zone analysée pour ce secteur
                    </p>
                    <p className="text-sm text-amber-700">
                        Aucune zone n'a d'analyse pour le secteur « {secteur} ». Essayez
                        un autre secteur ou lancez l'analyse sur vos zones.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                        Comparaison des zones
                    </h1>
                    <p className="text-sm text-gray-500">
                        Analysez jusqu'à 4 zones côte à côte selon vos critères métier
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <label className="text-xs text-gray-500">Secteur :</label>
                        <select
                            value={secteur}
                            onChange={handleSecteurChange}
                            className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                            {typesActivite.map((t) => (
                                <option key={t.id} value={t.nom}>
                                    {t.icone ? `${t.icone} ` : ""}
                                    {t.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    {pdfUrl && (
                        <button
                            onClick={handleDownloadPdf}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                            <Download size={14} />
                            Exporter PDF
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={!canCompare}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                        <Save size={14} />
                        Sauvegarder
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <ZoneSelector
                    selectedZones={selectedZones}
                    availableZones={availableZones}
                    onAdd={handleAddZone}
                    onRemove={handleRemoveZone}
                />
            </div>

            {selectedZones.length === 0 && (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                    <BarChart3 className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Commencez par sélectionner des zones
                    </p>
                    <p className="text-xs text-gray-500">
                        Ajoutez au moins 2 zones pour démarrer la comparaison
                    </p>
                </div>
            )}

            {selectedZones.length === 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-amber-900">
                        <span className="font-medium">Ajoutez au moins une autre zone</span>{" "}
                        pour démarrer la comparaison
                    </p>
                </div>
            )}

            {canCompare && (
                <div className="space-y-4">
                    <GlobalScoreBar zones={selectedZones} secteur={secteur} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <RadarChart zones={selectedZones} />
                        <ComparisonTable zones={selectedZones} />
                    </div>

                    <VerdictCard
                        verdict={verdict}
                        isLoading={isGenerating}
                        error={error}
                        onGenerate={handleGenerateVerdict}
                        onDownloadPdf={handleDownloadPdf}
                        hasPdf={!!pdfUrl}
                    />
                </div>
            )}
        </div>
    );
}