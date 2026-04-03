// features/recherche-zone/components/LieuCard.tsx
'use client'

import { MapPin, Star, MessageSquare } from 'lucide-react'
import { Lieu } from '@/types'
import { CAT_COLORS, DEFAULT_COLOR } from '@/constants'

interface LieuCardProps {
  lieu: Lieu
  isSelected: boolean
  onClick: (lieu: Lieu) => void
}

export function LieuCard({ lieu, isSelected, onClick }: LieuCardProps) {
  const color = CAT_COLORS[lieu.categorie] || DEFAULT_COLOR

  return (
    <button
      onClick={() => onClick(lieu)}
      className={`text-left p-4 rounded-xl border transition-all bg-white w-full ${
        isSelected
          ? 'border-blue-300 ring-2 ring-blue-100 shadow-md'
          : 'border-slate-100 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <MapPin className="w-4 h-4" style={{ color }} />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{lieu.nom}</div>
          {lieu.adresse && (
            <div className="text-xs text-slate-500 truncate mt-0.5">{lieu.adresse}</div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${color}15`, color }}
            >
              {lieu.categorie}
            </span>
            {lieu.note != null && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {lieu.note}
                {lieu.nbAvis > 0 && (
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <MessageSquare className="w-2.5 h-2.5" />
                    {lieu.nbAvis}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}