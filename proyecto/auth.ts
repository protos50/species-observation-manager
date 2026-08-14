// Importamos las dependencias necesarias para NextAuth
import NextAuth from "next-auth"; // Core de NextAuth para manejar la autenticación
import Credentials from "next-auth/providers/credentials"; // Proveedor para autenticación personalizada con credenciales
import { LoginSchema } from "@/lib/zod"; // Esquema de validación para el formulario de login
import { authConfig } from "./src/auth.config"; // Configuración adicional de autenticación (páginas, callbacks, etc.)
import { JWT } from "next-auth/jwt"; // Tipo para el token JWT que almacena la información del usuario
import { Session } from "next-auth"; // Tipo para la sesión del usuario
import { authApi } from "@/lib/api/auth"; // Importamos el módulo centralizado de llamadas a la API

// Determinamos si debemos usar cookies `Secure` en función del entorno y del protocolo
const isProd = process.env.NODE_ENV === "production";
const useSecureCookies = isProd && process.env.NEXTAUTH_URL?.startsWith("https://");

// Exportamos las funciones principales de NextAuth que usaremos en la aplicación
export const {
  handlers, // Manejadores para las rutas de API de autenticación
  signIn, // Función para iniciar sesión
  signOut, // Función para cerrar sesión
  auth, // Función para obtener la sesión actual
} = NextAuth({
  // Combinamos la configuración base con la configuración adicional
  ...authConfig,
  trustHost: true,
  basePath: "/api/auth", // Ruta base para NextAuth
  // Solo usamos cookies `Secure` cuando estamos en producción *y* el sitio corre sobre HTTPS
  useSecureCookies,

  // Definimos los proveedores de autenticación que usaremos
  providers: [
    // Usamos el proveedor de credenciales para autenticación personalizada
    Credentials({
      name: "credentials", // Nombre del proveedor

      // Definimos los campos que necesitamos para la autenticación
      credentials: {
        email: { label: "Email", type: "email" }, // Campo de email
        password: { label: "Contraseña", type: "password" }, // Campo de contraseña
      },

      // Función que maneja la autenticación
      async authorize(credentials) {
        try {
          // Validamos los campos usando Zod
          const validatedFields = LoginSchema.safeParse(credentials);

          // Si la validación falla, retornamos null (autenticación fallida)
          if (!validatedFields.success) {
            console.error("Validación fallida:", validatedFields.error);
            return null;
          }

          // Extraemos email y contraseña de los campos validados
          const { email, password } = validatedFields.data;

          console.log("Intentando autenticar usuario:", email);

          // Llamamos a la función centralizada de autenticación
          const user = await authApi.login(email, password);

          if (!user) {
            console.error(
              "Login fallido: usuario no encontrado o credenciales inválidas"
            );
            return null;
          }

          console.log("Usuario autenticado exitosamente:", user.email);
          return user;
        } catch (error) {
          // Si hay algún error, lo registramos y retornamos null
          console.error("Error de autenticación:", error);
          return null;
        }
      },
    }),
  ],

  // Configuración de la sesión
  session: {
    strategy: "jwt", // Usamos JWT para manejar las sesiones (más seguro que cookies)
    maxAge: 30 * 24 * 60 * 60, // 30 días en segundos
    updateAge: 24 * 60 * 60, // Actualizar token cada 24 horas
  },

  // Configuración de cookies para persistir sesión
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // Alineamos con useSecureCookies para evitar problemas de CSRF en entornos HTTP
        secure: useSecureCookies,
        maxAge: 30 * 24 * 60 * 60, // 30 días en segundos - CRÍTICO para persistencia
      },
    },
  },

  // Callbacks para manejar tokens y sesiones
  callbacks: {
    // Callback que se ejecuta cuando se crea/actualiza el token JWT
    async jwt({ token, user }) {
      // Si tenemos un usuario, agregamos sus datos al token
      if (user) {
        token.accessToken = user.accessToken; // Guardamos el token de acceso
        token.refreshToken = user.refreshToken; // Guardamos el token de refresco
        token.role = user.role; // Guardamos el rol del usuario
      }
      return token;
    },

    // Callback que se ejecuta cuando se crea/actualiza la sesión
    async session({ session, token }: { session: Session; token: JWT }) {
      // Si tenemos un token, agregamos sus datos a la sesión
      if (token) {
        session.user = {
          ...session.user, // Mantenemos los datos existentes del usuario
          accessToken: token.accessToken as string, // Agregamos el token de acceso
          refreshToken: token.refreshToken as string, // Agregamos el token de refresco
          role: token.role as number, // Agregamos el rol
        };
      }
      return session;
    },
  },
});
