import React from 'react'
import { observationsApi } from '@/lib/api/observations'
import { ObservationClient } from './components/ObservationClient'

export default async function ObservacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const get = (key: string) => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }
  const page = Number(get('page') || '1') || 1
  const limit = Number(get('limit') || '10') || 10

  // Extract all filter parameters
  const filters: Record<string, string | undefined> = {
    q: get('q'),
    taxon_name: get('taxon_name'),
    person_name: get('person_name'),
    locality_name: get('locality_name'),
    department_name: get('department_name'),
    province_name: get('province_name'),
    country_name: get('country_name'),
    start_date: get('start_date'),
    end_date: get('end_date'),
    geolocation_tag: get('geolocation_tag'),
    latitude: get('latitude'),
    longitude: get('longitude'),
    radius: get('radius'),
    taxonomic_level: get('taxonomic_level'),
    caste: get('caste'),
    environment_name: get('environment_name'),
    conservation_status: get('conservation_status'),
    identifier_name: get('identifier_name'),
    confirmer_name: get('confirmer_name'),
    min_abundance: get('min_abundance'),
    max_abundance: get('max_abundance'),
  }

  // Clean filters by removing undefined and empty string values
  const cleanFilters: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value && value.trim()) {
      cleanFilters[key] = value.trim()
    }
  }

  const hasFilters = Object.keys(cleanFilters).length > 0
  const result = hasFilters
    ? await observationsApi.search({
        ...cleanFilters,
        page,
        limit,
      })
    : await observationsApi.getAll({ page, limit })
  const observations = Array.isArray(result?.data) ? result.data : result

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de observaciones</h1>
        <p className="text-muted-foreground mt-1">
          Revisa y explora las observaciones registradas con su información completa.
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <ObservationClient observations={observations} />
      </div>
    </div>
  )
}
