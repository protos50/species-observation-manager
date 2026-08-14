🐜 AntLog – Registro de Especies de Hormigas

Sistema para registrar y gestionar observaciones de hormigas, construido con Next.js (App Router) y un enfoque server-first para rendimiento.

## 🚀 Tecnologías y librerías

- **Framework y rendering**: Next.js (App Router), React, TypeScript, React Server Components (RSC)
- **UI**: shadcn/ui, Radix UI, Tailwind CSS, `next-themes`, `lucide-react`, `nextjs-toploader`
- **Feedback y overlays**: `sonner`, `vaul`, `tw-animate-css`, `motion`
- **Tablas y datos**: `@tanstack/react-table`
- **Formularios y validación**: `react-hook-form`, `zod`, `@hookform/resolvers`
- **Autenticación**: `next-auth`
- **Utilidades**: `clsx`, `class-variance-authority`, `tailwind-merge`

## 🏗️ Arquitectura (Screaming Architecture)

- `src/app/(main)`: landing y páginas públicas (About, Services, Team, etc.). Server-first; solo marcan `use client` cuando requieren interactividad directa.
- `src/app/dashboard`: área autenticada con vistas por dominio (usuarios, taxones, trampas, observaciones, etc.). Patrón server-first: `page.tsx` (RSC) obtiene datos en el servidor y delega a componentes `*Client` cuando hay interacción.
  - Ejemplo: `src/app/dashboard/usuarios/page.tsx` renderiza en servidor y llama a `usuarios/components/UserClient.tsx` para la UI interactiva.
- `src/app/api/auth/[...nextauth]/route.ts`: endpoints de autenticación (NextAuth).
- `src/components`: componentes reutilizables como `DataCards.tsx` y `DataTable.tsx`.

## 🧩 Componentes base

- **DataCards (`src/components/DataCards.tsx`)**: grilla de tarjetas de métricas/resumen.

  - Usa `card` de shadcn/ui, iconos de `lucide-react` y utilidades Tailwind.
  - Props típicas: lista de items `{ title, value, icon? }`. Responsive por defecto.

- **DataTable (`src/components/DataTable.tsx`)**: tabla genérica basada en `@tanstack/react-table`.
  - Soporta columnas configurables, ordenamiento, filtrado y paginación controlada.
  - Integra componentes shadcn/ui (`table`, `input`, `dropdown-menu`, etc.) y puede mostrar acciones por fila.
  - Props típicas: `data` (array de registros) y `columns` (definiciones de columnas de TanStack Table).

## 🎯 Módulo `(main)`

Ubicación: `src/app/(main)/components`

- **HeroSection**: cabecera principal de la landing.
- **Navbar**: navegación superior (client si incluye toggles/temas/menú móvil).
- **AboutSection**: descripción del proyecto/equipo.
- **Services / ServiceItem**: listado de servicios.
- **Team / TeamItem**: equipo y tarjetas de miembros.
- **FormServices**: formulario de contacto/servicios (client) con `react-hook-form` + `zod`.
- **Footer**: pie de página.
- **LoginForm**: formulario de autenticación (client) con NextAuth.

Notas de renderizado: todo componente sin interactividad se sirve como RSC; formularios, menús y toggles se aíslan como client components.

## 📊 Módulo `dashboard`

Ubicación: `src/app/dashboard`

- **usuarios**: `UserClient` (client) + `page.tsx` (server) para listar/gestionar usuarios. Usa `DataTable` y diálogos shadcn.
- **taxones**: `TaxonClient`, `TaxonDetailsSheet` y `CreateTaxonDialog`. Tabla con TanStack Table y formularios con `react-hook-form` + `zod`.
- **trampas**: `TrapClient`, `CreateTrampDialog`.
- **metodos-preservacion**: `MethodClient`, `CreateMethodDialog`.
- **niveles-taxonomicos**: `LevelTaxonClient`, `CreateLevelTaxonDialog`.
- **contacto**: `MessageClient`, `MessageList`, `MessageDetail`.

Patrón de renderizado: `page.tsx` (RSC) hace fetch/selección de datos en servidor y pasa props serializables a `*Client`. Esto reduce JS en el cliente y mejora Rendimiento.

## 🔐 Autenticación

- NextAuth (`next-auth`) configurado en `src/app/api/auth/[...nextauth]/route.ts` y tipos en `src/types/next-auth.d.ts`.
- Componentes sensibles del dashboard verifican roles/permisos en servidor cuando es posible.

## 🗂️ Estructura (resumen)

- `src/app/(main)` – público (landing)
- `src/app/dashboard` – área autenticada por dominio
- `src/components` – reutilizables (`DataCards`, `DataTable`, `sidebar`, `ui/*` de shadcn)
- `src/lib` – APIs de datos, utilidades, zod schemas
- `src/types` – tipos de la app (auth, user, role)
