import { API_BASE_URL, handleResponse, createHeaders } from "./config";

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Login es público, no necesita JWT
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        id: data.user.user_id.toString(),
        name: `${data.user.first_name} ${data.user.last_name}`,
        email: data.user.email,
        role: data.user.role?.role_id || data.user.role_id,
        accessToken: data.backendTokens.accessToken,
        refreshToken: data.backendTokens.refreshToken,
      };
    } catch (error) {
      console.error("Error en loginUser:", error);
      return null;
    }
  },

  register: async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role_id: number
  ) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Register es público, no necesita JWT
      body: JSON.stringify({ first_name, last_name, email, password, role_id }),
    });

    return handleResponse(response);
  },
};
