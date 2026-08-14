import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const rolesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/rol`, {
      cache: "no-store",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
        headers: await createHeaders()
      });
    return handleResponse(response);
  },

  create: async (roleData: { name: string; description: string }) => {
    const response = await fetch(`${API_BASE_URL}/rol`, {
      method: "POST",
        headers: await createHeaders(),
      body: JSON.stringify(roleData),
      });
    return handleResponse(response);
  },

  update: async (id: string, roleData: any) => {
    const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
      method: "PATCH",
        headers: await createHeaders(),
      body: JSON.stringify(roleData),
      });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
      method: "DELETE",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },
};
