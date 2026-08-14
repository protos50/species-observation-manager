import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const geolocationApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/geolocation`, {
        headers: await createHeaders()
      });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/geolocation/${id}`, {
        headers: await createHeaders()
      });
    return handleResponse(response);
  },

  getByCoordinates: async (latitude: number, longitude: number) => {
    const response = await fetch(
      `${API_BASE_URL}/geolocation/coordinates?latitude=${latitude}&longitude=${longitude}`,
      { headers: await createHeaders() }
    );
    return handleResponse(response);
  },

  create: async (geolocationData: {
    latitude: number;
    longitude: number;
    altitude?: number;
    source_type?: string;
    tag?: string;
    ihh?: number;
    distance_to_river?: number;
    id_locality: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/geolocation`, {
      method: "POST",
        headers: await createHeaders(),
      body: JSON.stringify(geolocationData),
      });
    return handleResponse(response);
  },

  update: async (id: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/geolocation/${id}`, {
      method: "PUT",
        headers: await createHeaders(),
      body: JSON.stringify(updateData),
      });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/geolocation/${id}`, {
      method: "DELETE",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  checkIfInUse: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/geolocation/${id}/check-in-use`, {
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  getDeleted: async () => {
    const response = await fetch(`${API_BASE_URL}/geolocation/deleted/list`, {
      headers: await createHeaders()
    });
    return handleResponse(response);
  },

  restore: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/geolocation/${id}/restore`, {
      method: "PUT",
      headers: await createHeaders()
    });
    return handleResponse(response);
  },
};
