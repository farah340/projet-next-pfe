export interface ZoneResult {
  id: string | number
  nom: string
  lat: number
  lng: number
  adresse: string
}

export interface TypeActivite {
  id: string
  nom: string
  icone: string | null
  radius: number
  categories: Categorie[]
}

export interface Categorie {
  id: string
  name: string
  google_type: string
  keywords: string[]
  typeActiviteId: string
}

export interface Lieu {
  id: string
  nom: string
  lat: number
  lng: number
  adresse: string
  categorie: string
  types: string
  note: number | null
  nbAvis: number
  placeId?: string
}