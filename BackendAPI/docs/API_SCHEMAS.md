# API Schemas - Estructuras JSON de Request y Response

## Introducción

Este documento contiene ejemplos completos de JSON organizados según el **flujo lógico de dependencias** que necesitas para integrar el frontend. Los endpoints están organizados en el orden que debes usarlos.

**Base URL**: `http://localhost:4000`

**Autenticación**: JWT Token en header `Authorization: Bearer <token>`

---

## 🔐 FASE 1: Autenticación

### Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "admin@test.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": {
      "role_id": 1,
      "name": "admin",
      "description": "Administrador del sistema"
    }
  }
}
```

### Register
**POST** `/api/auth/register`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role_id": 2
}
```

**Response (201):**
```json
{
  "user_id": 15,
  "email": "usuario@ejemplo.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "created_at": "2024-08-04T23:45:00.000Z"
}
```

---

## 📊 FASE 2: Datos Maestros para Formularios

> **¿Por qué estos endpoints primero?** Antes de poder crear una observación, tu frontend necesita cargar los datos base para poblar los formularios (dropdowns de especies, localidades, personas, etc.). Carga estos datos al inicializar tu aplicación.

### 🔍 Búsqueda de Taxones (Para Autocompletar Especies)
**GET** `/api/taxon/search?term=Solenopsis`

**Response (200):**
```json
[
  {
    "id_taxon": 6,
    "name": "Solenopsis",
    "level": "Genus",
    "parent_name": "Formicidae",
    "parent_level": "Family"
  },
  {
    "id_taxon": 7,
    "name": "Solenopsis invicta",
    "level": "Species",
    "parent_name": "Solenopsis",
    "parent_level": "Genus"
  }
]
```

### 🏛️ Datos Geográficos (Para Dropdowns de Ubicación)

#### Listar Países
**GET** `/api/geographic/countries`

**Response (200):**
```json
[
  {
    "id_country": 1,
    "country_name": "Argentina"
  },
  {
    "id_country": 2,
    "country_name": "Brasil"
  }
]
```

#### Obtener Provincias por País
**GET** `/api/geographic/country/1/provinces`

**Response (200):**
```json
[
  {
    "id_province": 1,
    "id_country": 1,
    "province_name": "Buenos Aires"
  },
  {
    "id_province": 2,
    "id_country": 1,
    "province_name": "Córdoba"
  }
]
```

#### Obtener Departamentos por Provincia
**GET** `/api/geographic/province/1/departments`

**Response (200):**
```json
[
  {
    "id_department": 1,
    "id_province": 1,
    "department_name": "Capital Federal"
  }
]
```

#### Obtener Localidades por Departamento
**GET** `/api/geographic/department/1/localities`

**Response (200):**
```json
[
  {
    "id_locality": 1,
    "id_department": 1,
    "locality_name": "Buenos Aires"
  },
  {
    "id_locality": 2,
    "id_department": 1,
    "locality_name": "La Plata"
  }
]
```

### 👤 Personas (Para Dropdown de Colectores)
**GET** `/api/persons`

**Response (200):**
```json
[
  {
    "id_person": 1,
    "person_name": "Carlos",
    "person_lastname": "González"
  },
  {
    "id_person": 2,
    "person_name": "María",
    "person_lastname": "López"
  }
]
```

### 🧪 Métodos de Preservación (Para Dropdown)
**GET** `/api/preservation-methods`

**Response (200):**
```json
[
  {
    "id_preservation_method": 1,
    "method_name": "Alcohol 70%"
  },
  {
    "id_preservation_method": 2,
    "method_name": "Formaldehído"
  },
  {
    "id_preservation_method": 3,
    "method_name": "Congelado"
  }
]
```

### 🪤 Trampas (Para Dropdown)
**GET** `/api/traps`

**Response (200):**
```json
[
  {
    "id_trap": 1,
    "trap_name": "Pitfall"
  },
  {
    "id_trap": 2,
    "trap_name": "Yellow Pan"
  },
  {
    "id_trap": 3,
    "trap_name": "Malaise"
  }
]
```

### 🌿 Tipos de Ambiente (Para Dropdown)
**GET** `/api/environment`

**Response (200):**
```json
[
  {
    "id_environment": 1,
    "environment_name": "Montado"
  },
  {
    "id_environment": 2,
    "environment_name": "Playa"
  },
  {
    "id_environment": 3,
    "environment_name": "Selva riparia"
  },
  {
    "id_environment": 4,
    "environment_name": "Pastizal"
  },
  {
    "id_environment": 5,
    "environment_name": "Bosque"
  },
  {
    "id_environment": 6,
    "environment_name": "Estepas"
  }
]
```

### Crear Tipo de Ambiente
**POST** `/api/environment`

**Request:**
```json
{
  "environment_name": "Bosque templado"
}
```

**Response (201):**
```json
{
  "id_environment": 7,
  "environment_name": "Bosque templado"
}
```

### 🔗 Asociar Localidad con Ambiente
**POST** `/api/locality-environment`

**Request:**
```json
{
  "id_locality": 5,
  "id_environment": 3
}
```

**Response (201):**
```json
{
  "id_locality_environment": 12,
  "id_locality": 5,
  "id_environment": 3,
  "locality": {
    "id_locality": 5,
    "locality_name": "Vedia"
  },
  "environment": {
    "id_environment": 3,
    "environment_name": "Selva riparia"
  }
}
```

### Obtener Ambientes de una Localidad
**GET** `/api/locality-environment/locality/5`

**Response (200):**
```json
[
  {
    "id_locality_environment": 12,
    "id_locality": 5,
    "id_environment": 3,
    "environment": {
      "id_environment": 3,
      "environment_name": "Selva riparia"
    }
  }
]
```

---

## 🌍 FASE 3: Geolocalización (Coordenadas del Sitio)

> **¿Por qué ahora?** Una vez que tienes los datos base, necesitas capturar las coordenadas geográficas exactas del sitio de colecta. Esto debe hacerse ANTES de crear la observación.

### Crear Geolocalización
**POST** `/api/geolocation`

**Request:**
```json
{
  "latitude": -34.6037,
  "longitude": -58.3816,
  "altitude": 25.5,
  "source_type": "GPS"
}
```

**Response (201):**
```json
{
  "id_geolocation": 42,
  "latitude": -34.6037,
  "longitude": -58.3816,
  "altitude": 25.5,
  "source_type": "GPS"
}
```

### Buscar por Coordenadas
**GET** `/api/geolocation/search?latitude=-34.6037&longitude=-58.3816&radius=1000`

**Response (200):**
```json
[
  {
    "id_geolocation": 42,
    "latitude": -34.6037,
    "longitude": -58.3816,
    "altitude": 25.5,
    "source_type": "GPS"
  },
  {
    "id_geolocation": 43,
    "latitude": -34.6125,
    "longitude": -58.3731,
    "altitude": null,
    "source_type": "Manual"
  }
]
```

---

## 🎯 FASE 4: Lógica de Negocio Principal

> **¡Este es el momento!** Ahora que tienes todos los IDs necesarios (taxón, localidad, persona, método, trampa, geolocalización), puedes crear la observación principal del sistema.

### ⭐ Crear Colección y Observación (ENDPOINT PRINCIPAL)

**POST** `/api/observation/with-collection`

> **IMPORTANTE**: Usa todos los IDs obtenidos de las fases anteriores (taxón, localidad, persona, método, trampa, geolocalización)

**Request:**
```json
{
  "id_person": 1,
  "id_preservation_method": 1,
  "id_trap": 1,
  "collection_date": "2024-08-04",
  "id_taxon": 7,
  "id_locality_environment": 12,
  "id_geolocation": 42
}
```

**Nota:** `id_locality_environment` es el ID de la asociación LocalityEnvironment que vincula una localidad con un tipo de ambiente.

**Response (201):**
```json
{
  "observation_id": 125,
  "message": "Colección y observación creadas exitosamente"
}
```

### ⭐ Obtener Todas las Observaciones (CON PAGINACIÓN)
**GET** `/api/observation?page=1&limit=10`

> **🎯 NUEVA IMPLEMENTACIÓN**: Ahora usa Prisma directo con datos anidados completos y paginación robusta

**Query Parameters** (se envían en la URL, NO en el body JSON):
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Ejemplo de llamada desde JavaScript:**
```javascript
// Correcto: parámetros en la URL
fetch('/api/observation?page=2&limit=20', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});
```

**Response (200):**
```json
{
  "data": [
    {
      "id_observation": 2,
      "id_taxon": 8,
      "id_locality_environment": 15,
      "id_collection": 2,
      "id_geolocation": 43,
      "taxon": {
        "id_taxon": 8,
        "name": "Solenopsis richteri",
        "id_taxonomic_level": 7,
        "parent_id": 6,
        "taxonomic_level": {
          "id_taxonomic_level": 7,
          "name": "Species"
        }
      },
      "localityEnvironment": {
        "id_locality_environment": 15,
        "id_locality": 2,
        "id_environment": 5,
        "locality": {
          "id_locality": 2,
          "locality_name": "Reserva Sierra de San Javier",
          "id_department": 2,
          "department": {
            "id_department": 2,
            "department_name": "Tafí Viejo",
            "id_province": 2,
            "province": {
              "id_province": 2,
              "province_name": "Tucumán",
              "id_country": 1,
              "country": {
                "id_country": 1,
                "country_name": "Argentina"
              }
            }
          }
        },
        "environment": {
          "id_environment": 5,
          "environment_name": "Bosque"
        }
      },
      "collection": {
        "id_collection": 2,
        "id_person": 2,
        "id_preservation_method": 2,
        "id_trap": 2,
        "collection_date": "2024-08-04T00:00:00.000Z",
        "person": {
          "id_person": 2,
          "person_name": "Ana",
          "person_lastname": "Martínez"
        },
        "preservation_method": {
          "id_preservation_method": 2,
          "method_name": "Formaldehído"
        },
        "trap": {
          "id_trap": 2,
          "trap_name": "Yellow Pan"
        }
      },
      "geolocation": {
        "id_geolocation": 43,
        "latitude": -26.8083,
        "longitude": -65.2176,
        "altitude": 450.0,
        "source_type": "GPS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Obtener Observación por ID
**GET** `/api/observation/1`

**Response (200):**
```json
{
  "id_observation": 1,
  "id_taxon": 7,
  "id_locality_environment": 10,
  "id_collection": 1,
  "id_geolocation": 42,
  "taxon": {
    "id_taxon": 7,
    "name": "Solenopsis invicta",
    "taxonomic_level": {
      "name": "Species"
    }
  },
  "localityEnvironment": {
    "id_locality_environment": 10,
    "id_locality": 1,
    "id_environment": 3,
    "locality": {
      "id_locality": 1,
      "locality_name": "Buenos Aires",
      "department": {
        "department_name": "Capital Federal"
      }
    },
    "environment": {
      "id_environment": 3,
      "environment_name": "Selva riparia"
    }
  },
  "collection": {
    "id_collection": 1,
    "collection_date": "2024-08-04T00:00:00.000Z",
    "person": {
      "person_name": "Carlos",
      "person_lastname": "González"
    }
  },
  "geolocation": {
    "id_geolocation": 42,
    "latitude": -34.6037,
    "longitude": -58.3816,
    "altitude": 25.5,
    "source_type": "GPS"
  }
}
```

### 🎯 Búsqueda Avanzada de Observaciones (RENOVADO)
**GET** `/api/observation/search`

> **🆕 COMPLETAMENTE RENOVADO:** Ahora con **Prisma directo**, **15+ filtros flexibles**, **paginación integrada** y **datos anidados completos**

#### 📋 **Diferencias Conceptuales:**
- **`GET /observation`** = Lista paginada general (sin filtros)
- **`GET /observation/search`** = Lista paginada con filtros avanzados

#### 🚀 **Filtros Disponibles:**

**Por IDs (compatibilidad):**
```bash
GET /api/observation/search?taxon_id=7&locality_id=2&collector_id=1&page=1&limit=5
```

**Ejemplo JavaScript (frontend):**
```javascript
// ✅ CORRECTO - Parámetros en la URL
const params = new URLSearchParams({
  taxon_id: 7,
  locality_id: 2,
  page: 1,
  limit: 5
});

fetch(`/api/observation/search?${params}`, {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});

// ❌ INCORRECTO - NO hacer esto con GET
fetch('/api/observation/search', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({ taxon_id: 7 })  // ❌ GET no tiene body!
});
```

**Por nombres/texto (flexible):**
```bash
GET /api/observation/search?taxon_name=Solenopsis&taxonomic_level=Species&person_name=Juan
```

**Por ubicación geográfica:**
```bash
GET /api/observation/search?locality_name=Buenos Aires&department_name=Capital&province_name=Buenos Aires&country_name=Argentina
```

**Por fechas:**
```bash
GET /api/observation/search?start_date=2024-01-01&end_date=2024-12-31
```

**Por coordenadas GPS (radio en metros):**
```bash
GET /api/observation/search?latitude=-34.6037&longitude=-58.3816&radius=1000
```

**Combinación compleja:**
```bash
GET /api/observation/search?taxon_name=Solenopsis&person_name=Juan&province_name=Tucumán&start_date=2024-01-01&page=2&limit=5
```

#### 📋 **Query Parameters Completos:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|----------|
| `taxon_id` | number | ID del taxón | `7` |
| `taxon_name` | string | Nombre del taxón (partial match) | `Solenopsis` |
| `taxonomic_level` | string | Nivel taxonómico | `Species` |
| `locality_id` | number | ID de localidad | `2` |
| `locality_name` | string | Nombre de localidad | `Buenos Aires` |
| `department_name` | string | Nombre de departamento | `Capital` |
| `province_name` | string | Nombre de provincia | `Buenos Aires` |
| `country_name` | string | Nombre de país | `Argentina` |
| `collector_id` | number | ID del colector | `1` |
| `person_name` | string | Nombre del colector | `Juan` |
| `start_date` | string | Fecha inicio (YYYY-MM-DD) | `2024-01-01` |
| `end_date` | string | Fecha fin (YYYY-MM-DD) | `2024-12-31` |
| `latitude` | number | Latitud GPS | `-34.6037` |
| `longitude` | number | Longitud GPS | `-58.3816` |
| `radius` | number | Radio en metros | `1000` |
| `page` | number | Número de página | `2` |
| `limit` | number | Elementos por página | `5` |

#### 🎯 **Response Structure (idéntica a findAll):**

**Response (200):**
```json
{
  "data": [
    {
      "id_observation": 2,
      "id_taxon": 8,
      "id_locality_environment": 15,
      "id_collection": 2,
      "id_geolocation": 43,
      "taxon": {
        "id_taxon": 8,
        "name": "Solenopsis richteri",
        "id_taxonomic_level": 7,
        "parent_id": 6,
        "taxonomic_level": {
          "id_taxonomic_level": 7,
          "name": "Species"
        }
      },
      "localityEnvironment": {
        "id_locality_environment": 15,
        "id_locality": 2,
        "id_environment": 5,
        "locality": {
          "id_locality": 2,
          "locality_name": "Reserva Sierra de San Javier",
          "id_department": 2,
          "department": {
            "id_department": 2,
            "department_name": "Tafí Viejo",
            "id_province": 2,
            "province": {
              "id_province": 2,
              "province_name": "Tucumán",
              "id_country": 1,
              "country": {
                "id_country": 1,
                "country_name": "Argentina"
              }
            }
          }
        },
        "environment": {
          "id_environment": 5,
          "environment_name": "Bosque"
        }
      },
      "collection": {
        "id_collection": 2,
        "id_person": 2,
        "id_preservation_method": 2,
        "id_trap": 2,
        "collection_date": "2024-08-04T00:00:00.000Z",
        "person": {
          "id_person": 2,
          "person_name": "Ana",
          "person_lastname": "Martínez"
        },
        "preservation_method": {
          "id_preservation_method": 2,
          "method_name": "Formaldehído"
        },
        "trap": {
          "id_trap": 2,
          "trap_name": "Yellow Pan"
        }
      },
      "geolocation": {
        "id_geolocation": 43,
        "latitude": -26.8083,
        "longitude": -65.2176,
        "altitude": 450.0,
        "source_type": "GPS"
      }
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "totalCount": 12,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "filters": {
    "taxon_name": "Solenopsis",
    "person_name": "Juan",
    "province_name": "Tucumán",
    "start_date": "2024-01-01",
    "page": 2,
    "limit": 5
  }
}
```

#### ⚡ **Casos de Uso Comunes:**

**1. Buscar por especie:**
```bash
GET /api/observation/search?taxon_name=Solenopsis&taxonomic_level=Species
```

**2. Buscar por colector:**
```bash
GET /api/observation/search?person_name=Ana
```

**3. Buscar por ubicación:**
```bash
GET /api/observation/search?province_name=Tucumán&locality_name=Sierra
```

**4. Buscar por rango de fechas:**
```bash
GET /api/observation/search?start_date=2024-01-01&end_date=2024-06-30
```

**5. Buscar cerca de coordenadas:**
```bash
GET /api/observation/search?latitude=-26.8083&longitude=-65.2176&radius=5000
```

---

## 🔍 Búsqueda de Taxonomía

### Buscar Taxones
**GET** `/api/taxon/search?term=Solenopsis`

**Response (200):**
```json
[
  {
    "id_taxon": 6,
    "name": "Solenopsis",
    "level": "Genus",
    "parent_name": "Formicidae",
    "parent_level": "Family"
  },
  {
    "id_taxon": 7,
    "name": "Solenopsis invicta",
    "level": "Species",
    "parent_name": "Solenopsis",
    "parent_level": "Genus"
  },
  {
    "id_taxon": 8,
    "name": "Solenopsis richteri",
    "level": "Species",
    "parent_name": "Solenopsis",
    "parent_level": "Genus"
  }
]
```

### Obtener Taxón por ID
**GET** `/api/taxon/7`

**Response (200):**
```json
{
  "id_taxon": 7,
  "name": "Solenopsis invicta",
  "id_taxonomic_level": 6,
  "parent_id": 6,
  "taxonomic_level": {
    "id_taxonomic_level": 6,
    "name": "Species"
  },
  "parent": {
    "id_taxon": 6,
    "name": "Solenopsis",
    "taxonomic_level": {
      "name": "Genus"
    }
  }
}
```

---

## 🏛️ Datos Geográficos

### Listar Países
**GET** `/api/geographic/countries`

**Response (200):**
```json
[
  {
    "id_country": 1,
    "country_name": "Argentina"
  },
  {
    "id_country": 2,
    "country_name": "Brasil"
  }
]
```

### Obtener Provincias por País
**GET** `/api/geographic/country/1/provinces`

**Response (200):**
```json
[
  {
    "id_province": 1,
    "id_country": 1,
    "province_name": "Buenos Aires"
  },
  {
    "id_province": 2,
    "id_country": 1,
    "province_name": "Córdoba"
  }
]
```

### Obtener Localidades por Departamento
**GET** `/api/geographic/department/1/localities`

**Response (200):**
```json
[
  {
    "id_locality": 1,
    "id_department": 1,
    "locality_name": "Buenos Aires"
  },
  {
    "id_locality": 2,
    "id_department": 1,
    "locality_name": "La Plata"
  }
]
```

---

## 👥 Gestión de Usuarios

### Listar Usuarios (Admin)
**GET** `/api/users`

**Response (200):**
```json
[
  {
    "user_id": 1,
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@test.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null,
    "role": {
      "role_id": 1,
      "name": "admin",
      "description": "Administrador del sistema"
    }
  },
  {
    "user_id": 2,
    "first_name": "Usuario",
    "last_name": "Normal",
    "email": "user@test.com",
    "created_at": "2024-02-15T10:30:00.000Z",
    "deleted_at": null,
    "role": {
      "role_id": 2,
      "name": "user",
      "description": "Usuario estándar"
    }
  }
]
```

### Crear Usuario (Admin)
**POST** `/api/users`

**Request:**
```json
{
  "email": "nuevo@usuario.com",
  "password": "password123",
  "first_name": "Nuevo",
  "last_name": "Usuario",
  "role_id": 2
}
```

**Response (201):**
```json
{
  "user_id": 16,
  "email": "nuevo@usuario.com",
  "first_name": "Nuevo",
  "last_name": "Usuario",
  "created_at": "2024-08-04T23:45:00.000Z",
  "role": {
    "role_id": 2,
    "name": "user",
    "description": "Usuario estándar"
  }
}
```

---

## 🔧 Datos de Configuración

### Obtener Métodos de Preservación
**GET** `/api/preservation-methods`

**Response (200):**
```json
[
  {
    "id_preservation_method": 1,
    "method_name": "Alcohol 70%"
  },
  {
    "id_preservation_method": 2,
    "method_name": "Formaldehído"
  },
  {
    "id_preservation_method": 3,
    "method_name": "Congelado"
  }
]
```

### Obtener Trampas
**GET** `/api/traps`

**Response (200):**
```json
[
  {
    "id_trap": 1,
    "trap_name": "Pitfall"
  },
  {
    "id_trap": 2,
    "trap_name": "Yellow Pan"
  },
  {
    "id_trap": 3,
    "trap_name": "Malaise"
  }
]
```

### Obtener Personas
**GET** `/api/persons`

**Response (200):**
```json
[
  {
    "id_person": 1,
    "person_name": "Carlos",
    "person_lastname": "González"
  },
  {
    "id_person": 2,
    "person_name": "María",
    "person_lastname": "López"
  }
]
```

---

## ❌ Manejo de Errores

### Error 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": ["email should not be empty", "password should not be empty"],
  "error": "Bad Request"
}
```

### Error 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error 403 - Forbidden (Sin permisos admin)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### Error 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### Error 500 - Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 🚀 Flujo Recomendado para Frontend

### 1. Autenticación
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token } = await loginResponse.json();

// Usar token en requests posteriores
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
};
```

### 2. Crear Observación con Geolocalización
```javascript
// Paso 1: Crear geolocalización
const geoResponse = await fetch('/api/geolocation', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    latitude: -34.6037,
    longitude: -58.3816,
    altitude: 25.5,
    source_type: 'GPS'
  })
});
const { id_geolocation } = await geoResponse.json();

// Paso 2: Crear observación con el ID obtenido
const obsResponse = await fetch('/api/observation/with-collection', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    id_person: 1,
    id_preservation_method: 1,
    id_trap: 1,
    collection_date: '2024-08-04',
    id_taxon: 7,
    id_locality: 1,
    id_geolocation: id_geolocation  // 🎯 Usar el ID obtenido
  })
});
```

### 3. Búsqueda de Taxones (Para Autocompletar)
```javascript
const searchResponse = await fetch(`/api/taxon/search?term=${searchTerm}`, {
  headers
});
const taxa = await searchResponse.json();
// Usar taxa para mostrar opciones en select/autocomplete
```

---

## 📝 Notas Importantes

- **Fechas**: Formato `YYYY-MM-DD` para collection_date
- **Coordenadas**: Latitude/longitude como números flotantes
- **IDs**: Todos los IDs son enteros
- **Paginación**: No implementada (devuelve todos los resultados)
- **CORS**: Configurado para desarrollo local
- **Rate Limiting**: No implementado

---

**Para más información sobre endpoints disponibles, consulta:** `docs/ENDPOINTS.md`
