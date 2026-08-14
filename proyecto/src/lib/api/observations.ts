import { API_BASE_URL, handleResponse, createHeaders } from "./config";

export const observationsApi = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    search.set("sort", "desc"); // Más recientes primero
    const query = search.toString();
    const url = query
      ? `${API_BASE_URL}/observation?${query}`
      : `${API_BASE_URL}/observation`;
    const response = await fetch(url, { 
      cache: "no-store",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/observation/${id}`, {
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  search: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const str = String(value).trim();
      if (str) params.set(key, str);
    });
    params.set("sort", "desc"); // Más recientes primero
    const response = await fetch(
      `${API_BASE_URL}/observation/search?${params}`,
      {
        cache: "no-store",
        headers: await createHeaders()
      }
    );
    return handleResponse(response);
  },

  getByTaxon: async (taxonId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/observation/taxon/${taxonId}`
    );
    return handleResponse(response);
  },

  getByLocality: async (localityId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/observation/locality/${localityId}`
    );
    return handleResponse(response);
  },

  getByCollection: async (collectionId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/observation/collection/${collectionId}`
    );
    return handleResponse(response);
  },

  createWithCollection: async (observationData: any) => {
    const response = await fetch(
      `${API_BASE_URL}/observation/with-collection`,
      {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(observationData),
      }
    );
    return handleResponse(response);
  },

  update: async (id: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/observation/${id}`, {
      method: "PATCH",
      headers: await createHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/observation/${id}`, {
      method: "DELETE",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  getDeleted: async () => {
    const response = await fetch(`${API_BASE_URL}/observation/deleted`, {
      cache: "no-store",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  restore: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/observation/${id}/restore`, {
      method: "PATCH",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },
};
