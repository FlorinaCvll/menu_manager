import { NextResponse } from "next/server";
import type { persona_rol } from "@/generated/prisma/client";
import { obtenerSesion } from "@/lib/session";

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function requireApiSession(roles?: persona_rol[]) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return {
      error: jsonError("Sesión no válida.", 401),
      sesion: null,
    };
  }

  if (roles && !roles.includes(sesion.rol)) {
    return {
      error: jsonError("No tienes permisos para esta acción.", 403),
      sesion: null,
    };
  }

  return {
    error: null,
    sesion,
  };
}
