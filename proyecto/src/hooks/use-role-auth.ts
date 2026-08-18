import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_IDS, WRITE_ROLE_IDS, type RoleId } from "@/lib/constants/roles";

/**
 * Custom hook para manejar la autorización basada en roles
 * Optimizado con useMemo y contexto compartido para evitar múltiples llamadas a useSession
 */
export function useRoleAuth() {
  const { session, status } = useAuth();

  const userRole = useMemo(
    () => session?.user?.role as RoleId | undefined,
    [session?.user?.role]
  );
  const isLoading = status === "loading";
  const isAuthenticated = useMemo(
    () => !!session?.user,
    [session?.user]
  );

  /**
   * Funciones memoizadas para optimizar performance
   */
  const authFunctions = useMemo(() => {
    const hasRole = (roleId: RoleId): boolean => {
      return userRole === roleId;
    };

    const hasAnyRole = (roleIds: RoleId[]): boolean => {
      return roleIds.includes(userRole as RoleId);
    };

    const isAdmin = (): boolean => {
      return hasRole(ROLE_IDS.ADMIN);
    };

    const canAccess = (requiredRoles: RoleId | RoleId[]): boolean => {
      if (!isAuthenticated) return false;

      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];
      return hasAnyRole(roles);
    };

    const canViewAdminContent = (): boolean => {
      return canAccess(ROLE_IDS.ADMIN);
    };

    /**
     * Habilita las acciones de escritura (crear, editar, dar de baja y
     * restaurar) sobre los datos cientificos. Corresponde a los perfiles
     * Administrador y Colaborador; el perfil de consulta (USER) solo lee.
     *
     * Sirve para no mostrar controles que el backend va a rechazar igual:
     * el RolesGuard aplica @Roles(...WRITE_ROLES) sobre esos endpoints y
     * responde 403. Ocultar el control es una mejora de interfaz, no la
     * autorizacion en si.
     */
    const canWrite = (): boolean => {
      return canAccess(WRITE_ROLE_IDS as RoleId[]);
    };

    const filterByRole = <T extends Record<string, any>>(items: T[]): T[] => {
      if (!isAuthenticated) return [];

      return items.filter((item) => {
        if (!item.requiredRoles) return true;
        return canAccess(item.requiredRoles as RoleId[]);
      });
    };

    return {
      hasRole,
      hasAnyRole,
      isAdmin,
      canAccess,
      canViewAdminContent,
      canWrite,
      filterByRole,
    };
  }, [userRole, isAuthenticated]);

  return {
    userRole,
    isLoading,
    isAuthenticated,
    ...authFunctions,
    ROLE_IDS,
  };
}
