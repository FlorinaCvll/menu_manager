import { NextResponse } from "next/server";
import {jsonError, requireApiSession} from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const negocio = await prisma.negocio.findUnique({
    where: {
      idNegocio: sesion.idNegocio,
    },
  });

  return NextResponse.json({ ok: true, item: negocio });
}

export async function PUT(request: Request) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

    await request.json().catch(() => null);
    return jsonError("Los datos fiscales del negocio no se pueden modificar desde la aplicacion.", 403);
}
