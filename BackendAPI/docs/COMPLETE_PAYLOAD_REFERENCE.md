# Complete API Payload Reference

This document provides comprehensive payload examples for ALL database tables, including those without implemented endpoints yet.

## 📋 Table of Contents

1. [Authentication Models](#authentication-models)
2. [Taxonomic Models](#taxonomic-models)
3. [Collection Support Models](#collection-support-models)
4. [Geographic Models](#geographic-models)
5. [Core Models](#core-models)
6. [Geolocation Model](#geolocation-model)

---

## Authentication Models

### 🔐 Rol (Role)

**Table**: `Rol`  
**Endpoint**: `/api/rol`  
**Primary Key**: `role_id`

#### Create Role
```json
POST /api/rol
{
  "name": "admin",
  "description": "Administrator role with full access"
}
```

#### Update Role
```json
PATCH /api/rol/:id
{
  "description": "Updated description"
}
```

#### Response Structure
```json
{
  "role_id": 1,
  "name": "admin",
  "description": "Administrator role with full access"
}
```

### 👤 User

**Table**: `User`  
**Endpoint**: `/api/users`  
**Primary Key**: `user_id`  
**Features**: Soft delete support

#### Create User
```json
POST /api/users
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role_id": 2
}
```

#### Update User
```json
PATCH /api/users/:id
{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

#### Response Structure
```json
{
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john.doe@example.com",
  "created_at": "2024-03-15T10:00:00Z",
  "deleted_at": null,
  "role_id": 2,
  "role": {
    "role_id": 2,
    "name": "user",
    "description": "Standard user"
  }
}
```

---

## Taxonomic Models

### 📊 TaxonomicLevel

**Table**: `TaxonomicLevel`  
**Endpoint**: `/api/taxonomic-level`  
**Primary Key**: `id_taxonomic_level`

#### Create Taxonomic Level
```json
POST /api/taxonomic-level
{
  "name": "Species"
}
```

#### Update Taxonomic Level
```json
PATCH /api/taxonomic-level/:id
{
  "name": "Subspecies"
}
```

#### Response Structure
```json
{
  "id_taxonomic_level": 1,
  "name": "Species"
}
```

### 🐛 Taxon

**Table**: `Taxon`  
**Endpoint**: `/api/taxon`  
**Primary Key**: `id_taxon`  
**Features**: Hierarchical (self-referencing with parent_id)

#### Create Root Taxon
```json
POST /api/taxon
{
  "name": "Formicidae",
  "id_taxonomic_level": 1,
  "parent_id": null
}
```

#### Create Child Taxon
```json
POST /api/taxon
{
  "name": "Solenopsis invicta",
  "id_taxonomic_level": 2,
  "parent_id": 5
}
```

#### Update Taxon
```json
PATCH /api/taxon/:id
{
  "name": "Solenopsis richteri",
  "parent_id": 10
}
```

#### Response Structure
```json
{
  "id_taxon": 1,
  "name": "Solenopsis invicta",
  "id_taxonomic_level": 2,
  "parent_id": 5,
  "taxonomic_level": {
    "id_taxonomic_level": 2,
    "name": "Species"
  },
  "parent": {
    "id_taxon": 5,
    "name": "Solenopsis"
  }
}
```

---

## Collection Support Models

### 🌿 Environment

**Table**: `Environment`  
**Endpoint**: `/api/environment` ✅ **IMPLEMENTED**  
**Primary Key**: `id_environment`

#### Create Environment
```json
POST /api/environment
{
  "environment_name": "Selva riparia"
}
```

#### Update Environment
```json
PATCH /api/environment/:id
{
  "environment_name": "Bosque templado"
}
```

#### Response Structure
```json
{
  "id_environment": 3,
  "environment_name": "Selva riparia"
}
```

#### Helpers
```json
GET /api/environment/:id/check-in-use
GET /api/environment/deleted/list
PATCH /api/environment/:id/restore
```

**Tipos de ambiente disponibles:**
- Montado
- Playa
- Selva riparia
- Pastizal
- Bosque
- Estepas

---

### 🌍 LocalityEnvironment

**Table**: `LocalityEnvironment`  
**Endpoint**: `/api/locality-environment` ✅ **IMPLEMENTED**  
**Primary Key**: `id_locality_environment`  
**Purpose**: Asociación muchos-a-muchos entre Locality y Environment

#### Create Association
```json
POST /api/locality-environment
{
  "id_locality": 5,
  "id_environment": 3
}
```

#### Response Structure
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

#### Set Multiple Environments for a Locality
```json
PUT /api/locality-environment/locality/5/environments
{
  "environmentIds": [1, 3, 5]
}
```

**Response:** Lista completa de asociaciones actualizadas para la localidad.

---

### 🪤 Trap

**Table**: `Trap`  
**Endpoint**: `/api/trap`  
**Primary Key**: `id_trap`

#### Create Trap
```json
POST /api/trap
{
  "trap_name": "Pitfall trap"
}
```

#### Update Trap
```json
PATCH /api/trap/:id
{
  "trap_name": "Modified pitfall trap"
}
```

#### Response Structure
```json
{
  "id_trap": 1,
  "trap_name": "Pitfall trap"
}
```

---

### 🐜 Caste

**Table**: `Caste`  
**Endpoint**: `/api/caste`  
**Primary Key**: `id_caste`

#### Create Caste
```json
POST /api/caste
{
  "caste_name": "Worker"
}
```

#### Update Caste
```json
PATCH /api/caste/:id
{
  "caste_name": "Major Worker"
}
```

#### Response Structure
```json
{
  "id_caste": 1,
  "caste_name": "Worker"
}
```

**Castas comunes:**
- Worker (Obrera)
- Queen (Reina)
- Male (Macho)
- Soldier (Soldado)
- Major Worker (Obrera Mayor)
- Minor Worker (Obrera Menor)

---

### 🧪 PreservationMethod

**Table**: `PreservationMethod`  
**Endpoint**: `/api/preservation-method`  
**Primary Key**: `id_preservation_method`

#### Create Preservation Method
```json
POST /api/preservation-method
{
  "method_name": "70% Ethanol"
}
```

#### Update Preservation Method
```json
PATCH /api/preservation-method/:id
{
  "method_name": "95% Ethanol"
}
```

#### Response Structure
```json
{
  "id_preservation_method": 1,
  "method_name": "70% Ethanol"
}
```

### 👨‍🔬 Person

**Table**: `Person`  
**Endpoint**: `/api/person`  
**Primary Key**: `id_person`

#### Create Person
```json
POST /api/person
{
  "person_name": "Charles",
  "person_lastname": "Darwin"
}
```

#### Update Person
```json
PATCH /api/person/:id
{
  "person_name": "Charles Robert",
  "person_lastname": "Darwin"
}
```

#### Response Structure
```json
{
  "id_person": 1,
  "person_name": "Charles",
  "person_lastname": "Darwin"
}
```

---

## Geographic Models

### 🌍 Country

**Table**: `Country`  
**Endpoint**: `/api/country`  
**Primary Key**: `id_country`

#### Create Country
```json
POST /api/country
{
  "country_name": "Argentina"
}
```

#### Update Country
```json
PATCH /api/country/:id
{
  "country_name": "República Argentina"
}
```

#### Response Structure
```json
{
  "id_country": 1,
  "country_name": "Argentina"
}
```

**Helpers:**

```json
GET /api/country/:id/check-in-use
GET /api/country/deleted/list
PATCH /api/country/:id/restore
```

### 🏛️ Province

**Table**: `Province`  
**Endpoint**: `/api/province`  
**Primary Key**: `id_province`

#### Create Province
```json
POST /api/province
{
  "id_country": 1,
  "province_name": "Buenos Aires"
}
```

#### Update Province
```json
PATCH /api/province/:id
{
  "province_name": "Provincia de Buenos Aires"
}
```

#### Response Structure
```json
{
  "id_province": 1,
  "id_country": 1,
  "province_name": "Buenos Aires",
  "country": {
    "id_country": 1,
    "country_name": "Argentina"
  }
}
```

**Helpers:**

```json
GET /api/province/:id/check-in-use
GET /api/province/deleted/list
PATCH /api/province/:id/restore
```

### 🏘️ Department

**Table**: `Department`  
**Endpoint**: `/api/department`  
**Primary Key**: `id_department`

#### Create Department
```json
POST /api/department
{
  "id_province": 1,
  "department_name": "La Plata"
}
```

#### Update Department
```json
PATCH /api/department/:id
{
  "department_name": "Partido de La Plata"
}
```

#### Response Structure
```json
{
  "id_department": 1,
  "id_province": 1,
  "department_name": "La Plata",
  "province": {
    "id_province": 1,
    "province_name": "Buenos Aires",
    "country": {
      "id_country": 1,
      "country_name": "Argentina"
    }
  }
}
```

**Helpers:**

```json
GET /api/department/:id/check-in-use
GET /api/department/deleted/list
PATCH /api/department/:id/restore
```

### 📍 Locality

**Table**: `Locality`  
**Endpoint**: `/api/locality`  
**Primary Key**: `id_locality`

#### Create Locality
```json
POST /api/locality
{
  "id_department": 1,
  "locality_name": "City Bell"
}
```

#### Update Locality
```json
PATCH /api/locality/:id
{
  "locality_name": "Villa Elisa"
}
```

#### Response Structure
```json
{
  "id_locality": 1,
  "id_department": 1,
  "locality_name": "City Bell",
  "department": {
    "id_department": 1,
    "department_name": "La Plata",
    "province": {
      "id_province": 1,
      "province_name": "Buenos Aires",
      "country": {
        "id_country": 1,
        "country_name": "Argentina"
      }
    }
  }
}
```

**Helpers:**

```json
GET /api/locality/:id/check-in-use
GET /api/locality/deleted/list
PATCH /api/locality/:id/restore
```

---

## Core Models

### 📦 Collection

**Table**: `Collection`  
**Endpoint**: `/api/collection` *(Usually created with Observation)*  
**Primary Key**: `id_collection`

#### Create Collection (Standalone - if implemented)
```json
POST /api/collection
{
  "id_person": 1,
  "id_preservation_method": 2,
PATCH /api/collection/:id
{
  "collection_date": "2024-03-16",
  "id_trap": 4,
  "id_biotype_type": 2
}
```

#### Response Structure
```json
{
  "id_collection": 1,
  "id_person": 1,
  "id_preservation_method": 2,
  "id_trap": 3,
  "collection_date": "2024-03-15",
  "person": {
    "id_person": 1,
    "person_name": "Charles",
    "person_lastname": "Darwin"
  },
  "preservation_method": {
    "id_preservation_method": 2,
    "method_name": "70% Ethanol"
  },
  "trap": {
    "id_trap": 3,
    "trap_name": "Pitfall trap"
  }
}
```

### 🔬 Observation

**Table**: `Observation`  
**Endpoint**: `/api/observation`  
**Primary Key**: `id_observation`

#### Create Observation with Collection (Stored Procedure)

**Campos obligatorios:**
```json
POST /api/observation/with-collection
{
  "id_person": 1,
  "id_preservation_method": 2,
  "id_trap": 3,
  "collection_date": "2024-03-15T12:00:00.000Z",
  "id_taxon": 42,
  "id_geolocation": 10
}
```

**Payload completo (con campos opcionales):**
```json
POST /api/observation/with-collection
{
  "id_person": 1,
  "id_preservation_method": 2,
  "id_trap": 3,
  "collection_date": "2024-03-15T12:00:00.000Z",
  "trap_number": 5,
  "id_taxon": 42,
  "id_geolocation": 10,
  "abundance": 15,
  "id_caste": 2,
  "biology_notes": "Observada forrajeando en el suelo",
  "general_observations": "Clima cálido y húmedo",
  "conservation_status": "LC",
  "id_identifier": 3,
  "identification_date": "2024-03-20T12:00:00.000Z"
}
```

**Campos opcionales:**
- `trap_number`: Número de trampa
- `abundance`: Número de individuos
- `id_caste`: ID de casta (para hormigas)
- `biology_notes`: Notas biológicas
- `general_observations`: Observaciones generales
- `conservation_status`: Estado de conservación (ej: LC, EN, VU, CR, DD)
- `id_identifier`: ID de la persona que identificó
- `identification_date`: Fecha de identificación (ISO-8601)

**Nota:** Las fechas deben estar en formato ISO-8601 con hora (recomendado: `T12:00:00.000Z`)

#### Update Observation (Prisma Direct)
```json
PATCH /api/observation/:id
{
  "abundance": 20,
  "id_caste": 3,
  "biology_notes": "Actualizada",
  "general_observations": "Observaciones adicionales",
  "conservation_status": "EN",
  "id_identifier": 4,
  "identification_date": "2024-04-01T12:00:00.000Z"
}
```

#### Response Structure (GET - Prisma Direct)
```json
{
  "id_observation": 1,
  "id_taxon": 42,
  "id_locality": 5,
  "id_collection": 1,
  "id_geolocation": 10,
  "taxon": {
    "id_taxon": 42,
    "name": "Solenopsis invicta",
    "id_taxonomic_level": 2,
    "parent_id": 5,
    "taxonomic_level": {
      "id_taxonomic_level": 2,
      "name": "Species"
    }
  },
  "locality": {
    "id_locality": 5,
    "locality_name": "City Bell",
    "department": {
      "id_department": 1,
      "department_name": "La Plata",
      "province": {
        "id_province": 1,
        "province_name": "Buenos Aires",
        "country": {
          "id_country": 1,
          "country_name": "Argentina"
        }
      }
    }
  },
  "collection": {
    "id_collection": 1,
    "collection_date": "2024-03-15",
    "person": {
      "id_person": 1,
      "person_name": "Charles",
      "person_lastname": "Darwin"
    },
    "preservation_method": {
      "id_preservation_method": 2,
      "method_name": "70% Ethanol"
    },
    "trap": {
      "id_trap": 3,
      "trap_name": "Pitfall trap"
    }
  },
  "geolocation": {
    "id_geolocation": 10,
    "latitude": -34.6037,
    "longitude": -58.3816,
    "altitude": 25.5,
    "source_type": "GPS"
  }
}
```

---

### 🌦️ Climate Data

**Soft delete helpers y validación de uso:**

```json
GET /api/climate-data/:id/check-in-use
GET /api/climate-data/deleted/list
PATCH /api/climate-data/:id/restore
```

---

## Geolocation Model

### 🗺️ Geolocation

**Table**: `Geolocation`  
**Endpoint**: `/api/geolocation`  
**Primary Key**: `id_geolocation`

#### Create Geolocation

**Campos obligatorios:**
```json
POST /api/geolocation
{
  "latitude": -34.6037,
  "longitude": -58.3816,
  "source_type": "GPS",
  "id_locality": 5
}
```

**Con campos opcionales:**
```json
POST /api/geolocation
{
  "latitude": -34.6037,
  "longitude": -58.3816,
  "altitude": 25.5,
  "source_type": "GPS",
  "ihh": 0.85,
  "distance_to_river": 150.5,
  "tag": "Colonia principal",
  "id_locality": 5
}
```

**Campos opcionales:**
- `altitude`: Altitud en metros (Float)
- `ihh`: Índice de Heterogeneidad del Hábitat (Float)
- `distance_to_river`: Distancia al río más cercano en metros (Float)
- `tag`: Etiqueta descriptiva opcional para identificar la geolocalización (String)

#### Update Geolocation

```json
PUT /api/geolocation/:id
{
  "latitude": -34.6038,
  "longitude": -58.3817,
  "altitude": 26.0,
  "source_type": "GPS_CORRECTED",
  "ihh": 0.90,
  "distance_to_river": 155.0,
  "tag": "Colonia secundaria",
  "id_locality": 5
}
```

#### Search by Coordinates

```json
GET /api/geolocation/coordinates?latitude=-34.6037&longitude=-58.3816
```

#### Search by Tag

```json
GET /api/geolocation/tag/:tag
```

#### Soft Delete Helpers

```json
GET /api/geolocation/deleted/list
PUT /api/geolocation/:id/restore
```

#### Response Structure

```json
{
  "id_geolocation": 1,
  "latitude": -34.6037,
  "longitude": -58.3816,
  "altitude": 25.5,
  "source_type": "GPS",
  "tag": "Colonia principal"
}
```

---

## 📊 Data Type Reference

### Required vs Optional Fields

| Model | Required Fields | Optional Fields |
|-------|----------------|-----------------|
| **Rol** | name | description |
| **User** | first_name, last_name, email, password, role_id | deleted_at |
| **TaxonomicLevel** | name | - |
| **Taxon** | name, id_taxonomic_level | parent_id |
| **Environment** | environment_name | - |
| **Trap** | trap_name | - |
| **PreservationMethod** | method_name | - |
| **Person** | person_name, person_lastname | - |
| **Country** | country_name | - |
| **Province** | id_country, province_name | - |
| **Department** | id_province, department_name | - |
| **Locality** | id_department, locality_name | - |
| **Collection** | id_person, id_preservation_method, id_trap, collection_date | - |
| **Observation** | id_taxon, id_locality, id_collection | id_geolocation |
| **Geolocation** | latitude, longitude, source_type | altitude, ihh, distance_to_river, tag |

### Field Types

- **IDs**: Integer (auto-increment)
- **Names/Descriptions**: String (text in database)
- **Dates**: ISO 8601 format (YYYY-MM-DD for dates, full ISO for timestamps)
- **Coordinates**: Float (decimal numbers)
- **Booleans**: Not used in current schema
- **Foreign Keys**: Integer references to related tables

---

## 🔄 Special Operations

### Soft Delete (Users only)
```json
DELETE /api/users/:id
// Sets deleted_at timestamp, doesn't actually remove record
```

### Restore Soft-Deleted User
```json
PATCH /api/users/:id/restore
// Clears deleted_at timestamp
```

### Hierarchical Queries

**Nota: Para endpoints GET, todos los parámetros van en la URL (path params o query params), NO en el body JSON**

#### Get Taxon Hierarchy
```bash
GET /api/taxon/hierarchy/:id
# Ejemplo: GET /api/taxon/hierarchy/42
# Returns complete ancestry chain
```

#### Get Taxon Children
```bash
GET /api/taxon/children/:id
# Ejemplo: GET /api/taxon/children/42
# Returns direct children only
```

#### Get Taxon Descendants
```bash
GET /api/taxon/descendants/:id
# Ejemplo: GET /api/taxon/descendants/42
# Returns all descendants recursively
```

#### Get Geographic Hierarchy
```bash
GET /api/province/country/:countryId
GET /api/department/province/:provinceId
GET /api/locality/department/:departmentId
```

### Advanced Search (Observations)

**Los filtros se envían como query parameters en la URL, NO en el body:**

```bash
GET /api/observation/search?taxon_name=Solenopsis&locality_name=Buenos Aires&start_date=2024-01-01&end_date=2024-12-31&page=1&limit=10
```

Available filters (todos en la URL como query params):
- `taxon_id`, `taxon_name`, `taxonomic_level`
- `locality_id`, `locality_name`, `department_name`, `province_name`, `country_name`
- `collector_id`, `person_name`
- `start_date`, `end_date`
- `latitude`, `longitude`, `radius`
- `page`, `limit`

---

## 📝 Authentication

**Nota importante sobre métodos HTTP:**

- **GET**: Parámetros van en la URL (path params como `:id` o query params como `?page=1&limit=10`)
- **POST/PUT/PATCH**: Datos van en el body como JSON
- **DELETE**: Solo usa path params en la URL (ej: `/api/resource/:id`)

### Register
```json
POST /api/auth/register
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role_id": 2
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Using JWT Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📞 Service

**Table**: `Service`  
**Endpoint**: `/api/service`  
**Primary Key**: `id_service`  
**Features**: Soft delete support

#### Create Service
```json
POST /api/service
{
  "service_name": "Consulta General"
}
```

#### Update Service
```json
PATCH /api/service/:id
{
  "service_name": "Consulta General Actualizada"
}
```

#### Response Structure
```json
{
  "id_service": 1,
  "service_name": "Consulta General",
  "deleted_at": null
}
```

#### Get Service with Contacts
```json
GET /api/service/:id
{
  "id_service": 1,
  "service_name": "Consulta General",
  "deleted_at": null,
  "Contact": [
    {
      "id_contact": 1,
      "name": "Franco Test",
      "email": "franco@test.com",
      "message": "Esta es una consulta de prueba",
      "created_at": "2025-09-10T23:03:26.875Z",
      "deleted_at": null,
      "status": false,
      "id_service": 1
    }
  ]
}
```

---

## 📧 Contact

**Table**: `Contact`  
**Endpoint**: `/api/contact`  
**Primary Key**: `id_contact`  
**Features**: Soft delete support, status tracking (read/unread)

#### Create Contact
```json
POST /api/contact
{
  "name": "Franco Javier",
  "email": "franco@example.com",
  "message": "Tengo una consulta sobre las especies de hormigas encontradas en la región del Chaco. ¿Podrían proporcionarme información sobre la metodología de colección utilizada?",
  "id_service": 1
}
```

#### Update Contact
```json
PATCH /api/contact/:id
{
  "message": "Mensaje actualizado con más detalles",
  "status": true
}
```

#### Mark as Read
```json
PATCH /api/contact/:id/read
// No body required - automatically sets status: true
```

#### Response Structure
```json
{
  "id_contact": 1,
  "name": "Franco Javier",
  "email": "franco@example.com",
  "message": "Tengo una consulta sobre las especies de hormigas...",
  "created_at": "2025-09-10T23:03:26.875Z",
  "deleted_at": null,
  "status": false,
  "id_service": 1,
  "service": {
    "id_service": 1,
    "service_name": "Consulta General",
    "deleted_at": null
  }
}
```

#### Filter Examples
```bash
# Get unread contacts
GET /api/contact?status=false

# Get read contacts  
GET /api/contact?status=true

# Get contacts by service
GET /api/contact/service/1
```

---

## 🚨 Important Notes

1. **Port**: API runs on port **4000** (not 3000)
2. **Authentication**: Most endpoints require JWT token in Authorization header
3. **Timestamps**: Use ISO 8601 format
4. **IDs**: All primary keys are auto-increment integers
5. **Text Fields**: All string fields accept any length (text type in DB)
6. **Environment Model**: ✅ Fully implemented with CRUD endpoints
7. **LocalityEnvironment Model**: ✅ Implemented for many-to-many associations
7. **Collection Creation**: Usually done automatically with observation creation
8. **Stored Procedures**: Still used for POST/PATCH/DELETE observation operations
9. **Prisma Direct**: Used for all GET operations (better performance and type safety)

---

## 🧪 Testing

Use the provided test scripts to test all payloads:

```bash
# Node.js comprehensive test
npm run test:api

# Bash quick test
npm run test:api:bash
```

Both scripts create test records with timestamps for easy identification and **DO NOT delete** them, allowing for manual inspection.
