import { usersApi } from "@/lib/api/users";
import { UserClient } from "./components/UserClient";
import { rolesApi } from "@/lib/api/roles";

export default async function UsuariosPage() {
  const [users, roles] = await Promise.all([
    usersApi.getAll(),
    rolesApi.getAll(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de usuarios
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los usuarios del sistema y sus roles
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <UserClient users={users} roles={roles} />
      </div>
    </div>
  );
}
