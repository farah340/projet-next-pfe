import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const query = q.toLowerCase().includes('tunis') ? q : `${q}, Tunisie`

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&accept-language=fr`,
      {
        headers: {
          'User-Agent': 'MarketMap-PFE/1.0',
          'Accept-Language': 'fr'
        }
      }
    )

    if (!res.ok) throw new Error('Nominatim error')

    const data = await res.json()

    const results = data.map((item: any) => ({
      id: item.place_id,
      nom: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      adresse: item.display_name,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Erreur de recherche' }, { status: 500 })
  }
}