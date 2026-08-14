import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { formatDateLocal, formatDateTimeLocalFromUtc } from '@/lib/utils/dateUtils'

export type Observation = {
  id_observation: number
  id_taxon: number
  id_collection: number
  id_geolocation: number
  id_environment?: number | null
  id_caste?: number | null
  abundance?: number | null
  id_identifier?: number | null
  identification_date?: string | null
  id_confirmer?: number | null
  confirmation_date?: string | null
  biology_notes?: string | null
  general_observations?: string | null
  conservation_status?: string | null
  taxon: {
    id_taxon: number
    name: string
    id_taxonomic_level?: number
    id_author?: number | null
    description_year?: number | null
    parent_id?: number | null
    taxonomic_level?: {
      id_taxonomic_level: number
      name: string
    }
    author?: {
      id_author: number
      author_name: string
    } | null
  }
  collection: {
    id_collection: number
    id_person: number
    id_preservation_method: number
    id_trap: number
    id_taxon: number
    id_geolocation: number
    collection_date: string
    trap_number?: number | null
    person?: {
      id_person: number
      person_name: string
      person_lastname: string
    }
    preservation_method?: {
      id_preservation_method: number
      method_name: string
    }
    trap?: {
      id_trap: number
      trap_name: string
    }
    taxon?: {
      id_taxon: number
      name: string
      taxonomic_level?: {
        id_taxonomic_level: number
        name: string
      }
    }
    geolocation?: {
      id_geolocation: number
      latitude: number
      longitude: number
      altitude: number | null
      id_locality: number
      locality?: {
        id_locality: number
        locality_name: string
        department?: {
          department_name: string
          province?: {
            province_name: string
          }
        }
      }
    }
  }
  geolocation: {
    id_geolocation: number
    latitude: number
    longitude: number
    altitude: number | null
    source_type: string
    tag?: string | null
    id_locality: number
    ihh?: number | null
    distance_to_river?: number | null
    locality: {
      id_locality: number
      locality_name: string
      id_department: number
      department?: {
        id_department: number
        department_name: string
        id_province: number
        province?: {
          id_province: number
          province_name: string
          id_country: number
          country?: {
            id_country: number
            country_name: string
          }
        }
      }
    }
  }
  environment?: {
    id_environment: number
    environment_name: string
  } | null
  caste?: {
    id_caste: number
    caste_name: string
  } | null
  identifier?: {
    id_person: number
    person_name: string
    person_lastname: string
  } | null
  confirmer?: {
    id_person: number
    person_name: string
    person_lastname: string
  } | null
  climate_data?: {
    id_climate_data: number
    t_min?: number | null
    t_max?: number | null
    t_med?: number | null
    hr_min?: number | null
    hr_max?: number | null
    hr_med?: number | null
    pp_14_days_before?: number | null
    pp_30_days_before?: number | null
  } | null
}

const levelColor: Record<string, string> = {
  Kingdom: 'bg-purple-100 text-purple-800 border-purple-200',
  Phylum: 'bg-blue-100 text-blue-800 border-blue-200',
  Class: 'bg-green-100 text-green-800 border-green-200',
  Order: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Family: 'bg-orange-100 text-orange-800 border-orange-200',
  Genus: 'bg-red-100 text-red-800 border-red-200',
  Species: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function getObservationColumns(onOpenDetails: (o: Observation) => void): ColumnDef<Observation, any>[] {
  return [
    {
      accessorKey: 'taxon.name',
      header: 'Taxón',
      cell: ({ row }) => {
        const t = row.original.taxon
        const level = t.taxonomic_level?.name
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-900">{t.name}</div>
            {level && <Badge className={`${levelColor[level] || levelColor['Species']}`}>{level}</Badge>}
          </div>
        )
      },
    },
    {
      id: 'location',
      header: 'Localidad',
      cell: ({ row }) => {
        const geo = row.original.geolocation
        if (!geo?.locality) return <span className="text-gray-400">Sin localidad</span>
        const l = geo.locality
        const department = l.department?.department_name
        const province = l.department?.province?.province_name
        const country = l.department?.province?.country?.country_name
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{l.locality_name}</span>
            <span className="text-xs text-gray-500">{[department, province, country].filter(Boolean).join(' · ')}</span>
          </div>
        )
      },
    },
    {
      id: 'collector',
      header: 'Colector',
      cell: ({ row }) => {
        const p = row.original.collection.person
        const name = p ? `${p.person_name} ${p.person_lastname}` : '-'
        return <span>{name}</span>
      },
    },
    {
      id: 'date',
      header: 'Fecha',
      cell: ({ row }) => {
        const dateIso = row.original.collection.collection_date
        return (
          <span className="tabular-nums">
            {formatDateLocal(dateIso) === 'Sin fecha' ? '-' : formatDateLocal(dateIso)}
          </span>
        )
      },
    },
    {
      id: 'geo',
      header: 'Coordenadas',
      cell: ({ row }) => {
        const g = row.original.geolocation
        if (!g || g.latitude == null || g.longitude == null) {
          return (
            <div className="flex flex-col">
              <span className="tabular-nums text-gray-400">-</span>
              <span className="text-xs text-gray-400">No disponible</span>
            </div>
          )
        }
        return (
          <div className="flex flex-col">
            <span className="tabular-nums">
              {g.latitude.toFixed(4)}, {g.longitude.toFixed(4)}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">{g.source_type || '-'}</span>
              {g.tag && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-blue-600 font-medium">{g.tag}</span>
                </>
              )}
            </div>
          </div>
        )
      },
      meta: { align: 'right' },
    },
    {
      accessorKey: 'deleted_at',
      header: 'Fecha de baja',
      meta: {
        align: 'center',
      },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as Date | string | null | undefined
        if (!deletedAt) return '-'
        return formatDateTimeLocalFromUtc(String(deletedAt))
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const obs = row.original
        return (
          <div className=" ">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onOpenDetails(obs)}
              className="hover:bg-gray-100 cursor-pointer"
              aria-label={`Ver detalles de observación #${obs.id_observation}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
