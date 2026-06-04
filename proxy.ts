import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const esRutaAdmin = pathname.startsWith("/admin");
  const esRutaCamarero = pathname.startsWith("/camarero");
  const esRutaSuperAdmin = pathname.startsWith("/superadmin");

  if ((esRutaAdmin || esRutaCamarero || esRutaSuperAdmin) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/camarero/:path*", "/superadmin/:path*"],
};
