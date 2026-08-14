import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const preservationApi = {
  // Métodos de preservación
  preservationMethods: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/preservation-method`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
    getDeleted: async () => {
      const response = await fetch(
        `${API_BASE_URL}/preservation-method/deleted`,
        {
          cache: "no-store",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/preservation-method/${id}`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    create: async (methodData: {
      method_name: string;
      description?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/preservation-method`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(methodData),
      });
      return handleResponse(response);
    },

    update: async (id: string, methodData: any) => {
      const response = await fetch(
        `${API_BASE_URL}/preservation-method/${id}`,
        {
          method: "PATCH",
          headers: await createHeaders(),
          body: JSON.stringify(methodData),
        }
      );
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/preservation-method/${id}`,
        {
          method: "DELETE",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
    restore: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/preservation-method/${id}/restore`,
        {
          method: "PATCH",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/preservation-method/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
  },
};
