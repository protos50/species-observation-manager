import { auth } from "../auth";
import { NextResponse, NextRequest } from "next/server";
import { ROLE_IDS } from "@/lib/constants/roles";

/**
 * Secciones del dashboard reservadas a Administrador.
 *
 * Es una segunda linea de defensa del lado del servidor de Next: evita que
 * alguien llegue a la pantalla escribiendo la URL a mano, aunque el item este
 * oculto en el menu. La autorizacion definitiva la aplica el backend
 * (RolesGuard + @Roles), que es el unico que realmente protege los datos.
 */
const ADMIN_ONLY_PATHS = [
  "/dashboard/usuarios",
  "/dashboard/servicios",
  "/dashboard/contacto",
];

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const { pathname } = req.nextUrl;
  const isOnDashboard = pathname.startsWith("/dashboard");

  // Sin sesion no se entra al dashboard.
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Secciones administrativas: solo rol Administrador.
  const isAdminOnlySection = ADMIN_ONLY_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (isAdminOnlySection && session?.user?.role !== ROLE_IDS.ADMIN) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
