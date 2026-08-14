# Custom Hooks

## useRoleAuth

Hook personalizado para manejar la autorización basada en roles en toda la aplicación.

### Uso básico

```tsx
import { useRoleAuth } from "@/hooks/use-role-auth";

function MyComponent() {
  const { isAdmin, canAccess, filterByRole } = useRoleAuth();

  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {canAccess([ROLE_IDS.ADMIN, ROLE_IDS.USER]) && <UserPanel />}
    </div>
  );
}
```

### API del hook

#### Propiedades retornadas

- `userRole`: El ID del rol del usuario actual
- `isLoading`: Indica si la sesión está cargando
- `isAuthenticated`: Indica si el usuario está autenticado
- `ROLE_IDS`: Constantes con los IDs de roles disponibles

#### Métodos disponibles

- `hasRole(roleId)`: Verifica si el usuario tiene un rol específico
- `hasAnyRole(roleIds[])`: Verifica si el usuario tiene alguno de los roles especificados
- `isAdmin()`: Verifica si el usuario es administrador
- `canAccess(requiredRoles)`: Verifica si el usuario puede acceder a una funcionalidad
- `canViewAdminContent()`: Verifica si el usuario puede ver contenido administrativo
- `filterByRole(items[])`: Filtra un array de elementos basado en permisos de rol

### Ejemplos de uso

#### 1. Mostrar contenido condicionalmente

```tsx
function Dashboard() {
  const { isAdmin, canAccess, ROLE_IDS } = useRoleAuth();

  return (
    <div>
      {isAdmin() && <AdminStats />}
      {canAccess(ROLE_IDS.USER) && <UserStats />}
    </div>
  );
}
```

#### 2. Filtrar elementos del menú

```tsx
const menuItems = [
  { title: "Inicio", url: "/dashboard" },
  { title: "Usuarios", url: "/users", requiredRoles: [ROLE_IDS.ADMIN] },
  {
    title: "Reportes",
    url: "/reports",
    requiredRoles: [ROLE_IDS.ADMIN, ROLE_IDS.USER],
  },
];

function Navigation() {
  const { filterByRole } = useRoleAuth();
  const visibleItems = filterByRole(menuItems);

  return (
    <nav>
      {visibleItems.map((item) => (
        <Link key={item.url} href={item.url}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
```

#### 3. Proteger rutas

```tsx
function ProtectedRoute({ children, requiredRoles }) {
  const { canAccess, isLoading } = useRoleAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!canAccess(requiredRoles)) return <AccessDenied />;

  return children;
}

// Uso
<ProtectedRoute requiredRoles={[ROLE_IDS.ADMIN]}>
  <AdminPanel />
</ProtectedRoute>;
```

### Constantes de roles

Los IDs de roles están definidos en `@/lib/constants/roles`:

```tsx
import { ROLE_IDS } from "@/lib/constants/roles";

// ROLE_IDS.ADMIN = 1
// ROLE_IDS.USER = 2
// ROLE_IDS.VIEWER = 3
```

### Mejores prácticas

1. **Usar el hook en componentes que necesitan autorización**: Evita pasar props de autorización por múltiples niveles.

2. **Combinar con loading states**: Siempre verifica `isLoading` antes de mostrar contenido basado en roles.

3. **Usar `filterByRole` para listas**: Es más eficiente que verificar cada elemento individualmente.

4. **Definir roles requeridos en la configuración**: Usa `requiredRoles` en arrays de configuración para mantener la lógica centralizada.

5. **Usar constantes**: Siempre usa `ROLE_IDS` en lugar de números mágicos.
