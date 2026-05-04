import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { jsonError, requireApiSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const usuarios = await prisma.persona.findMany({
    where: {
      idNegocio: sesion.idNegocio,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return NextResponse.json({ ok: true, items: usuarios });
}

export async function POST(request: Request) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const body = await request.json();

  if (!body.nombre || !body.pin) {
    return jsonError("Nombre y PIN son obligatorios.");
  }

  const usuario = await prisma.persona.create({
    data: {
      nombre: body.nombre,
      apellidos: body.apellidos || null,
      telefono: body.telefono || null,
      pin: await bcrypt.hash(String(body.pin), 10),
      rol: body.rol === "admin" ? "admin" : "camarero",
      fechaAlta: new Date(),
      fechaBaja: body.activo === false ? new Date() : null,
      comentarios: body.comentarios || null,
      idNegocio: sesion.idNegocio,
    },
  });

  return NextResponse.json({ ok: true, item: usuario });
}
