/**
 * Diagnostic : affiche l'état actuel des analyses en DB.
 * Repère facilement les analyses qui sont des MOCKS (score=75, verdict='Favorable')
 * vs les vraies analyses n8n.
 *
 * Usage : npx tsx prisma/check-analyses.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

import { prisma } from '../src/lib/bd'

async function check() {
  const all = await prisma.analyse.findMany({
    orderBy: { dateAnalyse: 'desc' },
    select: {
      id: true,
      nomZone: true,
      activite: true,
      scoreTotal: true,
      verdict: true,
      nbConcurrents: true,
      nbStationsTransport: true,
      nbParkings: true,
      noteMoyConcurrents: true,
      recommandation: true,
      dateAnalyse: true,
    },
  })

  console.log(`📊 ${all.length} analyse(s) en DB\n`)

  for (const a of all) {
    // Heuristique : si recommandation contient "Analyse n8n indisponible" ou
    // si toutes les valeurs annexes sont à 0 → c'est probablement un mock
    const isMock =
      a.recommandation?.includes('Analyse n8n indisponible') ||
      (a.scoreTotal === 75 &&
       a.verdict === 'Favorable' &&
       a.nbStationsTransport === 0 &&
       a.nbParkings === 0)

    const tag = isMock ? '🤖 MOCK ' : '✅ VRAI '
    const note = a.noteMoyConcurrents != null ? Number(a.noteMoyConcurrents).toFixed(1) : '—'

    console.log(
      `${tag} ${a.nomZone ?? '?'} / ${a.activite ?? '?'} ` +
      `→ score=${a.scoreTotal ?? '—'}, ` +
      `concurrents=${a.nbConcurrents}, ` +
      `note=${note}, ` +
      `transports=${a.nbStationsTransport}, ` +
      `parkings=${a.nbParkings}, ` +
      `${a.dateAnalyse.toISOString().slice(0, 16)}`
    )
  }

  // Statistiques
  const mocks = all.filter(a =>
    a.recommandation?.includes('Analyse n8n indisponible') ||
    (a.scoreTotal === 75 && a.verdict === 'Favorable' && a.nbStationsTransport === 0 && a.nbParkings === 0)
  )
  const reals = all.length - mocks.length

  console.log('\n' + '━'.repeat(50))
  console.log(`Total : ${all.length} analyse(s)`)
  console.log(`   ✅ Vraies (n8n) : ${reals}`)
  console.log(`   🤖 Mocks       : ${mocks.length}`)
}

check()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(() => prisma.$disconnect())