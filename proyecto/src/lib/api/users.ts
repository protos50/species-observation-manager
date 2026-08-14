import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const usersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      cache: "no-store",
      headers: await createHeaders()
    });

    const data = await handleResponse(response);
    return data.map((user: any) => ({
      ...user,
      created_at: new Date(user.created_at),
    }));
  },

  getDeleted: async () => {
    const response = await fetch(`${API_BASE_URL}/users/deleted`, {
      cache: "no-store",
      headers: await createHeaders()
    });

    const data = await handleResponse(response);
    return data.map((user: any) => ({
      ...user,
      created_at: new Date(user.created_at),
      deleted_at: user.deleted_at ? new Date(user.deleted_at) : null,
    }));
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: await createHeaders()
      });
    return handleResponse(response);
  },

  create: async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role_id: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
        headers: await createHeaders(),
      body: JSON.stringify(userData),
      });
    return handleResponse(response);
  },

  update: async (id: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
        headers: await createHeaders(),
      body: JSON.stringify(userData),
      });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  restore: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/restore`, {
      method: "PATCH",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },
};
