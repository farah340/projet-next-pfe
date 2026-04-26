import ZoneAnalysePage from '@/components/zone-analyse/ZoneAnalysePage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ZoneAnalysePage params={{ id }} />
}