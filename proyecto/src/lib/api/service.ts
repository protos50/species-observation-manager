import { API_BASE_URL, handleResponse, createHeaders } from "./config";

// Interfaces TypeScript basadas en la estructura del JSON
export interface Service {
  id_service: number;
  service_name: string;
  deleted_at: string | null;
}

export interface CreateServiceData {
  service_name: string;
}

export interface UpdateServiceData {
  service_name?: string;
}

export const serviceApi = {
  service: {
    getAll: async (): Promise<Service[]> => {
      // PUBLIC - Lista de servicios para formulario de contacto
      const response = await fetch(`${API_BASE_URL}/service`);
      return handleResponse(response);
    },
    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/service/deleted`, {
        cache: "no-store",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/service/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (serviceData: CreateServiceData): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/service`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(serviceData),
      });
      return handleResponse(response);
    },

    update: async (
      id: string,
      serviceData: UpdateServiceData
    ): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/service/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(serviceData),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/service/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/service/${id}/check-in-use`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/service/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },
};
