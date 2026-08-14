import { createHeaders } from './config'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

export interface ProvinceStatsResponse {
  province: string
  totalObservations: number
  totalSpecies: number
  totalGenera: number
  fieldTrips: number
  topSpecies: Array<{ species: string; count: number }>
}

export interface TopLocalityResponse {
  rank: number
  locality: string
  department: string
  observations: number
}

export const statsApi = {
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE}/stats/dashboard`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return null
    }
  },

  async getTaxonomyStats() {
    try {
      const response = await fetch(`${API_BASE}/stats/taxonomy`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching taxonomy stats:', error)
      return null
    }
  },

  async getEnvironmentStats() {
    try {
      const response = await fetch(`${API_BASE}/stats/environments`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching environment stats:', error)
      return null
    }
  },

  async getCommonSpecies() {
    try {
      const response = await fetch(`${API_BASE}/stats/common-species`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching common species:', error)
      return null
    }
  },

  async getStatsByProvince(province: string): Promise<ProvinceStatsResponse | null> {
    if (!province) {
      console.warn('Stats API warning: provincia no especificada')
      return null
    }

    try {
      const response = await fetch(`${API_BASE}/stats/province/${encodeURIComponent(province)}`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return (await response.json()) as ProvinceStatsResponse
    } catch (error) {
      console.error('Error fetching province stats:', error)
      return null
    }
  },

  async getStatsByCountry() {
    try {
      const response = await fetch(`${API_BASE}/stats/by-country`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching country stats:', error)
      return null
    }
  },

  async getTopLocalitiesByProvince(provinceName: string): Promise<TopLocalityResponse[] | null> {
    if (!provinceName) {
      return null
    }

    try {
      const response = await fetch(`${API_BASE}/stats/province/${encodeURIComponent(provinceName)}/top-localities`, {
        headers: await createHeaders(),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status}`)
      }

      return (await response.json()) as TopLocalityResponse[]
    } catch (error) {
      console.error('Error fetching top localities:', error)
      return null
    }
  },
}
