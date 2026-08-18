# Documentación de la API

API REST del sistema de gestión de colecciones biológicas, construida con NestJS,
Prisma y PostgreSQL.

La API también está documentada con Swagger: con el backend levantado, la interfaz
queda en `/api/docs`.

## Índice

| Documento | Qué contiene |
|---|---|
| [Arquitectura](./architecture/README.md) | Cómo está organizado el proyecto en capas y cómo fluyen los datos |
| [Modelos de datos](./models/README.md) | Las 20 entidades del dominio y cómo se relacionan |
| [Seguridad](./security/README.md) | Autenticación JWT, control de acceso por roles y hasheo de contraseñas |
| [Endpoints](./ENDPOINTS.md) | Listado completo de endpoints por módulo |
| [Esquemas de la API](./API_SCHEMAS.md) | Requests y responses con ejemplos |
| [Referencia de payloads](./COMPLETE_PAYLOAD_REFERENCE.md) | Estructura de datos de cada tabla |
| [Endpoints de estadísticas](./STATS_ENDPOINTS.md) | Consultas agregadas para el panel principal |

Dentro de [seguridad](./security/) hay además tres documentos específicos:
[autenticación](./security/authentication.md),
[integración con el frontend](./security/frontend_integration.md) y
[hasheo de contraseñas](./security/password_hashing.md).

## Cómo se accede a la API

Todos los endpoints exigen un token JWT válido, salvo los marcados con `@Public()`
(login, registro y el formulario de contacto de la landing). El `JwtAuthGuard` está
registrado de forma global, así que no hay que declararlo en cada controlador.

Sobre esa autenticación se aplica el control por roles. Hay tres perfiles, que se
corresponden con la tabla `Rol`:

| Rol | id | Qué puede hacer |
|---|---|---|
| `ADMIN` | 1 | Todo, incluida la gestión de usuarios, roles, servicios y la bandeja de contacto |
| `RESEARCHER` | 3 | Crear, editar y dar de baja los datos científicos |
| `USER` | 2 | Solo lectura de los datos del laboratorio |

Los endpoints que no llevan el decorador `@Roles` quedan accesibles para cualquier
usuario autenticado; es el caso de las consultas de lectura. Ver
[seguridad](./security/README.md) para el detalle.

## Particularidades del dominio

- **Taxonomía recursiva**: `Taxon` se referencia a sí mismo, así que la clasificación
  admite cualquier profundidad (reino, filo, clase, orden, familia, género, especie y
  los niveles intermedios que haga falta).
- **Ubicación en cascada**: país → provincia → departamento → localidad, y la
  geolocalización cuelga de la localidad con sus coordenadas, altitud e índice de
  huella humana.
- **Baja lógica**: nada se borra de verdad. Los registros quedan con `deleted_at`
  cargado y se pueden restaurar. Un middleware de Prisma convierte los `delete` en
  `update` y filtra lo dado de baja en las lecturas.
