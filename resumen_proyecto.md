# Resumen del proyecto

Sistema de gestión de colecciones biológicas para el Laboratorio de Zoología
Agrícola de la FaCENA (UNNE), desarrollado como Práctica Profesional Supervisada
de la Licenciatura en Sistemas de Información.

## El problema

El laboratorio llevaba sus registros de campo en planillas de cálculo. Eso
funcionaba para cargar datos, pero no para consultarlos: no había forma de
buscar por criterios combinados, la cadena taxonómica se repetía a mano en cada
fila y no existía control de quién modificaba qué.

## La solución

Una aplicación web con tres piezas: una API REST que centraliza los datos y las
reglas, un panel de administración para el trabajo diario y una base relacional
que reemplaza a las planillas.

| Capa | Tecnología |
|---|---|
| API | NestJS 11, Prisma 6.5, TypeScript |
| Base de datos | PostgreSQL 18, 20 tablas |
| Panel web | Next.js 15, React 19, NextAuth v5 |
| Despliegue | Docker Compose, Nginx, Dokploy |

## Qué resuelve

**Taxonomía recursiva.** La tabla `Taxon` se referencia a sí misma, así que la
clasificación admite cualquier profundidad. Consultar la cadena completa de una
especie hasta el reino es una sola llamada, y no hay que repetir los niveles
superiores en cada registro.

**Ubicación en cascada.** País, provincia, departamento y localidad encadenados,
con la geolocalización colgando de la localidad: coordenadas, altitud, índice de
huella humana y distancia al curso de agua más cercano.

**Búsqueda combinada.** Un mismo endpoint filtra por taxón, localidad, colector,
rango de fechas y coordenadas con radio de tolerancia, todo a la vez y paginado.
Está disponible tanto en la API como en el panel.

**Control de acceso por roles.** Tres perfiles: administración completa,
colaborador —que carga y edita datos científicos pero no toca usuarios ni
servicios— y consulta, de solo lectura. La autorización se aplica en el backend
con un guard global; el panel además oculta lo que cada perfil no puede usar.

**Nada se borra.** Todas las bajas son lógicas: el registro queda marcado con su
fecha de borrado y se puede restaurar. El borrado físico existe, pero es
explícito y exclusivo del administrador.

**Importación desde las planillas.** Un script levanta los ODS/CSV históricos del
laboratorio, valida los mapeos y arma las relaciones, de modo que los años de
registros previos entraron al sistema sin recargarlos a mano.

**Exportación para análisis.** Las observaciones se exportan a CSV respetando el
orden de columnas del Excel original, así los scripts de R que ya usaba el
laboratorio siguen funcionando.

## Estado

En producción, con más de 1.000 observaciones reales y su cadena taxonómica
completa. La API está documentada con Swagger y el panel cubre los módulos de
observaciones, taxonomía, ubicación, colecciones, datos maestros, usuarios y
reportes.

## Documentación

- [README](./README.md) — puesta en marcha y arquitectura
- [Documentación de la API](./BackendAPI/docs/README.md) — endpoints, modelos y seguridad
- [Modelo de datos](./modelo_datos_gema.md) — diagrama entidad-relación
