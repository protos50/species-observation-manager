# Modelo de Datos GEMA - Diagrama ER

```mermaid
erDiagram
    %% ===== AUTHENTICATION SYSTEM =====
    Rol {
        int role_id PK
        string name UK
        string description
    }
    
    User {
        int user_id PK
        string first_name
        string last_name
        string email UK
        string password
        datetime created_at
        datetime deleted_at
        int role_id FK
    }

    %% ===== TAXONOMIC SYSTEM =====
    TaxonomicLevel {
        int id_taxonomic_level PK
        string name UK
    }
    
    Taxon {
        int id_taxon PK
        string name
        int id_taxonomic_level FK
        int parent_id FK
        int id_author FK
    }

    Author {
        int id_author PK
        string author_name
        datetime deleted_at
    }

    %% ===== ENVIRONMENTAL SYSTEM =====
    Environment {
        int id_environment PK
        string environment_name
    }

    Caste {
        int id_caste PK
        string caste_name
        datetime deleted_at
    }

    ClimateData {
        int id_climate_data PK
        int id_locality FK
        date climate_date
        float t_min
        float t_max
        float t_med
        float hr_min
        float hr_max
        float hr_med
        float precipitation
    }

    %% ===== COLLECTION SYSTEM =====
    Person {
        int id_person PK
        string person_name
        string person_lastname
    }
    
    Trap {
        int id_trap PK
        string trap_name
    }
    
    PreservationMethod {
        int id_preservation_method PK
        string method_name
    }
    
    Collection {
        int id_collection PK
        int id_person FK
        int id_preservation_method FK
        int id_trap FK
        date collection_date
    }

    %% ===== GEOGRAPHIC SYSTEM =====
    Country {
        int id_country PK
        string country_name
    }
    
    Province {
        int id_province PK
        int id_country FK
        string province_name
    }
    
    Department {
        int id_department PK
        int id_province FK
        string department_name
    }
    
    Locality {
        int id_locality PK
        int id_department FK
        int id_environment FK
        string locality_name
    }
    
    Geolocation {
        int id_geolocation PK
        float latitude
        float longitude
        float altitude
        string source_type
    }

    %% ===== CORE OBSERVATION SYSTEM =====
    Observation {
        int id_observation PK
        int id_taxon FK
        int id_locality FK
        int id_collection FK
        int id_geolocation FK
    }

    %% ===== CONTACT/SERVICE SYSTEM =====
    Service {
        int id_service PK
        string service_name
        datetime deleted_at
    }
    
    Contact {
        int id_contact PK
        string name
        string email
        string message
        datetime created_at
        datetime deleted_at
        boolean status
        int id_service FK
    }

    %% ===== RELATIONSHIPS =====
    
    %% Authentication
    Rol ||--o{ User : "has role"
    
    %% Taxonomic hierarchy
    TaxonomicLevel ||--o{ Taxon : "defines level"
    Taxon ||--o{ Taxon : "parent/child"
    Author ||--o{ Taxon : "describes"
    
    %% Geographic hierarchy
    Country ||--o{ Province : "contains"
    Province ||--o{ Department : "contains"
    Department ||--o{ Locality : "contains"
    Environment ||--o{ Locality : "characterizes"
    
    %% Collection system
    Person ||--o{ Collection : "collects"
    Trap ||--o{ Collection : "used in"
    PreservationMethod ||--o{ Collection : "preserved with"
    
    %% Core observations
    Taxon ||--o{ Observation : "observed"
    Collection ||--o{ Observation : "collected in"
    Geolocation ||--o{ Observation : "positioned at"
    Environment ||--o{ Observation : "habitat"
    Caste ||--o{ Observation : "caste"
    ClimateData ||--o{ Observation : "weather at"
    Person ||--o{ Observation : "identified by"
    Person ||--o{ Observation : "confirmed by"
    Locality ||--o{ ClimateData : "measured at"
    
    %% Contact system
    Service ||--o{ Contact : "related to"
```

## Descripción del Modelo

### 🔐 **Sistema de Autenticación**
- **User**: Usuarios del sistema con roles específicos
- **Rol**: Diferentes niveles de acceso (admin, investigador, etc.)

### 🧬 **Sistema Taxonómico**
- **TaxonomicLevel**: Niveles jerárquicos (Reino, Phylum, Clase, Orden, Familia, etc.)
- **Taxon**: Entidades taxonómicas con estructura jerárquica padre/hijo

### 🌍 **Sistema Geográfico**
- **Country → Province → Department → Locality**: Jerarquía administrativa
- **Environment**: Tipos de ambiente/hábitat (Montado, Selva riparia, etc.)
- **Geolocation**: Coordenadas GPS precisas

### 🔬 **Sistema de Colección**
- **Person**: Recolectores/investigadores
- **Trap**: Tipos de trampas utilizadas
- **PreservationMethod**: Métodos de conservación
- **Collection**: Evento de recolección específico

### 👁️ **Sistema Central de Observaciones**
- **Observation**: Registro central que conecta todos los sistemas
  - Qué se observó (Taxon)
  - Dónde (Locality + Geolocation)
  - Cómo fue recolectado (Collection)
  - En qué ambiente (Environment via Locality)

### 📞 **Sistema de Contacto**
- **Service**: Servicios ofrecidos por GEMA
- **Contact**: Consultas y solicitudes de usuarios

## Características Clave

### 🔗 **Relaciones Importantes**
1. **Taxon**: Auto-referencial para jerarquía taxonómica
2. **Observation**: Tabla central que conecta taxonomía, geografía y colección
3. **Locality**: Conecta geografía administrativa con ambiente
4. **Geolocation**: Opcional - no todas las observaciones tienen coordenadas

### 📊 **Cardinalidades**
- **1:N** - La mayoría de relaciones (un país tiene muchas provincias)
- **0:N** - Relaciones opcionales (observación puede no tener geolocalización)
- **Auto-referencial** - Taxon para jerarquía taxonómica

### 🎯 **Puntos Focales**
- **Observation** es la entidad central
- **Environment** recién agregado (Sep 2025)
- **Sistema híbrido**: Prisma para consultas, SQL functions para transacciones complejas
