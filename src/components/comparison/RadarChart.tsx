"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Zone,
  ZONE_COLORS,
  COMPARISON_CRITERIA,
  ZoneMetrics,
} from "@/types/comparison";

interface RadarChartProps {
  zones: Zone[];
}

export default function RadarChart({ zones }: RadarChartProps) {
  // Normalise une valeur sur 0-10 selon le max du critère.
  // Si higherIsBetter = false, on inverse (10 = mieux dans tous les cas)
  // pour que sur le radar, "plus c'est étendu, mieux c'est".
  const normalize = (
    value: number,
    max: number,
    higherIsBetter: boolean
  ) => {
    if (!max || max <= 0) return 0;
    const raw = Math.min(10, (value / max) * 10);
    return higherIsBetter ? raw : 10 - raw;
  };

  // Construit dynamiquement les axes du radar à partir de COMPARISON_CRITERIA.
  const visibleCriteria = COMPARISON_CRITERIA;

  const data = visibleCriteria.map((criterion) => {
    const point: Record<string, string | number> = {
      critere: criterion.radarLabel,
    };
    zones.forEach((zone, idx) => {
      const value = zone.metrics[criterion.key as keyof ZoneMetrics] ?? 0;
      point[`zone${idx}`] = normalize(
        Number(value),
        criterion.radarMax,
        criterion.higherIsBetter
      );
    });
    return point;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 h-full">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Vue multi-critères
      </h3>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar data={data} outerRadius="75%">
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="critere"
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fontSize: 9, fill: "#9CA3AF" }}
            />
            {zones.map((zone, index) => {
              const color = ZONE_COLORS[index];
              return (
                <Radar
                  key={zone.id}
                  name={zone.nom}
                  dataKey={`zone${index}`}
                  stroke={color.dot}
                  fill={color.dot}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              );
            })}
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              iconType="circle"
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-2">
        Plus la surface est étendue, mieux c'est sur ces critères.
      </p>
    </div>
  );
}