import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/",  // Página a la que se redirige si no está autenticado
  },
  callbacks: {
    authorized({ auth }) {  
      return !!auth?.user // Devuelve "true" si el usuario está autenticado, "false" si no
    },
  },
  providers: [], 
} satisfies NextAuthConfig
