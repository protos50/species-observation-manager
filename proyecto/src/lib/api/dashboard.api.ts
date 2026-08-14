import { usersApi } from "./users";
import { observationsApi } from "./observations";
import { trapsApi } from "./traps";
import { taxonomyApi } from "./taxonomy";
import { API_BASE_URL, createHeaders, handleResponse } from "./config";

export interface DashboardMetrics {
  users: number;
  observations: number;
  traps: number;
  taxa: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentObservations: any[];
}

export interface TaxonomyStats {
  subfamilies: number;
  genera: number;
  species: number;
  totalObservations: number;
}

export interface Environment {
  name: string;
  count: number;
}

export interface CommonSpecies {
  species: string;
  count: number;
}

export interface Province {
  id: number;
  name: string;
  count: number;
}

export interface Country {
  id: number;
  name: string;
  count: number;
  provinces: Province[];
}

export interface DashboardStats {
  taxonomy: TaxonomyStats;
  environments: Environment[];
  commonSpecies: CommonSpecies[];
  byCountry: Country[];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [users, observations, traps, taxa] = await Promise.all([
    usersApi.getAll().catch(() => []),
    observationsApi.getAll().catch(() => []),
    trapsApi.traps.getAll().catch(() => []),
    taxonomyApi.taxa.getAll().catch(() => []),
  ]);

  const metrics: DashboardMetrics = {
    users: Array.isArray(users) ? users.length : 0,
    observations: Array.isArray(observations) ? observations.length : 0,
    traps: Array.isArray(traps) ? traps.length : 0,
    taxa: Array.isArray(taxa) ? taxa.length : 0,
  };

  const recentObservations = Array.isArray(observations)
    ? observations.slice(0, 5)
    : [];

  return { metrics, recentObservations };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const headers = await createHeaders();
  const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
    headers,
    cache: "no-store",
  });
  return handleResponse(response);
}
