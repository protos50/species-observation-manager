import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const collectionApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/collection`, {
      headers: await createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
      headers: await createHeaders(),
    });
    return handleResponse(response);
  },

  getByPerson: async (personId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/collection/person/${personId}`,
      { headers: await createHeaders() }
    );
    return handleResponse(response);
  },

  create: async (collectionData: {
    collection_date: string;
    collector_id: number;
    locality_id: number;
    preservation_method_id: number;
    trap_id?: number;
    notes?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/collection`, {
      method: "POST",
      headers: await createHeaders(),
      body: JSON.stringify(collectionData),
    });
    return handleResponse(response);
  },

  update: async (id: string, collectionData: any) => {
    const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
      method: "PATCH",
      headers: await createHeaders(),
      body: JSON.stringify(collectionData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
      method: "DELETE",
      headers: await createHeaders(),
    });
    return handleResponse(response);
  },

  // Personas (colectores)
  persons: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/person`, {
        headers: await createHeaders(),
      });
      const data = await handleResponse(response);
      // Extraer solo datos de persona, ignorar Collection si existe
      return Array.isArray(data)
        ? data.map((person: any) => {
            const { Collection, ...personData } = person;
            return personData;
          })
        : [];
    },
    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/person/deleted`, {
        headers: await createHeaders(),
      });
      const data = await handleResponse(response);
      // Extraer solo datos de persona, ignorar Collection si existe
      return Array.isArray(data)
        ? data.map((person: any) => {
            const { Collection, ...personData } = person;
            return personData;
          })
        : [];
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/person/${id}`, {
        headers: await createHeaders(),
      });
      const data = await handleResponse(response);
      // Extraer solo datos de persona, ignorar Collection
      const { Collection, ...personData } = data;
      return personData;
    },

    create: async (personData: {
      person_name: string;
      person_lastname: string;
      email?: string;
      institution?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/person`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(personData),
      });
      const data = await handleResponse(response);
      // Extraer solo datos de persona, ignorar Collection si existe
      const { Collection, ...personDataResponse } = data;
      return personDataResponse;
    },

    update: async (
      id: string,
      personData: {
        person_name?: string;
        person_lastname?: string;
        email?: string;
        institution?: string;
      }
    ) => {
      const response = await fetch(`${API_BASE_URL}/person/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(personData),
      });
      const data = await handleResponse(response);
      // Extraer solo datos de persona, ignorar Collection si existe
      const { Collection, ...personDataResponse } = data;
      return personDataResponse;
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/person/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/person/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      const data = await handleResponse(response);
      // Extraer solo datos de persona, ignorar Collection si existe
      const { Collection, ...personData } = data;
      return personData;
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/person/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
  },
};
