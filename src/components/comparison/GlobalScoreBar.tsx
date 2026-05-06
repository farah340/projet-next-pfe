"use client";

import { Zone, ZONE_COLORS } from "@/types/comparison";

interface GlobalScoreBarProps {
  zones: Zone[];
  secteur: string;
}

export default function GlobalScoreBar({ zones, secteur }: GlobalScoreBarProps) {
  const maxScore = Math.max(...zones.map((z) => z.metrics.scoreTotal));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Score global pour le secteur{" "}
          <span className="text-blue-600 capitalize">{secteur}</span>
        </h3>
        <span className="text-xs text-gray-500">/100</span>
      </div>

      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: `repeat(${zones.length}, minmax(0, 1fr))`,
        }}
      >
        {zones.map((zone, index) => {
          const color = ZONE_COLORS[index];
          const score = zone.metrics.scoreTotal;
          const isWinner = score === maxScore && zones.length > 1;

          return (
            <div key={zone.id}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-gray-600 truncate pr-2">
                  {zone.nom}
                </span>
                <span
                  className="text-xl font-medium flex items-baseline gap-1"
                  style={{ color: color.text }}
                >
                  {score}
                  <span className="text-xs text-gray-400">/100</span>
                  {isWinner && (
                    <span className="text-[10px] ml-1" title="Meilleur score">
                      🏆
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, score))}%`,
                    background: color.dot,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}