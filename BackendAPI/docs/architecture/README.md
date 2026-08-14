# Arquitectura del Sistema de Colecciones Biológicas

## Visión General de la Arquitectura

El sistema de colecciones biológicas está diseñado siguiendo una arquitectura de capas que separa claramente las responsabilidades y facilita el mantenimiento y la escalabilidad. La arquitectura combina las mejores prácticas de desarrollo backend moderno con un modelo de datos especializado para la gestión de colecciones biológicas.

```
┌───────────────────┐
│     Cliente       │
│  (Frontend/API)   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   API Controllers │ ◄─── Validación DTO
│     (NestJS)      │ ◄─── Swagger Docs
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│     Servicios     │ ◄─── Lógica de negocio
│     (NestJS)      │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Prisma Client   │ ◄─── ORM
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    PostgreSQL     │ ◄─── Funciones almacenadas
│                   │ ◄─── Consultas recursivas
└───────────────────┘
```

## Componentes Principales

### 1. Controllers (NestJS)

Los controladores son responsables de manejar las solicitudes HTTP, definir los endpoints de la API y dirigir las peticiones a los servicios apropiados.

- **Validación**: Utilizan DTOs (Data Transfer Objects) con decoradores de class-validator
- **Documentación**: Integran Swagger para la documentación automática de la API
- **Seguridad**: Implementan guardias para la autenticación y autorización

### 2. Servicios (NestJS)

Los servicios contienen la lógica de negocio y actúan como intermediarios entre los controladores y la capa de acceso a datos.

- **Operaciones CRUD**: Operaciones estándar para la mayoría de las entidades
- **Lógica Especializada**: Implementación de reglas de negocio específicas
- **Integración de Funciones PostgreSQL**: Llamadas a funciones almacenadas para operaciones complejas

### 3. Prisma ORM

Prisma actúa como ORM (Object-Relational Mapping) para interactuar con la base de datos PostgreSQL.

- **Schema**: Define modelos que mapean a tablas en la base de datos
- **Type Safety**: Proporciona tipos TypeScript para todas las operaciones de base de datos
- **Raw Queries**: Permite ejecutar consultas SQL directas cuando es necesario

### 4. PostgreSQL

PostgreSQL sirve como sistema de base de datos principal, aprovechando sus capacidades avanzadas:

- **Funciones Almacenadas**: Implementa lógica compleja directamente en la base de datos
- **Consultas Recursivas**: Gestiona estructuras de datos jerárquicas como la taxonomía
- **Integridad Transaccional**: Garantiza la consistencia de los datos en operaciones complejas

## Flujo de Datos

1. **Solicitud HTTP**: El cliente envía una solicitud a un endpoint específico.
2. **Controller**: Valida la entrada mediante DTOs y llama al servicio correspondiente.
3. **Servicio**: Implementa la lógica de negocio y utiliza Prisma para interactuar con la base de datos.
4. **Prisma**: Traduce las operaciones a consultas SQL o llamadas a funciones PostgreSQL.
5. **PostgreSQL**: Ejecuta las consultas o funciones y devuelve los resultados.
6. **Respuesta**: Los datos fluyen de vuelta a través de la cadena hasta el cliente.

## Módulos Principales

El sistema está organizado en módulos que encapsulan funcionalidades específicas:

### Módulo de Taxonomía
- Gestión de niveles taxonómicos
- Operaciones con taxones
- Consultas recursivas para navegación jerárquica

### Módulo de Localización
- Gestión de países, provincias, departamentos y localidades
- Búsqueda geográfica jerárquica

### Módulo de Colección
- Gestión de colecciones biológicas
- Integración con funciones PostgreSQL para operaciones complejas
- Subcomponentes: trampas, métodos de preservación, personas, etc.

### Módulo de Observación
- Registros de observaciones de especímenes
- Vinculación con taxonomía, localización y colección

### Módulo de Autenticación
- Gestión de usuarios y roles
- Autenticación mediante JWT
- Autorización basada en roles

## Consideraciones de Seguridad

- **Autenticación**: Sistema JWT para autenticación de usuarios
- **Autorización**: Control de acceso basado en roles
- **Validación**: Validación estricta de entradas mediante class-validator
- **Protección SQL**: Uso de consultas parametrizadas para prevenir inyección SQL

## Escalabilidad

La arquitectura está diseñada para escalar:

- **Modularidad**: Los componentes pueden escalarse independientemente
- **Stateless**: Los servicios no mantienen estado, facilitando la horizontalidad
- **Eficiencia de Base de Datos**: Las operaciones complejas se delegan a PostgreSQL

## Integración y Extensión

El sistema está diseñado para ser extensible:

- **API RESTful**: Interfaces claras para integración con otros sistemas
- **Documentación Swagger**: Facilita el uso por desarrolladores externos
- **Módulos Independientes**: Nuevas funcionalidades pueden agregarse como módulos adicionales
