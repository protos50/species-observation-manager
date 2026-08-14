import { Rol } from "@prisma/client";

export type CreateRolDto = Omit<Rol, 'id_rol' >;
