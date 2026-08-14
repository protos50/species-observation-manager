import { auth } from '../../../auth'

import { fetchDashboardData, fetchDashboardStats } from '@/lib/api/dashboard.api'
import { EnvironmentsChart } from '@/app/dashboard/components/EnvironmentsChart'
import { CommonSpeciesChart } from '@/app/dashboard/components/CommonSpeciesChart'
import { TaxonomyChart } from '@/app/dashboard/components/TaxonomyChart'
import Map from '@/components/map/map'

export default async function Page() {
  const session = await auth()
  const userName = session?.user?.name ?? ''

  // Fetch datos
  const [dashboardData, stats] = await Promise.all([
    fetchDashboardData().catch(() => ({
      metrics: null,
      recentObservations: [],
    })),
    fetchDashboardStats().catch(() => null),
  ])

  const { metrics, recentObservations } = dashboardData

  // Transformar datos de byCountry a Record<string, number> para el mapa
  const registrosPorProvincia: Record<string, number> = {}
  if (stats?.byCountry) {
    stats.byCountry.forEach((country) => {
      country.provinces.forEach((province) => {
        registrosPorProvincia[province.name] = province.count
      })
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex w-full flex-col gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#2C89A0] to-[#7DAC7C] bg-clip-text text-transparent">
          Hola
          {userName
            ? `, ${userName
                .split(' ')
                .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
                .join(' ')}`
            : ''}
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">Resumen de la plataforma</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
          <div className="w-full">
            <TaxonomyChart data={stats.taxonomy} />
          </div>

          <div className="w-full max-w-full sm:row-span-2">
            <Map registrosPorProvincia={registrosPorProvincia} />
          </div>

          <div className="w-full">
            <EnvironmentsChart stats={stats} />
          </div>

          <div className="sm:col-span-2 w-full">
            <CommonSpeciesChart data={stats.commonSpecies} />
          </div>
        </div>
      )}
    </div>
  )
}
