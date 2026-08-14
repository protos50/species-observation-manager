import { API_BASE_URL, handleResponse, createHeaders } from "./config";

export interface TaxonomicLevel {
  id_taxonomic_level: number;
  name: string;
}

export interface Taxon {
  id_taxon: number;
  name: string;
  id_taxonomic_level: number;
  id_author?: number | null;
  description_year?: number | null;
  parent_id: number | null;
  taxonomic_level: TaxonomicLevel;
  parent: Taxon | null;
  author?: {
    id_author: number;
    author_name: string;
  } | null;
}

export interface CreateTaxonomicLevelData {
  name: string;
}

export interface CreateTaxonData {
  name: string;
  id_taxonomic_level: number;
  parent_id?: number | null;
  id_author?: number | null;
}

export interface UpdateTaxonomicLevelData {
  name?: string;
}

export interface UpdateTaxonData {
  name?: string;
  id_taxonomic_level?: number;
  parent_id?: number | null;
  id_author?: number | null;
}

// API principal
export const taxonomyApi = {
  // Niveles taxonómicos
  levels: {
    getAll: async (): Promise<TaxonomicLevel[]> => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level/deleted`, {
        cache: "no-store",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: number): Promise<TaxonomicLevel> => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (
      levelData: CreateTaxonomicLevelData
    ): Promise<TaxonomicLevel> => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(levelData),
      });
      return handleResponse(response);
    },

    update: async (
      id: number,
      levelData: UpdateTaxonomicLevelData
    ): Promise<TaxonomicLevel> => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(levelData),
      });
      return handleResponse(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/taxonomic-level/${id}/check-in-use`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: number): Promise<void> => {
      const response = await fetch(
        `${API_BASE_URL}/taxonomic-level/${id}/restore`,
        {
          method: "PATCH",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Taxones
  taxa: {
    // Obtener todos los taxones (con relaciones incluidas)
    getAll: async (): Promise<Taxon[]> => {
      const response = await fetch(`${API_BASE_URL}/taxon`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Obtener taxón por ID (con relaciones incluidas)
    getById: async (id: number): Promise<Taxon> => {
      const response = await fetch(`${API_BASE_URL}/taxon/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Obtener taxones por nivel taxonómico
    getByLevel: async (levelId: number): Promise<Taxon[]> => {
      const response = await fetch(`${API_BASE_URL}/taxon/level/${levelId}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Obtener taxones hijos por ID del padre
    getByParent: async (parentId: number): Promise<Taxon[]> => {
      const response = await fetch(`${API_BASE_URL}/taxon/parent/${parentId}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Obtener taxones raíz (sin padre)
    getRoot: async (): Promise<Taxon[]> => {
      const response = await fetch(`${API_BASE_URL}/taxon/root`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Obtener árbol taxonómico completo desde un taxón
    getTree: async (rootId?: number): Promise<Taxon[]> => {
      const url = rootId
        ? `${API_BASE_URL}/taxon/tree/${rootId}`
        : `${API_BASE_URL}/taxon/tree`;
      const response = await fetch(url, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Buscar taxones por nombre
    search: async (query: string): Promise<Taxon[]> => {
      const response = await fetch(
        `${API_BASE_URL}/taxon/search?q=${encodeURIComponent(query)}`,
        { headers: await createHeaders() }
      );
      return handleResponse(response);
    },

    // Crear nuevo taxón
    create: async (taxonData: CreateTaxonData): Promise<Taxon> => {
      const response = await fetch(`${API_BASE_URL}/taxon`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(taxonData),
      });
      return handleResponse(response);
    },

    // Actualizar taxón
    update: async (id: number, taxonData: UpdateTaxonData): Promise<Taxon> => {
      const response = await fetch(`${API_BASE_URL}/taxon/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(taxonData),
      });
      return handleResponse(response);
    },

    // Eliminar taxón
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/taxon/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Check if taxon is in use
    checkIfInUse: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/taxon/${id}/check-in-use`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Get deleted taxons
    getDeleted: async (): Promise<Taxon[]> => {
      const response = await fetch(`${API_BASE_URL}/taxon/deleted`, {
        cache: "no-store",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Restore taxon
    restore: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/taxon/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },
};

export default taxonomyApi;
