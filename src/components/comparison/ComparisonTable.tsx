"use client";

import {
  Zone,
  ZONE_COLORS,
  COMPARISON_CRITERIA,
  getBestZoneId,
  getWorstZoneId,
} from "@/types/comparison";

interface ComparisonTableProps {
  zones: Zone[];
}

export default function ComparisonTable({ zones }: ComparisonTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 h-full">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Tableau comparatif détaillé
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 px-2 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Critère
              </th>
              {zones.map((zone, index) => {
                const color = ZONE_COLORS[index];
                return (
                  <th
                    key={zone.id}
                    className="py-2.5 px-2 font-medium text-xs"
                    style={{ color: color.text }}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: color.dot }}
                      />
                      <span className="truncate">{zone.nom}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_CRITERIA.map((criterion) => {
              const bestId = getBestZoneId(zones, criterion);
              const worstId =
                zones.length >= 2 ? getWorstZoneId(zones, criterion) : null;

              // Si la métrique vaut 0 partout (ex: populationEstimee non calculée),
              // on grise toute la ligne pour signaler qu'elle n'est pas disponible.
              const allEmpty = zones.every(
                (z) => !z.metrics[criterion.key]
              );

              return (
                <tr
                  key={criterion.key}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    allEmpty ? "opacity-50" : "hover:bg-gray-50/50"
                  }`}
                >
                  <td className="py-3 px-2 text-gray-600 text-xs">
                    {criterion.label}
                    {allEmpty && (
                      <span className="ml-1 text-[10px] text-gray-400">
                        (à venir)
                      </span>
                    )}
                  </td>
                  {zones.map((zone) => {
                    const value = zone.metrics[criterion.key] ?? 0;
                    const isBest =
                      zone.id === bestId &&
                      zones.length >= 2 &&
                      !allEmpty;
                    const isWorst =
                      zone.id === worstId &&
                      zones.length >= 2 &&
                      !isBest &&
                      !allEmpty;

                    let cellClass =
                      "py-3 px-2 text-center text-xs transition-colors";
                    if (isBest) {
                      cellClass +=
                        " bg-green-50 text-green-800 font-medium rounded";
                    } else if (isWorst) {
                      cellClass +=
                        " bg-red-50 text-red-800 font-medium rounded";
                    } else {
                      cellClass += " text-gray-700";
                    }

                    return (
                      <td key={zone.id} className={cellClass}>
                        {criterion.format
                          ? criterion.format(Number(value))
                          : `${value} ${criterion.unit}`}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded" />
          <span>Meilleur</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded" />
          <span>À surveiller</span>
        </div>
      </div>
    </div>
  );
}