import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {revalidateTag} from "next/cache";
import { jsonError, requireApiSession } from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

function esObjeto(valor: unknown): valor is Record<string, unknown>
{
    return Boolean(valor && typeof valor === "object" && !Array.isArray(valor));
}

async function leerBody(request: Request)
{
    const body = await request.json().catch(() => null);
    return esObjeto(body) ? body : null;
}

function limpiarTexto(valor: unknown)
{
    return String(valor || "").trim();
}

function pinValido(pin: string)
{
    return pin.length >= 4 && pin.length <= 20;
}

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

    if (!Number.isInteger(idPersona) || idPersona <= 0)
    {
        return jsonError("Usuario no válido.", 400);
    }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos de usuario no validos.");
    }

    const nombre = limpiarTexto(body.nombre);
    const pin = limpiarTexto(body.pin);

    if (!nombre)
    {
        return jsonError("El nombre es obligatorio.");
    }

    if (pin && !pinValido(pin))
    {
        return jsonError("El PIN debe tener entre 4 y 20 caracteres.");
    }

  const usuarioExistente = await prisma.persona.findFirst({
    where: {
      idPersona,
      idNegocio: sesion.idNegocio,
    },
  });

  if (!usuarioExistente) {
    return jsonError("Usuario no encontrado.", 404);
  }

    if (idPersona === sesion.idPersona && body.activo === false)
    {
        return jsonError("No puedes darte de baja a ti mismo.", 400);
    }

    if (idPersona === sesion.idPersona && body.rol !== "admin")
    {
        return jsonError("No puedes quitarte tu propio rol de administrador.", 400);
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
      nombre,
      apellidos: limpiarTexto(body.apellidos) || null,
      telefono: limpiarTexto(body.telefono) || null,
    rol: body.rol === "admin" ? "admin" : "camarero",
      comentarios: limpiarTexto(body.comentarios) || null,
    fechaBaja: body.activo === false ? new Date() : null,
  };

    if (pin)
    {
        data.pin = await bcrypt.hash(pin, 10);
  }

  const usuario = await prisma.persona.update({
    where: { idPersona },
    data,
  });

    revalidateTag(cacheTags.usuarios(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true, item: usuario });
}

export async function DELETE(_: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const idPersona = Number(id);

    if (!Number.isInteger(idPersona) || idPersona <= 0)
    {
        return jsonError("Usuario no válido.", 400);
    }

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

    revalidateTag(cacheTags.usuarios(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true });
}
