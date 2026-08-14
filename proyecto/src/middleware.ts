import { auth } from "../auth";
import { NextResponse, NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isUsersSection = req.nextUrl.pathname.startsWith("/dashboard/usuarios");

  // Si intenta acceder al dashboard pero no está logueado, redirigir
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Restringir sección Usuarios a Administrador (role_id === 1)
  if (isUsersSection) {
    const roleId = session?.user?.role;
    if (roleId !== 1) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
