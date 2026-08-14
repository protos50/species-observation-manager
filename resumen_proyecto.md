# Resumen del Proyecto

## Objetivos

El objetivo general es mantener un registro confiable y ordenado de observaciones, centralizar los datos taxonómicos y de geolocalización, ofrecer una API estable para integraciones y proveer una interfaz web simple para administración y consulta.

## Estado general (no técnico)

El proyecto está en marcha con avances concretos en todas las capas. La base de datos continúa en construcción y se expande de forma incremental en cuanto a los datos de los registros almacenados por el laboratorio; ya se probaron cargas de datos reales. El backend está operativo y documentado, con búsquedas avanzadas y ejecución estable en el puerto 4000. El frontend cuenta con un panel de administración modular y está entrando en etapa de integración con la API. Además, se desarrolló un script que permite popular y exportar los datos del laboratorio a la base de datos desde archivos ODS/CSV con los atributos actualmente disponibles.

## Tecnologías utilizadas

El backend se implementa con NestJS sobre Node.js y TypeScript; Prisma se utiliza como ORM sobre PostgreSQL. La autenticación de la API usa tokens JWT y la documentación de endpoints está publicada en GitHub. Para el soporte de datos se dispone de un script de carga desde ODS/CSV que permite popular y exportar datos del laboratorio a la base de datos.

El frontend está construido con Next.js (App Router) y React en TypeScript. La aplicación ofrece un dashboard modular con navegación clara y componentes reutilizables.

## Avances en Base de Datos

La base de datos se encuentra en desarrollo activo. La base de datos PostgreSQL tiene 17 modelos y se irán ajustando o ampliando según las necesidades funcionales. Se utiliza Prisma como ORM para la capa de acceso a datos. Se desarrolló un script para popular y exportar los datos del laboratorio a la base de datos desde ODS/CSV utilizando los atributos disponibles hasta el momento, validando mapeos y relaciones principales.

## Tablas actuales de la base de datos

La base de datos PostgreSQL cuenta con 17 tablas. A continuación se listan con su nombre funcional en español y, entre paréntesis, el nombre técnico del modelo en Prisma (la base utiliza nombres técnicos mayormente en inglés):

- Rol (acceso) (Prisma: Rol)
- Usuario (Prisma: User)
- Nivel taxonómico (Prisma: TaxonomicLevel)
- Taxón (Prisma: Taxon)
- Ambiente (Prisma: Environment)
- Trampa (Prisma: Trap)
- Método de preservación (Prisma: PreservationMethod)
- Persona (Prisma: Person)
- Identificador (Prisma: Identifier)
- Rol (personas) (Prisma: Role)
- Persona–Rol (relación) (Prisma: PersonRole)
- País (Prisma: Country)
- Provincia (Prisma: Province)
- Departamento (Prisma: Department)
- Localidad (Prisma: Locality)
- Colección (Prisma: Collection)
- Observación (Prisma: Observation)

## Avances en Backend (API)

El backend (NestJS + Prisma + PostgreSQL) está corriendo en el puerto 4000. Las operaciones de lectura (GET) usan Prisma con respuestas consistentes y datos anidados; para creación, edición y eliminación de observaciones se emplean funciones SQL que garantizan la integridad transaccional. Se incorporó geolocalización en el flujo y está implementada una función de búsqueda por atributos (búsqueda avanzada) disponible en la API. Tanto esa integración en la UI como la tabla de Observaciones en el frontend están en desarrollo, dado que se está estableciendo el formato de visualización. La documentación de la API está alojada en GitHub y se indica en la sección de enlaces.

## Avances en Frontend

El frontend está desarrollado con Next.js (App Router) y organiza un dashboard modular con las secciones de usuarios, taxones, niveles taxonómicos, métodos de preservación, trampas, ubicación, observaciones, reportes y configuración. El sistema de login ya está vigente para los usuarios del sistema de registro. El panel de usuarios permite dar de alta y baja usuarios. Están en servicio los formularios de Trampas, Métodos de preservación, Niveles taxonómicos y Taxones; cada formulario incluye un campo de búsqueda para realizar búsquedas específicas. Existe un micrositio para el Laboratorio que permite realizar consultas de servicios del backend. La interfaz incluye un sidebar de navegación y una vista de detalle por registro que se despliega en una ventana lateral/modal para ver información ampliada. Por el momento, la búsqueda avanzada solo está disponible a nivel de API (no visible aún en la UI) y se publicará en la UI con filtros y paginación.

## Hitos clave alcanzados

Se integró geolocalización en observaciones, se migraron las lecturas a Prisma con resultados homogéneos, se auditaron y sincronizaron los endpoints con su documentación y se desarrolló un script de carga para popular y exportar datos del laboratorio (ODS/CSV) a la base de datos, junto con scripts que agilizan el testeo por módulo.

## Próximos pasos

En el corto plazo, se conectará el frontend con los endpoints para listas, formularios y validaciones; se expondrá la búsqueda avanzada en la UI con filtros y paginación; se completarán los modelos pendientes en el backend según prioridad; y se ejecutarán pruebas end‑to‑end para ajustar la experiencia de usuario.

## Cómo probar rápidamente

Para una verificación rápida, puede iniciarse el backend y consultar el puerto 4000 (por ejemplo, `/observation/search?taxon_name=...`). Desde el dashboard del frontend se navegan las secciones y, a medida que se complete la integración, se podrán crear y buscar registros. Los endpoints protegidos requerirán un token de autenticación cuando corresponda. Para auditoría sin entorno local, habrá una demo en producción; el enlace está indicado en la sección de Documentación y enlaces.

## Capturas sugeridas (para el documento)

Se recomiendan capturas del dashboard (menú de módulos), del panel de usuarios (alta/baja), de los buscadores en formularios (Trampas, Métodos de preservación, Niveles taxonómicos, Taxones), de una respuesta JSON de la búsqueda de observaciones con geolocalización, del micrositio del Laboratorio (consultas de servicios), del detalle desplegable de un registro, del resumen del script de carga (ODS/CSV) y de un diagrama conceptual simplificado de tablas.

## Desarrollo

### Desarrollo del backend

El backend está operativo en el puerto 4000. Las lecturas utilizan Prisma y las operaciones transaccionales de observaciones emplean funciones SQL. Se integró geolocalización y la búsqueda avanzada admite más de quince filtros. Existen scripts que permiten probar rápidamente los módulos principales.

### Desarrollo del frontend

El frontend en Next.js cuenta con un dashboard modular; ya hay formularios operativos y login vigente. El panel de usuarios permite alta/baja y los formularios de Trampas, Métodos de preservación, Niveles taxonómicos y Taxones incluyen un campo de búsqueda para consultas específicas. Resta publicar en la UI la búsqueda avanzada con filtros y paginación para completar el flujo.

## Documentación y enlaces

La documentación de la API y los repositorios de código se encuentran en GitHub. Pegar aquí los enlaces correspondientes:
Documentación API (GitHub): [Pegar enlace aquí]
Backend (GitHub): [gonzzaramirez/BackendAPI](https://github.com/gonzzaramirez/BackendAPI)
Frontend (GitHub): [gonzzaramirez/proyecto](https://github.com/gonzzaramirez/proyecto)

### Demo en producción

Se dispone de una demo desplegada en producción para evaluación sin necesidad de entorno local. Demo (URL): [https://192-99-145-175.sslip.io/](https://192-99-145-175.sslip.io/). Si aplica, incluir credenciales de prueba o instrucciones de registro.

### Pruebas realizadas

Se desarrolló y validó un script de carga desde ODS/CSV, utilizando los atributos disponibles en las tablas actuales, para popular y exportar los datos del laboratorio a la base de datos y validar el flujo y la consistencia de datos.

### Estado actual

El proyecto es funcional y continúa en integración: base de datos en evolución, backend estable y documentado, y frontend en proceso de conexión con la API.
