# 🔗 Resumen de Endpoints - Sistema de Colecciones Biológicas

> **Base URL:** `http://localhost:4000/api`  
> **Autenticación:** JWT Bearer Token (excepto endpoints de autenticación)

---

## 🔐 **Autenticación**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |

---

## 👥 **Usuarios y Roles**

### Users
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:id` | Obtener usuario por ID |
| POST | `/users` | Crear nuevo usuario |
| PATCH | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |
| PATCH | `/users/:id/restore` | Restaurar usuario eliminado |

### Roles
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/rol` | Listar todos los roles |
| GET | `/rol/:id` | Obtener rol por ID |
| POST | `/rol` | Crear nuevo rol |
| PATCH | `/rol/:id` | Actualizar rol |
| DELETE | `/rol/:id` | Eliminar rol |

---

## 🌍 **Ubicación Geográfica**

### Countries
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/country` | Listar todos los países |
| GET | `/country/:id` | Obtener país por ID |
| POST | `/country` | Crear nuevo país |
| PATCH | `/country/:id` | Actualizar país |
| DELETE | `/country/:id` | Eliminar país |
| GET | `/country/:id/check-in-use` | Validar uso en jerarquía |
| GET | `/country/deleted/list` | Listar países eliminados |
| PATCH | `/country/:id/restore` | Restaurar país eliminado |

### Provinces
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/province` | Listar todas las provincias |
| GET | `/province/:id` | Obtener provincia por ID |
| GET | `/province/country/:countryId` | Obtener provincias por país |
| POST | `/province` | Crear nueva provincia |
| PATCH | `/province/:id` | Actualizar provincia |
| DELETE | `/province/:id` | Eliminar provincia |
| GET | `/province/:id/check-in-use` | Validar uso en jerarquía |
| GET | `/province/deleted/list` | Listar provincias eliminadas |
| PATCH | `/province/:id/restore` | Restaurar provincia eliminada |

### Departments
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/department` | Listar todos los departamentos |
| GET | `/department/:id` | Obtener departamento por ID |
| GET | `/department/province/:provinceId` | Obtener departamentos por provincia |
| POST | `/department` | Crear nuevo departamento |
| PATCH | `/department/:id` | Actualizar departamento |
| DELETE | `/department/:id` | Eliminar departamento |
| GET | `/department/:id/check-in-use` | Validar uso en jerarquía |
| GET | `/department/deleted/list` | Listar departamentos eliminados |
| PATCH | `/department/:id/restore` | Restaurar departamento eliminado |

### Localities
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/locality` | Listar todas las localidades |
| GET | `/locality/:id` | Obtener localidad por ID |
| GET | `/locality/department/:departmentId` | Obtener localidades por departamento |
| POST | `/locality` | Crear nueva localidad |
| PATCH | `/locality/:id` | Actualizar localidad |
| DELETE | `/locality/:id` | Eliminar localidad |
| GET | `/locality/:id/check-in-use` | Validar uso en observaciones |
| GET | `/locality/deleted/list` | Listar localidades eliminadas |
| PATCH | `/locality/:id/restore` | Restaurar localidad eliminada |

---

## 📍 **Geolocalización**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/geolocation` | Listar todas las geolocalizaciones |
| GET | `/geolocation/:id` | Obtener geolocalización por ID |
| GET | `/geolocation/coordinates?latitude=X&longitude=Y` | Buscar por coordenadas |
| POST | `/geolocation` | Crear nueva geolocalización |
| PUT | `/geolocation/:id` | Actualizar geolocalización |
| DELETE | `/geolocation/:id` | Eliminar geolocalización |

**Payload para crear geolocalización (campos obligatorios):**
```json
{
  "latitude": -34.6118,
  "longitude": -58.4173,
  "source_type": "GPS",
  "id_locality": 5
}
```

**Payload completo (con campos opcionales):**
```json
{
  "latitude": -34.6118,
  "longitude": -58.4173,
  "altitude": 20.5,
  "source_type": "GPS",
  "ihh": 0.85,
  "distance_to_river": 150.5,
  "tag": "Colonia principal",
  "id_locality": 5
}
```

**Campos opcionales:**
- `altitude`: Altitud en metros
- `ihh`: Índice de Heterogeneidad del Hábitat
- `distance_to_river`: Distancia al río más cercano en metros
- `tag`: Etiqueta descriptiva opcional

### Endpoints adicionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/geolocation/tag/:tag` | Buscar geolocalizaciones por tag (case-insensitive) |
| GET | `/geolocation/deleted/list` | Listar geolocalizaciones eliminadas (soft delete) |
| PUT | `/geolocation/:id/restore` | Restaurar una geolocalización eliminada |

---

## 🦎 **Taxonomía**

### Taxonomic Levels
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/taxonomic-level` | Listar niveles taxonómicos |
| GET | `/taxonomic-level/:id` | Obtener nivel por ID |
| POST | `/taxonomic-level` | Crear nivel taxonómico |
| PATCH | `/taxonomic-level/:id` | Actualizar nivel |
| DELETE | `/taxonomic-level/:id` | Eliminar nivel |

### Taxons
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/taxon` | Listar todos los taxones |
| GET | `/taxon/:id` | Obtener taxón por ID |
| GET | `/taxon/search?term=X` | Buscar taxones por término |
| GET | `/taxon/level/:levelId` | Obtener taxones por nivel |
| GET | `/taxon/children/:parentId` | Obtener taxones hijos |
| GET | `/taxon/hierarchy/:id` | Obtener jerarquía taxonómica |
| GET | `/taxon/descendants/:id` | Obtener descendientes |
| POST | `/taxon` | Crear nuevo taxón |
| PATCH | `/taxon/:id` | Actualizar taxón |
| DELETE | `/taxon/:id` | Eliminar taxón |

---

## 🏺 **Colección**

### Climate Data
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/climate-data` | Listar datos climáticos |
| GET | `/climate-data/:id` | Obtener dato climático por ID |
| GET | `/climate-data/locality/:localityId` | Datos por localidad |
| GET | `/climate-data/locality/:localityId/date/:date` | Obtener dato por localidad y fecha |
| POST | `/climate-data` | Crear dato climático |
| PATCH | `/climate-data/:id` | Actualizar dato climático |
| DELETE | `/climate-data/:id` | Eliminar dato climático |
| GET | `/climate-data/:id/check-in-use` | Validar uso en observaciones |
| GET | `/climate-data/deleted/list` | Listar datos climáticos eliminados |
| PATCH | `/climate-data/:id/restore` | Restaurar dato climático eliminado |

### People
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/person` | Listar todas las personas |
| GET | `/person/:id` | Obtener persona por ID |
| POST | `/person` | Crear nueva persona |
| PATCH | `/person/:id` | Actualizar persona |
| DELETE | `/person/:id` | Eliminar persona |

### Preservation Methods
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/preservation-method` | Listar métodos de preservación |
| GET | `/preservation-method/:id` | Obtener método por ID |
| POST | `/preservation-method` | Crear método |
| PATCH | `/preservation-method/:id` | Actualizar método |
| DELETE | `/preservation-method/:id` | Eliminar método |

### Traps
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/trap` | Listar todas las trampas |
| GET | `/trap/:id` | Obtener trampa por ID |
| POST | `/trap` | Crear nueva trampa |
| PATCH | `/trap/:id` | Actualizar trampa |
| DELETE | `/trap/:id` | Eliminar trampa |

### Castes (Castas de Hormigas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/caste` | Listar todas las castas |
| GET | `/caste/:id` | Obtener casta por ID |
| POST | `/caste` | Crear nueva casta |
| PATCH | `/caste/:id` | Actualizar casta |
| DELETE | `/caste/:id` | Eliminar casta |

---

## 🌿 **Ambiente**

### Environment (Tipos de Ambiente)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/environment` | Listar todos los tipos de ambiente |
| GET | `/environment/:id` | Obtener tipo de ambiente por ID |
| POST | `/environment` | Crear nuevo tipo de ambiente |
| PATCH | `/environment/:id` | Actualizar tipo de ambiente |
| DELETE | `/environment/:id` | Eliminar tipo de ambiente |
| GET | `/environment/:id/check-in-use` | Validar uso en observaciones |
| GET | `/environment/deleted/list` | Listar ambientes eliminados |
| PATCH | `/environment/:id/restore` | Restaurar ambiente eliminado |

### Locality-Environment (Asociaciones)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/locality-environment` | Listar todas las asociaciones localidad-ambiente |
| GET | `/locality-environment/:id` | Obtener asociación por ID |
| GET | `/locality-environment/locality/:localityId` | Obtener ambientes de una localidad |
| GET | `/locality-environment/environment/:environmentId` | Obtener localidades de un ambiente |
| POST | `/locality-environment` | Crear asociación localidad-ambiente |
| PUT | `/locality-environment/locality/:localityId/environments` | Reemplazar ambientes de una localidad |
| DELETE | `/locality-environment/:id` | Eliminar asociación |

**Payload para crear asociación:**
```json
{
  "id_locality": 5,
  "id_environment": 3
}
```

**Payload para actualizar ambientes de una localidad:**
```json
{
  "environmentIds": [1, 3, 5]
}
```

---

## 🔬 **Observaciones** ⭐

> **🎯 OPTIMIZADO:** Todos los endpoints GET usan **Prisma directo** con **datos anidados completos** y **estructura consistente**

### Main Endpoints
| Método | Endpoint | Descripción | Paginación | Filtros |
|--------|----------|-------------|------------|----------|
| GET | `/observation` | **Lista paginada general** | ✅ `page`, `limit` | No |
| GET | `/observation/:id` | **Observación individual completa** | No | No |
| GET | `/observation/search` | **Búsqueda avanzada paginada** | ✅ `page`, `limit` | ✅ 15+ filtros |
| GET | `/observation/taxon/:taxonId` | Deprecated — usar `/observation/search?taxon_id=:taxonId` | No | ID específico |
| GET | `/observation/locality/:localityId` | Deprecated — usar `/observation/search?locality_id=:localityId` | No | ID específico |
| GET | `/observation/collection/:collectionId` | Observación por colección | No | ID específico |
| **POST** | **`/observation/with-collection`** | **Crear colección + observación** ⚡ | No | No |
| PATCH | `/observation/:id` | Actualizar observación | No | No |
| DELETE | `/observation/:id` | Eliminar observación | No | No |

### 🚀 **Estructura de Respuesta Consistente**

Todos los endpoints GET devuelven **datos anidados completos** con:
- **Taxón** con nivel taxonómico
- **Localidad** con jerarquía geográfica completa (departamento → provincia → país)
- **Colección** con persona, método preservación, trampa
- **Geolocalización** con coordenadas GPS

### 🎯 **Endpoint Principal - Crear Observación con Geolocalización**

**`POST /observation/with-collection`**

**Payload (campos obligatorios):**
```json
{
  "id_person": 1,
  "id_preservation_method": 2,  
  "id_trap": 1,
  "collection_date": "2024-04-15T12:00:00.000Z",
  "id_taxon": 42,
  "id_geolocation": 3
}
```

**Payload completo (con campos opcionales):**
```json
{
  "id_person": 1,
  "id_preservation_method": 2,  
  "id_trap": 1,
  "collection_date": "2024-04-15T12:00:00.000Z",
  "trap_number": 5,
  "id_taxon": 42,
  "id_geolocation": 3,
  "abundance": 10,
  "id_caste": 2,
  "biology_notes": "Observada forrajeando en el suelo",
  "general_observations": "Clima cálido y húmedo",
  "conservation_status": "LC",
  "id_identifier": 3,
  "identification_date": "2024-04-20T12:00:00.000Z"
}
```

**Notas:**
- `collection_date` e `identification_date` deben estar en formato ISO-8601 con hora (recomendado: `T12:00:00.000Z`)
- `trap_number`, `abundance`, `id_caste`, `biology_notes`, `general_observations`, `conservation_status`, `id_identifier`, `identification_date` son opcionales

**Flujo recomendado:**
1. Crear geolocalización: `POST /geolocation` → obtener `id_geolocation`
2. Crear observación: `POST /observation/with-collection` con `id_geolocation`

---

## 🔍 **Endpoints de Búsqueda Avanzada**

### 🎯 Search Observations - 15+ Filtros Flexibles

**Endpoint:** `GET /observation/search`

**🆕 OPTIMIZADO:** Ahora usa **Prisma directo** con **datos anidados completos** y **paginación integrada**

#### 📋 **Filtros Disponibles:**

**Por IDs (compatibilidad):**
```bash
?taxon_id=7&locality_id=2&collector_id=1
```

**Por nombres/texto (flexible):**
```bash
?taxon_name=Solenopsis&taxonomic_level=Species&person_name=Juan
?locality_name=Buenos Aires&department_name=Capital&province_name=Buenos Aires&country_name=Argentina
```

**Por fechas:**
```bash
?start_date=2024-01-01&end_date=2024-12-31
```

**Por coordenadas (radio en metros):**
```bash
?latitude=-34.6037&longitude=-58.3816&radius=1000
```

**Con paginación:**
```bash
?page=2&limit=5
```

**Combinaciones complejas:**
```bash
?taxon_name=Solenopsis&person_name=Juan&province_name=Tucumán&start_date=2024-01-01&page=1&limit=10
```

### Search Taxons
```
GET /taxon/search?term=panthera
```

### Geographic Filtering
```
GET /geolocation/coordinates?latitude=-34.6118&longitude=-58.4173
```

---

## 📊 **Estadísticas**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/stats/dashboard` | Resumen general para dashboard |
| GET | `/stats/taxonomy` | Estadísticas de taxonomía (subfamilias, géneros, especies) |
| GET | `/stats/environments` | Distribución de observaciones por tipo de ambiente |
| GET | `/stats/common-species` | Especies más comúnmente observadas |
| GET | `/stats/by-country` | Observaciones por país y provincia |
| GET | `/stats/province/:provinceName` | Estadísticas detalladas de una provincia |
| GET | `/stats/province/:provinceName/top-localities` | Top 5 localidades con más observaciones en una provincia |

**Notas:**
- Todos los endpoints de estadísticas requieren JWT token
- Búsqueda case-insensitive para nombres de provincias
- Respuestas en formato JSON con datos agregados

---

## 📝 **Notas Importantes**

- **Función PostgreSQL:** El endpoint `POST /observation/with-collection` usa función almacenada para atomicidad
- **Geolocalización:** Flujo desacoplado (crear geolocalización → asociar por ID)
- **Autenticación:** Todos los endpoints requieren JWT excepto `/auth/*`
- **Arquitectura:** Módulos refactorizados con `PrismaModule` para inyección de dependencias

---

## 📞 **Sistema de Consultas**

### Services
| Método | Endpoint | Descripción | Paginación | Filtros |
|--------|----------|-------------|------------|---------|
| GET | `/service` | Listar servicios disponibles | No | ✅ soft delete |
| GET | `/service/:id` | Obtener servicio con sus consultas | No | No |
| POST | `/service` | Crear nuevo servicio | No | No |
| PATCH | `/service/:id` | Actualizar servicio | No | No |
| DELETE | `/service/:id` | Eliminar servicio (soft delete) | No | No |

### Contacts
| Método | Endpoint | Descripción | Paginación | Filtros |
|--------|----------|-------------|------------|---------|
| GET | `/contact` | Listar todas las consultas | No | ✅ status (true/false) |
| GET | `/contact/:id` | Obtener consulta por ID | No | No |
| GET | `/contact/service/:serviceId` | Consultas por servicio | No | ✅ soft delete |
| POST | `/contact` | Crear nueva consulta | No | No |
| PATCH | `/contact/:id` | Actualizar consulta | No | No |
| PATCH | `/contact/:id/read` | Marcar consulta como leída | No | No |
| DELETE | `/contact/:id` | Eliminar consulta (soft delete) | No | No |

---

## 🧪 **Endpoints de Prueba Rápida**

```bash
# Autenticación
POST /api/auth/login
POST /api/auth/register

# Sistema de consultas
GET /api/service
POST /api/contact
GET /api/contact?status=false

# Crear geolocalización
POST /api/geolocation

# Crear observación completa
POST /api/observation/with-collection

# Buscar observaciones
GET /api/observation/search

# Jerarquía taxonómica  
GET /api/taxon/hierarchy/:id
```
