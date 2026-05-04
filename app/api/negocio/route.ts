import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api";
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

  const body = await request.json();

  const negocio = await prisma.negocio.update({
    where: {
      idNegocio: sesion.idNegocio,
    },
    data: {
      nombre: body.nombre,
      direccion: body.direccion,
      telefono: body.telefono || null,
      CIF_NIF: body.CIF_NIF,
      estado: body.estado || "activo",
    },
  });

  return NextResponse.json({ ok: true, item: negocio });
}
