"use client";

import { AIVerdict } from "@/types/comparison";
import { Sparkles, Trophy, Loader2, FileDown, AlertCircle } from "lucide-react";

interface VerdictCardProps {
  verdict: AIVerdict | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onDownloadPdf?: () => void;
  hasPdf?: boolean;
}

export default function VerdictCard({
  verdict,
  isLoading,
  error,
  onGenerate,
  onDownloadPdf,
  hasPdf,
}: VerdictCardProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="font-medium text-sm text-red-900 mb-1">
              Erreur lors de la génération
            </p>
            <p className="text-xs text-red-700 mb-3">{error}</p>
            <button
              onClick={onGenerate}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="text-blue-600 animate-spin" size={20} />
          <div className="flex-1">
            <p className="font-medium text-sm text-blue-900">
              L'IA analyse vos zones...
            </p>
            <p className="text-xs text-blue-700">
              Génération du verdict et du rapport PDF · 10-30 secondes
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!verdict) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0">
            <Sparkles className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 mb-1">
              Obtenez un verdict détaillé par IA
            </p>
            <p className="text-xs text-gray-600">
              Analyse comparative + rapport PDF téléchargeable
            </p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <Sparkles size={14} />
          Générer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500" size={18} />
          <h3 className="text-sm font-medium text-blue-900">
            Verdict IA & recommandation
          </h3>
        </div>
        {hasPdf && onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            className="bg-white hover:bg-gray-50 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <FileDown size={12} />
            Télécharger PDF
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="bg-white/60 rounded-md p-3">
          <p className="text-xs text-blue-700 mb-1 font-medium">
            🎯 Zone recommandée
          </p>
          <p className="text-base font-medium text-blue-900">
            {verdict.gagnant}
          </p>
        </div>

        <div>
          <p className="text-xs text-blue-700 mb-1 font-medium">
            Justification
          </p>
          <p className="text-xs text-blue-900 leading-relaxed">
            {verdict.raison}
          </p>
        </div>

        {verdict.alternatives && (
          <div className="pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 mb-1 font-medium">
              À propos des autres zones
            </p>
            <p className="text-xs text-blue-800 italic leading-relaxed">
              {verdict.alternatives}
            </p>
          </div>
        )}

        {verdict.scores && verdict.scores.length > 0 && (
          <div className="pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 mb-2 font-medium">
              Classement final
            </p>
            <div className="space-y-1.5">
              {verdict.scores
                .sort((a, b) => a.rang - b.rang)
                .map((s) => (
                  <div
                    key={s.zoneId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-blue-900">
                      <span className="inline-block w-5 font-medium">
                        #{s.rang}
                      </span>
                      {s.nom}
                    </span>
                    <span className="font-medium text-blue-900">
                      {s.score.toFixed(1)}/10
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}