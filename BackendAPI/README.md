# BackendAPI - Sistema de Colecciones Biológicas

Este proyecto implementa una API RESTful para la gestión de colecciones biológicas, observaciones y geolocalizaciones, utilizando una arquitectura modular basada en NestJS y Prisma ORM sobre PostgreSQL.

## Descripción General

- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (Bearer Token)
- **Arquitectura:** Modular (módulos para colección, observación, taxonomía, localización, geolocalización, usuarios, roles, etc.)
- **Lógica de negocio crítica:** Centralizada en funciones almacenadas de PostgreSQL para operaciones como creación de colección+observación, garantizando integridad y eficiencia.

## Estructura de Módulos

- `collection`: Gestión de colecciones biológicas
- `observation`: Gestión de observaciones, integración con geolocalización
- `geolocation`: CRUD de geolocalizaciones, asociación con observaciones
- `taxonomic`: Niveles y jerarquía taxonómica
- `location`: País, provincia, departamento, localidad
- `users` y `rol`: Gestión de usuarios y roles

## Integración de Geolocalización

Las observaciones pueden asociarse a una geolocalización mediante los campos:
- `latitude` (float, requerido)
- `longitude` (float, requerido)
- `altitude` (float, opcional)
- `source_type` (string, opcional)

**Lógica de backend:**
- Si se incluyen estos campos al crear una observación, el backend busca una geolocalización existente con esos datos. Si existe, la reutiliza; si no, crea una nueva.
- Si no se envían, la observación se crea sin geolocalización asociada.
- La lógica de creación de colección+observación utiliza funciones almacenadas en PostgreSQL para garantizar atomicidad y validaciones centralizadas.

## Ejemplo de payload para crear observación con geolocalización

```json
{
  "id_person": 1,
  "id_preservation_method": 2,
  "id_trap": 1,
  "collection_date": "2024-04-15",
  "id_taxon": 42,
  "id_locality": 5,
  "latitude": -34.6118,
  "longitude": -58.4173,
  "altitude": 20.5,
  "source_type": "GPS"
}
```

## Documentación Extendida

- [Documentación de API y ejemplos de endpoints](./docs/api/README.md)
- [Documentación de funciones almacenadas y modelo de datos](./docs/database/README.md)
- [Arquitectura y decisiones de diseño](./docs/architecture/README.md)
- [Modelos y ejemplos de uso](./docs/models/README.md)

## Recursos útiles

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
