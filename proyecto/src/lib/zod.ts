import { z } from "zod";

// Esquema para login
export const LoginSchema = z.object({
  email: z
    .string({ required_error: "El email es requerido" })
    .email("El email no es válido")
    .min(1, "El email es requerido"),

  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(4, "La contraseña debe tener más de 4 caracteres")
    .max(32, "La contraseña debe tener menos de 32 caracteres"),
});

// Esquema para registro
export const RegisterSchema = z.object({
  first_name: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre es requerido"),

  last_name: z
    .string({ required_error: "El apellido es requerido" })
    .min(1, "El apellido es requerido"),

  email: z
    .string({ required_error: "El email es requerido" })
    .email("El email no es válido"),

  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(4, "La contraseña debe tener más de 4 caracteres")
    .max(32, "La contraseña debe tener menos de 32 caracteres"),

  role_id: z
    .number({ required_error: "El rol es requerido" })
    .positive("Debe seleccionar un rol"),
});
