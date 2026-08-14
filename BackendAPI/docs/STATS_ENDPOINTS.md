# Stats Endpoints

## Endpoints

### GET /api/stats/dashboard
Todas las estadísticas en una llamada.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "taxonomy": {
    "subfamilies": 12,
    "genera": 51,
    "species": 158,
    "totalObservations": 1020
  },
  "environments": [
    { "name": "Bosque", "count": 350 },
    { "name": "Pastizal", "count": 280 }
  ],
  "commonSpecies": [
    { "species": "Camponotus rufipes", "count": 150 },
    { "species": "Pheidole flavens", "count": 120 }
  ],
  "byCountry": [
    {
      "id": 1,
      "name": "Argentina",
      "count": 1020,
      "provinces": [
        { "id": 19, "name": "Misiones", "count": 890 },
        { "id": 22, "name": "Chaco", "count": 130 }
      ]
    }
  ]
}
```

### GET /api/stats/taxonomy
Solo taxonomía.

### GET /api/stats/environments
Solo ambientes.

### GET /api/stats/common-species
Top 10 especies.

### GET /api/stats/by-country
Solo países y provincias.

### GET /api/stats/province/:provinceName
Estadísticas detalladas de una provincia específica.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Ejemplo:** `/api/stats/province/Corrientes` o `/api/stats/province/Buenos%20Aires`

**Response:**
```json
{
  "province": "Corrientes",
  "totalObservations": 245,
  "totalSpecies": 38,
  "totalGenera": 12,
  "fieldTrips": 15,
  "topSpecies": [
    { "species": "Solenopsis invicta", "count": 45 },
    { "species": "Pheidole sp.", "count": 32 }
  ]
}
```

**Campos:**
- `totalObservations`: Total de observaciones
- `totalSpecies`: Especies únicas
- `totalGenera`: Géneros únicos
- `fieldTrips`: Salidas de campo (fechas únicas)
- `topSpecies`: Top 10 especies más observadas

### GET /api/stats/province/:provinceName/top-localities
Top 5 localidades con más observaciones en una provincia específica.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Ejemplo:** `/api/stats/province/Formosa/top-localities` o `/api/stats/province/Buenos%20Aires/top-localities`

**Response:**
```json
[
  {
    "rank": 1,
    "locality": "Formosa",
    "department": "Formosa",
    "observations": 156
  },
  {
    "rank": 2,
    "locality": "Clorinda",
    "department": "Clorinda",
    "observations": 89
  },
  {
    "rank": 3,
    "locality": "El Colorado",
    "department": "Pilcomayo",
    "observations": 67
  },
  {
    "rank": 4,
    "locality": "Pilcomayo",
    "department": "Pilcomayo",
    "observations": 45
  },
  {
    "rank": 5,
    "locality": "Las Lomitas",
    "department": "Pilcomayo",
    "observations": 32
  }
]
```

**Campos:**
- `rank`: Posición en el ranking (1-5)
- `locality`: Nombre de la localidad
- `department`: Nombre del departamento
- `observations`: Cantidad de observaciones en esa localidad

## Notas

- Todos requieren JWT token
- Datos en paralelo con `Promise.all()`
- Ordenados de mayor a menor
- Búsqueda case-insensitive para nombres de provincias
