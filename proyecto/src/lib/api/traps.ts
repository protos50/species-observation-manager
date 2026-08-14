import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const trapsApi = {
  // Trampas
  traps: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/trap`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/trap/deleted`, {
        cache: "no-store",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/trap/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (trapData: { trap_name: string; description?: string }) => {
      const response = await fetch(`${API_BASE_URL}/trap`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(trapData),
      });
      return handleResponse(response);
    },

    update: async (id: string, trapData: any) => {
      const response = await fetch(`${API_BASE_URL}/trap/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(trapData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/trap/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/trap/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/trap/${id}/check-in-use`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },
};
