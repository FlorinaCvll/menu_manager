import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { jsonError, requireApiSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const idPersona = Number(id);
  const body = await request.json();
  const usuarioExistente = await prisma.persona.findFirst({
    where: {
      idPersona,
      idNegocio: sesion.idNegocio,
    },
  });

  if (!usuarioExistente) {
    return jsonError("Usuario no encontrado.", 404);
  }

  const data: {
    nombre?: string;
    apellidos?: string | null;
    telefono?: string | null;
    rol?: "admin" | "camarero";
    comentarios?: string | null;
    fechaBaja?: Date | null;
    pin?: string;
  } = {
    nombre: body.nombre,
    apellidos: body.apellidos || null,
    telefono: body.telefono || null,
    rol: body.rol === "admin" ? "admin" : "camarero",
    comentarios: body.comentarios || null,
    fechaBaja: body.activo === false ? new Date() : null,
  };

  if (body.pin) {
    data.pin = await bcrypt.hash(String(body.pin), 10);
  }

  const usuario = await prisma.persona.update({
    where: { idPersona },
    data,
  });

  return NextResponse.json({ ok: true, item: usuario });
}

export async function DELETE(_: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const idPersona = Number(id);
  const usuarioExistente = await prisma.persona.findFirst({
    where: {
      idPersona,
      idNegocio: sesion.idNegocio,
    },
  });

  if (idPersona === sesion.idPersona) {
    return jsonError("No puedes darte de baja a ti mismo.", 400);
  }

  if (!usuarioExistente) {
    return jsonError("Usuario no encontrado.", 404);
  }

  await prisma.persona.update({
    where: { idPersona },
    data: {
      fechaBaja: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
