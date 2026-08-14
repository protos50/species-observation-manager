import { API_BASE_URL, handleResponse, createHeaders } from "./config";

export const castesApi = {
  castes: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/caste`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/caste/deleted`, {
        cache: "no-store",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/caste/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (casteData: { caste_name: string; description?: string }) => {
      const response = await fetch(`${API_BASE_URL}/caste`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(casteData),
      });
      return handleResponse(response);
    },

    update: async (id: string, casteData: any) => {
      const response = await fetch(`${API_BASE_URL}/caste/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(casteData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/caste/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/caste/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/caste/${id}/check-in-use`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },
};
