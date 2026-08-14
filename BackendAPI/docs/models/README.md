# Modelos de Datos del Sistema

## 📊 Modelos Implementados (17 total)

### 1. **Autenticación** (2 modelos)
- `User`: Usuarios del sistema
- `Rol`: Roles y permisos

### 2. **Taxonomía** (3 modelos)
- `TaxonomicLevel`: Niveles taxonómicos (Reino, Filo, Clase, etc.)
- `Taxon`: Taxones específicos con jerarquía recursiva
- `Author`: Autores de descripciones taxonómicas

### 3. **Ubicación Geográfica** (4 modelos)
- `Country` → `Province` → `Department` → `Locality` (jerarquía)

### 4. **Geolocalización** (1 modelo)
- `Geolocation`: Coordenadas GPS (lat, long, altitude, ihh, distance_to_river)
  - Pertenece a una `Locality`

### 5. **Colección** (5 modelos)
- `Person`: Colectores e identificadores
- `Trap`: Tipos de trampas
- `PreservationMethod`: Métodos de preservación
- `Caste`: Castas de hormigas (Worker, Queen, Male, Soldier, etc.)
- `Collection`: Evento de colecta

### 6. **Observación** (1 modelo)
- `Observation`: Registro de espécimen observado
  - Campos opcionales: abundance, biology_notes, general_observations, conservation_status

### 7. **Ambiente y Clima** (2 modelos)
- `Environment`: Tipos de ambiente (Selva riparia, Montado, Playa, etc.)
- `ClimateData`: Datos climáticos (temperatura, humedad, precipitación)

### 8. **Servicios** (2 modelos)
- `Service`: Servicios disponibles
- `Contact`: Mensajes de contacto

---

## 🔗 Diagrama de Relaciones

```
┌──────────────────── NÚCLEO PRINCIPAL ────────────────────┐
│                                                           │
│  ┌──────────────┐                 ┌──────────────┐      │
│  │TaxonomicLevel│                 │    Author    │      │
│  └──────┬───────┘                 └──────┬───────┘      │
│         │ 1:N                            │ 1:N          │
│         │                                │              │
│         ▼                                │              │
│  ┌──────────────┐◄───────────────────────┘             │
│  │    Taxon     │ (jerarquía recursiva parent-children)│
│  └──────┬───────┘                                       │
│         │ 1:N                                           │
│         │                                               │
│         ▼                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Observation                       │  │
│  └────┬─────┬─────┬─────┬─────┬──────┬──────┬──────┘  │
│       │     │     │     │     │      │      │         │
│     1:1   1:1   0:1   0:1   0:1    0:1    0:1         │
│       │     │     │     │     │      │      │         │
│       ▼     ▼     ▼     ▼     ▼      ▼      ▼         │
│  ┌────────────────┬──────────┬──────────────────┐     │
│  │  Collection    │Geolocation│ Environment      │     │
│  │  Caste         │ClimateData│ Person(id)       │     │
│  └────────────────┴──────────┴──────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌────────────────── JERARQUÍA GEOGRÁFICA ─────────────────┐
│                                                          │
│  Country 1:N→ Province 1:N→ Department 1:N→ Locality    │
│                                                ↓ 1:N     │
│                                           Geolocation    │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌────────────────── COLECCIÓN ────────────────────────────┐
│                                                          │
│  Collection ← Person, Trap, PreservationMethod          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Modelos Principales (según schema.prisma)

### Observation (Modelo Central)
```prisma
model Observation {
  // IDs obligatorios
  id_taxon       Int
  id_collection  Int
  id_geolocation Int
  
  // IDs opcionales
  id_environment  Int?
  id_caste        Int?
  id_climate_data Int?
  id_identifier   Int?  // Person que identificó
  
  // Datos opcionales
  abundance        Int?
  identification_date DateTime?
  biology_notes    String?
  general_observations String?
  conservation_status String?
}
```

### Geolocation
```prisma
model Geolocation {
  latitude          Float
  longitude         Float
  altitude          Float?
  source_type       String
  ihh               Float?  // Índice Heterogeneidad Hábitat
  distance_to_river Float?
  id_locality       Int     // ⚠️ OBLIGATORIO
}
```

### Taxon (Jerarquía Recursiva)
```prisma
model Taxon {
  name               String
  id_taxonomic_level Int
  parent_id          Int?      // autorreferencia
  id_author          Int?
  description_year   Int?
  
  parent   Taxon?  @relation("TaxonToTaxon")
  children Taxon[] @relation("TaxonToTaxon")
}
```

### Collection
```prisma
model Collection {
  id_person              Int
  id_preservation_method Int
  id_trap                Int
  collection_date        DateTime
  trap_number            Int?
}
```

---

## 🔑 Relaciones Clave

1. **Observation es el centro**: Conecta taxonomía, geolocalización, colección, ambiente, casta y clima
2. **Geolocation pertenece a Locality**: Siempre asociado a una localidad geográfica
3. **Taxon tiene jerarquía recursiva**: parent_id → autorreferencia para árbol taxonómico
4. **Collection conecta**: Person + Trap + PreservationMethod
5. **Person tiene dos roles**: Colector (Collection) e Identificador (Observation)

---

## 🗄️ Para ver el schema completo

Consultar: `/BackendAPI/prisma/schema.prisma`

Este archivo contiene TODOS los modelos con sus relaciones, índices y constraints.
