import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const esRutaAdmin = pathname.startsWith("/admin");
  const esRutaCamarero = pathname.startsWith("/camarero");
  const esRutaSuperAdmin = pathname.startsWith("/superadmin");

  if ((esRutaAdmin || esRutaCamarero || esRutaSuperAdmin) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session) {
    try {
      const sesion = JSON.parse(session) as { rol?: string };

      if (esRutaSuperAdmin && sesion.rol !== "superadmin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      if (esRutaAdmin && sesion.rol === "superadmin") {
        return NextResponse.redirect(new URL("/superadmin/altas", request.url));
      }

      if (esRutaAdmin && sesion.rol !== "admin") {
        return NextResponse.redirect(new URL("/camarero", request.url));
      }

      if (esRutaCamarero && sesion.rol === "superadmin") {
        return NextResponse.redirect(new URL("/superadmin/altas", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/camarero/:path*", "/superadmin/:path*"],
};
