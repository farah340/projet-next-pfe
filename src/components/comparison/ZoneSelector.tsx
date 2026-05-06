"use client";

import { useState } from "react";
import { Zone, ZONE_COLORS, MAX_ZONES } from "@/types/comparison";
import { MapPin, X, Plus, Search } from "lucide-react";

interface ZoneSelectorProps {
  selectedZones: Zone[];
  availableZones: Zone[];
  onAdd: (zone: Zone) => void;
  onRemove: (zoneId: string) => void;
}

export default function ZoneSelector({
  selectedZones,
  availableZones,
  onAdd,
  onRemove,
}: ZoneSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const canAddMore = selectedZones.length < MAX_ZONES;

  const filteredZones = availableZones
    .filter((z) => !selectedZones.find((sz) => sz.id === z.id))
    .filter(
      (z) =>
        z.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        z.adresse.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAdd = (zone: Zone) => {
    onAdd(zone);
    setIsModalOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {selectedZones.map((zone, index) => {
          const color = ZONE_COLORS[index];
          return (
            <div
              key={zone.id}
              className="relative bg-white border rounded-lg p-4 transition-all hover:shadow-sm"
              style={{ borderColor: color.border + "40" }}
            >
              <button
                onClick={() => onRemove(zone.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-400 transition-colors"
                aria-label="Retirer cette zone"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: color.dot }}
                />
                <span
                  className="text-xs uppercase tracking-wide font-medium"
                  style={{ color: color.text }}
                >
                  Zone {String.fromCharCode(65 + index)}
                </span>
              </div>

              <p className="font-medium text-sm text-gray-900 mb-1 truncate">
                {zone.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">
                <MapPin size={10} className="inline mr-1" />
                {zone.gouvernorat}
              </p>
            </div>
          );
        })}

        {canAddMore && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[100px]"
          >
            <Plus size={20} />
            <span className="text-sm font-medium">Ajouter une zone</span>
            <span className="text-xs text-gray-400">
              {selectedZones.length}/{MAX_ZONES} sélectionnées
            </span>
          </button>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sélectionner une zone
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou adresse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredZones.length === 0 ? (
                <p className="text-center text-gray-500 py-12 text-sm">
                  Aucune zone trouvée
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredZones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => handleAdd(zone)}
                      className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={16}
                          className="text-blue-600 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">
                            {zone.nom}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {zone.adresse}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {zone.metrics.scoreTotal}/100
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}