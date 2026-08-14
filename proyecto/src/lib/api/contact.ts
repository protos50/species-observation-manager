import { API_BASE_URL, handleResponse, createHeaders } from "./config";

// Interfaces TypeScript basadas en la estructura del JSON
export interface Service {
  id_service: number;
  service_name: string;
  deleted_at: string | null;
}

export interface Contact {
  id_contact: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  deleted_at: string | null;
  status: boolean;
  id_service: number;
  service: Service;
}

export interface CreateContactData {
  name: string;
  email: string;
  message: string;
  id_service: number;
}

export interface UpdateContactData {
  name?: string;
  email?: string;
  message?: string;
  id_service?: number;
  status?: boolean;
}

export const contactApi = {
  contact: {
    getAll: async (): Promise<Contact[]> => {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        headers: await createHeaders()
      });
      return handleResponse(response);
    },

    getById: async (id: string): Promise<Contact> => {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        headers: await createHeaders()
      });
      return handleResponse(response);
    },

    create: async (contactData: CreateContactData): Promise<Contact> => {
      // PUBLIC - No requiere autenticación (formulario de contacto en landing)
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });
      return handleResponse(response);
    },

    update: async (
      id: string,
      contactData: UpdateContactData
    ): Promise<Contact> => {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(contactData),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: "DELETE",
        headers: await createHeaders()
      });
      return handleResponse(response);
    },

    // Método adicional para obtener contactos por servicio
  },
};
