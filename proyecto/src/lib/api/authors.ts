import { API_BASE_URL, handleResponse, createHeaders } from "./config";

export const authorsApi = {
  authors: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/author`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/author/deleted`, {
        cache: "no-store",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/author/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (authorData: { author_name: string }) => {
      const response = await fetch(`${API_BASE_URL}/author`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(authorData),
      });
      return handleResponse(response);
    },

    update: async (id: string, authorData: any) => {
      const response = await fetch(`${API_BASE_URL}/author/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(authorData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/author/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/author/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    
    checkIfInUse: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/author/${id}/check-in-use`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },
};
