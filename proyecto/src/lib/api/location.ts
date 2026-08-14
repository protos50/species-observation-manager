import { API_BASE_URL, handleResponse, createHeaders } from "./config";
export const locationApi = {
  // Países
  countries: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/country`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/country/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (countryData: { country_name: string }) => {
      const response = await fetch(`${API_BASE_URL}/country`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(countryData),
      });
      return handleResponse(response);
    },

    update: async (id: string, countryData: any) => {
      const response = await fetch(`${API_BASE_URL}/country/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(countryData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/country/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/country/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/country/deleted/list`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/country/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Provincias
  provinces: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/province`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/province/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getByCountry: async (countryId: string) => {
      const response = await fetch(
        `${API_BASE_URL}/province/country/${countryId}`,
        { headers: await createHeaders() }
      );
      return handleResponse(response);
    },

    create: async (provinceData: {
      id_country: number;
      province_name: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/province`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(provinceData),
      });
      return handleResponse(response);
    },

    update: async (id: string, provinceData: any) => {
      const response = await fetch(`${API_BASE_URL}/province/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(provinceData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/province/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/province/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/province/deleted/list`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/province/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Departamentos
  departments: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/department`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/department/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getByProvince: async (provinceId: string) => {
      const response = await fetch(
        `${API_BASE_URL}/department/province/${provinceId}`,
        { headers: await createHeaders() }
      );
      return handleResponse(response);
    },

    create: async (departmentData: {
      id_province: number;
      department_name: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/department`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(departmentData),
      });
      return handleResponse(response);
    },

    update: async (id: string, departmentData: any) => {
      const response = await fetch(`${API_BASE_URL}/department/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(departmentData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/department/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/department/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/department/deleted/list`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/department/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Localidades
  localities: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/locality`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/locality/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getByDepartment: async (departmentId: string) => {
      const response = await fetch(
        `${API_BASE_URL}/locality/department/${departmentId}`,
        { headers: await createHeaders() }
      );
      return handleResponse(response);
    },

    create: async (localityData: {
      id_department: number;
      locality_name: string;
      id_environment?: number;
    }) => {
      const response = await fetch(`${API_BASE_URL}/locality`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(localityData),
      });
      return handleResponse(response);
    },

    update: async (id: string, localityData: any) => {
      const response = await fetch(`${API_BASE_URL}/locality/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(localityData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/locality/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/locality/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/locality/deleted/list`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/locality/${id}/restore`, {
        method: "PATCH",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Geolocalizaciones
  geolocations: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/geolocation`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/geolocation/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/geolocation`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_BASE_URL}/geolocation/${id}`, {
        method: "PUT",
        headers: await createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/geolocation/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/geolocation/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/geolocation/deleted/list`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/geolocation/${id}/restore`,
        {
          method: "PUT",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Environments
  environments: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/environment`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/environment/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (environmentData: any) => {
      const response = await fetch(`${API_BASE_URL}/environment`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(environmentData),
      });
      return handleResponse(response);
    },

    update: async (id: string, environmentData: any) => {
      const response = await fetch(`${API_BASE_URL}/environment/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(environmentData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/environment/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/environment/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(`${API_BASE_URL}/environment/deleted/list`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/environment/${id}/restore`,
        {
          method: "PATCH",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Datos Climáticos
  climateData: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/climate-data`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/climate-data/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    create: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/climate-data`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_BASE_URL}/climate-data/${id}`, {
        method: "PATCH",
        headers: await createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/climate-data/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    checkIfInUse: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/climate-data/${id}/check-in-use`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    getDeleted: async () => {
      const response = await fetch(
        `${API_BASE_URL}/climate-data/deleted/list`,
        {
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    restore: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/climate-data/${id}/restore`,
        {
          method: "PATCH",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },
  },
};
