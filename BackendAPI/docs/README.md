# Documentación del Sistema de Colecciones Biológicas

Esta documentación proporciona una visión detallada de la arquitectura, modelos de datos, APIs y componentes del sistema de colecciones biológicas desarrollado con NestJS, PostgreSQL y Prisma ORM.

## Índice

1. [Arquitectura del Sistema](./architecture/README.md)
   - Visión general de la arquitectura
   - Flujo de datos
   - Componentes principales

2. [Base de Datos](./database/README.md)
   - [Estructura de Base de Datos](./database/structure.md)
   - [Funciones PostgreSQL](./database/postgresql_functions.md)
   - [Consultas Recursivas](./database/recursive_queries.md)

3. [Modelos de Datos](./models/README.md)
   - [Estructura Taxonómica Recursiva](./models/taxonomic_structure.md)
   - [Modelos de Localización](./models/location_models.md)
   - [Modelos de Colección](./models/collection_models.md)
   - [Autenticación y Usuarios](./models/authentication.md)

4. [Referencia Rápida de API](./ENDPOINTS.md)
   - Listado completo de todos los endpoints por módulo
   
5. [Esquemas y Ejemplos JSON](./API_SCHEMAS.md)
   - Requests/Responses completos con ejemplos
   
6. [Referencia de Payloads](./COMPLETE_PAYLOAD_REFERENCE.md)
   - Estructuras de datos para todas las tablas del sistema

## Características Principales

- **Taxonomía Recursiva**: Sistema flexible para manejar clasificaciones taxonómicas a cualquier nivel de profundidad.
- **Funciones PostgreSQL**: Operaciones complejas delegadas a la base de datos para garantizar integridad y rendimiento.
- **API Modular**: Diseño modular para facilitar el mantenimiento y la extensión.
- **Geolocalización Precisa**: Sistema de coordenadas GPS con altitud y tipo de fuente.
- **Tipos de Ambiente**: Categorización de localidades por ambiente (Selva riparia, Montado, Playa, etc.).
- **Validación Integrada**: Validación de datos en múltiples niveles (database, ORM, API).
- **Documentación Swagger**: API completamente documentada con Swagger.

## Módulos Implementados

### ✅ Completamente Funcionales (17 modelos)
- **Autenticación**: User, Rol
- **Ubicación**: Country, Province, Department, Locality
- **Taxonomía**: TaxonomicLevel, Taxon
- **Colección**: Person, Trap, PreservationMethod, Collection
- **Core**: Observation, Geolocation
- **Ambiente**: Environment, LocalityEnvironment
- **Servicios**: Service, Contact

## Requisitos del Sistema

- Node.js v16 o superior
- PostgreSQL 12 o superior
- Prisma ORM

## Configuración

Para la configuración del entorno de desarrollo, consulte el archivo [.env.example](../.env.example) y ajuste según sea necesario.
